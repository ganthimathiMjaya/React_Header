import { Request, Response } from 'express';
import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';
import JobStatus from '../../utils/enums/job.status';
import { createInvoiceRecord } from '../../utils/reports/invoice/createInvoiceRecords';

export default class ReportController {
  public async getAllInvoices(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const response = await prisma.invoice.findMany({});
    res.status(200);
    return response;
  }

  public async getAllInvoiceDetails(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    const response = await prisma.invoiceDetail.findMany({
      include: {
        invoice: {
          include: {
            job: {
              include: {
                customer: true,
                project: {
                  include: {
                    location: {
                      include: {
                        address: true,
                      },
                    },
                  },
                },
                primaryContact: true,
                secondaryContact: true,
              },
            },
          },
        },
      },
    });
    res.status(200);
    return response;
  }

  //updating invoiceDetail or invoice processed
  public async updateInvoice(req: Request, res: Response) {
    const prisma = getPrismaClientForTenant(res.locals.orgId);
    if (req.body.processed !== undefined) {
      const invoiceId = await prisma.invoiceDetail.findUnique({
        where: {
          id: req.params.id,
        },
        select: {
          invoice: {
            select: {
              id: true,
            },
          },
        },
      });

      if (invoiceId !== null) {
        const response = await prisma.invoice.update({
          where: { id: invoiceId?.invoice.id },
          data: {
            processed: req.body.processed,
          },
        });
        return response;
      }
    }

    const response = await prisma.invoiceDetail.update({
      where: {
        id: req.params.id,
      },
      data: {
        amount: req.body.amount,
        qbClass: req.body.qbClass,
        qbRef: req.body.qbRef,
        quantity: req.body.quantity,
      },
    });
    return response;
  }

  public async triggerGenerateInvoices(req: Request, res: Response) {
    const invoiceRecords = await this._generateInvoices(res.locals.orgId);
    const response = this._insertInvoiceRecords(
      invoiceRecords,
      res.locals.orgId
    );

    res.status(200);
    return response;
  }

  private async _generateInvoices(orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    const jobs = await prisma.job.findMany({
      where: {
        Invoice: null,
        OR: [
          {
            statusId: JobStatus.Complete,
          },
        ],
      },
      include: {
        customer: true,
      },
    });

    const invoices: any[] = jobs.map((x) => {
      return createInvoiceRecord(x);
    });

    return invoices;
  }

  private async _insertInvoiceRecords(invoiceRecords: any, orgId: string) {
    const prisma = getPrismaClientForTenant(orgId);
    let createdInvoices = [];
    for (let i = 0; i < invoiceRecords.length; i++) {
      let createdRecord = await prisma.invoice.create({
        data: {
          invoiceNo: invoiceRecords[i].invoiceNo,
          invoiceDetail: {
            createMany: {
              data: invoiceRecords[i].details,
            },
          },
          job: {
            connect: {
              id: invoiceRecords[i].jobId,
            },
          },
        },
      });
      createdInvoices.push(createdRecord);
    }
    return createdInvoices;
  }
}
