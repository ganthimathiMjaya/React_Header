import express from 'express';
import ReceiveSmsController from '../controllers/receiveSms/receiveSms.controller';
import { param, body, validationResult } from 'express-validator';
import { Console } from 'console';

const text = express.Router();

text.post(
  '/', 
  async (req: express.Request, res: express.Response) => {

    const controller = new ReceiveSmsController();
    const response = await controller.processText(req, res);

  }
);

export default text;
