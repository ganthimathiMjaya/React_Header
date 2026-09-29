import express from 'express';
import NotificationController from '../controllers/notification/notification.controller';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate';

const markNotificationValidationRules = () => {
  return [body('ids').isLength({ min: 1 })];
};

const notification = express.Router();
const notificationController = new NotificationController();

notification.get('/', notificationController.getNotifications);
notification.post(
  '/_markRead',
  markNotificationValidationRules(),
  validate,
  notificationController.markNotificationRead
);
notification.post(
  '/_markCleared',
  markNotificationValidationRules(),
  validate,
  notificationController.markNotificationCleared
);

export default notification;
