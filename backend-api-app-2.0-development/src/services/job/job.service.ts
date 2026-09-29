import { ExpoPushMessage } from 'expo-server-sdk';
import { User } from '@prisma/client';
import { geocode } from '../../utils/geocoder/geocoder.client';
import {
  isDateSameAsToday,
  isWithinTwentyFourHours,
  generateStartEndDateRangeForDiff,
} from '../../utils/dates/dates';
import { EtaService } from '../eta/eta.service';
import {
  getPushMessagesForUsers,
  getPushMessagesForUser,
} from '../pushNotification/userPushNotification.service';
import { PushNotificationService } from '../pushNotification/pushNotification.service';
import { JobSendNotification } from './job.sendNotification.service';
import { JobRepository } from '../../repositories/job/job.repository';
import { JobSearchRepository } from '../../repositories/job/jobSearch.repository';
import { LocationRepository } from '../../repositories/location/location.repository';
import { CrewRepository } from '../../repositories/crew/crew.repository';
import JobStatus from '../../utils/enums/job.status';
import TextController from '../../controllers/text/text.controller';
import NotificationService, {
  CreateNotificationInput,
} from '../notification/notification.service';
import {
  generateJobScopeChangedTemplate,
  generatePushTemplate,
  generateCancelTemplate,
  generateReportTemplate,
  generateRescheduleTemplate,
} from '../../utils/email/templateGenerator.util';
import {
  sendJobCancelledEmail,
  sendJobReportEmail,
  sendJobRescheduleEmail,
  sendJobPushEmail,
  sendScopeChangedEmail,
} from '../../utils/email/send.confirmation';
import NotificationType from '../../utils/enums/notification.types';
import ReceiverType from '../../utils/enums/receiver.types';
import { getS3FilesAsAttachments } from '../../utils/s3/s3.util';
import Role from '../../utils/enums/roles';
import OrganizationSettingsService from '../../services/organizationSettings/organizationSettings.service';
import { DateTime } from 'luxon';

const etaService = new EtaService();
const pushService = new PushNotificationService();
const jobSendNotification = new JobSendNotification();
const jobRepository = new JobRepository();
const jobSearchRepository = new JobSearchRepository();
const locationRepository = new LocationRepository();
const crewRepository = new CrewRepository();
const notificationService = new NotificationService();
const organizationSettingsService = new OrganizationSettingsService();

export class JobService {
  async getAllJobs(orgId: string) {
    return jobRepository.getAllJobs(orgId);
  }

  async getStatusCount(orgId: string) {
    return jobRepository.getStatusCount(orgId);
  }

  async getTodayAndTomorrow(orgId: string) {
    const timezoneObj = await organizationSettingsService.getTimeZone(orgId);
    if(typeof timezoneObj?.timezone === "string") {
      const today = DateTime.now().setZone(timezoneObj?.timezone).startOf('day').toFormat('MM-dd-yy')
      const tomorrow= DateTime.now().setZone(timezoneObj?.timezone).plus({days: 1}).toFormat('MM-dd-yy')
      const todayDate = new Date(today)
      const tomorrowDate = new Date(tomorrow)
      return jobRepository.getTodayAndTomorrowJobs(orgId, todayDate, tomorrowDate)
    } else {
      console.log("There was an error in getTodayAndTomorrow job.service. Timezoneobj.timezone isn't a string.")
    }
  }

  async getJobsByDayDiff(orgId: string, days: number) {
    const timezoneObj = await organizationSettingsService.getTimeZone(orgId);
    if(typeof timezoneObj?.timezone === "string") {
      const dateRange = generateStartEndDateRangeForDiff(days, timezoneObj?.timezone);
      return jobRepository.getJobsByDayDiff(orgId, dateRange);
    } else {
      console.log("There was an error in getJobsByDayDiff job.service. Timezoneobj.timezone isn't a string.")
    }
  }

  async getJobsByStatus(orgId: string, statusId: number) {
    return jobRepository.getJobsByStatus(orgId, statusId);
  }

  async getSearchJobs(orgId: string, query: string) {
    return jobSearchRepository.getSearchJobs(orgId, query);
  }

  async getJob(orgId: string, id: string) {
    return jobRepository.getJob(orgId, id);
  }

