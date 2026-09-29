import { prismaClientBypass } from '../../utils/prisma/multiTenancyPrisma.client';
import {
  CronJobStatus,
  CronJobType,
  CronJobInput,
} from '../../utils/enums/cronJob.types';

export default class CronJobService {
  async acquireLock(nameKey: string, type: string): Promise<boolean> {
    try {
      await prismaClientBypass.jobLock.create({
        data: {
          id: nameKey,
          type,
          status: CronJobStatus.IN_PROGRESS,
        },
      });
      return true;
    } catch (error: any) {
      // P2002 means duplicate key error, which is expected on an active lock
      if (error.code !== 'P2002') {
        console.error('Something went wrong: acquireLock', error);
      }
      return false;
    }
  }

  async releaseLock(nameKey: string) {
    return prismaClientBypass.jobLock.delete({ where: { id: nameKey } });
  }

  async markLockCompleted(nameKey: string) {
    return prismaClientBypass.jobLock.update({
      where: { id: nameKey },
      data: { status: CronJobStatus.COMPLETED },
    });
  }

  getJobPrefix(type: string): string {
    const currentTime = new Date();
    const shortDate = currentTime.toISOString().split('T')[0];
    const hour = currentTime.getHours().toString();
    switch (type) {
      case CronJobType.HOURLY:
        return `${shortDate}T${hour}`;
      case CronJobType.DAILY:
      case CronJobType.OTHER:
      default:
        return shortDate;
    }
  }

  async acquireAndExecute(
    { name, type }: CronJobInput,
    jobToExecute: () => void
  ) {
    const jobPrefix = this.getJobPrefix(type);
    const nameKey = `${name}-${jobPrefix}`;

    const locked = await this.acquireLock(nameKey, type);
    if (!locked) {
      // Lock could not be acquired
      console.warn(
        `Unable to acquire JobLock for name: ${name}, nameKey: ${nameKey}`
      );
      return;
    }
    try {
      console.info(`Executing job name: ${name}`);
      await jobToExecute();
      console.info(`Execution completed for: ${name}`);
      await this.markLockCompleted(nameKey);
    } catch (error) {
      // Mark as failed in case of exception
      console.error('Error executing cron job', error);
      await this.releaseLock(nameKey);
    }
  }
}
