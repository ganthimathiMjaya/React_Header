import twilio from '../../utils/twilio/twilio.client';
import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export default class TextController {
  public async sendText(
    orgId: string,
    message: string,
    number: string,
    jobId?: string,
    isArrivalText?: boolean
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    if (isArrivalText) {
      const updated = await prisma.job.update({
        where: {
          id: jobId,
        },
        data: {
          arrivedTextSent: true,
        },
      });
    }

    const sentMessage = await twilio.messages.create({
      from: process.env.TWILIO_PHONE,
      to: number,
      body: message,
    });

    return {
      messageSid: sentMessage.sid,
      message: message,
      number: number,
    };
  }
}
