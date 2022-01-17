import Puppeteer from 'puppeteer-core';

import {MediaSource} from './media-source';

export class MediaSourceManager {
  mediaSourceMap: Map<string, MediaSource> = new Map();

  private resolver = Promise.resolve();

  constructor(page: Puppeteer.Page) {
    page.on('console', async msg => {
      let [tag, ...args] = msg.args();

      if (tag?._remoteObject.value !== '__pms') {
        return;
      }

      let [id, type, ...params] = await Promise.all(
        args.map(arg => arg.jsonValue()) as [
          string,
          keyof MediaSource,
          ...any[]
        ],
      );
      let mediaSource = this.mediaSourceMap.get(id);

      if (!mediaSource) {
        mediaSource = new MediaSource(id, page);
        this.mediaSourceMap.set(id, mediaSource);
      }

      if (typeof mediaSource[type] === 'function') {
        this.resolver = this.resolver.then(() =>
          Promise.resolve(
            (mediaSource![type] as (...args: any[]) => any)(...params),
          ),
        );
      }
    });
  }
}
