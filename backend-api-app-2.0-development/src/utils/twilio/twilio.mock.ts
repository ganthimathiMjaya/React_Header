import { Twilio } from 'twilio';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import twilio from './twilio.client';

jest.mock('./twilio.client', () => ({
  __esModule: true,
  default: mockDeep<Twilio>(),
}));

beforeEach(() => {
  mockReset(twilioMock);
});

export const twilioMock = twilio as unknown as DeepMockProxy<Twilio>;
