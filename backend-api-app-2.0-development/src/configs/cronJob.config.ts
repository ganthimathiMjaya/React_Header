import schedule from 'node-schedule';
import { CronJobType, CronJobDefinition } from '../utils/enums/cronJob.types';
import CronJobService from '../services/cronJob/cronJob.service';
import {
  rolledOverJobs,
  scheduledForTomorrowJobs,
  jobsAssignedEndOfDay,
} from '../cronjobs/notifications.cronjob';
import {
  pushCustomersJob,
  pullCustomersJob,
  pushServicesJob,
  pullServicesJob,
  pushInvoicesJob,
} from '../cronjobs/quickBooks.cronjob';
import { PushNotificationService } from '../services/pushNotification/pushNotification.service';

// CronJob expression for testing (runs every minute): '*/1 * * * *'

const pushNotificationService = new PushNotificationService();

const jobs: CronJobDefinition[] = [
  {
    name: 'ADMIN_ROLLED_OVER_JOBS',
    cronExpression: '0 22 * * *', //Daily at 4pm CST (10pm UTC).
    jobExecutor: rolledOverJobs,
    type: CronJobType.DAILY,
  },
  {
    name: 'CREW_JOBS_ASSIGNED_EOD',
    cronExpression: '30 22 * * *', //Daily at 4:30pm CST (10:30pm UTC).
    jobExecutor: jobsAssignedEndOfDay,
    type: CronJobType.DAILY,
  },
  {
    name: 'CUSTOMER_SCHEDULED_TOMORROW_JOBS',
    cronExpression: '0 21 * * *', //Daily at 3pm CST (9pm UTC).
    jobExecutor: scheduledForTomorrowJobs,
    type: CronJobType.DAILY,
  },
  {
    name: 'PUSH_NOTIFICATIONS_TICKETS_CHECK',
    cronExpression: '0 23 * * *', //Daily at 3pm CST (11pm UTC).
    jobExecutor: pushNotificationService.checkPushNotificationStatus,
    type: CronJobType.DAILY,
  },
  {
    name: 'QB_PULL_CUSTOMERS_SYNC',
    cronExpression: '0 7 * * *', //Daily at 1am CST (7am UTC).
    jobExecutor: pullCustomersJob,
    type: CronJobType.DAILY,
  },
  {
    name: 'QB_PULL_SERVICES_SYNC',
    cronExpression: '0 8 * * *', //Daily at 2am CST (8am UTC).
    jobExecutor: pullServicesJob,
    type: CronJobType.DAILY,
  },
  {
    name: 'QB_PUSH_CUSTOMERS_SYNC',
    cronExpression: '0 9 * * *', //Daily at 3am CST (9am UTC).
    jobExecutor: pushCustomersJob,
    type: CronJobType.DAILY,
  },
  {
    name: 'QB_PUSH_SERVICES_SYNC',
    cronExpression: '0 10 * * *', //Daily at 4am CST (10am UTC).
    jobExecutor: pushServicesJob,
    type: CronJobType.DAILY,
  },
  {
    name: 'QB_PUSH_INVOICES_SYNC',
    cronExpression: '0 11 * * *', //Daily at 5am CST (11am UTC).
    jobExecutor: pushInvoicesJob,
    type: CronJobType.DAILY,
  },
];

const cronJobService = new CronJobService();

export default class CronJobConfigurator {
  configureJobs() {
    jobs.map((job) => {
      console.info(`Configuring Job: ${job.name}`);
      const jobWrapper = () => {
        cronJobService.acquireAndExecute(
          { name: job.name, type: job.type },
          job.jobExecutor
        );
      };
      schedule.scheduleJob(job.cronExpression, jobWrapper);
    });
  }
}
