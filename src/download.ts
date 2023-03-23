import fetch, { RequestInit } from "node-fetch";
import { createWriteStream } from "fs-extra";
import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";

type DownloadProgressTypeEmitter = {
  error: (error: Error) => void;
  finish: (info: DownloadInfo) => void;
  progress: (chunk: Buffer) => void;
};

export class DownloadProgress extends (EventEmitter as new () => TypedEmitter<DownloadProgressTypeEmitter>) {
  bytesTransferred: number = 0;

  public transferBytes(numOfBytes: number): void {
    this.bytesTransferred += numOfBytes;
  }
}

export interface DownloadInfo {
  url: URL;
  destination: string;
}

export interface DownloadProcessOptions {
  progress?: DownloadProgress;
}

/**
 * Represents a download process.
 * For instance, in order to download a file from url
 * and store it onto destination file
 *
 * ```js
 * import { download } from 'kratos-core'
 * const process = new download.DownloadProcess({
 *  destination: 'path/to/download',
 *  url: new Url('https://example.com')
 * })
 *
 * const processInfo = await process.startDownload();
 * ```
 *
 * In order to observe the download progress,
 * use {@link DownloadProgress}. {@link DownloadProgressTypeEmitter}
 *
 * ```js
 * const progress = new DownloadProgress();
 * const process = new DownloadProcess(
 *  destination: 'path/to/download',
 *  url: new Url('https://example.com')
 * });
 *
 * await process.startDownload();
 *
 * progress.on("progress", (chunk: Buffer) => {  })
 * progress.on("error", (error: Error) => {  })
 * ```
 */
export class DownloadProcess {
  private info: DownloadInfo;
  private options: DownloadProcessOptions | undefined;

  constructor(info: DownloadInfo, options?: DownloadProcessOptions) {
    this.info = info;
    this.options = options;

    // Undefined options
    if (info === undefined) {
      throw new Error("Invalid download process parameter");
    }

    // Undefined assertion
    if (this.info.destination === undefined || this.info.url === undefined) {
      throw new Error("Invalid download info");
    }
  }

  /**
   * Start to download a current download process information.
   *
   * @param init a request initial configuration for node-fetch
   * @returns a current info request
   */
  public startDownload(init?: RequestInit) {
    return new Promise<DownloadInfo>(async (resolve, reject) => {
      try {
        const writer = createWriteStream(this.info.destination);
        // Create a fetch
        const response = await fetch(this.info.url, {
          method: "get",
          ...init,
        });

        // Unable to resolve the HTTP request
        if (!response.ok) {
          const error = new Error(
            "Unable to do HTTP Get with status " +
              response.status +
              "; statusText: " +
              response.statusText
          );

          if (
            this.options !== undefined &&
            this.options.progress !== undefined
          ) {
            this.options.progress.emit("error", error);
          }

          return reject(error);
        }

        // Piping a stream from download resource to dest
        const responseBody: NodeJS.ReadableStream = response.body;
        responseBody.pipe(writer);

        // File or output error (for Node stream error catch)
        responseBody.on("error", (error) => {
          if (this.options.progress !== undefined && this.options.progress) {
            this.options.progress.emit("error", error);
          }
          return reject(error);
        });

        // Trigger event when a stream is buffering
        responseBody.on("data", (chunk: Buffer) => {
          // Call when buffering
          if (this.options !== undefined && this.options.progress) {
            this.options.progress.transferBytes(chunk.length);
            this.options.progress.emit("progress", chunk);
          }
        });

        // Trigger event when stream is closed
        responseBody.on("close", () => {
          if (
            this.options !== undefined &&
            this.options.progress !== undefined
          ) {
            this.options.progress.emit("finish", this.info);
          }
          return resolve(this.info);
        });
      } catch (err) {
        if (this.options !== undefined && this.options.progress !== undefined) {
          this.options.progress.emit("error", err);
        }
        return reject(err);
      }
    });
  }
}
