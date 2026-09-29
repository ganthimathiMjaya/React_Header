import { AdminWithEmail } from '../../services/user/user.service';

export const getAdminRecipients = (admins: AdminWithEmail[]): string[] => {
  const recipientList: string[] = [];
  admins.map((admin: AdminWithEmail) => {
    const email = admin.User.contact?.email?.address;
    if (email) {
      recipientList.push(email);
    }
  });
  return recipientList;
};
