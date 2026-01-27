import localforage from 'localforage';
import { md5 } from 'js-md5';

export type DownloadOptions = {
  url: string;
  fileName: string;
  mitmPath?: string;
  onReady?: () => void;
  onStatusChange?: (status: STATUS, error: any ) => void;
  onProgress?: (value: string) => void;
  onError?: (error: any) => void;
  chunkSize?: number;
};

export enum STATUS {
  PENDING = 'pending',
  PAUSE = 'pause',
  DOWNLOADING = 'downloading',
  FINISHED = 'finished',
  ERROR = 'error',
}

enum EVENTS {
  READY = 'ready',
  STATUS_UPDATE = 'status_update',
  PROGRESS_UPDATE = 'progress_update',
}

class Download {
  static EVENTS = EVENTS;
  static STATUS = STATUS;

  url: string;
  fileName: string;
  isReady: boolean = false;
  mitmPath?: string;
  abortController?: AbortController;
  currentChunk: number = 0;
  chunkSize: number;
  totalChunk: number = 0;
  totalSize: number = 0;
  status: STATUS = STATUS.PENDING;
  onReady: DownloadOptions['onReady'];
  onStatusChange: DownloadOptions['onStatusChange'];
  onProgress: DownloadOptions['onProgress'];

  constructor({
    url,
    fileName,
    chunkSize = 10 * 1024 * 1024,
    mitmPath,
    onReady,
    onProgress,
    onStatusChange,
  }: DownloadOptions) {
    this.url = url;
    this.fileName = fileName;
    this.chunkSize = chunkSize;
    this.mitmPath = mitmPath;
    this.abortController = new AbortController();
    this.onReady = onReady;
    this.onProgress = onProgress;
    this.onStatusChange = onStatusChange;
    this.openDB();
  }

  static async setMitmPath(path: string) {
    const mod = await import('streamsaver')
    mod.default.mitm = path;
  }

  changeStatus(value: STATUS, error: any = null) {
    this.status = value;
    this.onStatusChange?.(value , error);
  }

  async openDB() {
    try {
      this.changeStatus(STATUS.PENDING);
      await localforage.ready();
      await this.init();
      this.onReady?.();
      this.isReady = true;
    } catch (error) {
      this.changeStatus(STATUS.ERROR, error);
    }
  }

  async getChunkKeys() {
    const md5 = this.getURLMd5();
    const keys = await localforage.keys();
    return keys.filter((k) => k.startsWith(`${md5}_`));
  }

  async getCompletedCount(): Promise<number> {
    const keys = await this.getChunkKeys();
    return keys.length;
  }

  async getResumePosition() {
    const chunkKeys = await this.getChunkKeys();
    const downloadedIndices = chunkKeys
      .map((k) => parseInt(k.split('_')[1]!, 10))
      .filter((n) => !isNaN(n));
    // 找到第一个缺失作为下次开始位置，这样规避中间漏上传的问题
    let chunkIndex = 0;
    const set = new Set(downloadedIndices);
    while (set.has(chunkIndex)) {
      chunkIndex++;
    }
    return chunkIndex;
  }

  async init() {
    const totalSize = await this.getFileSize();
    this.totalSize = totalSize;
    this.totalChunk = Math.ceil(this.totalSize / this.chunkSize);
    this.currentChunk = await this.getResumePosition();
    this.updateProgress();
  }

  getURLMd5 = (() => {
    let md5Value: string;
    return () => {
      if (md5Value) {
        return md5Value;
      }
      return (md5Value = md5(this.url));
    };
  })();

  async getFileSize() {
    try {
      const { headers } = await fetch(this.url, {
        method: 'HEAD',
      });
      let len = headers.get('content-length');
      if (len) return Number(len);
    } catch {}

    // 兜底
    const { headers } = await fetch(this.url, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
    });
    const cr = headers.get('content-range');
    if (cr) {
      const match = cr.match(/\/(\d+)$/);
      if (match) return Number(match[1]);
    }

