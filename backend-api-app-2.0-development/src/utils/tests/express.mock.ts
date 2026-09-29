import { Response, NextFunction } from 'express';
import { Request } from 'express-jwt';

let responseObject = {} as unknown as Response;

export const getResponseObject = () => responseObject;

export const req = {
  auth: {
    sub: '1234',
  },
  params: {},
  query: {},
} as unknown as Request;

export const res = {
  locals: {
    orgId: '123',
    userAuthId: '222',
  },
  json: jest.fn().mockImplementation((result) => {
    responseObject = result;
  }),
  status: (result: any) => ({
    json: jest.fn().mockImplementation((result) => {
      responseObject = result;
    }),
  }),
} as unknown as Response;

export const resWithMocks = {
  locals: {
    orgId: '123',
    userAuthId: '222',
  },
  json: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
};

export const next: NextFunction = jest.fn();
