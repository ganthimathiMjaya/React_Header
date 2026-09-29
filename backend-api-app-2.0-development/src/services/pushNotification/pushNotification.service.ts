import {
  Expo,
  ExpoPushMessage,
  ExpoPushTicket,
  ExpoPushErrorReceipt,
} from 'expo-server-sdk';
import { prismaClientBypass } from '../../utils/prisma/multiTenancyPrisma.client';

// optionally providing an access token if you have enabled push security
let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export class PushNotificationService {
  async sendPushNotifications(messages: ExpoPushMessage[]) {
    if (!messages.length) return;

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    const promises = chunks.map(async (chunk) => {
      try {
        let ticketChunk: ExpoPushTicket[] =
          await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);

        const successTickets: {
          id: string;
          status: string;
          pushNotificationToken: string;
        }[] = [];
        const pushTokensToRemove: string[] = [];

        ticketChunk.map((ticket: ExpoPushTicket, i) => {
          const to = messages[i].to;
          //ExpoPushMessage "to" type is either string or string[]. We're using only as string, so this should be fine.
          const token: string = Array.isArray(to) ? to[0] : to;
          if (ticket.status === 'ok') {
            successTickets.push({
              id: ticket.id,
              status: ticket.status,
              pushNotificationToken: token,
            });
          } else {
            const error = ticket.details?.error;
            if (error === 'DeviceNotRegistered') {
              if (token) {
                pushTokensToRemove.push(token);
              }
            }
          }
        });

        //Save ok tickets to check later
        if (successTickets.length) {
          await prismaClientBypass.pushNotificationTicket.createMany({
            data: successTickets,
          });
        }

        //Remove ALL DeviceNotRegistered
        if (pushTokensToRemove.length) {
          await prismaClientBypass.userDevice.deleteMany({
            where: { pushNotificationToken: { in: pushTokensToRemove } },
          });
        }

        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(
          `Error pushNotificationService.sendPushNotifications: ${error}`
        );
      }
    });

    await Promise.all(promises);
  }

  async checkPushNotificationStatus() {
    const tickets = await prismaClientBypass.pushNotificationTicket.findMany();

    const receiptIds: string[] = tickets.map((ticket) => ticket.id);

    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    const promises = receiptIdChunks.map(async (chunk) => {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        const receiptsToRemove: string[] = [];
        const devicesToRemove: string[] = [];

        // If there is no push receipt for a requested receipt ID, the mapping won't contain that ID
        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receiptId in receipts) {
          const { status } = receipts[receiptId];

          //Remove all tickets processed.
          receiptsToRemove.push(receiptId);

          if (status === 'ok') {
            continue;
          } else if (status === 'error') {
            const receiptError = receipts[
              receiptId
            ] as unknown as ExpoPushErrorReceipt;
            console.error(
              `There was an error sending a notification: ${receiptError.message}`
            );
            if (receiptError.details && receiptError.details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
              // You must handle the errors appropriately.
              console.error(`The error code is ${receiptError.details.error}`);
              if (receiptError.details.error === 'DeviceNotRegistered') {
                devicesToRemove.push();
              }
            }
          }
        }
        //Remove ALL DeviceNotRegistered
        if (devicesToRemove.length) {
          await prismaClientBypass.userDevice.deleteMany({
            where: { pushNotificationToken: { in: devicesToRemove } },
          });
        }
        //Remove Processed tickets
        if (receiptsToRemove.length) {
          await prismaClientBypass.pushNotificationTicket.deleteMany({
            where: { id: { in: receiptsToRemove } },
          });
        }
      } catch (error) {
        console.error(
          `Error pushNotificationService.checkPushNotificationStatus: ${error}`
        );
      }
    });

    await Promise.all(promises);
  }
}
