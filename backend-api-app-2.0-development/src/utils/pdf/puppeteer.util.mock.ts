export const mockPuppeteerUtil = {
  generatePdf: jest.fn(),
  getLogoDataUrl: jest.fn(),
};

jest.mock('./puppeteer.util', () => ({
  __esModule: true,
  default: mockPuppeteerUtil,
  generatePdf: mockPuppeteerUtil.generatePdf,
  getLogoDataUrl: mockPuppeteerUtil.getLogoDataUrl,
}));
