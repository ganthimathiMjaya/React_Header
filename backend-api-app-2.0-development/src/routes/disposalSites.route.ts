import express, { Request, Response } from 'express';
import DisposalSiteController from '../controllers/disposalSite/disposalSites.controller';
import { fileUpload } from '../shared/s3Multer';

const disposalSites = express.Router();
const controller = new DisposalSiteController();

disposalSites.get('/', async (req: Request, res: Response) => {
  const response = await controller.getAllDisposalSites(req, res);
  return res.json(response);
});

disposalSites.get('/waste-types', async (req: Request, res: Response) => {
  const response = await controller.getWasteTypes();
  return res.json(response);
});

//TODO: remove scrap-it specific endpoint. Keeping for now bc the ui has not been updated.
disposalSites.get('/dumpTicket', async (req: Request, res: Response) => {
  return res.json([]);
});

disposalSites.get('/:id', async (req: Request, res: Response) => {
  const response = await controller.getDisposalSite(req, res);
  return res.json(response);
});

disposalSites.post('/', async (req: Request, res: Response) => {
  const response = await controller.createDisposalSite(req, res);
  return res.json(response);
});

disposalSites.post(
  '/:id/file',
  fileUpload.single('file'),
  async (req: Request, res: Response) => {
    const response = await controller.uploadFile(req, res);
    return res.json(response);
  }
);

disposalSites.put('/:id', async (req: Request, res: Response) => {
  const response = await controller.updateDisposalSite(req, res);
  return res.json(response);
});

disposalSites.put('/:id/contact', async (req: Request, res: Response) => {
  const response = await controller.updateDisposalSiteContact(req, res);
  return res.json(response);
});

disposalSites.put('/dumpTicket/:id', async (req: Request, res: Response) => {
  const response = await controller.updateDumpTicket(req, res);
  return res.json(response);
});

export default disposalSites;
