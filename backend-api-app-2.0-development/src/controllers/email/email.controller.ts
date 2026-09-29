import sgMail from '../../utils/sendgrid/sendgrid.client';

export default class EmailController {
  public async sendEmail({
    emailSubject,
    emailAddress,
    messageBody,
  }: {
    emailSubject: string;
    emailAddress: string;
    messageBody: string;
  }) {
    const msg: sgMail.MailDataRequired = {
      to: emailAddress,
      from: 'tech@scrap-it.com',
      cc: ['tech@scrap-it.com'],
      subject: emailSubject,
      text: messageBody,
      html: messageBody,
    };

    return sgMail.send(msg);
  }
}
