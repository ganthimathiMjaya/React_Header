export const mockGeocoder = jest.fn();

jest.mock('./geocoder.client', () => ({
  __esModule: true,
  default: mockGeocoder,
}));
