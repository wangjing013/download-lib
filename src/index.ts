import axios from 'axios';
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
  totalChunk: number = 1;
  chunkSize: number;
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

  async init() {
    const totalSize = await this.getFileSize();
    const md5 = await this.getURLMd5();
    const keys = await localforage.keys();
    if (Array.isArray(keys) && keys.length) {
      const chunks = keys.filter((key) => key.startsWith(`${md5}_`));
      this.currentChunk = chunks.length;
    }
    this.totalSize = totalSize;
    this.totalChunk = Math.ceil(this.totalSize / this.chunkSize);
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

  getURLMd5 = (() => {
    let md5Value: string;
    return () => {
      if (md5Value) {
        return md5Value;
      }
      return (md5Value = md5(this.url));
    };
  })();

  getFileSize = (() => {
    let length: number;
    return async () => {
      if (length) {
        return length;
      }
      const data = await axios.head(this.url);
      return (length = data.headers['content-length']);
    };
  })();

  getCurrentChunkName(currentChunk: number) {
    const md5 = this.getURLMd5();
    return `${md5}_${currentChunk}`;
  }

  async getChunkData(start: number, end: number) {
    const { data } = await axios.get(this.url, {
      responseType: 'arraybuffer',
      headers: {
        Range: `bytes=${start}-${end}`,
      },
      signal: this.abortController?.signal,
    });
    return data;
  }

  abort() {
    this.abortController?.abort();
    this.abortController = new AbortController();
  }

  updateProgress() {
    this.emit(
      EVENTS.PROGRESS_UPDATE,
      ((this.currentChunk / this.totalChunk) * 100).toFixed(2),
    );
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

  resume() {
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
    const start = currentChunk * this.chunkSize;
    const end = Math.min(start + this.chunkSize - 1, this.totalSize - 1);
    const arrayBuffer = await this.getChunkData(start, end);
    const chunkName = this.getCurrentChunkName(currentChunk);
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

        const p = run(this.currentChunk).finally(() => {
          const index = pool.indexOf(p);
          index > -1 && pool.splice(index, 1);
        });

        pool.push(p);
        this.currentChunk += 1;
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
    for (let i = 0; i < this.totalChunk; i++) {
      await localforage.removeItem(`${md5}_${i}`);
    }
  }

  async mergeAndDownload() {
    try {
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
      // 这里不能理解删除，某则下载不成功
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