  async updateEtaStatus(orgId: string, jobId: string, etaStatusId: number) {
    const job = await jobRepository.updateEtaStatus(orgId, jobId, etaStatusId);
    const isOnWay = await etaService.isOnTheWay(etaStatusId);
    if (isOnWay) {
      const pushNotifications: ExpoPushMessage[] = getPushMessagesForUsers(
        job.customer,
        'Job On The Way',
        `Job at ${job.project?.location?.address?.line1} is on the way`
      );
      await pushService.sendPushNotifications(pushNotifications);
    }
    return job;
  }

  async restartJob(
    orgId: string,
    jobId: string,
    statusId: number,
  ) {
    const restartedJob = await jobRepository.restartJob(
      orgId,
      jobId,
      statusId,
    );
    return restartedJob;
  }

  async pushJob(
    orgId: string,
    jobId: string,
    statusId: number,
    appNotes: string,
    userAuthId: string,
    userName: string
  ) {
    const pushedJob = await jobRepository.pushJob(
      orgId,
      jobId,
      statusId,
      appNotes
    );

    sendJobPushEmail(
      await notificationService.getAllAdminEmails(orgId),
      generatePushTemplate({
        subject: 'Job Push Request',
        address: pushedJob.project?.location?.address?.line1,
        city: pushedJob.project?.location?.address?.city,
        appNotes,
        customerName: pushedJob.customer.name,
        scheduledDate: pushedJob.scheduledDate,
        jobSubType: pushedJob.jobSubType?.name,
        jobScope: pushedJob.jobScope,
        crewName: pushedJob.crew?.name,
        userName,
      })
    );
    const notificationInput: CreateNotificationInput = {
      type: NotificationType.JOB_PUSHED,
      jobId: pushedJob.id,
      jobTechReference: pushedJob.techReference,
      receiverType: ReceiverType.ADMIN,
      title: 'Request to Push Job',
    };
    await notificationService.createNotification(
      orgId,
      userAuthId,
      notificationInput
    );
    return pushedJob;
  }

  async reportJob(
    orgId: string,
    jobId: string,
    statusId: number,
    notes: string,
    userAuthId: string,
    attachmentUrlBody: string,
    user: User
  ) {
    const job = await jobRepository.reportJob(orgId, jobId, statusId);

    const attachmentsArr = attachmentUrlBody
      ? await getS3FilesAsAttachments([attachmentUrlBody], job.id)
      : [];

    sendJobReportEmail(
      await notificationService.getAllAdminEmails(orgId),
      generateReportTemplate({
        subject: 'Job Reported',
        notes: notes,
        address: job.project?.location?.address?.line1,
        city: job.project?.location?.address?.city,
        techReference: job.techReference,
        customerName: job.customer.name,
        scheduledDate: job.scheduledDate,
        jobSubType: job.jobSubType?.name,
        jobScope: job.jobScope,
        crewName: job.crew?.name,
        userName: user?.firstName + ' ' + user?.lastName,
      }),
      attachmentsArr
    );

    await notificationService.createNotification(orgId, userAuthId, {
      type: NotificationType.JOB_REPORTED,
      jobId: job.id,
      jobTechReference: job.techReference,
      receiverType: ReceiverType.ADMIN,
      title: 'Job Reported',
      description: `${user?.firstName || ''} ${
        user?.lastName || ''
      } has reported job ${job.techReference} \n "${notes}"`,
    });
    return job;
  }

  async reschedule(
    orgId: string,
    jobId: string,
    scheduledDate: string,
    timeSlot: string,
    userAuthId: string
  ) {
    //if job is within 24 hours of schedule, then approval is required.
    const currentJob = await jobRepository.findFirstOrThrow(orgId, jobId);

    let data: { scheduledDate?: Date; timeSlot?: string; statusId?: number } = {
      scheduledDate: new Date(scheduledDate),
      timeSlot: `${timeSlot}`,
    };

    const approvalRequired = isWithinTwentyFourHours(currentJob.scheduledDate);
    let subject = 'Job Reschedule';

    if (approvalRequired) {
      data = {
        statusId: JobStatus.NeedsApproval,
      };
      subject = 'Job Reschedule - NEEDS APPROVAL';
    }
    const job = await jobRepository.reschedule(orgId, jobId, data);

    sendJobRescheduleEmail(
      await notificationService.getAllAdminEmails(orgId),
      generateRescheduleTemplate({
        subject,
        address: job?.project?.location?.address?.line1,
        city: job?.project?.location?.address?.city,
        scheduledDate: data.scheduledDate,
        timeSlot,
      })
    );

    await notificationService.createNotification(orgId, userAuthId, {
      type: NotificationType.JOB_RESCHEDULED,
      jobId: job.id,
      jobTechReference: job.techReference,
      receiverType: ReceiverType.ADMIN,
      triggeredBy: job.customer.name,
      title: subject,
      description: `${job.customer.name} has ${
        approvalRequired ? 'requested' : ''
      } rescheduled for ${job.scheduledDate.toDateString()}`,
    });
    return job;
  }

