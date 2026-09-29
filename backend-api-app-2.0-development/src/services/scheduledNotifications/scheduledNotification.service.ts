import JobController from '../../controllers/job/job.controller';
import { sendAdminInsightsEmail } from '../../utils/email/send.confirmation';
import { prismaClientBypass } from '../../utils/prisma/multiTenancyPrisma.client';
import { JobInsights } from '../../dto/jobInsights';
import ScheduledNotificationRepository from '../../repositories/scheduledNotifications/scheduledNotification.repository';
import { InvoiceService } from '../invoice/invoice.service';
import { formatShortCurrency } from '../../utils/number';

export default class ScheduledNotificationService {
  prisma = prismaClientBypass;
  repository = new ScheduledNotificationRepository();
  invoiceService = new InvoiceService();

  public async processJobInsights() {
    console.log('Processing rolling 30 day insights emails...');
    await this.processNewThirtyDayRollingInsights();
    await this.processExistingThirtyDayRollingInsights();
    await this.retryFailedInsights();
    console.log('Completed processing of rolling 30 day insights emails.');
  }

  async processNewThirtyDayRollingInsights() {
    const newLicensees = await this.repository.getNewLicensees();
    const status = await this.repository.getInsightsJobStatus('PROC');

    if (status !== null) {
      const insightsJobHeader = { insightsJobStatusId: status.id };
      let header = null;

      if (newLicensees.length > 0) {
        header = await this.prisma.insightsJobHeader.create({
          data: insightsJobHeader,
        });
      }

      let failureCount = 0;
      if (header !== null) {
        for (let i = 0; i < newLicensees.length; i++) {
          let detail = null;
          for (let j = 0; j < newLicensees[i].userOrganizations.length; j++) {
            try {
              const insightsJobDetail = {
                insightsJobHeaderId: header.id,
                insightsJobStatusId: 1,
                adminUserId: newLicensees[i].id,
                orgId: newLicensees[i].userOrganizations[j].orgId,
              };

              detail = await this.prisma.insightsJobDetail.create({
                data: insightsJobDetail,
              });

              let jobInsights = await this.getJobInsights(
                newLicensees[i].userOrganizations[j].orgId
              );

              let emailAddress = newLicensees[i].contact?.email?.address;

              if (emailAddress === null || emailAddress === '') {
                console.log(
                  `Cannot send email to userId ${newLicensees[i].id} because they do not have an email address.`
                );
                continue;
              }
              await this.sendInsightsEmail(jobInsights, emailAddress);
              await this.repository.updateJobDetailStatusById(
                detail.id,
                'COMP'
              );
            } catch (error) {
              console.log(
                `The following error occurred during processing of new rolling 30 day insights: ${error}`
              );

              if (detail !== null) {
                console.log(
                  `Insights email processing failed new licensee's Insights Job Detail record with ID of ${detail.id}.`
                );

                await this.repository.setFailedInsightsJobDetails(detail.id);
                failureCount++;
              }
            }
          }
        }

        await this.finalizeJobHeaderStatus(
          header.id,
          failureCount,
          newLicensees.length
        );
      }
    }
  }

  async processExistingThirtyDayRollingInsights() {
    const existingLicensees = await this.repository.getExistingLicensees();
    const status = await this.repository.getInsightsJobStatus('PROC');

    let hasInsightsJobHeaderAlreadyProcessed =
      await this.repository.determineIfInsightsJobHeaderAlreadyProcessed();

    if (hasInsightsJobHeaderAlreadyProcessed > 0) {
      console.log('A job header record has already been created today.');
    }

    if (status !== null && !hasInsightsJobHeaderAlreadyProcessed) {
      const insightsJobHeader = { insightsJobStatusId: status.id };
      let header = null;

      if (existingLicensees.length > 0) {
        header = await this.prisma.insightsJobHeader.create({
          data: insightsJobHeader,
        });
      }

      let failureCount = 0;
      if (header !== null) {
        for (let i = 0; i < existingLicensees.length; i++) {
          if (
            (await this.repository.determineIfInsightsJobDetailAlreadyProcessed(
              existingLicensees[i].user.id
            )) > 0
          ) {
            console.log(
              `Existing licensees with userId of ${existingLicensees[i].user.id} has already been processed...`
            );
            continue;
          }

          let detail = null;
          for (
            let j = 0;
            j < existingLicensees[i].user.userOrganizations.length;
            j++
          ) {
            try {
              const insightsJobDetail = {
                insightsJobHeaderId: header.id,
                insightsJobStatusId: 1,
                adminUserId: existingLicensees[i].user.id,
                orgId: existingLicensees[i].user.userOrganizations[j].orgId,
              };

              detail = await this.prisma.insightsJobDetail.create({
                data: insightsJobDetail,
              });

              const jobInsights = await this.getJobInsights(
                existingLicensees[i].user.userOrganizations[j].orgId
              );

              let emailAddress =
                existingLicensees[i].user.contact?.email?.address;

              if (emailAddress === null || emailAddress === '') {
                console.log(
                  `Cannot send email to userId ${existingLicensees[i].user.id} because they do not have an email address.`
                );
                continue;
              }

              await this.sendInsightsEmail(jobInsights, emailAddress);
              await this.repository.updateJobDetailStatusById(
                detail.id,
                'COMP'
              );
            } catch (error) {
              console.log(
                `The following error occurred during processing of rolling 30 day insights for existing licensees: ${error}`
              );

              if (detail !== null) {
                console.log(
                  `Insights email processing failed for existing licensee's Insights Job Detail record with ID of ${detail.id}.`
                );

                await this.repository.setFailedInsightsJobDetails(detail.id);
                failureCount++;
              }
            }
          }
        }

        await this.finalizeJobHeaderStatus(
          header.id,
          failureCount,
          existingLicensees.length
        );
      }
    }
  }

