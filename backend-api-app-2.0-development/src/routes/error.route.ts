import express, { Request, Response, NextFunction } from 'express';

const error = express.Router();

export interface Error {
  error?: any;
  log: String;
  status: String;
  message: {
    err: String;
  };
  internalMessage?: string;
  errorPath?: string;
}

error.use((req: Request, res: Response) => {
  return res.sendStatus(404);
});

error.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const defaultErr: Error = {
    log: 'Express error handler caught unknown middleware error',
    status: '500',
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign(defaultErr, err); // update new log, status, message w/ intake err ar from next invocation
  console.log('Error: ', errorObj.log);
  return res.status(+errorObj.status).json(errorObj.message);
});

export default error;
