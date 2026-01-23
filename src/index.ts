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

type DownloadMap = Map<
  string,
  {
    chunkNames: Set<number>;
    currentChunk: number;
    totalChunk: number;
  }
>;

class Download extends EventEmitter<
  EVENTS,
  {
    status: STATUS;
    error: any;
  }
> {
  static EVENTS = EVENTS;
  static STATUS = STATUS;
  static DOWNLOAD_MAP_KEY = 'downloadMap';
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
    const downloadMap = (await localforage.getItem(
      Download.DOWNLOAD_MAP_KEY,
    )) as DownloadMap;
    const md5 = this.getURLMd5();
    if (downloadMap) {
      const item = downloadMap.get(md5);
      if (item) {
        this.currentChunk = item.currentChunk + 1;
        this.totalChunk = item.totalChunk;
        this.updateProgress();
      }
    } else {
      const map = new Map();
      map.set(md5, {
        chunkNames: new Set(),
        currentChunk: 0,
        totalChunk: 0,
      });
      await localforage.setItem(Download.DOWNLOAD_MAP_KEY, map);
    }
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

  async getFileSize() {
    const data = await axios.head(this.url);
    return data.headers['content-length'];
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

  getURLMd5 = (() => {
    let md5Value: string;
    return () => {
      if (md5Value) {
        return md5Value;
      }
      return (md5Value = md5(this.url));
    };
  })();

  getCurrentChunkName(currentChunk: number) {
    const md5 = this.getURLMd5();
    return `${md5}_${currentChunk}`;
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

  resume() {}

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
    let downloadMap = (await localforage.getItem(
      Download.DOWNLOAD_MAP_KEY,
    )) as DownloadMap;
    const md5 = this.getURLMd5();
    const chunkName = this.getCurrentChunkName(currentChunk);
    let downloadItem = downloadMap.get(md5);
    if (downloadItem) {
      downloadItem.chunkNames.add(currentChunk);
      // downloadItem.currentChunk = currentChunk;
      downloadItem.totalChunk = this.totalChunk;
      await localforage.setItem(Download.DOWNLOAD_MAP_KEY, downloadMap);
      await localforage.setItem(chunkName, new Blob([arrayBuffer]));
      this.updateProgress();
    }
  }

  async download() {
    try {
      const concurrency = 4;
      const pool: Promise<any>[] = [];
      const run = async (currentChunk: number) => {
        await this.uploadSingeChunk(currentChunk);
      };

      this.totalSize = await this.getFileSize();
      this.totalChunk = Math.ceil(this.totalSize / this.chunkSize);

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
    const downloadMap = (await localforage.getItem(
      Download.DOWNLOAD_MAP_KEY,
    )) as DownloadMap;

    const downloadItem = downloadMap.get(md5);
    if (downloadItem) {
      // 移除每个下载项对应的 chunk
      await Promise.all(
        Array.from(downloadItem.chunkNames).map((key) =>
          localforage.removeItem(`${md5}_${key}`),
        ),
      );

      // 移除下载项
      await downloadMap.delete(md5);
      // 更新本地存储
      await localforage.setItem(Download.DOWNLOAD_MAP_KEY, downloadMap);
    }
  }

  async mergeAndDownload() {
    try {
      const md5 = this.getURLMd5();
      const downloadMap = (await localforage.getItem(
        Download.DOWNLOAD_MAP_KEY,
      )) as DownloadMap;
      const downloadItem = downloadMap.get(md5);
      if (downloadItem) {
        const arr = await Promise.all(
          Array.from(downloadItem.chunkNames)
            .sort((a, b) => a - b)
            .map((key) => localforage.getItem(`${md5}_${key}`)),
        );
        const blobs = arr.map((item) => item) as Blob[];
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
          // await this.remove(); // 删 IndexedDB 中的 chunk
          // this.changeStatus(STATUS.PENDING); // 恢复初始状态
        }, 2000);
      }
    } catch (error) {
      this.changeStatus(STATUS.ERROR, error);
    }
  }
}

export default Download;
