import { Prisma } from '@prisma/client';
import {
  getPrismaClientForTenant,
  prismaClientBypass,
} from '../../utils/prisma/multiTenancyPrisma.client';
import JobStatus from '../../utils/enums/job.status';
import { QueueJobDto } from '../../dto/queueJob.dto';
import LineItemType from '../../utils/enums/lineItemType.types';
import { JobInvoiceStatusService } from '../../services/invoice/jobInvoiceStatus.service';
import { StatusRepository } from '../../repositories/status/status.repository';
import { UpdateJobNotesDto } from '../../dto/updateJobNotes.dto';
import { InvoiceStatusRepository } from '../invoiceStatus/invoiceStatus.repository';

const jobInvoiceStatusService = new JobInvoiceStatusService();
const statusRepository = new StatusRepository();
const invoiceStatusRepository = new InvoiceStatusRepository();

export type CompleteJob = Prisma.JobGetPayload<{
  include: {
    User: true;
    customer: true;
    jobType: true;
    jobSubType: {
      include: {
        taxRate: true;
      };
    };
    project: true;
    OrganizationJobCustomField: {
      include: {
        organizationCustomField: true;
      };
    };
    tenantOrganization: {
      include: {
        OrganizationSetting: true;
      };
    };
  };
}>;

export type QueueJobInvoicing = Prisma.JobGetPayload<{
  include: {
    User: true;
    customer: true;
    jobType: true;
    jobSubType: {
      include: {
        taxRate: true;
      };
    };
    project: true;
    OrganizationJobCustomField: {
      include: {
        organizationCustomField: true;
      };
    };
    tenantOrganization: {
      include: {
        OrganizationSetting: true;
      };
    };
  };
}>;

export type DiscardJobInvoicing = Prisma.JobGetPayload<{
  include: {
    User: true;
    customer: true;
    jobType: true;
    jobSubType: {
      include: {
        taxRate: true;
      };
    };
    OrganizationJobCustomField: {
      include: {
        organizationCustomField: true;
      };
    };
    isDiscarded: true;
    tenantOrganization: {
      include: {
        OrganizationSetting: true;
      };
    };
    status: true;
    project: true;
  };
}>;

export type InvoiceWithDetails = Prisma.InvoiceGetPayload<{
  include: {
    customer: true;
    invoiceDetail: {
      include: {
        jobSubType: true;
        customFields: true;
      };
    };
  };
}>;

