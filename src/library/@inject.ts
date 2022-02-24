import * as FS from 'fs/promises';
import * as Path from 'path';

import Puppeteer from 'puppeteer-core';

export async function injectScript(page: Puppeteer.Page): Promise<void> {
  await page.addScriptTag({
    content: (
      await FS.readFile(Path.join(__dirname, '../../res/tamper-monkey.js'))
    ).toString(),
  });
}
