import EventEmitter from 'eventemitter3';
import localforage from 'localforage';
import { md5 } from 'js-md5';

export type DownloadOptions = {
  url: string;
  fileName: string;
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

class Download extends EventEmitter<
  EVENTS,
  {
    status: STATUS;
    error: any;
  }
> {
  static EVENTS = EVENTS;
  static STATUS = STATUS;

  url: string;
  fileName: string;
  isReady: boolean = false;
  abortController?: AbortController;
  currentChunk: number = 0;
  chunkSize: number;
  totalChunk: number = 1;
  totalSize: number = 0;
  status: STATUS = STATUS.PENDING;

  constructor({
    url,
    fileName,
    chunkSize = 10 * 1024 * 1024,
  }: DownloadOptions) {
    super();
    this.url = url;
    this.fileName = fileName;
    this.chunkSize = chunkSize;
    this.abortController = new AbortController();
    this.openDB();
  }

  changeStatus(value: STATUS, error: any = null) {
    this.status = value;
    this.emit(EVENTS.STATUS_UPDATE, {
      status: value,
      error,
    });
  }

  async openDB() {
    try {
      this.changeStatus(STATUS.PENDING);
      await localforage.ready();
      await this.init();
      this.emit(EVENTS.READY);
      this.isReady = true;
    } catch (error) {
      this.changeStatus(STATUS.ERROR, error);
    }
  }

  async getCompletedCount(): Promise<number> {
    const md5 = this.getURLMd5();
    const keys = await localforage.keys();
    return keys.filter((k) => k.startsWith(`${md5}_`)).length;
  }

  async getResumePosition() {
    const md5 = this.getURLMd5();
    const keys = await localforage.keys();
    const chunkKeys = keys.filter((k) => k.startsWith(`${md5}_`));

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
    this.emit(EVENTS.PROGRESS_UPDATE, percent);
  }

  start() {
    if (!this.isReady) {
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
    this.currentChunk = 0;
    this.totalChunk = 1;
    this.updateProgress();
    this.changeStatus(STATUS.PENDING);
    this.remove();
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
      console.error(error);
      this.changeStatus(STATUS.ERROR, error);
    }
  }

  async remove() {
    const md5 = this.getURLMd5();
    const prefix = `${md5}_`;
    const keys = await localforage.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith(prefix))
        .map((k) => localforage.removeItem(k)),
    );
  }

  async mergeAndDownload() {
    try {
      // 校验数据完整
      const completed = await this.getCompletedCount();
      if (completed < this.totalChunk) {
        this.changeStatus(
          STATUS.ERROR,
          new Error(`下载不完整，请取消再重新下载`),
        );
        return;
      }

      const md5 = this.getURLMd5();
      const promises: Promise<any>[] = [];
      for (let i = 0; i < this.totalChunk; i++) {
        promises.push(localforage.getItem(`${md5}_${i}`));
      }
      const blobs = (await Promise.all(promises)) as Blob[];
      const blob = new Blob(blobs);
      const tempURL = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = tempURL;
      a.download = this.fileName;
      document.body.append(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(tempURL);

      // fix: Safari 的 new Blob([blob1, blob2, ...]) 并不保证立即深拷贝所有数据，它在内存压力大时会偷偷保留对原 BlobPart 的引用，等真正需要写入磁盘时再去读。
      setTimeout(async () => {
        await this.remove(); // 删 IndexedDB 中的 chunk
        this.changeStatus(STATUS.PENDING); // 恢复初始状态
      }, 2000);
    } catch (error) {
      this.changeStatus(STATUS.ERROR, error);
    }
  }
}

export default Download;