export class InvoiceRepository {
  async getInvoices(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.invoice.findMany({
      where: { isDeleted: false },
      include: {
        invoiceDetail: {
          include: {
            job: {
              select: {
                techReference: true,
              },
            },
            customFields: true,
            jobSubType: true,
          },
          where: {
            isDeleted: false,
          },
        },
        status: true,
        customer: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
        tenantOrganization: {
          include: {
            OrganizationSetting: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async getInvoice(orgId: string, invoiceId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.invoice.findFirst({
      where: { id: invoiceId, isDeleted: false },
      include: {
        invoiceDetail: {
          include: {
            job: {
              select: {
                techReference: true,
              },
            },
            customFields: true,
          },
        },
        status: true,
        customer: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
        tenantOrganization: {
          include: {
            OrganizationSetting: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async getByIds(orgId: string, invoiceIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.invoice.findMany({
      where: {
        id: { in: invoiceIds },
      },
      orderBy: [
        {
          invoiceDate: 'desc',
        },
      ],
      include: {
        status: true,
        invoiceDetail: {
          include: {
            customFields: {
              select: {
                organizationCustomFieldName: true,
                customFieldValue: true,
              },
            },
            jobType: {
              select: {
                id: true,
                shortDescription: true,
              },
            },
            jobSubType: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tenantOrganization: {
          include: {
            OrganizationSetting: true,
          },
        },
        customer: {
          include: {
            location: {
              include: {
                address: true,
              },
            },
          },
        },
      },
    });
  }

  public async getInvoicesByIds(orgId: string, invoiceIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.invoice.findMany({
      where: {
        id: { in: invoiceIds },
      },
      include: {
        customer: {
          select: {
            qbId: true,
          },
        },
        invoiceDetail: {
          include: {
            jobSubType: {
              select: {
                qbId: true,
              },
            },
          },
        },
      },
    });
  }

  async getJobsByStatusId(orgId: string, statusId: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.findMany({
      where: {
        statusId,
        isDiscarded: false,
      },
      include: {
        User: true,
        customer: true,
        jobType: true,
        jobSubType: {
          include: {
            taxRate: true,
          },
        },
        project: true,
        OrganizationJobCustomField: {
          include: {
            organizationCustomField: true,
          },
        },
        tenantOrganization: {
          include: {
            OrganizationSetting: true,
          },
        },
      },
    });
  }

  async getInvoiceDetail(orgId: string, lineItemId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.invoiceDetail.findFirst({
      where: { id: lineItemId },
    });
  }

  async getInvoiceDetails(orgId: string, invoiceId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.invoiceDetail.findMany({
      where: { invoiceId },
    });
  }

  async getJobCountByStatusId(orgId: string, statusId: number) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.count({
      where: {
        statusId,
        isDiscarded: false,
      },
    });
  }

  async getDiscardedJobs(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    const completeStatus = await statusRepository.getStatusByContent(
      orgId,
      'Complete'
    );
    const invoicedStatus = await statusRepository.getStatusByContent(
      orgId,
      'Invoiced'
    );

    return prisma.job.findMany({
      where: {
        OR: [{ statusId: invoicedStatus.id }, { statusId: completeStatus.id }],
        isDiscarded: true,
      },
      include: {
        User: true,
        customer: true,
        jobType: true,
        jobSubType: {
          include: {
            taxRate: true,
          },
        },
        OrganizationJobCustomField: {
          include: {
            organizationCustomField: true,
          },
        },
        tenantOrganization: {
          include: {
            OrganizationSetting: true,
          },
        },
        status: true,
        project: true,
      },
    });
  }

  async discardJobs(orgId: string, jobIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);

    return await prisma.job.updateMany({
      where: { id: { in: jobIds } },
      data: { isDiscarded: true },
    });
  }

  async getCompletedJobById(orgId: string, jobId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    const statusId = JobStatus.Complete;
    return prisma.job.findFirstOrThrow({
      where: {
        statusId,
        isDiscarded: false,
        id: jobId,
      },
      include: {
        User: true,
        customer: true,
        jobType: true,
        jobSubType: {
          include: {
            taxRate: true,
          },
        },
        project: true,
        OrganizationJobCustomField: {
          include: {
            organizationCustomField: true,
          },
        },
        tenantOrganization: {
          include: {
            OrganizationSetting: true,
          },
        },
      },
    });
  }

  async createInvoice(
    orgId: string,
    invoiceDto: {
      invoiceNo: string;
      billingEmail: string | null;
      billingPhone: string | null;
      customerId: string;
      dueDate: Date;
      invoiceDate: Date;
      messageOnInvoice: string | null;
      statusId: number;
      projectId: string | null;
      terms: number;
      taxRate?: number;
      projectName: string | undefined;
      projectBillingNotes: string | null | undefined;
      projectAccountingSoftware: string | null | undefined;
      projectCommunityName: string | null | undefined;
      billingLine1: string | undefined;
      billingLine2: string | null | undefined;
      billingCity: string | undefined;
      billingState: string | undefined;
      billingZipcode: string | undefined;
      projectLine1: string | undefined;
      projectLine2: string | null | undefined;
      projectLine3: string | null | undefined;
      projectCity: string | undefined;
      projectState: string | undefined;
      projectZipcode: string | undefined;
    }
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    const createdInvoiceStatus = await invoiceStatusRepository.getStatusByCode(
      orgId,
      'CRD'
    );
    return await prisma.invoice.create({
      data: {
        ...invoiceDto,
        statusId: createdInvoiceStatus.id,
      },
    });
  }

  async updateInvoice(
    orgId: string,
    invoiceId: string,
    invoiceDto: {
      invoiceNo: string;
      billingEmail: string | null;
      customerId: string;
      dueDate: Date;
      invoiceDate: Date;
      messageOnInvoice: string | null;
      statusId: number;
      projectId: string | null;
      terms: number;
      taxRate?: number;
      projectName: string | undefined;
      projectBillingNotes: string | null | undefined;
      projectAccountingSoftware: string | null | undefined;
      projectCommunityName: string | null | undefined;
      billingLine1: string | undefined;
      billingLine2: string | null | undefined;
      billingCity: string | undefined;
      billingState: string | undefined;
      billingZipcode: string | undefined;
      projectLine1: string | undefined;
      projectLine2: string | null | undefined;
      projectLine3: string | null | undefined;
      projectCity: string | undefined;
      projectState: string | undefined;
      projectZipcode: string | undefined;
    }
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    //Increment sync token
    const scrappySyncToken = await this.getNewScrappySyncToken(
      orgId,
      invoiceId
    );
    return await prisma.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        scrappySyncToken,
        ...invoiceDto,
      },
    });
  }

  async getNewScrappySyncToken(orgId: string, id: string) {
    const prisma = getPrismaClientForTenant(orgId);
    const currentInvoice = await prisma.invoice.findFirst({
      where: { id },
    });
    let scrappySyncToken = undefined;
    if (currentInvoice?.scrappySyncToken) {
      scrappySyncToken = (
        Number(currentInvoice.scrappySyncToken) + 1
      ).toString();
    }
    return scrappySyncToken;
  }

  async hardDeleteInvoice(orgId: string, id: string) {
    const prisma = getPrismaClientForTenant(orgId);
    await prisma.invoice.delete({
      where: {
        id,
      },
    });
  }

  async hardDeleteInvoiceDetailsForInvoice(orgId: string, invoiceId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    await prisma.invoiceDetail.deleteMany({
      where: {
        invoiceId,
      },
    });
  }

  async createInvoiceDetail(orgId: string, invoiceDetails: any) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.invoiceDetail.create({
      data: invoiceDetails,
      include: {
        customFields: true,
      },
    });
  }

  async createInvoiceDetails(orgId: string, invoiceDetails: any) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.invoiceDetail.createMany({
      data: invoiceDetails,
    });
  }

  async createCustomFields(orgId: string, customFields: any) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.invoiceDetailCustomField.createMany({
      data: customFields,
    });
  }

  async createInvoiceDetailCustomFields(orgId: string, body: any[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.invoiceDetailCustomField.createMany({
      data: body,
    });
  }

  async updateInvoiceDetailCustomField(
    orgId: string,
    customFieldId: string,
    body: any
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.invoiceDetailCustomField.update({
      where: {
        id: customFieldId,
      },
      data: body,
    });
  }

  async deleteInvoiceDetailCustomFields(
    orgId: string,
    customFieldIds: string[]
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.invoiceDetailCustomField.updateMany({
      where: {
        id: { in: customFieldIds },
      },
      data: {
        isDeleted: true,
      },
    });
  }

  async updateInvoiceDetail(
    orgId: string,
    invoiceDetailId: string,
    invoiceDetail: any
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.invoiceDetail.update({
      where: {
        id: invoiceDetailId,
      },
      data: {
        ...invoiceDetail,
      },
      include: {
        customFields: true,
      },
    });
  }

  async saveInvoiceDetail(orgId: string, invoiceDetail: any) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.invoiceDetail.create({
      data: {
        ...invoiceDetail,
      },
    });
  }

  async softDeleteInvoices(orgId: string, invoiceIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.invoice.updateMany({
      where: {
        id: { in: invoiceIds },
      },
      data: {
        isDeleted: true,
      },
    });
  }

  async softDeleteInvoiceDetails(orgId: string, invoiceDetailIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.invoiceDetail.updateMany({
      where: {
        id: { in: invoiceDetailIds },
      },
      data: {
        isDeleted: true,
      },
    });
  }

  async getQueuedJob(orgId: string, jobId: string): Promise<QueueJobDto> {
    const job: QueueJobInvoicing = await this.getCompletedJobById(orgId, jobId);
    const billingEmail = job.project?.billingEmail || job.customer.email;
    const isTaxable = job.jobSubType?.isTaxable;
    const taxRate = job.jobSubType?.taxRate?.taxRatePercent || 0;
    const rate = job.jobSubType?.cost || 0;
    const total = rate + (taxRate ? rate * (taxRate / 100) : 0);

    return new QueueJobDto({
      jobId: job.id,
      jobStatusId: job.statusId,
      jobTechReference: job.techReference,
      //Dynamically calculate the jobStatus for the invoicing queue. It could change based on the dependencies, so it's calculated on the fly and may be persisted once the invoice is created and values and copied to the invoice.
      invoicingStatus: jobInvoiceStatusService.getQueueJobInvoiceStatus(
        job,
        billingEmail
      ),
      billingEmail,
      projectName: job.project?.name,
      accountingSoftware: job.project?.accountingSoftware,
      dateOfService: job.scheduledDate,
      customerName: job.customer?.name,
      jobTypeName: job.jobType?.shortDescription,
      jobSubTypeName: job.jobSubType?.name,
      jobTypeId: job.jobType?.id,
      jobSubTypeId: job.jobSubTypeId,
      crewFullName: `${job.User?.firstName} ${job.User?.lastName}`,
      crewFirstName: job.User?.firstName,
      crewLastName: job.User?.lastName,
      quantity: 1,
      rate: job.jobSubType?.cost,
      isTaxable,
      taxRate,
      total,
      //Notes
      jobScope: job.jobScope, // Job Scope
      crewNotes: job.crewNotes, // Crew Job Notes
      invoiceNotes: job.invoiceNotes, // Internal invoicing Job Notes
      customerNotes: job.customer?.notes, // Customer Invoicing Notes
      jobNotes: job.notes,
      projectInvoicingNotes: job.project?.billingNotes,
      customFields: job.OrganizationJobCustomField?.map((jobCustomField) => ({
        name: jobCustomField.organizationCustomField?.name,
        value: jobCustomField.value,
      })),
    });
  }

  async updateJobNotes(orgId: string, jobId: string, notes: UpdateJobNotesDto) {
    const prisma = getPrismaClientForTenant(orgId);
    const job = await prisma.job.findUniqueOrThrow({
      where: {
        id: jobId,
      },
    });
    return await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        jobScope: notes.jobScope,
        crewNotes: notes.crewNotes,
        invoiceNotes: notes.invoiceNotes,
        notes: notes.jobNotes,
      },
    });
  }

  async getJobsForValidation(orgId: string, jobIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.job.findMany({
      where: {
        id: {
          in: jobIds,
        },
        statusId: JobStatus.Complete,
        isDiscarded: false,
      },
      include: {
        jobType: true,
        jobSubType: true,
        project: true,
        customer: true,
        tenantOrganization: {
          include: {
            OrganizationSetting: true,
          },
        },
      },
    });
  }

  async discardInvoices(orgId: string, invoiceIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);

    await prisma.$transaction(async (tx) => {
      for (let id of invoiceIds) {
        // update invoice and invoice details records
        const invoiceDetails = await tx.invoiceDetail.findMany({
          where: {
            invoiceId: id,
          },
          select: {
            id: true,
          },
        });

        const invoiceDetailIds = invoiceDetails.flatMap((x) => x.id);

        await tx.invoice.update({
          where: { id: id },
          data: {
            isDeleted: true,
            invoiceDetail: {
              updateMany: {
                where: {
                  id: {
                    in: invoiceDetailIds,
                  },
                },
                data: {
                  isDeleted: true,
                },
              },
            },
          },
        });

        // update job record(s)
        const invoiceJobs = await tx.invoiceDetail.findMany({
          where: {
            id: {
              in: invoiceDetailIds,
            },
          },
          select: {
            job: true,
          },
        });

        const jobs = invoiceJobs.flatMap((x) => x.job);
        const jobIds = jobs.flatMap((x) => {
          if (x !== null) {
            return x.id;
          }
        }) as string[];

        await tx.job.updateMany({
          where: {
            id: {
              in: jobIds,
            },
          },
          data: {
            isDiscarded: true,
          },
        });
      }
    });
  }

  async queueInvoice(orgId: string, invoiceIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);

    await prisma.$transaction(async (tx) => {
      const completeStatus = await tx.status.findFirstOrThrow({
        where: {
          content: 'Complete',
        },
      });

      for (let id of invoiceIds) {
        // update invoice and invoice details records
        const invoiceDetails = await tx.invoiceDetail.findMany({
          where: {
            invoiceId: id,
          },
          select: {
            id: true,
          },
        });

        const invoiceDetailIds = invoiceDetails.flatMap((x) => x.id);

        await tx.invoice.update({
          where: { id: id },
          data: {
            isDeleted: true,
            invoiceDetail: {
              updateMany: {
                where: {
                  id: {
                    in: invoiceDetailIds,
                  },
                },
                data: {
                  isDeleted: true,
                },
              },
            },
          },
        });

        // update job record(s)
        const invoiceJobs = await tx.invoiceDetail.findMany({
          where: {
            id: {
              in: invoiceDetailIds,
            },
          },
          select: {
            job: true,
          },
        });

        const jobIds: string[] = [];
        invoiceJobs.forEach((detail: any) => {
          if (detail?.job?.id) {
            jobIds.push(detail.job.id);
          }
        });

        await tx.job.updateMany({
          where: {
            id: {
              in: jobIds,
            },
          },
          data: {
            statusId: completeStatus.id,
            isDiscarded: false,
          },
        });
      }
    });
  }

  async queueDiscardedJobs(orgId: string, jobIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);

    const completeStatus = await prisma.status.findFirstOrThrow({
      where: {
        content: 'Complete',
      },
    });

    await prisma.job.updateMany({
      where: {
        id: {
          in: jobIds,
        },
      },
      data: {
        statusId: completeStatus.id,
        isDiscarded: false,
      },
    });
  }

