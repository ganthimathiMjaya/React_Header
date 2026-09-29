import { ExpoPushMessage } from 'expo-server-sdk';
import { Prisma } from '@prisma/client';

export type CustomerWithUsersAndDevices = Prisma.CustomerGetPayload<{
  include: {
    customerUser: {
      include: {
        User: {
          include: {
            userOrganizations: true;
            userDevices: true;
          };
        };
      };
    };
  };
}>;

export type UserWithOrgAndDevices = Prisma.UserGetPayload<{
  include: {
    userOrganizations: true;
    userDevices: true;
  };
}>;

export const getPushMessagesForUsers = (
  customer: CustomerWithUsersAndDevices,
  title: string,
  body: string
): ExpoPushMessage[] => {
  const customerUsers = customer.customerUser ?? [];
  const pushNotifications: ExpoPushMessage[] = [];

  customerUsers.map((customerUser) => {
    const customerUserUsers = customerUser.User;

    customerUserUsers.map((user) => {
      // Only one record should be returned per userOrg for a given org/user combination.
      const messages = getPushMessagesForUser(user, title, body);
      pushNotifications.push(...messages);
    });
  });
  return pushNotifications;
};

export const getPushMessagesForUser = (
  user: UserWithOrgAndDevices,
  title: string,
  body: string
) => {
  const pushNotifications: ExpoPushMessage[] = [];
  //each key represents a crewMember, and value all jobs in assigned status. UserOrganization and devices should be the exact same in this case since it's the same user.
  const userOrg = user.userOrganizations?.length
    ? user.userOrganizations[0]
    : undefined;
  if (
    userOrg &&
    !userOrg.isDeleted &&
    userOrg.isPushNotificationAllowed &&
    user.userDevices?.length
  ) {
    // Get push tokens for all devices associated with the user
    user.userDevices.map((userDevice) => {
      if (userDevice.pushNotificationToken) {
        pushNotifications.push({
          to: userDevice.pushNotificationToken,
          title,
          body,
        });
      }
    });
  }
  return pushNotifications;
};
