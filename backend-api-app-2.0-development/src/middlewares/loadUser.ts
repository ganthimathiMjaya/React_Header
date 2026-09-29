import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user/user.service';
import { User } from '@prisma/client';

const userService = new UserService();

export const loadUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: User = await userService.getUserByAuthId(
      res.locals.orgId,
      res.locals.userAuthId
    );
    req.user = user;
  } catch (error) {
    req.user = undefined;
    // next({
    //   error,
    //   messagePath: 'Middleware loadUser',
    //   message: 'Error loading user',
    // });
    console.warn('Error loading user');
  } finally {
    next();
  }
};
