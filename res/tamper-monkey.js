/* eslint-disable no-undef */
(function () {
  try {
    let endOfStream = window.MediaSource.prototype.endOfStream;

    window.MediaSource.prototype.endOfStream = function () {
      this._pms.isEnd = true;

      endOfStream.call(this);
    };

    let addSourceBuffer = window.MediaSource.prototype.addSourceBuffer;

    window.MediaSource.prototype.addSourceBuffer = function (mime) {
      this._pms = this._pms || new PuppeteerMediaSource(this);

      let sourceBuffer = addSourceBuffer.call(this, mime);

      this._pms.addSourceBuffer(sourceBuffer, mime);

      return sourceBuffer;
    };

    class PuppeteerMediaSource {
      constructor(mediaSource) {
        this.mediaSource = mediaSource;
        this.id = `${Date.now()}/${Math.random()}`;
        this.sourceBufferIndexMap = new Map();
        this.chunks = [];
        this.isEnd = false;

        window[this.id] = this;

        this.notify('initialize', mediaSource.duration);
      }

      addSourceBuffer(sourceBuffer, mime) {
        let sourceBufferIndexMap = this.sourceBufferIndexMap;
        let chunks = this.chunks;
        let append = sourceBuffer.appendBuffer;

        sourceBufferIndexMap.set(sourceBuffer, {
          mime,
          index: sourceBufferIndexMap.size,
        });

        sourceBuffer.appendBuffer = function (buffer) {
          let {mime, index} = sourceBufferIndexMap.get(sourceBuffer);

          chunks.push({
            index,
            mime,
            data: Array.from(buffer),
          });

          append.call(this, buffer);
        };
      }

      next() {
        let chunk = this.chunks.shift();

        if (chunk) {
          return this.notify('sync', chunk);
        }

        if (this.isEnd) {
          return this.notify('done');
        }

        setTimeout(() => this.next());
      }

      notify(...args) {
        console.info('__pms', this.id, ...args);
      }
    }
  } catch (error) {
    console.log(error);
  }
})();
