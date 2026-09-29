import ServicesManagementRepository from '../../repositories/serviceManagement/servicesManagement.repository';
const repository = new ServicesManagementRepository();

export default class ServicesManagementService {
  public async getAllJobTypes(orgId: string) {
    return await repository.getAllJobTypes(orgId);
  }

  public async getJobType(orgId: string, jobTypeId: number) {
    return await repository.getJobType(orgId, jobTypeId);
  }

  public async getJobSubType(orgId: string, jobSubTypeId: number) {
    return await repository.getJobSubType(orgId, jobSubTypeId);
  }

  public async getAllJobSubTypes(orgId: string) {
    return await repository.getAllJobSubTypes(orgId);
  }

  public async addJobSubType(
    orgId: string,
    jobSubType: {
      name: string;
      description: string;
      isOnBookingPortal: boolean;
      jobTypeId?: number;
      jobType?: string;
      cost?: number;
      taxRateId?: number;
      isTaxable?: boolean;
      qbIncomeAccountRef?: string;
    }
  ) {
    // if no jobtypeid no service name, then no jobsubtype
    // if no jobtypeid, but service name, then create jobtype, then pass to addjobsubtype fn
    // if jobtypeid, either w/ or w/o service name, then simply pass to addjobsubtype fn
    if (!jobSubType.jobTypeId && jobSubType.jobType) {
      const jobType = await repository.addJobType(orgId, jobSubType.jobType);
      jobSubType.jobTypeId = jobType.id;
    }
    return repository.addJobSubType(orgId, jobSubType);
  }

  public async updateJobType(
    orgId: string,
    jobType: {
      id: number;
      description: string;
      shortDescription: string;
      isOnBookingPortal: boolean;
      jobSubTypes: {
        id: number;
        name: string;
        description: string;
        cost?: number;
        additionalNotes?: string;
        taxRateId?: number;
        isTaxable?: boolean;
        qbIncomeAccountRef?: string;
      }[];
    }
  ) {
    if (jobType.id === undefined || jobType.id === 0) {
      throw new Error('JobType ID is invalid.');
    }
    await repository.updateJobType(orgId, jobType);
  }

  public async updateJobSubType(
    orgId: string,
    jobSubType: {
      id: number;
      description: string;
      name: string;
      isOnBookingPortal: boolean;
      jobTypeId: number | null;
      isTaxable: boolean;
      qbIncomeAccountRef: string | null;
      cost: number;
      taxRateId: number | null;

      jobType: {
        id: number;
        isDeleted: boolean;
        orgId: string;
        shortDescription: string;
      };
    }
  ) {
    if (jobSubType.id === undefined || jobSubType.id === 0) {
      throw new Error('JobSubType ID is invalid.');
    }
    await repository.updateJobSubType(orgId, jobSubType);
  }

  public async deleteJobType(orgId: string, jobTypeId: number) {
    await repository.deleteJobType(orgId, jobTypeId);
  }

  public async deleteJobSubType(orgId: string, jobSubTypeId: number) {
    if (jobSubTypeId === undefined || jobSubTypeId === 0) {
      throw new Error('JobSubType ID is invalid.');
    }
    await repository.deleteJobSubType(orgId, jobSubTypeId);
  }
}
