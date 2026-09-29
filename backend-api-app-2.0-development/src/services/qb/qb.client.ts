import { QBIntegrationRepository } from '../../repositories/qb/qb.repository';
import axios, { AxiosError } from 'axios';
import * as qs from 'qs';

const qbIntegrationRepository = new QBIntegrationRepository();

export default class QBClient {
  public async getTokens(orgId: string) {
    return qbIntegrationRepository.getTokens(orgId);
  }

  private generateAxiosConfig(tokens: any) {
    return {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${tokens!.accessToken}`,
      },
    };
  }

  // This is where we get a new access token for our existing refresh token - Danielle
  public async refreshAccess(orgId: string) {
    const tokens = await this.getTokens(orgId);
    const data = qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: tokens!.refreshToken,
    });

    //if refresh fails, use may need to re-authorize QBs.
    try {
      // The below URL is the same in all environments, so I didn't put it in an
      // environment variable - Danielle
      const response = await axios.post(
        `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer`,
        data,
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            accept: 'application/json',
            Authorization:
              'Basic ' +
              btoa(
                process.env.QUICKBOOKS_CLIENT_ID +
                  ':' +
                  process.env.QUICKBOOKS_CLIENT_SECRET
              ),
          },
        }
      );
      //Update refresh times here - Danielle
      const result = await qbIntegrationRepository.updateTokens(
        orgId,
        tokens!.companyId,
        response.data.refresh_token,
        response.data.access_token || undefined
      );
      return result;
    } catch (e: any) {
      if ((e as AxiosError).response?.status === 401) {
        console.error(
          'Error refreshing QuickBooks access tokens for org: ',
          orgId,
          ' Refresh token could be expired. Please ask admin user to re-authorize'
        );
        await qbIntegrationRepository.setTokensExpired(orgId, true);
      }
      throw e;
    }
  }

  // The logic for requests is this. Make the request using the access
  // token from the DB. If that doesn't return a 401 then we return the result.
  // If it is a 401 then we try to refresh the access token using the refresh token
  // in the database (thats the call to this.refreshAccess) if that ALSO fails with
  // ANY code, then we return that result. Also, if the access token in the DB is
  // missing, we automatically try a refresh. - Danielle
  public async makeGetRequest(orgId: string, url: string, tokens: any) {
    let oldTokens = tokens;
    if (!oldTokens.accessToken) {
      //No access token, we need to fetch - Danielle
      oldTokens = await this.refreshAccess(orgId);
    }

    const config = this.generateAxiosConfig(oldTokens);

    try {
      return (await axios.get(url, config)).data;
    } catch (e) {
      if ((e as AxiosError).response?.status === 401) {
        //Access token expired, we need to refresh - Danielle
        const newTokens = await this.refreshAccess(orgId);
        if (!newTokens) {
          throw e;
        }
        const newConfig = this.generateAxiosConfig(newTokens);
        try {
          return (await axios.get(url, newConfig)).data;
        } catch (secondError) {
          return { error: secondError };
        }
      } else if ((e as AxiosError).response?.status === 429) {
        //Too many requests. QB allows up to 500 per minute. Wait for one minute.
        console.warn('QB Too many requests. Wait 1 minute');
        await new Promise((resolve) => setTimeout(resolve, 61000));
        try {
          return (await axios.get(url, config)).data;
        } catch (secondError) {
          return { error: secondError };
        }
      }
      return { error: e };
    }
  }

  // Why is there no makePutRequest? Well the QB API isn't exactly REST
  // They consider sending an Id field to be a "full update" and an Id
  // field with sparse: "true" to be a sparse update (a PATCH) - Danielle
  public async makePostRequest(
    orgId: string,
    url: string,
    tokens: any,
    data: any
  ) {
    let oldTokens = tokens;
    if (!oldTokens.accessToken) {
      //No access token, we need to fetch - Danielle
      oldTokens = await this.refreshAccess(orgId);
    }

    const config = this.generateAxiosConfig(oldTokens);

    try {
      return (await axios.post(url, data, config)).data;
    } catch (e) {
      if ((e as AxiosError).response?.status === 401) {
        //Access token expired, we need to refresh - Danielle
        const newTokens = await this.refreshAccess(orgId);
        if (!newTokens) {
          throw e;
        }
        const newConfig = this.generateAxiosConfig(newTokens);
        try {
          return (await axios.post(url, data, newConfig)).data;
        } catch (secondError) {
          return { error: secondError };
        }
      } else if ((e as AxiosError).response?.status === 429) {
        //Too many requests. QB allows up to 500 per minute per realmId. Wait for one minute.
        console.warn('QB Too many requests. Wait 1 minute');
        await new Promise((resolve) => setTimeout(resolve, 61000));
        try {
          return (await axios.post(url, data, config)).data;
        } catch (secondError) {
          return { error: secondError };
        }
      }
      return { error: e };
    }
  }
}
