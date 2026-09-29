import { ExpoPushMessage } from 'expo-server-sdk';
import { getPushMessagesForUser } from '../pushNotification/userPushNotification.service';
import { PushNotificationService } from '../pushNotification/pushNotification.service';
import { JobRepository } from '../../repositories/job/job.repository';
import UserRepository from '../../repositories/user/user.repository';
import sendConfirmationEmail from '../../utils/email/send.confirmation';
import { isDateSameAsToday } from '../../utils/dates/dates';
import Role from '../../utils/enums/roles';
import { ProjectService } from '../../services/project/project.service';
import { LocationRepository } from '../../repositories/location/location.repository';
import { ContactService } from '../../services/contact/contact.service';
import OrganizationSettingsService from '../../services/organizationSettings/organizationSettings.service';
import { CrewRepository } from '../../repositories/crew/crew.repository';
import { CustomerRepository } from '../../repositories/customer/customer.repository';
import { Project } from '@prisma/client';

import ContactTypes from '../../utils/enums/contact.types';

const pushService = new PushNotificationService();
const jobRepository = new JobRepository();
const userRepository = new UserRepository();
const contactService = new ContactService();
const crewRepository = new CrewRepository();
const customerRepository = new CustomerRepository();
const projectService = new ProjectService();
const organizationSettingsService = new OrganizationSettingsService();

export class JobCreateService {
  async create(orgId: string, body: any) {
    let project;
    let orgTimeZoneObj = await organizationSettingsService.getTimeZone(orgId);
    //Check to see if we need to create the project record - Danielle
    if (
      !body.projectId &&
      body.address &&
      body.city &&
      body.state &&
      body.zipCode
    ) {
      project = await projectService.createProject(orgId, body.customerId, {
        name: body.projectName ?? body.address,
        billingNotes: body.projectBillingNotes,
        customerId: body.customerId,
        isActive: true,
        location: {
          active: true,
          community: body.community,
          name: body.projectName ?? body.address,
          notes: body.locationNotes,
          address: {
            line1: body.address,
            line2: body.address2,
            state: body.state,
            city: body.city,
            county: body.county,
            zipcode: body.zipCode,
            active: true,
          },
        },
      });
    } else {
      project = await projectService.getProject(orgId, body.projectId);
    }

    body.projectId = project!.id;
    //TODO: Remove once location foreign key is removed from the schema
    body.locationId = project!.locationId;

    const job = await jobRepository.create(orgId, body);

    if (job.customer?.rentalFees) {
      await jobRepository.updateRentalFess(
        orgId,
        job.id,
        job.customer.rentalFees
      );
    }

    if (job.createdById && !body?.doNotSendEmail) {
      const createdByUser = await userRepository.findFirst(
        orgId,
        job.createdById
      );

      if (createdByUser) {
        const templateData = {
          subject: '',
          body: '',
          jobs: [
            {
              collection_ref: job.techReference,
              customer: job.customerId,
              primary_contact: `${job.primaryContact?.firstName} ${job.primaryContact?.lastName}`,
              primary_phone: job.primaryContact?.phone?.number || '',
              primary_email: job.primaryContact?.email?.address || '',
              ...(job.secondaryContact
                ? {
                    secondary_contact: `${
                      job.secondaryContact?.firstName || ''
                    } ${job.secondaryContact?.lastName || ''}`,
                    secondary_phone: job.secondaryContact?.phone?.number || '',
                    secondary_email: job.secondaryContact?.email?.address || '',
                  }
                : {}),
              collection_date: job.scheduledDate.toDateString(),
              arrival_window: `${job.timeSlot}`,
              areasToService: job?.areasToService!,
              notes: job?.notes!,
              collection_address: `${job.project?.location.address.line1}, ${job.project?.location.address.line2}, ${job.project?.location.address.city}, ${job.project?.location.address.state} ${job.project?.location.address.zipcode}`,
              type: job.jobType?.shortDescription || '',
              jobSubType: job?.jobSubType?.name || '',
              job_scope: job.jobScope,
              booked_by: createdByUser.id.toString(),
            },
          ],
        };

        let recipientList: string[] = [];
        if (job.primaryContact?.email?.address) {
          recipientList.push(job.primaryContact?.email.address);
        }

        if (job.secondaryContact?.email?.address) {
          recipientList.push(job.secondaryContact.email.address);
        }

        if (job.createdBy?.contact?.email?.address) {
          recipientList.push(job.createdBy.contact.email.address);
        }

        if (createdByUser.role.id === Role.ADMIN) {
          templateData['subject'] = `Notification for ${
            job.jobType?.shortDescription
          } ${
            job.project?.location.address.line1
          } ${job.scheduledDate.toDateString()}`;
          sendConfirmationEmail(recipientList, templateData);
        } else if (createdByUser.role.id === Role.CUSTOMER) {
          templateData['subject'] = `Booking Confirmation for ${
            job.jobType?.shortDescription
          } ${
            job.project?.location.address.line1
          } ${job.scheduledDate.toDateString()}`;
          sendConfirmationEmail(recipientList, templateData);
        }
      }
    }

    const jobScheduledForToday = isDateSameAsToday(
      job.scheduledDate,
      orgTimeZoneObj?.timezone
    );
    if (jobScheduledForToday && job.User) {
      //Job created for today - send push to crew.
      const pushNotifications: ExpoPushMessage[] = getPushMessagesForUser(
        job.User,
        'Job Assigned',
        `Job at ${job.project?.location?.address?.line1} has been assigned`
      );
      await pushService.sendPushNotifications(pushNotifications);
    }
    return job;
  }

