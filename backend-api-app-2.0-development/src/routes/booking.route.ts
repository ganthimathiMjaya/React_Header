import express, { Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { body, validationResult } from 'express-validator';
import { getPrismaClientForTenant } from '../utils/prisma/multiTenancyPrisma.client';
import BookingController from '../controllers/booking/booking.controller';
import Role from '../utils/enums/roles';

const booking = express.Router();
const controller = new BookingController();

booking.get('/', async (req, res) => {
  const controller = new BookingController();
  const response = await controller.getAllBookings(
    res.locals.orgId,
    Number(req.query.userid)
  );
  return res.json(response);
});

booking.get('/images/:bookingId', async (req, res) => {
  const response = await controller.getPhotos(req, res);
  return res.json(response);
});

booking.post(
  '/customer',
  body('source').exists().isString(),
  body('scheduledDate').exists(),
  body('address').exists(),
  body('address2').optional(),
  body('state').exists(),
  body('city').exists(),
  body('zipCode').exists(),
  body('jobs').exists().isArray({ min: 1 }),
  async (req: JWTRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const prisma = getPrismaClientForTenant(res.locals.orgId);

    let user = null;
    if (req.auth && req.auth.sub && req.auth.sub.includes('auth0|')) {
      user = await prisma.user.findUnique({
        where: { auth_id: req.auth.sub },
        include: { customerUser: true },
      });
    }

    if (!user || !user.customerUser) {
      return res.status(500);
    }

    if (user.roleId !== Role.CUSTOMER) {
      return res.status(500);
    }

    const customerUser = await prisma.customerUser.findUnique({
      where: { id: user.customerUser.id },
      include: { Customer: true },
    });

    if (!customerUser || !customerUser.Customer) {
      return res.status(500);
    }

    const response = await controller.createCustomerBooking(
      req,
      res,
      user,
      customerUser.Customer
    );

    return res.json(response);
  }
);

export default booking;
