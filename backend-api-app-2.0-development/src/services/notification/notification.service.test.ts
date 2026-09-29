import { AdminWithEmail } from '../../services/user/user.service';
import { Email, User } from '@prisma/client';
import NotificationService from './notification.service';
import { getAdminRecipients } from '../../utils/email/email.util';

describe('Notification Service', () => {
  const email = {
    address: 'test@test.com',
  } as unknown as Email;
  const contact = { email } as unknown as Contact;
  const user = { contact } as unknown as User;
  const admins: AdminWithEmail[] = [
    { User: user },
  ] as unknown as AdminWithEmail[];

  describe('getRecipients', () => {
    it('returns array of emails', async () => {
      const service = new NotificationService();
      const actual = getAdminRecipients(admins);
      const expected = ['test@test.com'];

      expect(actual).toEqual(expected);
    });
  });
});