  async adminCreate(orgId: string, body: any) {
    let orgTimeZoneObj;
    try {
      orgTimeZoneObj = await organizationSettingsService.getTimeZone(orgId);
      if (
        orgTimeZoneObj?.timezone === '' ||
        orgTimeZoneObj === null ||
        orgTimeZoneObj?.timezone === null
      ) {
        throw new ReferenceError(`Org Settings Error`);
      }
    } catch (e) {
      return e;
    }
    let primaryContactId = '';
    if (body.primaryContactId) {
      primaryContactId = body.primaryContactId;
    } else {
      primaryContactId = (
        await contactService.createContact(orgId, body.customerId, {
          active: true,
          firstName: body.onsiteContactFirstName,
          lastName: body.onsiteContactLastName,
          email: body.onsiteContactEmail,
          phone: body.onsiteContactPhone,
          contactTypeId: ContactTypes.PRIMARY,
        })
      ).id;
    }

    let secondaryContactId = '';
    if (body.secondaryContactId) {
      secondaryContactId = body.secondaryContactId;
    } else {
      secondaryContactId = (
        await contactService.createContact(orgId, body.customerId, {
          active: true,
          firstName: body.jobManagerFirstName,
          lastName: body.jobManagerLastName,
          email: body.jobManagerEmail,
          phone: body.jobManagerPhone,
          contactTypeId: ContactTypes.SECONDARY,
        })
      ).id;
    }

    let bookingProject: Project | null;
    if (body.projectId) {
      bookingProject = await projectService.getProject(orgId, body.projectId);
    } else {
      bookingProject = await projectService.createProject(
        orgId,
        body.customerId,
        {
          // billingEmail: customer?.billingEmail, // search and set within createProject?
          name: body.projectName,
          isActive: true,
          location: {
            active: true,
            name: body.projectName,
            address: body.address,
          },
          primaryContactId,
          secondaryContactId,
        }
      );
    }

    // let newCrewAssignment;
    // const existingAssignment =
    //   await crewRepository.findFirstCrewAssignmentFilteredBy(orgId, {
    //     customerId: body.customerId,
    //     crewId: body.crew,
    //     jobTypeId: body.jobTypeId,
    //   });

    // if (body.createCrewAssignment && !existingAssignment) {
    //   if (!existingAssignment) {
    //     newCrewAssignment = await crewRepository.createCrewAssignment(orgId, {
    //       crewId: body.crew,
    //       customerId: body.customerId,
    //       jobTypeId: body.jobTypeId,
    //     });
    //   }
    // }

    // if (body.createCrewAssignment == false && existingAssignment) {
    //   await crewRepository.deleteCrewAssignment(orgId, existingAssignment.id);
    // }

    const job = await jobRepository.adminCreate(orgId, body, {
      bookingProject,
      primaryContactId,
      secondaryContactId,
    });

    const allPushNotifications: ExpoPushMessage[] = [];
    const jobScheduledForToday = isDateSameAsToday(
      job.scheduledDate,
      orgTimeZoneObj?.timezone
    );
    if (jobScheduledForToday && job.User) {
      //send push to crew.
      const pushNotifications: ExpoPushMessage[] = getPushMessagesForUser(
        job.User,
        'Job Assigned',
        `Job at ${job.project?.location?.address?.line1} has been assigned`
      );
      allPushNotifications.push(...pushNotifications);
    }
    const highPriority = 1;
    if (jobScheduledForToday && job.User && job.priority === highPriority) {
      //send push to crew.
      const pushNotifications: ExpoPushMessage[] = getPushMessagesForUser(
        job.User,
        'HIGH PRIORITY',
        `Job at ${job.project?.location?.address?.line1} is flagged as high-priority`
      );
      allPushNotifications.push(...pushNotifications);
    }
    await pushService.sendPushNotifications(allPushNotifications);
    return job;
  }
}
