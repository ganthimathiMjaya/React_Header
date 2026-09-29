import { Response, NextFunction } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { Error } from '../routes/error.route';

/*
For multi-tenancy, every request should contain the org_id claim in the access token coming from Auth0. Otherwise throwing an error.
*/
export const orgIdCheck = async (
  req: JWTRequest,
  res: Response,
  next: NextFunction
) => {
  const orgId = req.auth?.org_id;
  const userAuthId = req.auth?.sub;
  res.locals.userAuthId = userAuthId;
  if (orgId) {
    res.locals.orgId = orgId;
  } else {
    res.statusCode = 401;
    console.error('ERROR: Missing orgId from token');
    const error: Error = {
      log: 'Error in orgIdCheck',
      status: '401',
      message: { err: 'Missing orgId from token' },
    };
    return next(error);
  }
  next();
};
