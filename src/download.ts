import { dirname } from "path";
import { Preconditions } from "./utils";
import fetch, { RequestInit } from "node-fetch";
import { createWriteStream, ensureDir } from "fs-extra";
import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";
import { createHash, Hash } from "crypto";

/**
 * Represents emit event for {@link DownloadProgress}
 */
type DownloadProgressTypeEmitter = {
  error: (error: Error) => void;
  finish: (info: DownloadInfo) => void;
  progress: (chunk: Buffer) => void;
};

/**
 * Represents a download progress for file.
 */
export class DownloadProgress extends (EventEmitter as new () => TypedEmitter<DownloadProgressTypeEmitter>) {
  bytesTransferred: number = 0;
  size: number = -1;

  constructor(size?: number) {
    super();

    this.size = size || -1;
  }
  /**
   * Updates the counter that is counting a bytes.
   *
   * @param numOfBytes a number of bytes that already transferred
   */
  public transferBytes(numOfBytes: number): void {
    this.bytesTransferred += numOfBytes;
  }
}

/**
 * Represents a pre-download information.
 */
export interface DownloadInfo {
  /**
   * The url of the file to request HTTP Get method
   */
  url: URL;
  /**
   * The destination of the file to save into
   */
  destination: string;
}

/**
 * Represents an option for a {@link DownloadProcess} class.
 */
export interface DownloadProcessOptions {
  /**
   * The progress of downloading task, see {@link DownloadProgress}
   */
  progress?: DownloadProgress;
  /**
   * The hash observation class to observe the downloading task
   * and return the hash (checksum) of downloading file.
   */
  hashObservation?: DownloadHashObservation;
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

  /**
   *
   * @param info the download information such as url, and destination
   * @param options an options for download
   */
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
        // Ensure the directory is not empty before download
        const directoryName = dirname(this.info.destination);
        await ensureDir(directoryName);

        // Create a writer
        const writer = createWriteStream(this.info.destination, {
          mode: 0o755,
        });

        // Reject the promise when create writer got error
        writer.on("error", async (error) => {
          return reject(error);
        });

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

          // Streaming into hash observation
          this.options !== undefined &&
            this.options.hashObservation !== undefined &&
            this.options.hashObservation.update(chunk);
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

  /**
   * Retrieves the local download options.
   *
   * @returns the download options from parameter
   */
  public getOptions(): DownloadProcessOptions | undefined {
    return this.options;
  }
}

/**
 * Creates a {@link DownloadProcess} for short-hand function
 * instead of using new keywords.
 *
 * @param info {@link DownloadInfo} a download information
 * @param options {@link DownloadProcessOptions} a download options interface
 * @returns a new instance of download process
 */
export function createDownloadProcess(
  info: DownloadInfo,
  options?: DownloadProcessOptions
) {
  return new DownloadProcess(info, options);
}

/**
 * Represents an observation, consume download data
 * when passing through {@link DownloadProcess} options.
 *
 * For instance, to generate the summation of the file after
 * downloading the file:
 *
 * ```
 * const hashObservation = new download.DownloadHashObservation("sha1");
 * const process = new download.DownloadProcess(downloadInfo, {
 *  hashObservation,
 * });
 *
 * await process.startDownload();
 *
 * const digestedHash = hashObservation.digest();
 * if (digestedHash === 'hash-to-compare') {
 *    // success to compare the file summation
 * } else {
 *    // failed to compare the file summation
 * }
 * ```
 *
 * Be aware of using a large file when downloading, it might cause memory issues.
 *
 * In order to hash a downloadable content, do as follows:
 *
 * ```
 * import {readFileSync} from 'fs';
 *
 * // Start downloading a file
 * const process = new download.DownloadProcess(downloadInfo);
 * await process.startDownload();
 *
 * const filePathDestination = downloadInfo.destination;
 * const hashObservation = new DownloadHashObservation();
 *
 * const fileBuffer =  readFileSync(filePathDestination)
 * hashObservation.update(fileBuffer);
 *
 * const digestedHash = hashObservation.digest();
 * if (digestedHash === 'hash-to-compare') {
 *    // success to compare the file summation
 * } else {
 *    // failed to compare the file summation
 * }
 * ```
 */
export class DownloadHashObservation {
  private hash: Hash;
  /**
   * The `algorithm` is dependent on the available
   * algorithms supported by the version
   * of OpenSSL on the platform.
   * Examples are `'sha256'`, `'sha512'`, etc.
   * On recent releases of OpenSSL, `openssl list -digest-algorithms`
   *  will display the available digest algorithms.
   *
   * @param algorithm the algorithm of hash function
   */
  constructor(algorithm: string) {
    this.hash = createHash(algorithm);
  }

  /**
   * Updates data into hash variable.
   *
   * @param buffer the buffer to update the hash variable
   */
  public update(buffer: Buffer) {
    this.hash.update(buffer);
  }

  /**
   * Retrieves the digested hash as buffer.
   *
   * @returns the digested hash as a buffer
   */
  public digest(): Buffer {
    return this.hash.digest();
  }

  /**
   * Retrieves the stored hash variables.
   *
   * @returns the variable hash that store updated hash
   */
  public getHash() {
    return this.hash;
  }
}

/**
 * Represents a emitter for {@link DownloadMatchingProcess}
 */
