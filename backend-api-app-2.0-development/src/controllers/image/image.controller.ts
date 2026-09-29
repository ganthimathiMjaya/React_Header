import { Request, Response } from 'express';
import { Readable } from 'stream';
import { s3Client } from '../../shared/s3Client';
import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export default class ImageController {
  public async uploadFile(req: any, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const uploadedFile = await prisma.photos.create({
      data: {
        job: {
          connect: {
            id: req.params.jobId,
          },
        },
        source: req.body.source,
        type: req.body.type,
        url: req.file?.location || req.body.webkitRelativePath || '',
      },
    });

    res.status(202).send({
      uploadedFile,
    });

    return;
  }

  public async uploadFileGetKey(req: any, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const uploadedFile = await prisma.photos.create({
      data: {
        job: {
          connect: {
            id: req.params.jobId,
          },
        },
        source: req.body.source,
        type: req.body.type,
        url: req.file.key,
      },
    });

    return res.status(202).send({
      uploadedFile,
    });
  }

  public async getImage(req: Request, res: Response) {
    const key = `jobs/${req.params.jobId}/${req.params.imageName}`;

    let response = await s3Client.getObject({
      Bucket: process.env.AWS_BUCKET,
      Key: `${key}`,
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

    return { image: await buffer };
  }

  public async getBookingImage(req: Request, res: Response) {
    const key = `booking/${req.params.imageName}`;

    let response = await s3Client.getObject({
      Bucket: process.env.AWS_BUCKET,
      Key: `${key}`,
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

    return {
      image: await buffer,
    };
  }

  public async getImageUrls(req: Request, res: Response) {
    var params = {
      Bucket: process.env.AWS_BUCKET,
      Prefix: `jobs/${req.params.jobId}/`,
      Delimiter: '/',
    };

    let response = await s3Client.listObjectsV2(params);
    let contents = response.Contents;

    if (contents && contents.length !== 0) {
      let keyArray: string[] = [];

      for (let i = 0; i < contents.length; i++) {
        keyArray.push(contents[i].Key as string);
      }

      return keyArray;
    }

    return 'No Images Available for selected Job';
  }

  public async getImages(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const job = await prisma.job.findUnique({
      where: { id: req.params.jobId },
      include: { photos: true },
    });

    return job?.photos || [];
  }

  public async removeImage(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const photoToRemove = await prisma.photos.findFirst({
      where: { url: req.body.url },
    });

    if (photoToRemove) {
      const update = await prisma.job.update({
        where: { id: req.params.jobId },
        data: {
          photos: {
            disconnect: [
              {
                id: photoToRemove.id,
              },
            ],
          },
        },
      });

      if (update) {
        res.status(200).send({
          message: 'ok',
        });
      }
    }
  }
}
