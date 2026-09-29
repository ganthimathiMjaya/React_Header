import { receiveMessageOnPort } from 'worker_threads';
import { twilioMock } from '../../utils/twilio/twilio.mock';
import ReceiveSmsController from './receiveSms.controller';

test('should receive a message and return 200', async () => {
  const mockResponse = {
    sid: 'SMcad205e6e0db46dcacafcf7fb1b4a3c2',
  };

  const controller = new ReceiveSmsController();
  twilioMock.messages.create = jest.fn().mockResolvedValue(mockResponse);

});