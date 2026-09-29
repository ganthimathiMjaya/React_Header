import express from 'express';
import ReportController from '../controllers/report/report.controller';

const report = express.Router();
const controller = new ReportController();

report.get('/invoice', async (_req, res) => {
  const response = await controller.getAllInvoices(_req, res);
  return res.json(response);
});

report.get('/invoice/detail', async (_req, res) => {
  const response = await controller.getAllInvoiceDetails(_req, res);
  return res.json(response);
});

report.put('/invoice/:id', async (_req, res) => {
  const response = await controller.updateInvoice(_req, res);
  return res.json(response);
});

report.post(
  '/invoice/generate',
  async (_req: express.Request, res: express.Response) => {
    const response = await controller.triggerGenerateInvoices(_req, res);
    return res.json(response);
  }
);

export default report;
