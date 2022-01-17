import * as Path from 'path';

import {extractMediaSource, newPage} from '../library';

(async () => {
  let page = await newPage({
    url: '',
    remote: {
      server: 'localhost',
      port: 9222,
    },
  });

  while (true) {
    for (const mediaSource of page.manager.mediaSourceMap.values()) {
      await extractMediaSource(mediaSource, Path.join(__dirname, '../../mp4'));
      return;
    }

    await new Promise(r => setTimeout(r, 200));
  }
})().catch(console.error);
