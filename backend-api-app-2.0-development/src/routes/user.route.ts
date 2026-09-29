import express, { Request, Response, NextFunction } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import UserController from '../controllers/user/user.controller';
import { param, body, validationResult } from 'express-validator';
import { validate } from '../middlewares/validate';
import {
  createUserValidationRules,
  createUserValidationCustomRules,
} from '../middlewares/validators/user.validator';

const user = express.Router();
const controller = new UserController();

user.get('/', async (req, res, next) => controller.getAllUsers(req, res, next));

user.get('/me', async (req: JWTRequest, res: Response, next: NextFunction) =>
  controller.getMe(req, res, next)
);

user.get(
  '/:userId',
  param('userId').isInt().exists(),
  async (req: JWTRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const response = await controller.getUser(
      parseInt(req.params?.userId),
      res.locals.orgId
    );
    return res.json(response);
  }
);

user.post(
  '/',
  createUserValidationRules(),
  createUserValidationCustomRules,
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.createUser(req, res, next)
);

user.post(
  '/password-reset',
  body('authId').exists(),
  validate,
  async (req: Request, res: Response, next: NextFunction) =>
    controller.userPasswordReset(req, res, next)
);

user.put('/:userId', async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const response = await controller.updateUser(req, res);

  return res.json(response);
});

user.patch(
  '/update/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const response = await controller.updateUserInfo(req, res, next);
    return res.status(200).json();
  }
);

user.put('/login/:auth_id', async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const response = await controller.updateLastLogin(req, res);

  return res.json(response);
});

user.post(
  '/linkSignup',
  body('companyName').exists(),
  body('firstName').exists(),
  body('lastName').exists(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const response = await controller.linkSignup(req, res);

    return res.json(response);
  }
);

user.get('/crewUser/:crewId', async (req: Request, res: Response) => {
  const users = await controller.getCrewUsers(req, res);

  res.json(users);
});

user.put(
  '/updateRole/:userId',
  body('roleId').exists(),
  async (req: Request, res: Response) => {
    const updatedUser = await controller.updateUserRole(req, res);

    res.json(updatedUser);
  }
);

user.put(
  '/updateCompany/:userId',
  body('companyId').exists(),
  async (req: Request, res: Response) => {
    await controller.updateUserCompany(req, res);

    res.send(200);
  }
);

user.post('/userDelete', async (req: Request, res: Response) => {
  const response = await controller.userDelete(req, res);
  return res.json(response);
});

user.delete(
  '/removePushToken',
  body('pushToken').isString().exists().withMessage('pushToken is required'),
  validate,
  controller.removePushToken
);

user.delete(
  '/:userId',
  param('userId').isInt().exists(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const response = await controller.deactivateUser(req, res);
    return res.json(response);
  }
);

user.patch(
  '/reactivate/:userId',
  param('userId').isInt().exists(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const response = await controller.reactivateUser(req, res);
    return res.json(response);
  }
);

user.post(
  '/addPushToken',
  body('pushToken').isString().exists().withMessage('pushToken is required'),
  validate,
  controller.addPushToken
);

user.patch(
  '/allowNotifications',
  body('allowNotifications')
    .isBoolean()
    .exists()
    .withMessage('allowNotifications is required'),
  validate,
  controller.allowNotifications
);

// user.delete('/:userId', param('userId').isInt().exists(), async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const controller = new UserController();
//   const response = await controller.deleteUser(parseInt(req.params?.userId));

//   return res.json(response);
// });

export default user;
