import express from 'express';
import feedBackController from '../controllers/feedBack/feedBack.controller';
import { body, param, validationResult } from 'express-validator';

const feedBack = express.Router();
const controller = new feedBackController();

feedBack.post(
  '/:jobId/feedback',
  async (req: express.Request, res: express.Response) => {
    const response = await controller.recordJobFeedback(req, res);
    return res.json(response);
  }
);

export default feedBack;
