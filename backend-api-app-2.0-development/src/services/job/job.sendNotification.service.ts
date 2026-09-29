import { Readable } from 'stream';
import TextController from '../../controllers/text/text.controller';
import { s3Client } from '../../shared/s3Client';
import { sendJobCompletionEmail } from '../../utils/email/send.confirmation';
import { PhotoRepository } from '../../repositories/photo/photo.repository';

const photoRepository = new PhotoRepository();

//Sends notifications for complete jobs
export class JobSendNotification {
  async sendNotifications(updatedJob: any, orgId: string) {
    // may need to add timezone var in the future
    //If there are other processes that take place during a completion event
    // this.completeJob(req.params.jobId);
    //Send call to generate email to scrap-it admin
    const textController = new TextController();
    let recipientList: string[] = [];
    recipientList.push(updatedJob.primaryContact.email.address);
    let text = '';
    let completedDate = updatedJob.completedAt?.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      timezone: 'CST',
    });
    text = `Your Scrap-It Job at address ${updatedJob.project.location.address.line1} has been completed`;
    /*if (updatedJob.poNum === '') {
      text = `Your Scrap-It Job at address ${updatedJob.project.location.address.line1} has been completed`;
    } else {
      text = `Your Scrap-It Job at address ${updatedJob.project.location.address.line1} PO# ${updatedJob.poNum} has been completed`;
    }*/ //commented out for now, PO null error fix
    let body = `We completed a service for you at ${updatedJob.project.location.address.line1} on ${completedDate}`;
    let afterPhotos: { url: string; type: string }[] =
      await photoRepository.getPhotosFilteredBy(orgId, {
        jobId: updatedJob.id,
        source: 'CREW',
        type: 'AFTER_JOB',
      });
    let beforePhotos: { url: string; type: string }[] =
      await photoRepository.getPhotosFilteredBy(orgId, {
        jobId: updatedJob.id,
        source: 'CREW',
        type: 'BEFORE_JOB',
      });

    let keys = [...beforePhotos, ...afterPhotos].map((element) => {
      return {
        type: element.type,
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
        filename: `${keys[i].type}-${updatedJob.id}-${i}.jpeg`,
        type: 'application/jpeg',
        disposition: 'attachment',
      };

      attachmentArr.push(attachment);
    }

    let templateData = {
      subject: text,
      body: body,
      attachments: attachmentArr,
    };

    sendJobCompletionEmail(recipientList, templateData, attachmentArr);

    if (process.env.SEND_TEXT === 'true') {
      if (updatedJob?.primaryContact?.phone?.number) {
        const number = `+1${updatedJob?.primaryContact?.phone?.number.replace(
          '-',
          ''
        )}`;
        textController.sendText(orgId, text, number);
      }
    }
  }
}
