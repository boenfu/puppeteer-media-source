import * as Path from 'path';

import * as FS from 'fs-extra';

import {MediaSource} from './source';

export async function extractMediaSource(
  mediaSource: MediaSource,
  dir: string,
): Promise<void> {
  while (true) {
    if (mediaSource.state === 'ready') {
      mediaSource.start();
      continue;
    }

    for (let [index, {mime, data}] of mediaSource.sourceBuffersMap) {
      let sourceBufferDir = Path.join(dir, `${index}`);

      await FS.outputFile(Path.join(sourceBufferDir, 'mime'), mime);

      for (let [i, buffer] of Object.entries(data)) {
        await FS.outputFile(Path.join(sourceBufferDir, `${i}`), buffer);
      }
    }

    await new Promise(resolve => setTimeout(resolve));

    if (mediaSource.state === 'done') {
      break;
    }
  }
}