type DownloadMatchingEmitter = {
  /**
   * Emits when the checksum of the file is not matching with provided hash.
   *
   *
   * @param info the information of the current downloading process
   * @param attempt the number of attempt
   * @param process the current process
   * @returns a void function
   */
  retry: (
    info: DownloadInfo,
    attempt: number,
    process: DownloadMatchingProcess
  ) => void;
  /**
   * Emits when the process is reached to maximum attempt and the hash is invalid.
   *
   * @param process the current process that emitter is running on
   * @returns a void function
   */
  corrupted: (info: DownloadInfo, process: DownloadMatchingProcess) => void;
  /**
   * Emits when the process is complete stream the file.
   *
   * @param info download information of the current process
   * @param process the current process that emitter is running on
   * @returns a void function
   */
  success: (info: DownloadInfo, process: DownloadMatchingProcess) => void;
};

/**
 * Represents an observer for {@link DownloadMatchingProcess} object.
 */
export class DownloadMatchingObserver extends (EventEmitter as new () => TypedEmitter<DownloadMatchingEmitter>) {}

/**
 * Represents an option for {@link DownloadMatchingProcess}.
 */
export interface DownloadMatchingOptions {
  /**
   * The hash algorithm to make a hash.
   * The hash is making using {@link DownloadHashObservation}.
   *
   */
  algorithm?: string;
  /**
   * The number of attempt before reject the download file.
   */
  maxAttempt?: number;
  /**
   * The download progress to follow progress of the process.
   */
  progress?: DownloadProgress;
  /**
   * The observer (event listener) to listen to the event from {@link DownloadMatchingProcess}.
   */
  observer?: DownloadMatchingObserver;
}

/**
 * Represents a download process using checksum function to check the integrity of the file
 * before save it. 
 * 
 * ```js
 *  const mismatchingProcess = new download.DownloadMatchingProcess(
        {
          destination: 'some/path/to/file.f',
          url: new Url("https://google.com/")
        },
        "this-is-a-provided-sha-to-check",
        {
          algorithm: "sha1",
          maxAttempt: 3,
        }
      );
 * 

    // Using then
    mismatchingProcess
      .startDownload()
      .then((downloadInfo) => {
        console.log(downloadInfo.destination); // output: some/path/to/file.f
      })

    // Using async/await
    (await mismatchingProcess.startDownload()).destination; // output: some/path/to/file.f
 * ```
 * 
 */
export class DownloadMatchingProcess {
  private readonly info: DownloadInfo;
  private readonly hashValue: string;
  private readonly options: DownloadMatchingOptions | undefined;
  private stack: DownloadProcess[] = [];
  private attempt: number;

  constructor(
    info: DownloadInfo,
    hashValue: string,
    options?: DownloadMatchingOptions
  ) {
    Preconditions.notNull(info);
    Preconditions.notNull(hashValue);

    this.info = info;
    this.hashValue = hashValue;
    this.options = options;

    this.attempt = 0;
  }

  private createSubprocess() {
    const observer = new DownloadHashObservation(
      (this.options && this.options.algorithm) || "sha1"
    );

    return createDownloadProcess(this.info, {
      hashObservation: observer,
      progress: (this.options && this.options.progress) || undefined,
    });
  }

  /**
   * Starts downloading the current pending process.
   *
   * @returns the downloaded file information
   */
  public async startDownload(init?: RequestInit): Promise<DownloadInfo> {
    return new Promise(async (resolve, reject) => {
      if (this.stack.length === 0) {
        this.stack.push(this.createSubprocess());
      }

      const maxAttempt = (this.options && this.options.maxAttempt) || 3;
      while (this.attempt < maxAttempt) {
        const chunk: DownloadProcess = this.stack.pop();
        // console.log(this.attempt);

        await chunk.startDownload(init);
        const currentObservation = chunk.getOptions().hashObservation;

        // if (currentObservation === undefined) {
        //   return resolve(this.info);
        // }

        if (currentObservation.digest().toString("hex") === this.hashValue) {
          // Emit success event
          if (
            this.options !== undefined &&
            this.options.observer !== undefined
          ) {
            this.options.observer.emit("success", this.info, this);
          }
          return resolve(this.info);
        }

        // Emit retry event
        if (this.options !== undefined && this.options.observer !== undefined) {
          this.options.observer.emit("retry", this.info, this.attempt, this);
        }

        this.stack.push(this.createSubprocess());
        this.attempt++;
      }

      // If reach the limit
      if (this.attempt === maxAttempt) {
        if (this.options !== undefined && this.options.observer !== undefined) {
          this.options.observer.emit("corrupted", this.info, this);
        }
        // Then reject the attempt
        return reject(
          new Error(
            `Maximum attempt (${this.attempt} over ${this.options.maxAttempt}). The downloading file is broken or check your input hash`
          )
        );
      }
    });
  }

  public getDownloadInfo() {
    return this.info;
  }
}

/**
 * Represents an abbreviation for create a new instance of {@link DownloadMatchingProcess}.
 *
 *
 * @param info the download info.
 * @param hashValue the hash value to check after the file is downloaded.
 * @param options a download options.
 * @returns a new instance of {@link DownloadMatchingProcess}.
 */
export function createAttemptDownload(
  info: DownloadInfo,
  hashValue: string,
  options?: DownloadMatchingOptions
) {
  return new DownloadMatchingProcess(info, hashValue, options);
}
