import sgMail from '../sendgrid/sendgrid.client';
import {
  RescheduleTemplate,
  CancelTemplate,
  ReportTemplate,
  PushTemplate,
  JobsRollingOverTemplate,
  JobsForTomorrowTemplate,
  JobScopeModifiedTemplate,
  SendInvoiceTemplate,
} from './template.types';

const sendEmailDisabled =
  process.env.SEND_EMAIL === undefined ||
  process.env.SEND_EMAIL === '' ||
  process.env.SEND_EMAIL === 'false';

export default async function sendConfirmationEmail(
  emailAddresses: string[],
  templateData: {
    subject: string;
    body: string;
    jobs: {
      collection_ref: string;
      customer: string;
      primary_contact: string;
      primary_phone: string;
      primary_email: string;
      secondary_contact?: string;
      secondary_phone?: string;
      secondary_email?: string;
      collection_date: string;
      // arrival_window: string;
      areasToService: string;
      notes: string;
      collection_address: string;
      type: string;
      jobSubType: string;
      job_scope: string;
      booked_by: string;
    }[];
  },
  attachments: any = [],
  customerEmail: any = []
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  const msg: sgMail.MailDataRequired = {
    to,
    from: 'tech@scrap-it.com',
    cc: customerEmail,
    templateId: 'd-ec92076cf25e48cea944624511ecce17',
    dynamicTemplateData: templateData,
    attachments: attachments,
  };

  return sgMail.sendMultiple(msg); // if await this, will not return 200? held up by this failed promise?
}

export async function sendUserEmail(
  emailAddresses: string[],
  templateData: {
    subject: string;
    user: {
      userName: string;
      firstName: string;
      lastName: string;
      createdAt: string;
      company: string;
    };
  }
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  const msg: sgMail.MailDataRequired = {
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-edfcd34679214d5ebeaed855907996a6',
    dynamicTemplateData: templateData,
  };

  return sgMail.sendMultiple(msg);
}

export async function sendUserWelcomeEmail(
  emailAddresses: string[],
  templateData: {
    subject: string;
    user: {
      userName: string;
      firstName: string;
      lastName: string;
      company: string;
      passwordResetLink: string;
    };
  }
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  const msg: sgMail.MailDataRequired = {
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-93e72f7d722742c69779aca9fc706c89',
    dynamicTemplateData: templateData,
  };

  return sgMail.sendMultiple(msg);
}

export async function sendAdminUserWelcomeEmail(
  emailAddresses: string[],
  templateData: {
    subject: string;
    user: {
      userName: string;
      firstName: string;
      lastName: string;
      company: string;
      webPortal: string;
      passwordResetLink: string;
    };
  }
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  const msg: sgMail.MailDataRequired = {
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-e913ba85e330429cb3fefafcda5ec982',
    dynamicTemplateData: templateData,
  };

  return sgMail.sendMultiple(msg);
}

export async function sendCustomerEmail(
  emailAddresses: string[],
  templateData: {
    subject: string;
    customer: {
      userName: string;
      fullName: string;
      createdAt: string;
      company: string;
      industry: string;
    };
  }
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  const msg: sgMail.MailDataRequired = {
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-f86ba51587c945f49f6469b2b7fc6da6',
    dynamicTemplateData: templateData,
  };

  return sgMail.sendMultiple(msg);
}

export async function sendCrewEmail(
  emailAddresses: string[],
  templateData: {
    subject: string;
    crew: {
      userName: string;
      fullName: string;
      company: string;
      description: string;
      liabilityInsurance: string;
      operatingCities: string;
      phone: string;
      w9: string;
      createdAt: string;
    };
  }
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  const msg: sgMail.MailDataRequired = {
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-c0862664672a4092baa335c1917a76e1',
    dynamicTemplateData: templateData,
  };

  return sgMail.sendMultiple(msg);
}

