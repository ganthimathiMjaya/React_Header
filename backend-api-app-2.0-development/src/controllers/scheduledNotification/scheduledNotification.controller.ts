import cron from 'node-schedule';
import ScheduledNotificationService from '../../services/scheduledNotifications/scheduledNotification.service';

export default class ScheduledNotificationController {
  public async cadencedNotificationProcessor(cronJob: string) {
    let service = new ScheduledNotificationService();

    cron.scheduleJob(cronJob, async () => {
      await service.processJobInsights();
    });
  }

  public async oneTimeNotificationProcessor() {
    let service = new ScheduledNotificationService();
    await service.processJobInsights();
  }
}
