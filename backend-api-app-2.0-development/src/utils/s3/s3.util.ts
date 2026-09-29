import { s3Client } from '../../shared/s3Client';
import { Readable } from 'stream';

export const getS3FilesAsAttachments = async (
  keys: string[],
  jobId: string
): Promise<any[]> => {
  const attachments: any[] = [];
  for (let i = 0; i < keys.length; i++) {
    const Key = keys[i].replace(/https:.*.com\//, '');

    const response = await s3Client.getObject({
      Bucket: process.env.AWS_BUCKET,
      Key,
    });

    const stream = response.Body as Readable;

    const buffer = new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.once('end', () => {
        resolve(Buffer.concat(chunks));
      });
      stream.once('error', reject);
    });

    const attachment = {
      content: (await buffer).toString('base64'),
      filename: `JOB-${jobId}-${i}.jpeg`,
      type: 'application/jpeg',
      disposition: 'attachment',
    };

    attachments.push(attachment);
  }
  return attachments;
};
