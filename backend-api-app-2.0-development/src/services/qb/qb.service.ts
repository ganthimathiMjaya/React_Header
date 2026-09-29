import { QBIntegrationRepository } from '../../repositories/qb/qb.repository';
import QBClient from './qb.client';
import { QB_MAX_RESULTS } from './qbPullCustomers.service';
const OAuthClient = require('intuit-oauth');

const qbIntegrationRepository = new QBIntegrationRepository();
const qbClient = new QBClient();

export default class QBIntegrationService {
  oauthClient = new OAuthClient({
    clientId:
      process.env.QUICKBOOKS_CLIENT_ID ||
      'ABl94g3PpPQWpVulnVudMYnE5SonR3FdEu1oWka3mMrZaDf4T0',
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
    environment: process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox',
    redirectUri:
      process.env.QUICKBOOKS_REDIRECT_URI ||
      'http://localhost:3000/admin/quickBooks/callback',
  });

  public async setTokens(
    orgId: string,
    _code: string,
    realmId: string,
    url: string
  ) {
    const resp = await this.oauthClient.createToken(url);
    if (resp.token.access_token && resp.token.refresh_token) {
      await this.clearTokens(orgId);
      await this.storeTokens(
        orgId,
        realmId,
        resp.token.refresh_token,
        resp.token.access_token
      );
    } else {
      throw new Error('Unable to fetch tokens');
    }
  }

  public async storeTokens(
    orgId: string,
    realmId: string,
    refreshToken: string,
    accessToken?: string
  ) {
    return qbIntegrationRepository.storeTokens(
      orgId,
      realmId,
      refreshToken,
      accessToken
    );
  }

  public async clearTokens(orgId: string) {
    return qbIntegrationRepository.clearTokens(orgId);
  }

  public async getAccounts(orgId: string) {
    const tokens = await qbClient.getTokens(orgId);
    const query = `select * from Account where SubAccount = false AND Active = true  MAXRESULTS ${QB_MAX_RESULTS}`;
    const url = `${process.env.QUICKBOOKS_URL}/v3/company/${
      tokens!.companyId
    }/query?query=${query}&minorversion=69`;
    const resp = await qbClient.makeGetRequest(orgId, url, tokens);

    return resp.QueryResponse.Account;
  }

  // This is a fetch for company preferences to use as a "heartbeat" of sorts - Danielle
  public async getPreferences(orgId: string) {
    const tokens = await qbClient.getTokens(orgId);
    return await qbClient.makeGetRequest(
      orgId,
      `${process.env.QUICKBOOKS_URL}/v3/company/${
        tokens!.companyId
      }/preferences?minorversion=14`,
      tokens
    );
  }
}
