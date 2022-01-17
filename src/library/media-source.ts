import Puppeteer from 'puppeteer-core';

export class MediaSource {
  sourceBuffersMap: Map<
    number,
    {
      mime: string;
      data: Uint8Array[];
    }
  > = new Map();

  duration!: number;

  state: 'ready' | 'in-progress' | 'done' = 'ready';

  constructor(readonly id: string, private page: Puppeteer.Page) {}

  initialize(duration: number): void {
    this.duration = duration;
  }

  start(): void {
    this.state = 'in-progress';
    this.next().catch(console.error);
  }

  async sync({
    index,
    mime,
    data,
  }: {
    index: number;
    mime: string;
    data: number[];
  }): Promise<void> {
    let sourceBuffers = this.sourceBuffersMap.get(index) || {
      mime,
      data: [],
    };

    sourceBuffers.mime = mime;
    sourceBuffers.data.push(Uint8Array.from(data));

    this.sourceBuffersMap.set(index, sourceBuffers);

    await this.next();
  }

  done(): void {
    this.state = 'done';
  }

  private next(): Promise<void> {
    return this.page.evaluate(id => (window[id] as any).next(), this.id);
  }
}
