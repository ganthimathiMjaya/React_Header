import { Response } from 'express';
import { differenceWith } from 'lodash';
import { Request as JWTRequest } from 'express-jwt';
import {
  Project,
  BookingSource,
  PhotoSource,
  PhotoType,
  Job,
} from '@prisma/client';
import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';
import randomString from '../../utils/randomString';
import getInternalContactList from '../../utils/email/get.distributionList';
import sendConfirmationEmail from '../../utils/email/send.confirmation';
import Role from '../../utils/enums/roles';
import { geocode } from '../../utils/geocoder/geocoder.client';
import JobStatus from '../../utils/enums/job.status';
import ContactTypes from '../../utils/enums/contact.types';
import recurringDates from '../../utils/dates/recurringDates';
import { s3Client } from '../../shared/s3Client';
import { Readable } from 'stream';
import NotificationService, {
  CreateNotificationInput,
} from '../../services/notification/notification.service';
import { ProjectService } from '../../services/project/project.service';
import { ContactService } from '../../services/contact/contact.service';
import NotificationType from '../../utils/enums/notification.types';
import ReceiverType from '../../utils/enums/receiver.types';
import { generateRandomUUID } from '../../utils/password/password.util';

const projectService = new ProjectService();
const notificationService = new NotificationService();
const contactService = new ContactService();

export class BookingService {
  public async getAllCustomFields(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.organizationCustomField.findMany({
      where: { isDeleted: false, isActive: true },
    });
  }

  public getOtherCustomFields(
    jobId: string,
    allCustomFields: any[],
    selectedCustomFields: any[]
  ) {
    const diff = differenceWith(
      allCustomFields,
      selectedCustomFields,
      ({ id }, { organizationCustomFieldId }) =>
        id === organizationCustomFieldId
    );
    if (!diff || !diff.length) {
      return [];
    }
    return diff.map((missing) => ({
      organizationCustomFieldId: missing.id,
      value: '',
      isDeleted: false,
      jobId,
    }));
  }

  public async getAllBookings(orgId: string, bookedById?: number) {
    const prisma = getPrismaClientForTenant(orgId);
    if (bookedById) {
      return await prisma.booking.findMany({ where: { bookedById } });
    }
    return await prisma.booking.findMany();
  }

  public async getPhotos(orgId: string, bookingId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return await prisma.photos.findMany({
      where: { bookingId },
    });
  }

