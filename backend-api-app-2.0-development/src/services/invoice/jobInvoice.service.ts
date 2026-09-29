import {
  CompleteJob,
  DiscardJobInvoicing,
  InvoiceRepository,
  QueueJobInvoicing,
} from '../../repositories/invoice/invoice.repository';
import JobStatus from '../../utils/enums/job.status';
import { QueueJobDto } from '../../dto/queueJob.dto';
import { JobInvoiceStatusService } from './jobInvoiceStatus.service';
import { CreateInvoiceDto } from '../../dto/createInvoice.dto';
import { createInvoiceNumber } from '../../utils/reports/invoice/createInvoiceRecords';
import { JobRepository } from '../../repositories/job/job.repository';
import { StatusRepository } from '../../repositories/status/status.repository';
import { InvoiceStatusRepository } from '../../repositories/invoiceStatus/invoiceStatus.repository';
import OrganizationSettingsRepository from '../../repositories/organizationSettings/organizationSettings.repository';
import { DiscardedJobDto } from '../../dto/discardedJob.dto';
import LineItemType from '../../utils/enums/lineItemType.types';
import { Prisma } from '@prisma/client';
import { UpdateJobNotesDto } from '../../dto/updateJobNotes.dto';
import { CustomerRepository } from '../../repositories/customer/customer.repository';

const invoiceRepository = new InvoiceRepository();
const jobRepository = new JobRepository();
const invoiceStatusRepository = new InvoiceStatusRepository();
const jobInvoiceStatusService = new JobInvoiceStatusService();
const orgSettingsRepository = new OrganizationSettingsRepository();
const customerRepository = new CustomerRepository();
const statusRepository = new StatusRepository();

