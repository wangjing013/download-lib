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
    this.changeStatus(STATUS.PENDING);
    this.checkDBReady();
  }

  changeStatus(value: STATUS, error: any = null) {
    this.status = value;
    this.onStatusChange?.(value , error);
  }

  async checkDBReady () {
    try {
      await localforage.ready();
      this.onReady?.();
    } catch (e) {
      this.changeStatus(STATUS.ERROR, e);
    }
  } 
  
  private async getMetadata() {
    try {
      const totalSize = await this.getFileSize();
      this.currentChunk = await this.getResumePosition();
      this.totalSize = totalSize;
      this.totalChunk = Math.ceil(this.totalSize / this.chunkSize);
      this.updateProgress();
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

  async start() {
    await this.getMetadata();
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
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = this.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }

  private isRecoverableError(error: any): boolean {
    if (!error) {
      return false;
    }
    const message = error.message ? error.message.toLowerCase() : "";
    return (
      message.indexOf('network') !== -1 ||
      message.indexOf('timeout') !== -1 ||
      message.indexOf('connection') !== -1 ||
      error.code === 'ECONNRESET'
    );
  }

  private async autoRetry(retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        await this.resume();
        return;
      } catch (error) {
        if (i === retries - 1) {
          this.changeStatus(STATUS.ERROR, error);
        }
      }
    }
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
      
      // 网络中断
      if (this.isRecoverableError(err)) {
        this.changeStatus(STATUS.PAUSE, error);
        this.autoRetry();
      } else {
        // 不可恢复的错误 → 需要用户手动处理
        this.changeStatus(STATUS.ERROR, error);
      }
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
 
    try {
      const md5 = this.getURLMd5();
      const blobs: Blob[] = [];
      // 1. 从 IndexedDB 按顺序读取所有分块
      for (let i = 0; i < this.totalChunk; i++) {
        const chunk = await localforage.getItem<Blob>(`${md5}_${i}`);
        if (!chunk) throw new Error(`丢失分块: ${i}`);
        blobs.push(chunk);
      }
      // 2. 合并生成最终的 blob
      const finalBlob = new Blob(blobs, { type: 'application/octet-stream' });
      // 3. 触发浏览器下载
      const downloadUrl = URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = this.fileName;
      document.body.appendChild(link);
      link.click();

      // fix: Safari 的 new Blob([blob1, blob2, ...]) 并不保证立即深拷贝所有数据，它在内存压力大时会偷偷保留对原 BlobPart 的引用，等真正需要写入磁盘时再去读。
      setTimeout(async () => {
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        await this.remove(); // 删 IndexedDB 中的 chunk
        this.resetState();
      }, 2000);
    } catch (err) {
      this.changeStatus(STATUS.ERROR, err);
    }
  }

  destroy() {
    this.abort();
  }
};

export {
  Download
} ;

