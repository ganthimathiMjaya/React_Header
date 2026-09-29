import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import {
  getPrismaClientForTenant,
  prismaClientBypass,
} from './multiTenancyPrisma.client';

let prismaClientMock = mockDeep<PrismaClient>();

const setPrismaClientMock: any = (newValue: any) => {
  prismaClientMock = newValue;
};
jest.mock('./multiTenancyPrisma.client', () => ({
  __esModule: true,
  ...(jest.requireActual('./multiTenancyPrisma.client') as any),
  getPrismaClientForTenant: (orgId: string) => prismaClientMock,
  prismaClientBypass: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaClientMock);
  mockReset(prismaClientBypass);
});

export const prismaMock = {
  getPrismaClientForTenant,
  prismaClientBypassMock:
    prismaClientBypass as unknown as DeepMockProxy<PrismaClient>,
  setPrismaClientMock,
};
