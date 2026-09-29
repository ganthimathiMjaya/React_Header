export const mockSendGrid = {
  sendMultiple: jest.fn(),
  setApiKey: jest.fn(),
};

jest.mock('@sendgrid/mail', () => ({
  __esModule: true,
  default: mockSendGrid,
}));
