import { Response, NextFunction } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { Error } from '../routes/error.route';
import Role from '../utils/enums/roles';

/*
For multi-tenancy, every request should contain the org_id claim in the access token coming from Auth0. Otherwise throwing an error.
*/
export const roleCheck = async (
  req: JWTRequest,
  res: Response,
  next: NextFunction
) => {
  const roleName: keyof typeof Role = req.auth?.user_role[0];
  if (roleName) {
    res.locals.roleId = Role[roleName];
  } else {
    res.statusCode = 401;
    console.error('ERROR: Missing role from token');
    const error: Error = {
      log: 'Error in roleCheck',
      status: '401',
      message: { err: 'Missing role from token' },
    };
    return next(error);
  }
  next();
};
