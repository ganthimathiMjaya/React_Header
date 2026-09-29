import express, { Request, Response, NextFunction } from 'express';
import ScheduledNotificationController from '../controllers/scheduledNotification/scheduledNotification.controller';

const scheduledNotification = express.Router();
const controller = new ScheduledNotificationController();

scheduledNotification.post('/', async (_req: Request, res: Response) => {
  await controller.oneTimeNotificationProcessor();
  return res.json('Executed scheduled notification.');
});

export default scheduledNotification;
