import path from 'path';
import fs from 'fs';
import puppeteer, { PDFOptions } from 'puppeteer';

let logoDataUrl: string;

// Disabled args for better performance
const puppeteerDisabledArgs = [
  '--disable-features=IsolateOrigins',
  '--disable-site-isolation-trials',
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];

export const generatePdf = async (
  html: string,
  footerTemplate: string,
  headerTemplate: string,
  options?: PDFOptions
) => {
  if (!options) {
    options = {
      displayHeaderFooter: true,
      format: 'A4',
      margin: {
        top: '15mm',
        bottom: '15mm',
      },
      printBackground: true,
      footerTemplate,
      headerTemplate,
    };
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: puppeteerDisabledArgs,
  });
  const page = await browser.newPage();

  await page.waitForFunction('document.fonts.ready');
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf(options);

  await page.close();
  await browser.close();

  return pdfBuffer;
};

export const getLogoDataUrl = (): Promise<string> => {
  if (logoDataUrl) {
    return Promise.resolve(logoDataUrl);
  }
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, '../../data/scrapItLogo.png'),
      'base64',
      (err, data) => {
        if (err) {
          console.error('getLogoDataUrl err: ', err.message, err);
          reject(err);
        } else {
          logoDataUrl = `data:image/png;base64,${data}`;
          resolve(logoDataUrl);
        }
      }
    );
  });
};
