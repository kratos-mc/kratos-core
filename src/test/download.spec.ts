import { expect } from "chai";
import { exists, remove, stat, readFile, lstat } from "fs-extra";
import * as path from "path";
import { getTestDirectoryPath } from "./utils/testOutput";
import * as download from "./../download";
/**
 * @deprecated using createMockDownloadInformation
 */
const mockDownloadInfo: download.DownloadInfo = {
  destination: path.join(getTestDirectoryPath(), "blocklist"),
  url: new URL(
    "https://libraries.minecraft.net/com/mojang/blocklist/1.0.10/blocklist-1.0.10.jar"
  ),
};

let currentMockFile = 0;
const createMockDownloadInformation = () => {
  currentMockFile++;
  const obj = {
    destination: path.join(
      getTestDirectoryPath(),
      currentMockFile.toString() + ".data"
    ),
    url: new URL(
      "https://libraries.minecraft.net/com/mojang/blocklist/1.0.10/blocklist-1.0.10.jar"
    ),
  };
  console.log(`creating mock file with destination ${obj.destination}`);

  return obj;
};

describe("[unit] download -", () => {
  // afterEach(async () => {
  //   await remove(mockDownloadInfo.destination);
  //   expect(await exists(mockDownloadInfo.destination)).to.be.false;
  // });

  it("should download a file and save it into storage destination", async function () {
    const downloadProcess: download.DownloadProcess =
      new download.DownloadProcess(createMockDownloadInformation());

    const response = await downloadProcess.startDownload();
    expect(await exists(response.destination)).to.be.true;
  });

  describe("progress - ", () => {
    let progress: download.DownloadProgress;
    let process: download.DownloadProcess;

    beforeEach(() => {
      progress = new download.DownloadProgress();
      process = new download.DownloadProcess(createMockDownloadInformation(), {
        progress, // create a download process with progress
      });
    });

    // afterEach(async () => {
    //   await remove(mockDownloadInfo.destination);
    //   expect(await exists(mockDownloadInfo.destination)).to.be.false;
    // });

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
          // expect(await exists(mockDownloadInfo.destination)).to.be.true;
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

      const resolver = new Promise<Error>(async (resolve) => {
        progress.on("error", (error) => {
          return resolve(error);
        });
        await process.startDownload();
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

    it(`should call when trying to download invalid url`, () => {
      process = new download.DownloadProcess(
        {
          destination: path.join(getTestDirectoryPath(), "blocklist"),
          url: new URL("https://download"),
        },
        {
          progress,
        }
      );

      const resolver = new Promise<Error>(async (res) => {
        progress.on("error", (error) => {
          res(error);
        });
        await process.startDownload();
      });

      return expect(resolver).to.eventually.instanceOf(Error);
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

  it(`should reject when trying to download invalid url`, () => {
    const process = new download.DownloadProcess({
      destination: path.join(getTestDirectoryPath(), "blocklist"),
      url: new URL("https://download"),
    });

    return expect(process.startDownload()).to.rejectedWith(Error, /request to/);
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
  // afterEach(async () => {
  //   await remove(mockDownloadInfo.destination);
  //   expect(await exists(mockDownloadInfo.destination)).to.be.false;
  // });

  describe("DownloadHashObservation", () => {
    it(`should update a hash object when streaming`, async () => {
      const hashObservation = new download.DownloadHashObservation("sha1");
      const process = new download.DownloadProcess(
        createMockDownloadInformation(),
        {
          hashObservation,
        }
      );

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
      const process = new download.DownloadProcess(
        createMockDownloadInformation()
      );

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

  describe("DownloadMatchingProcess", () => {
    it(`should retry to download many times and reject`, async function () {
      this.timeout(10000);

      const _mockInfo = createMockDownloadInformation();
      const mismatchingProcess = new download.DownloadMatchingProcess(
        _mockInfo,
        "great-to-have-a-hash",
        {
          algorithm: "sha1",
        }
      );

      return Promise.all([
        expect(mismatchingProcess.startDownload()).to.eventually.rejectedWith(
          Error,
          /Maximum attempt/
        ),
      ]);
    });
    it(`should retry with large maxAttempt`, async function () {
      this.timeout(0);
      const _mockInfo = createMockDownloadInformation();
      const mismatchingProcess = new download.DownloadMatchingProcess(
        _mockInfo,
        "random-test",
        {
          algorithm: "sha1",
          maxAttempt: 10,
        }
      );

      return expect(
        mismatchingProcess.startDownload()
      ).to.eventually.rejectedWith(Error, /Maximum attempt/);
    });

    it(`should resolve the download file`, async () => {
      const _mockInfo = createMockDownloadInformation();
      const matchProcess = new download.DownloadMatchingProcess(
        _mockInfo,
        "5c685c5ffa94c4cd39496c7184c1d122e515ecef"
      );

      return expect(
        Promise.all([
          expect(matchProcess.startDownload()).to.eventually.have.keys([
            "destination",
            "url",
          ]),

          expect(exists(_mockInfo.destination)).to.eventually.true,
        ])
      );
    });

    it(`should download using createAttemptDownload`, async function () {
      const downloader = download.createAttemptDownload(
        mockDownloadInfo,
        "5c685c5ffa94c4cd39496c7184c1d122e515ecef"
      );
      const downloadProcessResponse = await downloader.startDownload();
      expect(downloadProcessResponse).to.have.keys(["destination", "url"]);
      expect(downloader.getDownloadInfo()).not.to.be.undefined;
      expect(await exists(mockDownloadInfo.destination)).to.true;
    });

    it(`should emit success when successfully download`, async () => {
      const downloadInfo = createMockDownloadInformation();
      const observer = new download.DownloadMatchingObserver();
      const process = download
        .createAttemptDownload(
          downloadInfo,
          "5c685c5ffa94c4cd39496c7184c1d122e515ecef",
          {
            observer,
          }
        )
        .startDownload();

      const promise = new Promise((res) =>
        observer.on("success", (info) => res(info))
      );

      return Promise.all([
        expect(promise).to.eventually.be.deep.eq(downloadInfo),
        expect(process).to.eventually.be.deep.eq(downloadInfo),
      ]);
    });

    it(`should emit retry when generate an invalid hash-file`, async () => {
      const downloadInfo = createMockDownloadInformation();
      const observer = new download.DownloadMatchingObserver();
      const process = download.createAttemptDownload(downloadInfo, "", {
        observer,
      });

      const promise = new Promise((res) =>
        observer.on("retry", (info) => res(info))
      );

      return Promise.all([
        expect(promise).to.be.fulfilled,
        expect(process.startDownload()).to.be.rejectedWith(
          Error,
          /Maximum attempt/
        ),
      ]);
    });

    it(`should emit corrupted when failed to download the file (file is invalid)`, () => {
      const downloadInfo = createMockDownloadInformation();
      const observer = new download.DownloadMatchingObserver();
      const process = download
        .createAttemptDownload(downloadInfo, "", {
          observer,
        })
        .startDownload();

      const promise = new Promise((res) =>
        observer.on("corrupted", (info) => res(info))
      );

      return expect(
        Promise.all([
          expect(promise).to.eventually.be.deep.eq(downloadInfo),
          expect(exists(downloadInfo.destination)).to.eventually.be.true,
          expect(process).to.eventually.be.rejectedWith(
            Error,
            /Maximum attempt/
          ),
        ])
      );
    });
  });
});
