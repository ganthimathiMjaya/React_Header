import { ClientRequest } from '@sendgrid/client/src/request';
import { ClientResponse } from '@sendgrid/mail';
import { sgClient } from '../sendgrid/sendgrid.client';

export default async function getInternalContactList() {
  const data = {
    query: "email LIKE '%dialexa.com'",
  };

  const request: ClientRequest = {
    url: `/v3/marketing/contacts/search`,
    method: 'POST',
    body: data,
  };

  const [_response, body]: [ClientResponse, any] = await sgClient.request(
    request
  );
  return body.result.map((r: { email: string }) => r.email);
}
