import { JobLock } from '@prisma/client';
import CronJobService from '../cronJob/cronJob.service';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import {
  CronJobStatus,
  CronJobType,
  CronJobInput,
} from '../../utils/enums/cronJob.types';

describe('CronJobService', () => {
  describe('acquireLock', () => {
    it('returns false if key already exists', async () => {
      prismaMock.prismaClientBypassMock.jobLock.create.mockImplementation(
        () => {
          throw new Error();
        }
      );
      const cronJobService = new CronJobService();
      const actual = await cronJobService.acquireLock('nameKey', 'type');

      const expected = false;

      expect(actual).toEqual(expected);
    });

    it('acquires lock', async () => {
      const mockedJobLock = { id: 'myId' } as JobLock;
      prismaMock.prismaClientBypassMock.jobLock.create.mockResolvedValue(
        mockedJobLock
      );
      const cronJobService = new CronJobService();
      const actual = await cronJobService.acquireLock('nameKey', 'type');

      const expected = true;

      expect(actual).toEqual(expected);
    });
  });

  describe('releaseLock', () => {
    it('returns the record deleted', async () => {
      const mockedJobLock = { id: 'myId' } as JobLock;
      prismaMock.prismaClientBypassMock.jobLock.delete.mockResolvedValue(
        mockedJobLock
      );
      const cronJobService = new CronJobService();
      const actual = await cronJobService.releaseLock('nameKey');

      const expected = { ...mockedJobLock };

      expect(actual).toEqual(expected);
    });
  });

  describe('markLockCompleted', () => {
    it('returns the record marked completed', async () => {
      const mockedJobLock = { id: 'myId' } as JobLock;
      prismaMock.prismaClientBypassMock.jobLock.update.mockResolvedValue(
        mockedJobLock
      );
      const cronJobService = new CronJobService();
      const actual = await cronJobService.markLockCompleted('nameKey');

      const expected = { ...mockedJobLock };

      expect(actual).toEqual(expected);
    });
  });

  describe('getJobPrefix', () => {
    it('returns key appending the date only when DAILY', async () => {
      const currentTime = new Date();
      const cronJobService = new CronJobService();
      const actual = cronJobService.getJobPrefix(CronJobType.DAILY);

      const expected = currentTime.toISOString().split('T')[0];

      expect(actual).toEqual(expected);
    });

    it('returns key appending the date only when OTHER', async () => {
      const currentTime = new Date();
      const cronJobService = new CronJobService();
      const actual = cronJobService.getJobPrefix(CronJobType.OTHER);

      const expected = currentTime.toISOString().split('T')[0];

      expect(actual).toEqual(expected);
    });

    it('returns key appending the date only as default', async () => {
      const currentTime = new Date();
      const cronJobService = new CronJobService();
      const actual = cronJobService.getJobPrefix('test');

      const expected = currentTime.toISOString().split('T')[0];

      expect(actual).toEqual(expected);
    });

    it('returns key appending the date and time if hourly', async () => {
      const currentTime = new Date();
      const hour = currentTime.getHours().toString();
      const cronJobService = new CronJobService();
      const actual = cronJobService.getJobPrefix(CronJobType.HOURLY);

      const expected = `${currentTime.toISOString().split('T')[0]}T${hour}`;
      expect(actual).toEqual(expected);
    });
  });

  describe('acquireAndExecute', () => {
    it('calls create and update', async () => {
      const mockedJobLock = { id: 'myId' } as JobLock;
      prismaMock.prismaClientBypassMock.jobLock.create.mockResolvedValue(
        mockedJobLock
      );
      prismaMock.prismaClientBypassMock.jobLock.update.mockResolvedValue(
        mockedJobLock
      );
      const jobFn = () => {};
      const cronJobService = new CronJobService();
      const input = { name: 'test', type: CronJobType.OTHER };
      await cronJobService.acquireAndExecute(input, jobFn);

      expect(
        prismaMock.prismaClientBypassMock.jobLock.create
      ).toHaveBeenCalled();
      expect(
        prismaMock.prismaClientBypassMock.jobLock.update
      ).toHaveBeenCalled();
    });
  });
});
