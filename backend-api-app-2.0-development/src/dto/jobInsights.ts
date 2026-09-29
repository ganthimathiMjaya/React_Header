export class JobInsights {
  orgId: string;
  jobsAdded: number;
  jobsCompleted: number;
  totalRevenue: number;
  totalRevenueYtd: number;
  last60DaysRevenue: number;
  last60DaysJobsCompleted: number;

  constructor(
    orgId: string,
    jobsAdded: number,
    jobsCompleted: number,
    totalRevenue: number,
    totalRevenueYtd: number,
    last60DaysRevenue: number,
    last60DaysJobsCompleted: number
  ) {
    this.orgId = orgId;
    this.jobsAdded = jobsAdded;
    this.jobsCompleted = jobsCompleted;
    this.totalRevenue = totalRevenue;
    this.totalRevenueYtd = totalRevenueYtd;
    this.last60DaysRevenue = last60DaysRevenue;
    this.last60DaysJobsCompleted = last60DaysJobsCompleted;
  }
}