  async retryFailedInsights() {
    const failedInsights = await this.repository.getFailedInsights();

    for (let i = 0; i < failedInsights.length; i++) {
      let detail = await this.prisma.insightsJobDetail.findFirst({
        where: {
          id: {
            equals: failedInsights[i].id,
          },
        },
      });

      if (detail !== null) {
        try {
          const jobInsights = await this.getJobInsights(
            failedInsights[i].orgId
          );

          let emailAddress = failedInsights[i].user.contact?.email?.address;

          if (emailAddress === null || emailAddress === '') {
            console.log(
              `Cannot send email to userId ${failedInsights[i].adminUserId} because they do not have an email address.`
            );
            continue;
          }

          await this.sendInsightsEmail(jobInsights, emailAddress);
          await this.repository.updateJobDetailStatusById(detail.id, 'COMP');
          await this.prisma.insightsJobDetail.update({
            data: {
              failureDate: null,
            },
            where: {
              id: detail.id,
            },
          });
        } catch (error) {
          console.log(
            `The following error occurred during the retry of the failed monthly insights for Insights Job Detail ID of ${detail.id}: ${error}.`
          );
        }
      }
    }
  }

  async getJobInsights(orgId: string) {
    let jobController = new JobController();

    const jobsAdded = await jobController.getJobsAddedPastThirtyDays(orgId);
    const jobsCompleted = await jobController.getJobsCompletedPastDays(
      orgId,
      30
    );
    const revenueYtd = await this.invoiceService.getYtdRevenue(orgId);
    const revenuePast30Days =
      await this.invoiceService.getRevenueWithinPastDays(orgId, 30);

    const revenuePast60Days =
      await this.invoiceService.getRevenueWithinPastDays(orgId, 60);

    const jobsCompletedPast60Days =
      await jobController.getJobsCompletedPastDays(orgId, 60);

    return new JobInsights(
      orgId,
      jobsAdded,
      jobsCompleted,
      revenuePast30Days,
      revenueYtd,
      revenuePast60Days - revenuePast30Days,
      jobsCompletedPast60Days - jobsCompleted
    );
  }

  async sendInsightsEmail(jobInsights: JobInsights, emailAddress?: string) {
    const date = new Date();
    const month = date.toLocaleString('default', { month: 'long' });
    const templateData = {
      subject: 'Monthly Insights',
      insights: {
        month: month,
        year: date.getFullYear(),
        orgId: jobInsights.orgId,
        totalJobsAdded: jobInsights.jobsAdded,
        totalJobsCompleted: jobInsights.jobsCompleted,
        totalRevenue: `$${formatShortCurrency(jobInsights.totalRevenue)}`,
        totalRevenueYtd: `$${formatShortCurrency(jobInsights.totalRevenueYtd)}`,
        completedJobsDiff: this.calculateChangeInValForInsights(
          jobInsights.last60DaysJobsCompleted,
          jobInsights.jobsCompleted
        ),
        revenueDiff: this.calculateChangeInValForInsights(
          jobInsights.last60DaysRevenue,
          jobInsights.totalRevenue
        ),
      },
    };

    await sendAdminInsightsEmail(templateData, emailAddress);
    console.log(`Successfully sent email to licensee admin via SendGrid.`);
  }

  async finalizeJobHeaderStatus(
    headerId: number,
    failureCount: number,
    relevantLicenseesLength: number
  ) {
    if (relevantLicenseesLength === failureCount) {
      await this.repository.updateJobHeaderStatusById(headerId, 'FAIL');
      console.log(
        `Updated Job Header record with ID of ${headerId} to status with code of FAIL.`
      );
    } else if (failureCount > 0) {
      await this.repository.updateJobHeaderStatusById(headerId, 'PART');
      console.log(
        `Updated Job Header record with ID of ${headerId} to status with code of PART.`
      );
    } else {
      console.log(
        `Updated Job Header record with ID of ${headerId} to status with code of COMP.`
      );
      await this.repository.updateJobHeaderStatusById(headerId, 'COMP');
    }
  }

  calculateChangeInValForInsights(previousVal: number, currentVal: number) {
    if (previousVal === currentVal) {
      return 'No change from previous 30 days';
    }

    if (previousVal === 0 && currentVal > 0) {
      // Prevent divide by zero; default to 100% increase
      return '100% increase from previous 30 days';
    }

    if (previousVal > 0 && currentVal === 0) {
      // Default to 100% decrease
      return '100% decrease from previous 30 days';
    }

    if (previousVal > 0 && currentVal > 0) {
      if (previousVal > currentVal) {
        const diff = ((previousVal - currentVal) / previousVal) * 100;
        return `${diff.toFixed(0)}% decrease from previous 30 days`;
      } else {
        const diff = ((currentVal - previousVal) / previousVal) * 100;
        return `${diff.toFixed(0)}% increase from previous 30 days`;
      }
    }
  }
}
