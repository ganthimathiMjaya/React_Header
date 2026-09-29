import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { UserService } from '../../services/user/user.service';

const userService = new UserService();

export const createUserValidationRules = () => {
  return [
    body('email').isEmail().optional(),
    body('firstName').exists(),
    body('lastName').exists(),
    body('phoneNumber').isNumeric().exists(),
    body('roleId').exists(),
    body('active').exists(),
  ];
};

export const createUserValidationCustomRules = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isCrew = userService.isCrewRoleTypeId(req.body.roleId);
  const errors: string[] = [];
  if (!isCrew && !req.body.email) {
    errors.push('Email is required for this user role');
  }
  //Check email/username uniqueness.
  let username = req.body.username;
  let usernameError = 'Username must be unique';
  if (!username) {
    username = req.body.phoneNumber;
    usernameError = 'PhoneNumber must be unique';
  }
  const isUsernameUnique = await userService.isUsernameUnique(
    res.locals.orgId,
    username
  );
  if (!isUsernameUnique) {
    errors.push(usernameError);
  }
  if (req.body.email) {
    const isEmailUnique = await userService.isEmailUnique(
      res.locals.orgId,
      req.body.email
    );
    if (!isEmailUnique) {
      errors.push('Email must be unique');
    }
  }
  if (errors.length) {
    return res.status(400).json({
      errors,
    });
  }
  next();
};
