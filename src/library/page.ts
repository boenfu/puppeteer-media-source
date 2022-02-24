import Puppeteer from 'puppeteer-core';
import {AutoClosePageOptions, autoClosePage} from 'puppeteer-page';

import {injectScript} from './@inject';
import {MediaSourceManager} from './manager';

declare module 'puppeteer-core' {
  interface Page {
    manager: MediaSourceManager;
    release?: () => void;
  }
}

export interface PageOptions {
  url: string;
  remote: AutoClosePageOptions;
}

export async function newPage({
  url,
  remote,
}: PageOptions): Promise<Puppeteer.Page> {
  return new Promise((resolve, reject) => {
    autoClosePage(async page => {
      await page.goto(url);

      await puppeteerMediaSource(page);

      await new Promise<void>(release => {
        page.release = release;
        resolve(page);
      });
    }, remote).catch(reject);
  });
}

export async function puppeteerMediaSource(
  page: Puppeteer.Page,
): Promise<void> {
  page.manager = new MediaSourceManager(page);
  await injectScript(page);
}
