`kratos-core` is an open-source, elegant and battery-included Minecraft Launcher API module written in TypeScript in order to be the based of **KratosLauncher**.

[![Node.js CI](https://github.com/kratos-mc/kratos-core/actions/workflows/node.js.yml/badge.svg)](https://github.com/kratos-mc/kratos-core/actions/workflows/node.js.yml) ![npm](https://img.shields.io/npm/v/kratos-core?style=plastic) ![GitHub issues](https://img.shields.io/github/issues/kratos-mc/kratos-core)

 <!-- This module is using to build KratosLauncher. -->

# Features

- Allow to fetch, download, and search with fast access to minecraft manifest file.
- versioning in Minecraft with zero-configuration and simple line of code.
- Support workspace module, to reduce file system

# Install

`kratos-core` was built on Node version 14.17.
**npm**

```
npm i kratos-core
```

**yarn**

```
yarn add kratos-core
```

# Usage

## Version

### Fetch the manifest

The manifest included inside version module, which contains a VersionManager class to manage version.

```javascript
const kratos = require("kratos-core");

// Fetch the manifest from mojang server and print it to console
kratos.version.fetchVersionManifest().then((versionManager) => {
  console.log(versionManager.getRawManifest());

  // Get the package info
  console.log(versionManager.getPackageInfo("1.8"));
  // {
  //   id: '1.8',
  //   type: 'release',
  //   url: 'https://piston-meta.mojang.com/v1/packages/9eb165eef46294062d8698c8a78e8ac914949e7a/1.8.json',
  //   time: '2021-12-15T15:44:13+00:00',
  //   releaseTime: '2014-09-02T08:24:35+00:00',
  //   sha1: '9eb165eef46294062d8698c8a78e8ac914949e7a',
  //   complianceLevel: 0
  // }
});
```

### Handle the version package

```js
versionManager
  // Get the latest version package info of Minecraft
  .getLatestReleasePackageInfo()
  // Download the package using package info url
  .fetchPackage()
  .then((packageManager) => {
    // Get a list of libraries for platform
    // Platform: 'linux' | 'macos' | 'windows'
    packageManager.getLibraries({
      platform: "macos",
    });

    // Returns the raw version package as an object
    packageManager.getVersionPackage();
  });
```

## Download

### Create a download

Download a HTTP response by using [node-fetch](https://www.npmjs.com/package/node-fetch) fetch method. The function `startDownload()` it designing the be able to pass node-fetch [options](https://www.npmjs.com/package/node-fetch#options) as needed.

```js
// Create a download for the file 'https://piston-meta.mojang.com/v1/packages/9eb165eef46294062d8698c8a78e8ac914949e7a/1.8.json' at destination 1.8.json
const downloadProcess = kratos.download.createDownloadProcess({
  destination: "1.8.json",
  url: new URL(
    "https://piston-meta.mojang.com/v1/packages/9eb165eef46294062d8698c8a78e8ac914949e7a/1.8.json"
  ),
});

// Start downloading the file, logging out if download success
downloadProcess
  .startDownload()
  .then((info) => {
    console.log(
      `Successfully download the 1.8.json file at "${info.destination}"`
    );
  })
  .catch((err) => {
    // Do something with error
  });

// OR you can replace it by async/await
await downloadProcess.startDownload();

// passing node-fetch fetch options
await downloadProcess.startDownload({ follow: 5 }); // Only follow 5 redirect steps
```

### DownloadProgress

It is possible to observe the progress of current downloading process by using `DownloadProgress`

```javascript
// Create a new progress
const progress = new kratos.download.DownloadProgress();

// It passing the `data` stream event with buffer
progress.on("progress", (chunk) => {
  console.log(`downloading ${chunk.length} bytes...`);
});
progress.on("error", () => {
  /**
   * Handle downloading error
   */
});

progress.on("finish", () => {
  /**
   * Handle post-download stage
   */
});

// Create a download for the file 'https://piston-meta.mojang.com/v1/packages/9eb165eef46294062d8698c8a78e8ac914949e7a/1.8.json' at destination 1.8.json
const downloadProcess = kratos.download.createDownloadProcess(
  {
    destination: "1.8.json",
    url: new URL(
      "https://piston-meta.mojang.com/v1/packages/9eb165eef46294062d8698c8a78e8ac914949e7a/1.8.json"
    ),
  },
  {
    progress,
  }
);

await downloadProcess.startDownload();
```

### DownloadHashObservation

Sometimes, it is required to calculate the checksum value, `kratos-core` have a built-in class to handle hashing the file. It is call `DownloadHashObservation`

```js
// Create a new hash observation, the algorithm is changable
const hashObservation = new kratos.download.DownloadHashObservation("sha1");

// Create a download for the file 'https://piston-meta.mojang.com/v1/packages/9eb165eef46294062d8698c8a78e8ac914949e7a/1.8.json' at destination 1.8.json
const downloadProcess = kratos.download.createDownloadProcess(
  {
    destination: "1.8.json",
    url: new URL(
      "https://piston-meta.mojang.com/v1/packages/9eb165eef46294062d8698c8a78e8ac914949e7a/1.8.json"
    ),
  },
  {
    hashObservation,
  }
);

downloadProcess.startDownload().then(() => {
  const checksum = hashObservation.digest().toString("hex");
  console.log(
    `The hash of the file is ${checksum}`
    // actual: 9eb165eef46294062d8698c8a78e8ac914949e7a
    // expect: 9eb165eef46294062d8698c8a78e8ac914949e7a
  );
  console.log(checksum === "9eb165eef46294062d8698c8a78e8ac914949e7a"); // true
});
```

## Environment

This module was built on top of Bun.sh, which is a fast JavaScript runtime. However, NodeJS is a better option when you want to develop this module for cross-platform. Since, the requirement to certain build, run, and publish this module is:

- Node >= 14.17.6
- npm >= 8.4.1

# License

Free to contributing, fixing, and using the code to your project. This module was release under MIT license.

[MIT](LICENSE.md)
