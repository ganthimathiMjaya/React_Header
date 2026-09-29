import express, { Request, Response } from 'express';
import ImageController from '../controllers/image/image.controller';
import uploadToJobsS3, { uploadToBookingS3 } from '../shared/s3Multer';

interface ImageResponse {
  image?: Buffer;
}

const route = express.Router();
const controller = new ImageController();

route.post(
  '/job/:jobId',
  uploadToJobsS3().single('image'),
  async (req, res) => {
    const response = await controller.uploadFile(req, res);
    return response;
  }
);

route.post(
  '/job/crew/:jobId',
  uploadToJobsS3().single('image'),
  controller.uploadFileGetKey
);

route.post(
  '/job/admin/:jobId',
  uploadToJobsS3().single('image'),
  async (req, res) => {
    const response = await controller.uploadFileGetKey(req, res);
    return response;
  }
);

route.get('/job/crew/:jobId/', async (req: Request, res: Response) => {
  const response = await controller.getImages(req, res);
  return res.json(response);
});

//returns a list of S3 keys so you can link to the S3 url (for frontend)
route.get('/job/:jobId/', async (req: Request, res: Response) => {
  const response = await controller.getImageUrls(req, res);
  res.setHeader('content-type', 'application/json');
  res.write(JSON.stringify(response));
  res.end();
  return response;
});

//pulls actual binary photo from S3 (for attachments)
route.get('/job/:jobId/:imageName', async (req: Request, res: Response) => {
  const response = await controller.getImage(req, res);
  return formatImageResponse(res, response);
});

// Added this API to match the S3 Bucket name: "jobs"
route.get('/jobs/:jobId/:imageName', async (req: Request, res: Response) => {
  const response = await controller.getImage(req, res);
  return formatImageResponse(res, response);
});

route.get('/booking/:imageName', async (req: Request, res: Response) => {
  const response = await controller.getBookingImage(req, res);
  return formatImageResponse(res, response);
});

route.post(
  '/job/multiple/:jobId',
  uploadToJobsS3().array('image'),
  async (req: any, res: any) => {
    res.json({ keys: req.files.map((f: any) => f.key) });
  }
);

route.post(
  '/booking/multiple',
  uploadToBookingS3().array('image'),
  async (req: any, res: any) => {
    res.json({ keys: req.files.map((f: any) => f.key) });
  }
);

route.post(
  '/upload',
  uploadToJobsS3().single('image'),
  async (req: any, res: any) => {
    res.json({ key: req.file.key });
  }
);

route.put('/job/remove/:jobId', async (req: Request, res: Response) => {
  const removed = await controller.removeImage(req, res);
});

function formatImageResponse(res: Response, response: ImageResponse) {
  res.setHeader('content-type', 'image/jpg');
  res.write(response.image, 'binary');
  res.end(null, 'binary');
  return res;
}

export default route;
