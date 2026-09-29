import express, { Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { param, validationResult } from 'express-validator';
import CrewController from '../controllers/crew/crew.controller';

const crew = express.Router();
const controller = new CrewController();

crew.get('/', async (_req: Request, res: Response) => {
  const response = await controller.getAllCrews(res.locals.orgId);
  return res.json(response);
});

crew.get(
  '/:crewId',
  param('crewId').isString().exists(),
  async (_req: any, res: Response) => {
    const errors = validationResult(_req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const response = await controller.getCrew(
      res.locals.orgId,
      _req.params?.crewId,
      _req.query?.skipJobs,
      _req.query?.takeJobs
    );
    return res.json(response);
  }
);

crew.post('/', async (req: Request, res: Response) => {
  const response = await controller.createCrew(req, res);
  return res.json(response);
});

crew.post('/adminCreate', async (req: Request, res: Response) => {
  const response = await controller.adminCreateCrew(req, res);
  return res.json(response);
});

crew.put('/:id', async (req: Request, res: Response) => {
  const response = await controller.updateCrew(req, res);
  return res.json(response);
});

export default crew;
