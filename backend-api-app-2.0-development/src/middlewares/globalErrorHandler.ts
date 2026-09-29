import { Request, Response, NextFunction } from 'express';
import { Error } from '../routes/error.route';
import { Prisma } from '@prisma/client';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const defaultErr: Error = {
    log: 'Express Global Error handler caught unknown middleware error',
    status: '500',
    message: { err: 'Internal server error.' },
  };
  console.error('Global Error Handler: ', err);

  if (err.errorPath) console.error('Error ocurred in: ', err.errorPath);
  if (err.message) console.error('Error message: ', err.message);
  if (err.internalMessage) {
    console.error('Error internalMessage: ', err.internalMessage);
    delete err.internalMessage;
  }

  if (err.error instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.error.code === 'P2025') {
      defaultErr.status = '404';
      defaultErr.message.err = 'Not found';
    }
  }

  const errorObj = Object.assign(defaultErr, err);

  return res.status(+errorObj.status).json(errorObj.message);
};
