import express, { Request, Response } from 'express';
import TextController from '../controllers/text/text.controller';

const text = express.Router();

text.post('/', async (req: Request, res: Response) => {
  const controller = new TextController();
  const response = await controller.sendText(
    res.locals.orgId,
    req.body.message,
    req.body.number,
    req.body.jobId,
    req.body.isArrivalText
  );
});

export default text;
