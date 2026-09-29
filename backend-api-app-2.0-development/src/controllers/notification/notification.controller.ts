import { NextFunction, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import NotificationService from '../../services/notification/notification.service';

const notificationService = new NotificationService();

export default class NotificationController {
  public async getNotifications(
    req: JWTRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notifications = await notificationService.getNotificationsForUser(
        res.locals.orgId,
        res.locals.userAuthId
      );
      res.json(notifications);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in NotificationController.getNotifications',
      });
    }
  }

  public async markNotificationRead(
    req: JWTRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notification = await notificationService.markNotificationsRead(
        res.locals.orgId,
        req.body.ids
      );
      res.json(notification);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in NotificationController.markNotificationRead',
      });
    }
  }

  public async markNotificationCleared(
    req: JWTRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notification = await notificationService.markNotificationsCleared(
        res.locals.orgId,
        req.body.ids
      );
      res.json(notification);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in NotificationController.markNotificationCleared',
      });
    }
  }
}
