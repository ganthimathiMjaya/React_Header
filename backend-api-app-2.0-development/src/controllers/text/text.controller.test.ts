import { twilioMock } from '../../utils/twilio/twilio.mock';
import TextController from './text.controller';

test('should send a message and return sid', async () => {
  const mockResponse = {
    sid: 'SMcad205e6e0db46dcacafcf7fb1b4a3c2',
  };

  const controller = new TextController();
  twilioMock.messages.create = jest.fn().mockResolvedValue(mockResponse);
  const randomOrgId = '3405c2f3-79f9-457c-8bb1-abd227cb7d33';
  await expect(
    controller.sendText(randomOrgId, 'Hello', '+5555555555')
  ).resolves.toEqual({
    messageSid: 'SMcad205e6e0db46dcacafcf7fb1b4a3c2',
    number: '+5555555555',
    message: 'Hello',
  });
});
