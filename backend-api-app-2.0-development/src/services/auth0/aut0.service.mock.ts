export const mockAuth0Service = {
  createUser: jest.fn(),
  getRoles: jest.fn(),
  getRoleByName: jest.fn(),
  getUser: jest.fn(),
  getOrgName: jest.fn(),
  getPasswordResetLink: jest.fn(),
};

jest.mock('./auth0.service', () => ({
  __esModule: true,
  default: mockAuth0Service,
  Auth0Service: jest.fn().mockImplementation(() => mockAuth0Service),
}));
