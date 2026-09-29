import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
import { PrismaClient, QBIntegrationTokens } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import {
  req,
  res,
  next,
  getResponseObject,
} from '../../utils/tests/express.mock';
import QBIntegrationController from './qb.controller';

describe('QBIntegrationController', () => {
  const prisma = mockDeep<PrismaClient>();

  describe('getAccounts', () => {
    it('returns all accounts', async () => {
      prisma.qBIntegrationTokens.findFirst.mockResolvedValue({
        accessToken: '1',
      } as unknown as QBIntegrationTokens);
      prismaMock.setPrismaClientMock(prisma);
      const mockQbAccounts = {
        QueryResponse: {
          Account: [
            {
              Id: '1',
              Name: 'account name',
            },
          ],
        },
      };
      mockedAxios.get.mockResolvedValue({ data: mockQbAccounts });

      const controller = new QBIntegrationController();
      await controller.getAccounts(req, res as Response, next);
      const responseObj: any = getResponseObject();

      expect(mockedAxios.get).toHaveBeenCalled();
      expect(responseObj).toEqual(mockQbAccounts.QueryResponse.Account);
    });
  });

  describe('pushInvoicesQueue', () => {
    it('calls update', async () => {
      prisma.invoice.updateMany.mockResolvedValue({
        count: 1,
      });
      prismaMock.setPrismaClientMock(prisma);

      req.body = { invoiceIds: ['1'] };
      const controller = new QBIntegrationController();
      await controller.pushInvoicesQueue(req, res as Response, next);

      expect(prisma.invoice.updateMany).toHaveBeenCalled();
    });
  });
});
