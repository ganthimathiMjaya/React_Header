let mockOrganizationSettingsRepository = jest.mock;
let mockGetCompanyLogoKey = jest.fn().mockImplementation(async (orgId) => {});

jest.mock(
  '../../repositories/organizationSettings/organizationSettings.repository',
  () => {
    return {
      __esModule: true,
      default: jest.fn().mockImplementation(() => {
        return {
          OrganizationSettingsRepository: mockOrganizationSettingsRepository,
          getCompanyLogoKey: mockGetCompanyLogoKey,
        };
      }),
    };
  }
);

import { expect, jest } from '@jest/globals';
import OrganizationSettingsService from '../organizationSettings/organizationSettings.service';

describe('OrganizationSettingsService', () => {
  describe('getCompanyLogoNullLogoRecord', () => {
    it('getCompanyLogoNullLogoRecord', async () => {
      const service = new OrganizationSettingsService();
      let actual = await service.getCompanyLogo('orgId');

      expect(actual).toBeNull();
    });
  });
});
