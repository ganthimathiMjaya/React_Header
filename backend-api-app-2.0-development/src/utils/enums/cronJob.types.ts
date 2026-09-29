export enum CronJobStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
}

export enum CronJobType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  OTHER = 'OTHER',
}

export interface CronJobInput {
  name: string;
  type: string;
}

export interface CronJobDefinition {
  name: string;
  type: string;
  cronExpression: string;
  jobExecutor: () => void;
}