    throw new Error('无法获取文件大小');
  }

  getCurrentChunkName(currentChunk: number) {
    const md5 = this.getURLMd5();
    return `${md5}_${currentChunk}`;
  }

  async getChunkData(start: number, end: number) {
    const response = await fetch(this.url, {
      headers: {
        Range: `bytes=${start}-${end}`,
      },
      signal: this.abortController?.signal,
    });
    return response.arrayBuffer();
  }

  abort() {
    this.abortController?.abort();
    this.abortController = new AbortController();
  }

  async updateProgress() {
    // 异步并发下载，取实际已经下载好的
    const completed = await this.getCompletedCount();
    const percent = ((completed / this.totalChunk) * 100).toFixed(2);
    this.onProgress?.(percent);
  }

  resetState() {
    this.currentChunk = 0;
    this.updateProgress();
    this.changeStatus(STATUS.PENDING);
  }

  start() {
    if (!this.isReady) {
      return;
    }
    // 针对文本文件，直接下载
    if (this.url.endsWith('.txt')){
      this.downloadText();
      return;
    }

    this.changeStatus(STATUS.DOWNLOADING);
    this.download();
  }

  pause() {
    this.changeStatus(STATUS.PAUSE);
    this.abort();
  }

  async resume() {
    this.currentChunk = await this.getResumePosition();
    this.changeStatus(STATUS.DOWNLOADING);
    this.download();
  }

  async cancel() {
    this.abort();
    await this.remove();
    this.resetState();
  }

  async uploadSingeChunk(currentChunk: number) {
    const chunkName = this.getCurrentChunkName(currentChunk);
    if (await localforage.getItem(chunkName)) {
      this.updateProgress();
      return;
    }

    const start = currentChunk * this.chunkSize;
    const end = Math.min(start + this.chunkSize - 1, this.totalSize - 1);
    const arrayBuffer = await this.getChunkData(start, end);
    await localforage.setItem(chunkName, new Blob([arrayBuffer]));
    this.updateProgress();
  }


  async downloadText() {
    const blob = await fetch(this.url).then((res) => res.blob());
    const mod = await import('streamsaver');
    const fileStream = mod.default.createWriteStream(this.fileName, {
      size: this.totalSize,
    });
    const writer = fileStream.getWriter();
    const reader = (blob as Blob).stream().getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      await writer.write(value);
    }
    await writer.close();
  }

  async download() {
    try {
      const concurrency = 4;
      const pool: Promise<any>[] = [];

      const run = async (currentChunk: number) => {
        await this.uploadSingeChunk(currentChunk);
      };

      while (this.currentChunk < this.totalChunk) {
        if (pool.length >= concurrency) {
          await Promise.race(pool);
        }

        const p = run(this.currentChunk++).finally(() => {
          const index = pool.indexOf(p);
          index > -1 && pool.splice(index, 1);
        });
        pool.push(p);
      }
      await Promise.all(pool);
      this.changeStatus(STATUS.FINISHED);
      this.mergeAndDownload();
    } catch (error) {
      const err = error as unknown as Error;
      if (err && err.name === 'AbortError') {
        return;
      }
      this.changeStatus(STATUS.ERROR, error);
    }
  }

  async remove() {
    const keys = await this.getChunkKeys();
    await Promise.all(keys.map((k) => localforage.removeItem(k)));
  }

  async mergeAndDownload() {
    // 校验数据完整
    const completed = await this.getCompletedCount();
    if (completed < this.totalChunk) {
      this.changeStatus(
        STATUS.ERROR,
        new Error(`下载不完整，请取消再重新下载`),
      );
      return;
    }
    const mod = await import('streamsaver');
    if(this.mitmPath){
      mod.default.mitm = this.mitmPath;
    }
    const fileStream = mod.default.createWriteStream(this.fileName, {
      size: this.totalSize,
    });
    const writer = fileStream.getWriter();
    const md5 = this.getURLMd5();

    try {
      for (let i = 0; i < this.totalChunk; i++) {
        const blob = (await localforage.getItem(`${md5}_${i}`)) as Blob;
        if (!blob) throw new Error(`Chunk ${i} missed!`);
        const reader = (blob as Blob).stream().getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      }
      await writer.close();

      // fix: Safari 的 new Blob([blob1, blob2, ...]) 并不保证立即深拷贝所有数据，它在内存压力大时会偷偷保留对原 BlobPart 的引用，等真正需要写入磁盘时再去读。
      setTimeout(async () => {
        await this.remove(); // 删 IndexedDB 中的 chunk
        this.resetState();
      }, 2000);
    } catch (err) {
      this.changeStatus(STATUS.ERROR, err);
      writer.abort && writer.abort(err); // 兼容 StreamSaver
    }
  }

  destroy() {
    this.abort();
  }
};

export {
  Download
} ;