  public async createCustomerBooking(
    orgId: string,
    body: any,
    userAuthId: string,
    user: any,
    customer: any
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    let customerId = customer.id;
    let userId = user.customerUser.userId;

    //Set up contacts email addresses (this should probably come after the two
    //fetch calls below so that the frontend doesn't have to send this every time - Danielle
    let customerEmail = [];
    customerEmail.push(
      customer.email,
      body.primaryContactEmail,
      body.secondaryContactEmail
    );

    //Fetch primary contact's id (should change this to fetch the whole record and populate
    //email from here if we can - Danielle
    let primaryContactId = '';
    if (body.primaryContactId) {
      primaryContactId = body.primaryContactId;
    } else {
      primaryContactId = (
        await contactService.createContact(orgId, customerId, {
          active: true,
          firstName: body.primaryContactFirstName,
          lastName: body.primaryContactLastName,
          email: body.primaryContactEmail,
          phone: body.primaryContactPhone,
          contactTypeId: ContactTypes.PRIMARY,
        })
      ).id;
    }

    //Same as above
    let secondaryContactId = '';
    if (body.secondaryContactId) {
      secondaryContactId = body.secondaryContactId;
    } else {
      secondaryContactId = (
        await contactService.createContact(orgId, customerId, {
          active: true,
          firstName: body.secondaryContactFirstName,
          lastName: body.secondaryContactLastName,
          email: body.secondaryContactEmail,
          phone: body.secondaryContactPhone,
          contactTypeId: ContactTypes.SECONDARY,
        })
      ).id;
    }

    //Fetch or create the project record - Danielle
    let bookingProject: Project | null;
    if (body.projectId && body.projectId !== '') {
      bookingProject = await projectService.getProject(orgId, body.projectId);
    } else {
      bookingProject = await projectService.createProject(
        orgId,
        body.customerId,
        {
          name: body.address,
          billingNotes: body.projectBillingNotes,
          customerId: body.customerId,
          isActive: true,
          location: {
            active: true,
            community: body.community,
            name: body.address,
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
        }
      );
    }

    let jobs: any[] = [];
    let dates = [new Date(body.scheduledDate)];

    // If Booking is Recurring
    if (
      body.recurrenceFrequency &&
      body.recurrenceEndDate &&
      new Date(body.scheduledDate) < new Date(body.recurrenceEndDate)
    ) {
      dates = recurringDates(
        new Date(body.scheduledDate),
        new Date(body.recurrenceEndDate),
        body.recurrenceFrequency.includes('Bi') ? 2 : 1,
        body.recurrenceFrequency.includes('Weekly') ? 'Week' : 'Month',
        true // no weekends
      );
    }

    let jobsCustomFields: any[] = [];
    const allCustomFields = await this.getAllCustomFields(orgId);

    //Build job records (might want to change this to a map rather than a for loop) - Danielle
    for (let d of dates) {
      jobs = jobs.concat(
        await Promise.all(
          body.jobs.map(async (j: any, idx: number) => {
            const crewAssignment = await prisma.crewAssignment.findFirst({
              where: {
                AND: [{ customerId: j.customerId }, { jobTypeId: j.jobTypeId }],
              },
            });

            const id = generateRandomUUID();
            if (j.customFields) {
              const fields = j.customFields.map((item: any) => ({
                organizationCustomFieldId: item.id,
                value: item.value || '',
                isDeleted: false,
                jobId: id,
              }));
              const otherCustomFields = this.getOtherCustomFields(
                id,
                allCustomFields,
                fields
              );
              jobsCustomFields = [
                ...jobsCustomFields,
                ...fields,
                ...otherCustomFields,
              ];
            }
            return {
              id,
              techReference: `C-${randomString(8)}`,
              scheduledDate: d,
              lastUpdatedById: userId,
              notes: j.notes,
              invoiceContactEmailAddress: j.invoiceContactEmailAddress
                ? j.invoiceContactEmailAddress
                : body.invoiceContactEmailAddress,
              crewId: crewAssignment ? crewAssignment.crewId : undefined,
              jobScope: j.jobScope,
              // ...(j.invoiceContactEmailAddress && {
              //   invoiceContactEmailAddress: j.invoiceContactEmailAddress,
              // }),
              ...(j.dumpsterDropoffSize && {
                dumpsterDropoffSize: j.dumpsterDropoffSize,
              }),
              ...(j.dumpsterPickupId && {
                dumpsterPickupId: j.dumpsterPickupId,
              }),
              ...(j.addProtection && { addProtection: j.addProtection }),
              ...(j.windowCount && { windowCount: j.windowCount }),
              ...(j.areasToService && { areasToService: j.areasToService }),
              ...(j.totalSqFt && { totalSqFt: j.totalSqFt }),
              ...(primaryContactId && {
                primaryContactId: primaryContactId,
              }),
              ...(secondaryContactId && {
                secondaryContactId: secondaryContactId,
              }),
              timeSlot: j.timeSlot,
              ...(j.denoteEpo && { denoteEpo: j.denoteEpo }),
              ...(j.poNum && { poNum: j.poNum }),
              ...(j.dumpsterId && {
                dumpsterId: j.dumpsterId,
              }),
              ...(j.jobTypeId && {
                jobTypeId: j.jobTypeId,
              }),
              ...(j.wasteType && {
                wasteType: j.wasteType.toString(),
              }),
              ...(j.jobSubTypeId && {
                jobSubTypeId: j.jobSubTypeId,
              }),
              createdById: userId,
              customerId: customerId,
              statusId: crewAssignment
                ? JobStatus.Scheduled
                : JobStatus.Unassigned,
              projectId: bookingProject!.id,
              locationId: bookingProject!.locationId,
            };
          })
        )
      );
    }

    //Create the booking record - Danielle
    const booking = await prisma.booking.create({
      data: {
        bookingSource:
          body.source.toLowerCase() === 'web'
            ? BookingSource.WEB
            : BookingSource.MOBILE,
        ...(body.timeSlot && {
          timeSlot: user.roleId === Role.CUSTOMER ? 'Anytime' : body.timeSlot,
        }),
        ...(body.recurrenceEndDate && {
          recurrenceEndDate: new Date(body.recurrenceEndDate),
        }),
        ...(body.recurrenceFrequency && {
          recurrenceFrequency: body.recurrenceFrequency,
        }),
        scheduledDate: new Date(body.scheduledDate),
        customer: { connect: { id: customerId } },
        // customerId: customerId,
        bookedBy: { connect: { id: userId } },
        // bookedById: userId,
        status: { connect: { id: JobStatus.Unassigned } },
        // statusId: 1,
        internalNotes: body.internalNotes,
        project: { connect: { id: bookingProject!.id } },
        //TODO: This needs to go when we're fully switched to project - Danielle
        location: { connect: { id: bookingProject!.locationId } },
        // locationId: bookingLocation.id,
        jobs: {
          createMany: {
            data: jobs,
          },
        },
      },
      include: {
        location: { include: { address: true } },
        jobs: {
          include: {
            jobType: true,
            jobSubType: true,
            customer: true,
            primaryContact: { include: { phone: true, email: true } },
            secondaryContact: { include: { phone: true, email: true } },
            createdBy: { include: { contact: { select: { email: true } } } },
            location: { include: { address: true } },
            project: { include: { location: { include: { address: true } } } },
          },
        },
      },
    });

    //Create Jobs custom fields.
    if (jobsCustomFields.length) {
      await prisma.organizationJobCustomField.createMany({
        data: jobsCustomFields,
      });
    }

    //If there are photos, attach them to the booking record - Danielle
    if (body.photos) {
      for (let j of booking.jobs) {
        for (let p of body.photos) {
          await prisma.photos.create({
            data: {
              url: p,
              source: PhotoSource.CLIENT,
              type: PhotoType.BOOKING,
              jobId: j.id,
              bookingId: booking.id,
            },
          });
        }
      }
    }

    //Build the email template data - Danielle
    const createdByUser = user;
    if (createdByUser) {
      const templateData = {
        subject: '',
        body: '',
        jobs: booking.jobs.map((job) => {
          return {
            collection_ref: job.techReference,
            customer: job.customer.name,
            primary_contact: `${job.primaryContact?.firstName || ''} ${
              job.primaryContact?.lastName || ''
            }`,
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
            areasToService: job?.areasToService!,
            notes: job?.notes!,
            arrival_window:
              user.roleId === Role.CUSTOMER ? 'Anytime' : `${job.timeSlot}`,
            collection_address: `${job.location.address.line1}, ${job.location.address.line2}, ${job.location.address.city}, ${job.location.address.state} ${job.location.address.zipcode}`,
            type: job.jobType?.shortDescription || '',
            jobSubType: job?.jobSubType?.name || '',
            job_scope: job.jobScope,
            booked_by: `${createdByUser.firstName || ''} ${
              createdByUser.lastName || ''
            } `,
          };
        }),
      };

      //If email is enabled on the service, send the email - Danielle
      if (process.env.SEND_EMAIL) {
        let bookingPhotos: { url: string }[] = await prisma.photos.findMany({
          where: {
            bookingId: booking.id,
            type: 'BOOKING',
          },
          select: {
            url: true,
          },
        });

        let keys = bookingPhotos.map((element) => {
          return {
            url: element.url.replace(/https:.*.com\//, ''),
          };
        });

        let attachmentArr = [];

        for (let i = 0; i < keys.length; i++) {
          let response = await s3Client.getObject({
            Bucket: process.env.AWS_BUCKET,
            Key: `${keys[i].url}`,
          });

          const stream = response.Body as Readable;

          let buffer = new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.once('end', () => {
              resolve(Buffer.concat(chunks));
            });
            stream.once('error', reject);
          });

          let attachment = {
            content: (await buffer).toString('base64'),
            filename: `BOOKING-${booking.id}-${i}.jpeg`,
            type: 'application/jpeg',
            disposition: 'attachment',
          };

          attachmentArr.push(attachment);
        }

        let recipientList: string[] = await getInternalContactList();
        for (let job of booking.jobs) {
          if (job.primaryContact?.email?.address) {
            if (!recipientList.includes(job.primaryContact?.email.address)) {
              recipientList.push(job.primaryContact?.email.address);
            }
          }

          if (job.secondaryContact?.email?.address) {
            if (!recipientList.includes(job.secondaryContact?.email.address)) {
              recipientList.push(job.secondaryContact?.email.address);
            }
          }

          if (job.createdBy?.contact?.email?.address) {
            if (!recipientList.includes(job.createdBy?.contact.email.address)) {
              recipientList.push(job.createdBy?.contact.email.address);
            }
          }
        }

        templateData['subject'] = `Booking Confirmation for ${
          booking.location?.address.line1
        } ${booking.scheduledDate?.toDateString()}`;
        templateData[
          'body'
        ] = `Scrap-It has confirmed your booking for ${booking.scheduledDate?.toDateString()} at the following address: ${
          booking.location?.address.line1
        } ${booking.location?.address.line2}, ${
          booking.location?.address.city
        }, ${booking.location?.address.state} ${
          booking.location?.address.zipcode
        }`;
        sendConfirmationEmail(
          recipientList,
          templateData,
          attachmentArr,
          customerEmail
        );
      }

      //Create notifications
      const notificationInput: CreateNotificationInput = {
        type: NotificationType.JOB_CREATED,
        receiverType: ReceiverType.ADMIN,
        triggeredBy: booking.jobs[0].customer.name,
        title: 'Job Created',
        description: '',
      };
      let description = '';
      if (booking.jobs.length > 1) {
        //Multiple jobs associated with request (recurring or not)
        description = 'Multiple Jobs have been booked.';
        booking.jobs.map((job: Job) => {
          description = description + `\n Tech-reference: ${job.techReference}`;
        });
      } else {
        //Only one non-recurring job booked
        const job = booking.jobs[0];
        description = `${job.customer.name} has created job ${job.techReference}`;
        notificationInput.jobId = job.id;
        notificationInput.jobTechReference = job.techReference;
      }
      notificationInput.description = description;

      await notificationService.createNotification(
        orgId,
        userAuthId,
        notificationInput
      );
    }

    return booking;
  }
}