  async markInvoicesSent(orgId: string, invoiceIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    const invoiceStatusSent = await this.getInvoiceStatusByContent('SNT');
    return prisma.invoice.updateMany({
      data: {
        statusId: invoiceStatusSent.id,
      },
      where: {
        id: {
          in: invoiceIds,
        },
      },
    });
  }

  async markInvoicesPaid(orgId: string, invoiceIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    const invoiceStatusPaid = await this.getInvoiceStatusByContent('PAID');
    return prisma.invoice.updateMany({
      data: {
        statusId: invoiceStatusPaid.id,
        processed: true,
      },
      where: {
        id: {
          in: invoiceIds,
        },
      },
    });
  }

  async markInvoicesCreated(orgId: string, invoiceIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    const invoiceStatusCreated = await this.getInvoiceStatusByContent('CRD');
    return prisma.invoice.updateMany({
      data: {
        statusId: invoiceStatusCreated.id,
        processed: false,
      },
      where: {
        id: {
          in: invoiceIds,
        },
      },
    });
  }

  async getInvoiceStatusByContent(code: string) {
    return prismaClientBypass.invoiceStatus.findFirstOrThrow({
      where: {
        code,
      },
    });
  }

  async countInvoicesByIds(orgId: string, invoiceIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.invoice.count({
      where: {
        id: {
          in: invoiceIds,
        },
      },
    });
  }

