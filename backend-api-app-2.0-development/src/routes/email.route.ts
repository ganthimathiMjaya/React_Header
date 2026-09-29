import express from 'express';
import EmailController from '../controllers/email/email.controller';
import { body } from 'express-validator';

const email = express.Router();

email.post(
  '/',
  body('emailAddress').escape(),
  async (req: express.Request, res: express.Response) => {
    const { emailSubject, emailAddress, messageBody } = req?.body;
    const emailController = new EmailController();

    try {
      const emailRes = await emailController.sendEmail({
        emailSubject,
        emailAddress,
        messageBody,
      });

      return res.send(emailRes);
    } catch (error) {
      return res.json({
        message: 'Email could not be sent',
        statusCode: 500,
        error,
      });
    }
  }
);

export default email;
