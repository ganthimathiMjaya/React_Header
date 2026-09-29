import { Request, Response, NextFunction } from 'express';
import { JobInvoiceService } from '../../services/invoice/jobInvoice.service';
import { InvoiceService } from '../../services/invoice/invoice.service';
import { InvoicePdfService } from '../../services/invoice/invoicePdf.service';
import { SendInvoiceService } from '../../services/invoice/sendInvoice.service';

const jobInvoiceService = new JobInvoiceService();
const invoiceService = new InvoiceService();
const invoicePdfService = new InvoicePdfService();
const sendInvoiceService = new SendInvoiceService();

export default class InvoiceController {
  async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoices = await invoiceService.getInvoice(res.locals.orgId, req.params.invoiceId);
      return res.status(200).json(invoices);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in InvoiceController.getInvoice',
      });
    }
  }

  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const invoices = await invoiceService.getInvoices(res.locals.orgId);
      return res.status(200).json(invoices);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in InvoiceController.getInvoices',
      });
    }
  }

  /*
  There are three supported ways to get PDF invoices.
    1. A single PDF file given a single invoice id. Returns a PDF file.
    2. Multiple PDF (one per invoice id). Returns a zip file with individual PDFs.
    3. Combine ALL invoice ids into the same PDF. Returns a single PDF file.
  */
  async getInvoicesPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const combineInvoices = req.body.combine;
      if (req.body.invoiceIds.length === 1 || combineInvoices) {
        const pdf = await invoicePdfService.getInvoicePdf(
          res.locals.orgId,
          req.body.invoiceIds
        );
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Length': pdf?.length,
        });
        return res.status(200).send(pdf);
      } else {
        // Return a Zip file instead.
        const zip = await invoicePdfService.getInvoicesPdf(
          res.locals.orgId,
          req.body.invoiceIds
        );
        res.set({
          'Content-Type': 'application/zip',
          'Content-Length': zip?.length,
        });
        return res.status(200).send(zip);
      }
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in InvoiceController.getInvoicesPdf',
      });
    }
  }

  async getYtdRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const ytdRevenue = await invoiceService.getYtdRevenue(res.locals.orgId);
      return res.status(200).json(ytdRevenue);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in InvoiceController.getYtdRevenue',
      });
    }
  }

  async createBlankInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.createBlankInvoice(
        res.locals.orgId,
        req.body
      );
      return res.status(200).json(invoice);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in InvoiceController.createBlankInvoice',
      });
    }
  }

  async getQueueJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const queueJobs = await jobInvoiceService.getQueueJobs(res.locals.orgId);
      return res.status(200).json(queueJobs);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in InvoiceController.getQueueJobs',
      });
    }
  }

  async getQueueJobsCount(req: Request, res: Response, next: NextFunction) {
    try {
      const queueJobsCount = await jobInvoiceService.getQueueJobsCount(
        res.locals.orgId
      );
      return res.status(200).json(queueJobsCount);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in InvoiceController.getQueueJobsCount',
      });
    }
  }

  // TODO: Update this chain of calls once we get to the discarded jobs feature
  async getDiscardedJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const discardedJobs = await jobInvoiceService.getDiscardedJobs(
        res.locals.orgId
      );
      return res.status(200).json(discardedJobs);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in InvoiceController.getDiscardedJobs',
      });
    }
  }

  async combineInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.combineInvoices(
        res.locals.orgId,
        req.body.invoiceIds
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.combineInvoices',
      });
    }
  }

  async discardJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobInvoiceService.discardJobs(
        res.locals.orgId,
        req.body.jobIds
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.discardJobs',
      });
    }
  }

  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobInvoiceService.createInvoice(
        res.locals.orgId,
        req.body.createInvoice
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in InvoiceController.createInvoice',
      });
    }
  }

  async sendInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sendInvoiceService.sendInvoices(
        res.locals.orgId,
        req.body.invoiceIds
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in InvoiceController.sendInvoices',
      });
    }
  }

  async updateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.updateInvoice(
        res.locals.orgId,
        req.params.invoiceId,
        req.body
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in InvoiceController.updateInvoice',
      });
    }
  }

  async discardInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.discardInvoices(
        res.locals.orgId,
        req.body.invoiceIds
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.discardInvoices',
      });
    }
  }

  async queueInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.queueInvoices(
        res.locals.orgId,
        req.body.invoiceIds
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.queueInvoices',
      });
    }
  }

  async queueDiscardedJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await jobInvoiceService.queueDiscardedJobs(
        res.locals.orgId,
        req.body.jobIds
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.queueDiscardedJobs',
      });
    }
  }

  async createLineItem(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.createLineItem(
        res.locals.orgId,
        req.params.invoiceId,
        req.body
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.createLineItem',
      });
    }
  }

  async createLineItems(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.createLineItems(
        res.locals.orgId,
        req.params.invoiceId,
        req.body
      );
      return res.status(200).json(result);
    } catch (error) {
      console.log(error)
      next({
        error,
        errorPath: 'Error in InvoiceController.createLineItems',
      });
    }
  }

  async updateLineItem(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.updateLineItem(
        res.locals.orgId,
        req.params.invoiceId,
        req.params.lineItemId,
        req.body
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.updateLineItem',
      });
    }
  }

  async updateLineItems(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.updateLineItems(
        res.locals.orgId,
        req.body
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.updateLineItems',
      });
    }
  }

  async markInvoicesSent(req: Request, res: Response, next: NextFunction) {
    try {
      await invoiceService.markInvoicesSent(
        res.locals.orgId,
        req.body.invoiceIds
      );
      return res.status(204).json();
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.markInvoicesSent',
      });
    }
  }

  async deleteLineItem(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.deleteLineItem(
        res.locals.orgId,
        req.params.invoiceId,
        req.params.lineItemId
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.deleteLineItem',
      });
    }
  }

  async createLineItemCustomFields(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.createLineItemCustomFields(
        res.locals.orgId,
        req.params.invoiceId,
        req.params.lineItemId,
	req.body
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.createLineItemCustomFields',
      });
    }
  }

  async updateLineItemCustomFields(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.updateLineItemCustomFields(
        res.locals.orgId,
        req.params.invoiceId,
        req.params.lineItemId,
	req.body
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.updateLineItemCustomFields',
      });
    }
  }

  async deleteLineItemCustomFields(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await invoiceService.deleteLineItemCustomFields(
        res.locals.orgId,
        req.params.invoiceId,
        req.params.lineItemId,
	req.body
      );
      return res.status(200).json(result);
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.deleteLineItemCustomFields',
      });
    }
  }

  async markInvoicesPaid(req: Request, res: Response, next: NextFunction) {
    try {
      await invoiceService.markInvoicesPaid(
        res.locals.orgId,
        req.body.invoiceIds
      );
      return res.status(204).json();
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.markInvoicesPaid',
      });
    }
  }

  async markInvoicesCreated(req: Request, res: Response, next: NextFunction) {
    try {
      await invoiceService.markInvoicesCreated(
        res.locals.orgId,
        req.body.invoiceIds
      );
      return res.status(204).json();
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.markInvoicesCreated',
      });
    }
  }

  async updateJobNotes(req: Request, res: Response, next: NextFunction) {
    try {
      await jobInvoiceService.updateJobNotes(
        res.locals.orgId,
        req.params.jobId,
        req.body.values
      );
      return res.status(204).json();
    } catch (error) {
      next({
        error,
        errorPath: 'Error in InvoiceController.updateJobNotes',
      });
    }
  }
}