  async getYtdRevenue(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    const invoiceSentStatus = await this.getInvoiceStatusByContent('SNT');
    const invoicePaidStatus = await this.getInvoiceStatusByContent('PAID');

    let invoiceStatusArr = [];
    invoiceStatusArr.push(invoiceSentStatus.id);
    invoiceStatusArr.push(invoicePaidStatus.id);

    const januaryFirst = new Date(new Date().getFullYear(), 0, 1, -5, 0);
    const decemberThirtyFirst = new Date(
      new Date().getFullYear(),
      11,
      31,
      19,
      0
    );

    return await prisma.invoiceDetail.findMany({
      where: {
        invoice: {
          statusId: {
            in: invoiceStatusArr,
          },
          invoiceDate: {
            gte: januaryFirst,
            lt: decemberThirtyFirst,
          },
        },
      },
      select: {
        id: true,
        amount: true,
        taxRate: true,
        isTaxable: true,
      },
    });
  }

  async getRevenueWithinPastDays(orgId: string, pastDays: number) {
    const prisma = getPrismaClientForTenant(orgId);
    const invoiceSentStatus = await this.getInvoiceStatusByContent('SNT');
    const invoicePaidStatus = await this.getInvoiceStatusByContent('PAID');

    let invoiceStatusArr = [];
    invoiceStatusArr.push(invoiceSentStatus.id);
    invoiceStatusArr.push(invoicePaidStatus.id);

    const today = new Date();
    const startingDate = new Date(
      new Date().setDate(today.getDate() - pastDays)
    );
    startingDate.setHours(0);
    startingDate.setMinutes(0);

    return await prisma.invoiceDetail.findMany({
      where: {
        invoice: {
          statusId: {
            in: invoiceStatusArr,
          },
          invoiceDate: {
            gte: startingDate,
          },
        },
      },
      select: {
        id: true,
        amount: true,
        taxRate: true,
        isTaxable: true,
      },
    });
  }

  async isAnyStatusPaid(orgId: string, invoiceIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    const invoicePaidStatus = await this.getInvoiceStatusByContent('PAID');
    return await prisma.invoice.count({
      where: {
        id: {
          in: invoiceIds,
        },
        statusId: {
          equals: invoicePaidStatus.id,
        },
      },
    });
  }

  async updateQbSync(orgId: string, invoiceIds: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.invoice.updateMany({
      data: {
        syncToQb: true,
      },
      where: {
        id: {
          in: invoiceIds,
        },
      },
    });
  }

  async getInvoicesToSync(orgId: string, invoiceIds?: string[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.invoice.findMany({
      where: {
        syncToQb: true,
        isDeleted: false,
        ...(invoiceIds && {
          id: {
            in: invoiceIds,
          },
        }),
      },
      include: {
        invoiceDetail: {
          include: {
            jobSubType: true,
            customFields: true,
          },
          where: {
            isDeleted: false,
          },
        },
        customer: true,
      },
    });
  }
}
