import { Request, Response, NextFunction } from 'express';
import { Error } from '../../routes/error.route';
import md5 from 'md5';
import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export default class HyphenController {
  public async hyphenAuth(req: Request, res: Response, next: NextFunction) {
    const hyphenAuthHeader = req.get('HYPHEN_AUTH');
    const hashedAuthHeader = md5(hyphenAuthHeader as string);
    const hyphenKeyHashed = process.env.HYPHEN_API_KEY?.toLowerCase();
    if (hashedAuthHeader === hyphenKeyHashed) {
      return next();
    } else {
      const error: Error = {
        log: 'Error in HyphenController.hyphenAuth',
        status: '400',
        message: { err: 'Authorization error' },
      };
      return next(error);
    }
  }

  public async hyphenOrderReqVerify(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.locals.orderType = req.body.header.changeOrderNumber ? 'CO' : 'PO';
    return next();
  }

  public async saveHyphenData(req: Request, res: Response, next: NextFunction) {
    // identify what other fields need to be created if don't yet exist?
    // address, contact, job?,
    try {
      const prisma = getPrismaClientForTenant(res.locals.orgId);
      const savedOrder = await prisma.hyphenPurchaseOrder.create({
        data: {
          id: req.body.header.id.toString(),
          stringifiedOrder: JSON.stringify(req.body),
        },
      });
      return savedOrder;
    } catch (err) {
      const error = {
        log: `Error in hyphen.controller.saveHyphenData: ${err}`,
        status: '500',
        message: {
          err: `Unable to save data for PO#: ${req.body.header.id}`,
        },
      };
      return next(error);
    }
  }

  // TRY TO USE POSTMAN TO TEST THIS MIDDLEWARE
  public async updateHyphenData(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // separate table to track CO's based on CO id?
    // const createChangeOrder = await prisma.hyphenTest.create({

    // })
    try {
      const prisma = getPrismaClientForTenant(res.locals.orgId);
      const updatedOrder = await prisma.hyphenPurchaseOrder.update({
        where: {
          id: req.body.header.id.toString(),
        },
        data: {
          stringifiedOrder: JSON.stringify(req.body),
        },
      });
      return updatedOrder;
    } catch (err) {
      const error = {
        log: `Error in hyphen.controller.updateHyphenData: ${err}`,
        status: '500',
        message: {
          err: `Unable to update data for PO#: ${req.body.header.id}`,
        },
      };
      return next(error);
    }
  }
}