export async function sendInvoiceEmail(
  emailAddresses: string[],
  templateData: SendInvoiceTemplate,
  attachments: any
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  const msg: sgMail.MailDataRequired = {
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-c52edfac63b64da99d6874d60b9e209a',
    dynamicTemplateData: templateData,
    attachments: attachments,
  };

  return sgMail.sendMultiple(msg);
}

export async function sendJobCompletionEmail(
  emailAddresses: string[],
  templateData: {
    subject: string;
    body: string;
    attachments: any;
  },
  attachments: any
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  const msg: sgMail.MailDataRequired = {
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-8050621cf92c425eaf25b3680f49948d',
    dynamicTemplateData: templateData,
    attachments: attachments,
  };

  return sgMail.sendMultiple(msg);
}

export async function sendJobPushEmail(
  emailAddresses: string[],
  templateData: PushTemplate
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  return sgMail.sendMultiple({
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-40f2fcab1a7243e3836677520ef56a60',
    dynamicTemplateData: templateData,
  });
}

export async function sendScopeChangedEmail(
  emailAddresses: string[],
  templateData: JobScopeModifiedTemplate
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  return sgMail.sendMultiple({
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-781966ed83354426bdd1092dd144d199',
    dynamicTemplateData: templateData,
  });
}

export async function sendJobReportEmail(
  emailAddresses: string[],
  dynamicTemplateData: ReportTemplate,
  attachments: any[] = []
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  return sgMail.sendMultiple({
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-db585de8bab04e52b9428632d22ecaf5',
    dynamicTemplateData,
    attachments,
  });
}

export async function sendJobRescheduleEmail(
  emailAddresses: string[],
  dynamicTemplateData: RescheduleTemplate
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  return sgMail.sendMultiple({
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-8059ad78d622463283d18c4d26decf0f',
    dynamicTemplateData,
  });
}

export async function sendJobCancelledEmail(
  emailAddresses: string[],
  dynamicTemplateData: CancelTemplate
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  return sgMail.sendMultiple({
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-6df84d0978bf4c2d9ffca2ea5e898dbe',
    dynamicTemplateData,
  });
}

export async function sendUserDeleteEmail(
  emailAddresses: string[],
  templateData: {
    subject: string;
    customer: {
      userName: string;
      firstName: string;
      lastName: string;
      company: string;
      userId: string;
    };
  }
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;

  const msg: sgMail.MailDataRequired = {
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-18615278f9fe43a2a0f5b6cf03fe73b8',
    dynamicTemplateData: templateData,
  };

  return sgMail.sendMultiple(msg);
}

export async function sendJobRolledOverAdminEmail(
  emailAddresses: string[],
  dynamicTemplateData: JobsRollingOverTemplate
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  return await sgMail.sendMultiple({
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-cac6b779c4b641b385f40e5c035cf6be',
    dynamicTemplateData,
  });
}

export async function sendJobsForTomorrowEmail(
  emailAddresses: string[],
  dynamicTemplateData: JobsForTomorrowTemplate
) {
  const to = filterFakeEmails(emailAddresses);
  if (sendEmailDisabled || !to.length) return;
  return await sgMail.sendMultiple({
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-21adb0df49b04a799075d27198010fb7',
    dynamicTemplateData,
  });
}

export async function sendAdminInsightsEmail(
  templateData: {
    subject: string;
    insights: {
      month: string;
      year: number;
      orgId: string;
      totalJobsAdded: number;
      totalJobsCompleted: number;
      totalRevenue: string;
      totalRevenueYtd: string;
    };
  },
  emailAddress?: string
) {
  if (sendEmailDisabled || !emailAddress) return;
  const to = filterFakeEmails([emailAddress]);
  console.log('Monthly insights email sent to: ', emailAddress);
  const msg: sgMail.MailDataRequired = {
    to,
    from: 'tech@scrap-it.com',
    templateId: 'd-72f7995e64124c0f9e81a899af5e8731',
    dynamicTemplateData: templateData,
  };

  return sgMail.sendMultiple(msg);
}

export const filterFakeEmails = (emails: string[]) => {
  return emails.filter(
    (email) => !email.includes('auto-generated') && email != ''
  );
};