export class JobInvoiceService {
  async getQueueJobs(orgId: string): Promise<QueueJobDto[]> {
    const completedJobs: QueueJobInvoicing[] =
      await invoiceRepository.getJobsByStatusId(orgId, JobStatus.Complete);
    const queueJobs: QueueJobDto[] = completedJobs.map(
      (job: QueueJobInvoicing) => {
        const billingEmail = job.project?.billingEmail || job.customer?.email;
        const isTaxable = job.jobSubType?.isTaxable;
        const taxRate = job.jobSubType?.taxRate?.taxRatePercent;
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
          crewFullName: `${job.User?.firstName} ${job.User?.lastName}`,
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
          customFields: job.OrganizationJobCustomField?.map(
            (jobCustomField) => ({
              name: jobCustomField.organizationCustomField?.name,
              value: jobCustomField.value,
            })
          ),
        });
      }
    );
    return queueJobs;
  }

  async getQueueJobsCount(orgId: string) {
    const completedJobsCount = await invoiceRepository.getJobCountByStatusId(
      orgId,
      JobStatus.Complete
    );

    return completedJobsCount;
  }

  async getDiscardedJobs(orgId: string): Promise<DiscardedJobDto[]> {
    const discardedJobs: DiscardJobInvoicing[] =
      await invoiceRepository.getDiscardedJobs(orgId);

    const inactiveStatus = await invoiceStatusRepository.getStatusByCode(
      orgId,
      'INA'
    );

    const jobs: DiscardedJobDto[] = discardedJobs.map(
      (job: DiscardJobInvoicing) => {
        //if null, then use the customer's email.
        const billingEmail = job.project?.billingEmail || job.customer?.email;
        const isTaxable = job.jobSubType?.isTaxable;
        const taxRate = job.jobSubType?.taxRate?.taxRatePercent;
        const rate = job.jobSubType?.cost || 0;
        const total = rate + (taxRate ? rate * (taxRate / 100) : 0);

        return new DiscardedJobDto({
          jobId: job.id,
          jobStatusId: job.statusId,
          jobTechReference: job.techReference,
          invoicingStatus: inactiveStatus.desc,
          billingEmail,
          projectName: job.project?.name,
          accountingSoftware: job.project?.accountingSoftware,
          dateOfService: job.scheduledDate,
          customerName: job.customer?.name,
          jobTypeName: job.jobType?.shortDescription,
          jobSubTypeName: job.jobSubType?.name,
          crewFullName: `${job.User?.firstName} ${job.User?.lastName}`,
          quantity: 1,
          rate: job.jobSubType?.cost,
          isTaxable,
          taxRate,
          total,
          //Notes
          jobScope: job.jobScope, // Job Scope
          crewNotes: job.crewNotes, // Crew Job Notes
          invoiceNotes: job.invoiceNotes, // Invoice Job Notes
          customerNotes: job.customer?.notes, // Customer Invoicing Notes
          jobNotes: job.notes, // Job Notes
          projectInvoicingNotes: job.project?.billingNotes, // Does this need to show up in invoicing?
          customFields: job.OrganizationJobCustomField?.map(
            (jobCustomField) => ({
              name: jobCustomField.organizationCustomField?.name,
              value: jobCustomField.value,
            })
          ),
          isDiscarded: job.isDiscarded,
        });
      }
    );
    return jobs;
  }

  async discardJobs(orgId: string, jobIds: string[]) {
    await invoiceRepository.discardJobs(orgId, jobIds);
  }

  async queueDiscardedJobs(orgId: string, jobIds: string[]) {
    await invoiceRepository.queueDiscardedJobs(orgId, jobIds);
  }

  public getQueuedJob(orgId: string, job: CompleteJob): QueueJobDto {
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
    const customerId = (await jobRepository.getCustomerIdFromJob(orgId, jobId))
      .customerId;

    const updatedNotes = await invoiceRepository.updateJobNotes(
      orgId,
      jobId,
      notes
    );

    const updatedCustomer = await customerRepository.updateNotes(
      orgId,
      customerId,
      notes.customerInvoicingNotes
    );
  }

  async createInvoice(orgId: string, createInvoices: CreateInvoiceDto[]) {
    const invoicesCreated: string[] = [];
    const invoiceMessage = await this.getInvoiceMessage(orgId);
    const createdInvoiceStatus = await invoiceStatusRepository.getStatusByCode(
      orgId,
      'CRD'
    );
    const jobInvoicedStatus = await statusRepository.getStatusByContent(
      orgId,
      'Invoiced'
    );

    await Promise.all(
      createInvoices.map(async (createInvoice) => {
        // grab the first jobId since the system can only merge jobs
        // associated to the same project/customer
        const jobs = await jobRepository.getCompleteJobsWithCustomerById(
          orgId,
          createInvoice.jobIds
        );
        const firstJob = jobs[0] || null;

        if (firstJob !== null) {
          //Since we are already checking all jobs belong to same taxRate, it would be the same value.
          const taxRate = firstJob.jobSubType?.taxRate?.taxRatePercent;

          // set up Invoice record data
          const invoiceNumber = createInvoiceNumber(firstJob);

          const today = new Date();
          // default terms to 30 days
          const terms = firstJob.customer.terms ? firstJob.customer.terms : 30;
          const dueDate = this.generateDueDate(today, terms);
          const location = firstJob.project?.location;

          const createdInvoice = await invoiceRepository.createInvoice(orgId, {
            invoiceNo: invoiceNumber,
            customerId: firstJob.customer.id,
            billingEmail:
              firstJob.customer?.billingEmail ||
              firstJob.project?.billingEmail ||
              firstJob.customer.email,
            billingPhone: firstJob.customer?.billingPhone,
            terms,
            taxRate,
            statusId: createdInvoiceStatus.id,
            projectId: firstJob.projectId,
            dueDate,
            invoiceDate: today,
            messageOnInvoice: invoiceMessage,
            //Project snapshot.
            projectName: firstJob.project?.name,
            projectBillingNotes: firstJob.project?.billingNotes,
            projectAccountingSoftware: firstJob.project?.accountingSoftware,
            projectCommunityName: location?.community,
            projectLine1: location?.address?.line1,
            projectLine2: location?.address?.line2,
            projectLine3: location?.address?.line3,
            projectCity: location?.address?.city,
            projectState: location?.address?.state,
            projectZipcode: location?.address?.zipcode,
            billingLine1: firstJob.customer?.location?.address?.line1,
            billingLine2: firstJob.customer?.location?.address?.line2,
            billingCity: firstJob.customer?.location?.address?.city,
            billingState: firstJob.customer?.location?.address?.state,
            billingZipcode: firstJob.customer?.location?.address?.zipcode,
          });

          const queuedJobs = jobs.map((rawJob) =>
            this.getQueuedJob(orgId, rawJob)
          );

          const invoiceDetailRecords = queuedJobs.map((queuedJob, index) => {
            return {
              jobId: queuedJob.jobId,
              taxRate: queuedJob.taxRate,
              isTaxable: queuedJob.isTaxable,
              quantity: queuedJob.quantity,
              description: queuedJob.jobScope,
              serviceDate: queuedJob.dateOfService,
              jobTypeId: queuedJob.jobTypeId,
              jobSubTypeId: queuedJob.jobSubTypeId,
              crewFirstName: queuedJob.crewFirstName,
              crewLastName: queuedJob.crewLastName,
              orgId: orgId,
              cost: queuedJob.rate,
              lineItemType: LineItemType.JOB,
              amount: queuedJob.quantity * (queuedJob.rate || 0),
              invoiceId: createdInvoice.id,
              invoiceLineNo: index + 1,
              crewNotes: queuedJob.crewNotes,
              invoiceNotes: queuedJob.invoiceNotes,
              customerNotes: queuedJob.customerNotes,
              jobNotes: queuedJob.jobNotes,
              scope: queuedJob.jobScope,
            };
          });

          try {
            await invoiceRepository.createInvoiceDetails(
              orgId,
              invoiceDetailRecords
            );
          } catch (error) {
            // Prisma transaction couldn't handle processing necessary to rollback both the InvoiceDetail and Invoice records
            // Explicitly deleting the created Invoice record if processing of the InvoiceDetail records fails
            await invoiceRepository.hardDeleteInvoice(orgId, createdInvoice.id);
            throw new Error(
              `Could not process Invoice and Invoice Detail records due to ${error}`
            );
          }

          try {
            const invoiceDetailRecords =
              await invoiceRepository.getInvoiceDetails(
                orgId,
                createdInvoice.id
              );
            const customFieldRecords = jobs.flatMap((job) => {
              return job.OrganizationJobCustomField.filter((customField) => {
                return customField.organizationCustomField.isInvoiceable;
              }).map((customField) => {
                return {
                  invoiceDetailId: invoiceDetailRecords
                    .filter((detail) => detail.jobId === job.id)
                    .at(0)?.id,
                  organizationCustomFieldCategoryId:
                    customField.organizationCustomField
                      .organizationCustomFieldCategory.id,
                  organizationCustomFieldCategoryCode:
                    customField.organizationCustomField
                      .organizationCustomFieldCategory.code,
                  organizationCustomFieldCategoryDesc:
                    customField.organizationCustomField
                      .organizationCustomFieldCategory.desc,
                  organizationCustomFieldId:
                    customField.organizationCustomField.id,
                  organizationCustomFieldName:
                    customField.organizationCustomField.name,
                  organizationJobCustomFieldId: customField.id,
                  customFieldValue: customField.value,
                };
              });
            });
            await invoiceRepository.createCustomFields(
              orgId,
              customFieldRecords
            );
            await jobRepository.updateStatusesForJobs(
              orgId,
              jobs.map((job) => job.id),
              jobInvoicedStatus.id
            );
          } catch (error) {
            // Same as above, but at this point the invoice detail records were created successfully and need to be removed
            // first - Danielle
            await invoiceRepository.hardDeleteInvoiceDetailsForInvoice(
              orgId,
              createdInvoice.id
            );
            await invoiceRepository.hardDeleteInvoice(orgId, createdInvoice.id);
            throw new Error(
              `Could not process Invoice and Invoice Detail records due to ${error}`
            );
          }
          invoicesCreated.push(createdInvoice.id);
        } else {
          throw new Error(
            `Job ID: ${createInvoice.jobIds[0]} is not complete, is discarded, or could not be found, could not create invoice.`
          );
        }
      })
    );
    return invoicesCreated;
  }

  async getInvoiceMessage(orgId: string) {
    let invoiceMessage = null;
    try {
      const orgSetting = await orgSettingsRepository.getInvoiceMessage(orgId);
      invoiceMessage = orgSetting.invoiceMessage;
    } catch {
      console.log(
        'Could not find org setting record. Defaulting invoice message to null.'
      );
    }

    return invoiceMessage;
  }

  generateDueDate(startingDate: Date, terms: number) {
    const dueDate = new Date();
    dueDate.setDate(startingDate.getDate() + terms);

    return dueDate;
  }
}
