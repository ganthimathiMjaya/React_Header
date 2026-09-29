import { PrismaClient, Job } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import { req, resWithMocks, next } from '../../utils/tests/express.mock';
import { validateJobsCreateInvoice } from './invoice.validator';

describe('validateJobsCreateInvoice', () => {
  const prisma = mockDeep<PrismaClient>();

  const validJob1 = {
    id: '1234',
    projectId: '123',
    jobSubType: {
      id: 1,
      name: 'name',
      cost: 123.0,
      isTaxable: true,
      taxRateId: 1,
    },
    scheduledDate: new Date(),
    techReference: 'reference',
    jobScope: 'scope',
    project: {
      billingEmail: 'test@test.com',
    },
    customer: { email: 'test@test.com', name: 'name' },
    tenantOrganization: {
      OrganizationSetting: [{ taxRateId: 1 }],
    },
    jobType: { shortDescription: 'desc' },
  } as unknown as Job;

  const validJob2 = {
    id: '11111',
    projectId: '123',
    jobSubType: {
      id: 1,
      name: 'name',
      cost: 123.0,
      isTaxable: true,
      taxRateId: 1,
    },
    scheduledDate: new Date(),
    techReference: 'reference',
    jobScope: 'scope',
    project: {
      billingEmail: 'test@test.com',
    },
    customer: { email: 'test@test.com', name: 'name' },
    tenantOrganization: {
      OrganizationSetting: [{ taxRateId: 1 }],
    },
    jobType: { shortDescription: 'desc' },
  } as unknown as Job;

  it('throws an error if duplicate ids are passed', async () => {
    const payload = {
      createInvoice: [
        {
          jobIds: ['1234', '1234'],
        },
      ],
    };
    req.body = payload;
    const myJsonMock = jest.fn().mockReturnThis();
    resWithMocks.status.mockImplementation((data: any) => ({
      json: myJsonMock,
    }));
    await validateJobsCreateInvoice(
      req,
      resWithMocks as unknown as Response,
      next
    );
    expect(resWithMocks.status).toHaveBeenCalledWith(400);
    expect(myJsonMock).toHaveBeenCalledWith({
      errors: ['Cannot have duplicated jobIds.'],
    });
  });

  it('throws an error if job count does not match', async () => {
    const payload = {
      createInvoice: [
        {
          jobIds: ['1234', '11111'],
        },
      ],
    };
    req.body = payload;
    const myJsonMock = jest.fn().mockReturnThis();
    resWithMocks.status.mockImplementation((data: any) => ({
      json: myJsonMock,
    }));

    prisma.job.findMany.mockResolvedValue([validJob1]);
    prismaMock.setPrismaClientMock(prisma);

    await validateJobsCreateInvoice(
      req,
      resWithMocks as unknown as Response,
      next
    );
    expect(resWithMocks.status).toHaveBeenCalledWith(400);
    expect(myJsonMock).toHaveBeenCalledWith({
      errors: [
        'Validation failed. Make sure all the ids are valid, jobs completed, and NOT discarded jobs.',
      ],
    });
  });

  it('throws an error if jobs DOES NOT belong to same project', async () => {
    const mockedJobs = [
      { ...validJob1, projectId: '123' } as Job,
      { ...validJob2, projectId: '222' } as Job,
    ];
    const payload = {
      createInvoice: [
        {
          jobIds: ['1234', '11111'],
        },
      ],
    };
    req.body = payload;
    const myJsonMock = jest.fn().mockReturnThis();
    resWithMocks.status.mockImplementation((data: any) => ({
      json: myJsonMock,
    }));

    prisma.job.findMany.mockResolvedValue(mockedJobs);
    prismaMock.setPrismaClientMock(prisma);

    await validateJobsCreateInvoice(
      req,
      resWithMocks as unknown as Response,
      next
    );
    expect(resWithMocks.status).toHaveBeenCalledWith(400);
    expect(myJsonMock).toHaveBeenCalledWith({
      errors: [
        'Validation failed. Combined jobs MUST belong to the same project for each invoice.',
      ],
    });
  });

  it('throws an error if jobs subTypes taxRate are not the same', async () => {
    const mockedJobs = [
      {
        ...validJob1,
        jobSubType: { taxRateId: 1 },
      } as unknown as Job,
      {
        ...validJob2,
        jobSubType: { taxRateId: 2 },
      } as unknown as Job,
    ];
    const payload = {
      createInvoice: [
        {
          jobIds: ['1234', '11111'],
        },
      ],
    };
    req.body = payload;
    const myJsonMock = jest.fn().mockReturnThis();
    resWithMocks.status.mockImplementation((data: any) => ({
      json: myJsonMock,
    }));

    prisma.job.findMany.mockResolvedValue(mockedJobs);
    prismaMock.setPrismaClientMock(prisma);

    await validateJobsCreateInvoice(
      req,
      resWithMocks as unknown as Response,
      next
    );
    expect(resWithMocks.status).toHaveBeenCalledWith(400);
    expect(myJsonMock).toHaveBeenCalledWith({
      errors: [
        'Validation failed. Combined jobs MUST have the same TaxRate for each invoice.',
      ],
    });
  });

  it('throws an error if NOT all invoices are READY', async () => {
    const mockedJobs = [
      {
        id: '1234',
        projectId: '123',
        jobSubType: { taxRateId: 1 },
        project: {
          billingEmail: 'test@test.com',
        },
        customer: { email: 'test@test.com' },
        tenantOrganization: {
          OrganizationSetting: [{ taxRateId: 1 }],
        },
      } as unknown as Job,
      {
        id: '11111',
        projectId: '123',
        jobSubType: { taxRateId: 1 },
        project: {
          billingEmail: 'test@test.com',
        },
        customer: { email: 'test@test.com' },
      } as unknown as Job,
    ];
    const payload = {
      createInvoice: [
        {
          jobIds: ['1234', '11111'],
        },
      ],
    };
    req.body = payload;
    const myJsonMock = jest.fn().mockReturnThis();
    resWithMocks.status.mockImplementation((data: any) => ({
      json: myJsonMock,
    }));

    prisma.job.findMany.mockResolvedValue(mockedJobs);
    prismaMock.setPrismaClientMock(prisma);

    await validateJobsCreateInvoice(
      req,
      resWithMocks as unknown as Response,
      next
    );
    expect(resWithMocks.status).toHaveBeenCalledWith(400);
    expect(myJsonMock).toHaveBeenCalledWith({
      errors: ['Validation failed. All Jobs MUST be READY to be invoiced.'],
    });
  });

  it('success if jobs belong to same project and tax rate is not provided', async () => {
    const mockedJobs = [validJob1, validJob2];
    const payload = {
      createInvoice: [
        {
          jobIds: ['1234', '11111'],
        },
      ],
    };
    req.body = payload;
    const myJsonMock = jest.fn().mockReturnThis();
    resWithMocks.status.mockImplementation((data: any) => ({
      json: myJsonMock,
    }));

    prisma.job.findMany.mockResolvedValue(mockedJobs);
    prismaMock.setPrismaClientMock(prisma);

    await validateJobsCreateInvoice(
      req,
      resWithMocks as unknown as Response,
      next
    );
    expect(next).toHaveBeenCalled();
  });
});
