import { Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { BookingService } from '../../services/booking/booking.service';

const bookingService = new BookingService();

export default class BookingController {
  public async getAllBookings(orgId: string, bookedById?: number) {
    return bookingService.getAllBookings(orgId, bookedById);
  }

  public async getPhotos(req: JWTRequest, res: Response) {
    return bookingService.getPhotos(res.locals.orgId, req.params.bookingId);
  }

  public async createCustomerBooking(
    req: JWTRequest,
    res: Response,
    user: any,
    customer: any
  ) {
    return bookingService.createCustomerBooking(res.locals.orgId, req.body, res.locals.userAuthId, user, customer);
  }
}