  async cancel(
    orgId: string,
    jobId: string,
    userAuthId: string,
    userName: string
  ) {
    //if job is within 24 hours of schedule, then approval is required.
    const currentJob = await jobRepository.findFirstOrThrow(orgId, jobId);
    const needsApproval = isWithinTwentyFourHours(currentJob.scheduledDate);

    const job = await jobRepository.cancel(
      orgId,
      jobId,
      needsApproval ? JobStatus.NeedsApproval : JobStatus.Cancelled
    );

    const title = `Job Canceled${needsApproval ? ' - NEEDS APPROVAL' : ''}`;

    sendJobCancelledEmail(
      await notificationService.getAllAdminEmails(orgId),
      generateCancelTemplate({
        subject: title,
        address: job?.project?.location?.address?.line1,
        city: job?.project?.location?.address?.city,
        customerName: job.customer.name,
        scheduledDate: job.scheduledDate,
        jobSubType: job.jobSubType?.name,
        jobScope: job.jobScope,
        crewName: job.crew?.name,
        userName,
      })
    );

    const notificationInput: CreateNotificationInput = {
      type: NotificationType.JOB_CANCELED,
      jobId: job.id,
      jobTechReference: job.techReference,
      receiverType: ReceiverType.ADMIN,
      triggeredBy: job.customer.name,
      title,
      description: `${job.customer.name} ${
        needsApproval ? 'has requested to cancel job' : 'has canceled job'
      } ${job.techReference}`,
    };
    await notificationService.createNotification(
      orgId,
      userAuthId,
      notificationInput
    );
  }

  async updateStatus(orgId: string, jobId: string, statusId: number) {
    const job = await jobRepository.updateStatus(orgId, jobId, statusId);
    //Send notifications to customer
    let pushNotifications: ExpoPushMessage[] = [];
    if (statusId === JobStatus.InProgress) {
      pushNotifications = getPushMessagesForUsers(
        job.customer,
        'Job Started',
        `Job at ${job.project?.location?.address?.line1} has started`
      );
    } else if (statusId === JobStatus.Complete) {
      pushNotifications = getPushMessagesForUsers(
        job.customer,
        'Job Completed',
        `Job at ${job.project?.location?.address?.line1} has been completed`
      );
      await jobSendNotification.sendNotifications(job, orgId);
    }
    await pushService.sendPushNotifications(pushNotifications);

    return job;
  }

  async updateJobScope(
    orgId: string,
    jobId: string,
    jobScope: string,
    userAuthId: string
  ) {
    const thisJob = await jobRepository.findFirst(orgId, jobId);

    if (thisJob!.statusId == JobStatus.Complete) {
      throw new Error('JobScope cannot be changed after a Job is completed.');
    }

    const job = await jobRepository.updateJobScope(orgId, jobId, jobScope);

    await this.sendJobScopeNotification(job, userAuthId);

    return job;
  }

  async sendJobScopeNotification(job: any, userAuthId: string) {
    const adminEmails = await notificationService.getAllAdminEmails(job.orgId);

    sendScopeChangedEmail(
      adminEmails,
      generateJobScopeChangedTemplate({
        subject: 'Job Scope Adjusted',
        job: {
          techReference: job.techReference,
          jobScope: job.jobScope,
        },
      })
    );

    const notificationInput: CreateNotificationInput = {
      type: NotificationType.JOB_SCOPE_MODIFIED,
      jobId: job.id,
      jobTechReference: job.techReference,
      receiverType: ReceiverType.ADMIN,
      title: 'Job Scope Modified',
      description: `Scope has been adjusted for Job ${job.techReference}`,
    };

    await notificationService.createNotification(
      job.orgId,
      userAuthId,
      notificationInput
    );
  }

