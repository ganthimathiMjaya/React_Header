import sgMail from '@sendgrid/mail';
import sgClient from '@sendgrid/client';

const sgApiKey: string = process.env.SENDGRID_API_KEY as string;

sgMail.setApiKey(sgApiKey);
sgClient.setApiKey(sgApiKey);

export default sgMail;
export { sgClient };
