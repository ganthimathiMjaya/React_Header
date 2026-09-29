import express from 'express';
import RoleController from '../controllers/role/role.controller';

const role = express.Router();

role.get('/', async (req: express.Request, res: express.Response) => {
  const roleController = new RoleController();
  const roles = await roleController.getRoles();

  res.json(roles);
});

export default role;
