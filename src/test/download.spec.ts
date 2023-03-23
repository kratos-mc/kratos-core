import { expect } from "chai";
import { exists, remove, stat, readFile } from "fs-extra";
import * as path from "path";
import { getTestDirectoryPath } from "./utils/testOutput";
import * as download from "./../download";

const mockDownloadInfo: download.DownloadInfo = {
  destination: path.join(getTestDirectoryPath(), "blocklist"),
  url: new URL(
    "https://libraries.minecraft.net/com/mojang/blocklist/1.0.10/blocklist-1.0.10.jar"
  ),
};

describe("[unit] download -", () => {
  afterEach(async () => {
    await remove(mockDownloadInfo.destination);
    expect(await exists(mockDownloadInfo.destination)).to.be.false;
  });

  it("should download a file and save it into storage destination", async function () {
    const downloadProcess: download.DownloadProcess =
      new download.DownloadProcess(mockDownloadInfo);

    const response = await downloadProcess.startDownload();
    expect(await exists(response.destination)).to.be.true;
  });

  describe("progress - ", () => {
    let progress: download.DownloadProgress;
    let process: download.DownloadProcess;

    beforeEach(() => {
      progress = new download.DownloadProgress();
      process = new download.DownloadProcess(mockDownloadInfo, {
        progress, // create a download process with progress
      });
    });

    afterEach(async () => {
      await remove(mockDownloadInfo.destination);
      expect(await exists(mockDownloadInfo.destination)).to.be.false;
    });

    it(`should call progress when start downloading`, (done) => {
      const mustResolve = new Promise<Buffer>(async (resolve) => {
        progress.on("progress", (_chunk: Buffer) => {
          resolve(_chunk);
        });
        // progress.on("finish", (info) => {
        //   console.log();
        // });

        await process.startDownload();
      });

      mustResolve
        .then(async (buffer) => {
          // Must be a buffer without undefined and exist file
          expect(buffer).to.not.be.undefined;
          expect(buffer.length).to.gt(0);
          expect(await exists(mockDownloadInfo.destination)).to.be.true;
          expect(progress.bytesTransferred).to.gt(0);

          done();
        })
        .catch(done);
    });

    it(`should call finish when finished download progress`, (done) => {
      const downloadedResolver = new Promise<download.DownloadInfo>(
        async (resolve) => {
          progress.on("finish", (info) => {
            resolve(info);
          });
          // progress.on("finish", (info) => {
          //   console.log();
          // });

          await process.startDownload();
        }
      );

      downloadedResolver
        .then(async (info: download.DownloadInfo) => {
          expect(await exists(info.destination)).to.be.true;
          const infoStats = await stat(info.destination);
          expect(infoStats.size).to.eq(964);

          done();
        })
        .catch(done);
    });

    it(`should call http error`, (done) => {
      process = new download.DownloadProcess(
        {
          destination: path.join(getTestDirectoryPath(), "out"),
          url: new URL("https://dummyjson.com/http/404"),
        },
        {
          progress,
        }
      );

      const resolver = new Promise<Error>((resolve) => {
        progress.on("error", (error) => {
          return resolve(error);
        });
        process.startDownload();
      });

      resolver
        .then((err: Error) => {
          expect(err).not.to.be.undefined;
          expect(err.message).not.to.be.undefined;
          expect(err.message).to.include("Unable to do HTTP Get with status");

          done();
        })
        .catch(done);
    });

    it(`should call when trying to download invalid url`, (done) => {
      process = new download.DownloadProcess(
        {
          destination: path.join(getTestDirectoryPath(), "blocklist"),
          url: new URL("https://download"),
        },
        {
          progress,
        }
      );

      const resolver = new Promise<Error>((res) => {
        progress.on("error", (error) => {
          res(error);
        });

        process.startDownload();
      });

      resolver
        .then((error: Error) => {
          expect(error).not.to.be.undefined;
          expect(error.message).not.to.be.undefined;
          expect(error.message).to.includes("request to");
          done();
        })
        .catch(done);
    });
  });

  it("process - should throw when construct undefined parameters", () => {
    expect(() => {
      new download.DownloadProcess(undefined as any, undefined as any);
    }).to.throws(/Invalid download process parameter/);

    expect(() => {
      new download.DownloadProcess({
        destination: undefined as any,
        url: undefined as any,
      });
    }).to.throws(/Invalid download info/);
  });

  it(`should reject when trying to download invalid url`, (done) => {
    const process = new download.DownloadProcess({
      destination: path.join(getTestDirectoryPath(), "blocklist"),
      url: new URL("https://download"),
    });

    process
      .startDownload()
      .catch((error) => {
        expect(error).not.to.be.undefined;
        expect(error.message).not.to.be.undefined;

        expect(error.message).to.include("request to");

        done();
      })
      .catch(done);
  });

  it(`should reject when http response not ok (2xx)`, (done) => {
    const process = new download.DownloadProcess({
      destination: path.join(getTestDirectoryPath(), "something"),
      url: new URL("https://dummyjson.com/http/404"),
    });

    process
      .startDownload()
      .catch((error) => {
        expect(error).not.to.be.undefined;
        expect(error.message).not.to.be.undefined;
        expect(error.message).to.includes("Unable to do HTTP Get with status");

        done();
      })
      .catch(done);
  });

  it(`should createDownloadProcess create a new instance of DownloadProcess`, () => {
    const processA = new download.DownloadProcess(mockDownloadInfo);
    const processB = download.createDownloadProcess(mockDownloadInfo);

    expect(processB).not.to.be.undefined;
    expect(processA).to.not.equal(processB);

    expect(async () => {
      let completeDownloadInfo = await processB.startDownload();
      expect(await exists(completeDownloadInfo.destination)).to.be.true;
    }).not.to.throw();
  });
});

describe("[unit] download -", () => {
  describe("DownloadHashObservation", () => {
    it(`should update a hash object when streaming`, async () => {
      const hashObservation = new download.DownloadHashObservation("sha1");
      const process = new download.DownloadProcess(mockDownloadInfo, {
        hashObservation,
      });

      await process.startDownload();

      expect(hashObservation).to.not.be.undefined;
      const hashObservationDigestion = hashObservation.digest();

      expect(hashObservationDigestion.toString("hex")).to.eq(
        `5c685c5ffa94c4cd39496c7184c1d122e515ecef`
      );

      expect(hashObservationDigestion.toString("hex")).to.not.eq(``);
      expect(hashObservation.getHash()).not.to.be.undefined;
    });

    it(`should create a hash object after downloaded the file`, async () => {
      const hashObservation = new download.DownloadHashObservation("sha1");
      const process = new download.DownloadProcess(mockDownloadInfo);

      const dest = (await process.startDownload()).destination;

      hashObservation.update(await readFile(dest));

      expect(hashObservation).to.not.be.undefined;
      const hashObservationDigestion = hashObservation.digest();
      expect(hashObservationDigestion.toString("hex")).to.eq(
        `5c685c5ffa94c4cd39496c7184c1d122e515ecef`
      );
      expect(hashObservationDigestion.toString("hex")).to.not.eq(``);
    });
  });
});