  async updateJobCustomFields(
    orgId: string,
    jobId: string,
    customFields: any[]
  ) {
    return jobRepository.updateJobCustomFields(orgId, customFields);
  }

  async update(orgId: string, jobId: string, body: any, userAuthId: string) {
    const thisJob = await jobRepository.findFirst(orgId, jobId);

    let jobScopeChanged = false;
    if (body.jobScope != thisJob!.jobScope) {
      jobScopeChanged = true;
    }

    let jobBeingCompleted = false;
    if (body.statusId === JobStatus.Complete) {
      jobBeingCompleted = thisJob!.statusId != JobStatus.Complete;
      if (!jobBeingCompleted && jobScopeChanged) {
        throw new Error('JobScope cannot be changed after a Job is completed.');
      }
    }

    let geocoding = [];
    if (
      body.location &&
      body.location.address &&
      body.location.address.line1 &&
      body.location.address.city &&
      body.location.address.state &&
      body.location.address.zipCode
    ) {
      const address = `${body.address.line1} ${body.address.city}, ${body.address.state} ${body.address.zipCode}`;
      const data = (await geocode(address)).data;

      let results = [];
      if (data.status === 'OK') {
        results = data.results;
      }

      if (results.length > 0) {
        geocoding.push(results[0].geometry.location);
      }
    }

    const existingAssignment =
      await crewRepository.findFirstCrewAssignmentFilteredBy(orgId, {
        customerId: body.customerId,
        crewId: body.crewId,
        jobTypeId: body.jobTypeId,
      });

    if (body.createCrewAssignment == false && existingAssignment) {
      await crewRepository.deleteCrewAssignment(orgId, existingAssignment.id);
    }

    if (body.createCrewAssignment == true && !existingAssignment) {
      await crewRepository.createCrewAssignment(orgId, {
        customerId: body.customerId,
        crewId: body.crewId,
        jobTypeId: body.jobTypeId,
      });
    }

    const updatedJob = await jobRepository.update(
      orgId,
      jobId,
      body,
      thisJob,
      geocoding
    );

    if (!jobBeingCompleted && jobScopeChanged) {
      await this.sendJobScopeNotification(updatedJob, userAuthId);
    }

    if (body.locationNotes && body.locationId) {
      await locationRepository.updateNotes(orgId, body.locationId, body.notes);
    }

    const orgTimeZoneObj = await organizationSettingsService.getTimeZone(orgId);
    const jobScheduledForToday = isDateSameAsToday(
      updatedJob?.scheduledDate, orgTimeZoneObj?.timezone
    );
    const allPushNotifications: ExpoPushMessage[] = [];
    const highPriority = 1;
    const jobLocation = updatedJob.project?.location?.address?.line1 || '';
    if (
      jobScheduledForToday &&
      updatedJob.User &&
      thisJob?.priority != updatedJob.priority &&
      updatedJob.priority === highPriority
    ) {
      //Job for Today has been set as High-priority - crew
      const pushNotifications: ExpoPushMessage[] = getPushMessagesForUser(
        updatedJob.User,
        'HIGH PRIORITY',
        `Job at ${jobLocation} is flagged as high-priority`
      );
      allPushNotifications.push(...pushNotifications);
    }

    if (
      jobScheduledForToday &&
      updatedJob.User &&
      thisJob?.userId != updatedJob.userId &&
      updatedJob.statusId === JobStatus.Scheduled
    ) {
      //Job for Today has been assigned to Crew - crew
      const pushNotifications: ExpoPushMessage[] = getPushMessagesForUser(
        updatedJob.User,
        'Job Assigned',
        `Job at ${jobLocation} has been assigned`
      );
      allPushNotifications.push(...pushNotifications);
    }
    if (
      jobScheduledForToday &&
      updatedJob.User &&
      updatedJob.userId &&
      thisJob?.statusId != updatedJob.statusId &&
      updatedJob.statusId === JobStatus.Cancelled
    ) {
      //Assigned Job for Today has been cancelled - crew
      const pushNotifications: ExpoPushMessage[] = getPushMessagesForUser(
        updatedJob.User,
        'Job Cancelled',
        `Job at ${jobLocation} has been cancelled`
      );
      allPushNotifications.push(...pushNotifications);
    }

    if (
      jobScheduledForToday &&
      thisJob?.User &&
      thisJob?.userId &&
      thisJob?.userId != updatedJob.userId
    ) {
      //Job has been re-assigned. (unassigned) - crew
      const pushNotifications: ExpoPushMessage[] = getPushMessagesForUser(
        thisJob.User,
        'Job Unassigned',
        `Job at ${jobLocation} has been unassigned`
      );
      allPushNotifications.push(...pushNotifications);
    }

    if (
      thisJob?.statusId != JobStatus.InProgress &&
      updatedJob.statusId === JobStatus.InProgress
    ) {
      //Job started - crew
      const pushNotifications = getPushMessagesForUsers(
        updatedJob.customer,
        'Job Started',
        `Job at ${jobLocation} has started`
      );
      allPushNotifications.push(...pushNotifications);
    } else if (
      body.scheduledDate &&
      thisJob?.scheduledDate?.toUTCString() !=
        updatedJob?.scheduledDate?.toUTCString()
    ) {
      //Job re-scheduled
      const dateFormatted = updatedJob.scheduledDate
        ? new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'UTC',
          }).format(updatedJob.scheduledDate)
        : '';
      if (updatedJob.User && updatedJob.userId) {
        // Notify crew
        const pushNotifications: ExpoPushMessage[] = getPushMessagesForUser(
          updatedJob.User,
          'Job Re-scheduled',
          `Job at ${jobLocation} has been re-scheduled for ${dateFormatted}`
        );
        allPushNotifications.push(...pushNotifications);
      }
      // Notify customer
      const pushNotifications = getPushMessagesForUsers(
        updatedJob.customer,
        'Job Re-scheduled',
        `Job at ${jobLocation} has been re-scheduled for ${dateFormatted}`
      );
      allPushNotifications.push(...pushNotifications);
    }
    if (jobBeingCompleted) {
      //Job completed
      const pushNotifications = getPushMessagesForUsers(
        updatedJob.customer,
        'Job Completed',
        `Job at ${jobLocation} has been completed`
      );
      allPushNotifications.push(...pushNotifications);
      await jobSendNotification.sendNotifications(updatedJob, orgId);
    }

    await pushService.sendPushNotifications(allPushNotifications);

    if (
      (body.notifyCrew || body.notifyCrewMember) &&
      process.env.SEND_TEXT === 'true'
    ) {
      const textController = new TextController();
      // @ts-ignore
      const number = `+1${updatedJob?.crew?.CrewUser[0]?.User[0]?.contact?.phone?.number.replace(
        /-/g,
        ''
      )}`;

      const text = `A Scrap-It Job at address ${updatedJob.project?.location.address.line1} has been assigned to you. Please contact your Scrap-It admin for more info.`;

      textController.sendText(orgId, text, number);
    }
    return updatedJob;
  }

  async createCustomFields(
    orgId: string,
    jobId: string,
    customFields: {
      customFieldId: string;
      value: string;
    }[]
  ) {
    const createData = customFields.map((customField) => {
      return {
        jobId: jobId,
        organizationCustomFieldId: customField.customFieldId,
        value: customField.value,
        isDeleted: false,
      };
    });

    return await jobRepository.createCustomFields(orgId, createData);
  }

  async validateUserCanUpdateCustomFields(
    orgId: string,
    customFieldIds: number[],
    userRole: Role
  ): Promise<boolean> {
    const customFields = await jobRepository.getJobCustomFields(
      orgId,
      customFieldIds
    );
    let validCustomFields: any[] = [];
    if (userRole === Role.CUSTOMER) {
      validCustomFields = customFields.filter(
        (field) =>
          field.organizationCustomField.showCustomer &&
          field.organizationCustomField.isActive &&
          !field.organizationCustomField.isDeleted
      );
    } else if (userRole === Role.CREWMANAGER || userRole === Role.CREWMEMBER) {
      validCustomFields = customFields.filter(
        (field) =>
          field.organizationCustomField.showCrew &&
          field.organizationCustomField.isActive &&
          !field.organizationCustomField.isDeleted
      );
    } else {
      validCustomFields = customFields.filter(
        (field) => !field.organizationCustomField.isDeleted
      );
    }
    if (customFieldIds.length != validCustomFields.length) {
      return false;
    }
    return true;
  }
}
