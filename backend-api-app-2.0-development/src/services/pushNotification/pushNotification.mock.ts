import { mockReset } from 'jest-mock-extended';

export const sendPushNotifications = jest.fn();

jest.mock('../../services/pushNotification/pushNotification.service', () => ({
  __esModule: true,
  ...(jest.requireActual(
    '../../services/pushNotification/pushNotification.service'
  ) as any),
  sendPushNotifications,
  PushNotificationService: jest.fn(() => ({ sendPushNotifications })),
  default: jest.fn(() => ({ sendPushNotifications })),
}));

beforeEach(() => {
  mockReset(sendPushNotifications);
});
