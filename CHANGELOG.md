#### 1.2.0 (2023-04-11)

##### New Features

* **workspace:**
  *  add ensureDirname for LibraryWorkspace ([595c2852](https://github.com/kratos-mc/kratos-core/commit/595c28521650bc400b21486a8180783ce77ec694))
  *  add ensureDirname for LibraryWorkspace ([cee6186b](https://github.com/kratos-mc/kratos-core/commit/cee6186b2a3933e0e878697ef275cc4ce3d7eb81))
  *  add LauncherWorkspace#getLibraryWorkspace ([f9b88632](https://github.com/kratos-mc/kratos-core/commit/f9b8863252bfa43952008600a7d4e436877ad6ba))

#### 1.1.1 (2023-04-05)

##### Documentation Changes

* **Changelog:**  use version 1.1.0 instead of 1.0.2 ([0c535b3f](https://github.com/kratos-mc/kratos-core/commit/0c535b3f4369384007d7cd16cf3e89b282176aea))

##### Bug Fixes

* **download:**  ensure download directory before write ([0e5d0089](https://github.com/kratos-mc/kratos-core/commit/0e5d0089b381c76a8526c6cb2a873dd3cb705c40))

##### Tests

* **Download:**  extend time-out for long-duration test ([4ad5eca1](https://github.com/kratos-mc/kratos-core/commit/4ad5eca14eeea85592cff515526767da4d927bf2))

#### 1.1.0 (2023-04-05)

##### Bug Fixes

* **Version:**  throw error for undefined constructor params of AssetMetadataManager ([707d3347](https://github.com/kratos-mc/kratos-core/commit/707d3347984821a4536bfabd3bf4e2be09b300c7))

##### Refactors

* **package.json:**  add prepack script ([93ba5073](https://github.com/kratos-mc/kratos-core/commit/93ba5073a620000ea3fe16713e394d6077da4b29))

##### Tests

* **Version:**  add AssetMetadataManager tests ([61cd4495](https://github.com/kratos-mc/kratos-core/commit/61cd4495aa4d1bd052cbf4015f0e1397a342bafd))

#### 1.0.0 (2023-04-03)

##### New Features

*  update 1.0.0 ([3e748865](https://github.com/kratos-mc/kratos-core/commit/3e74886557200bff5d3d2af11c652ddd437b29f1))
*  add get all packages info from version.VersionPackageManager ([3f5f4296](https://github.com/kratos-mc/kratos-core/commit/3f5f4296ed76162582f7bcc1c2f7bdaa68c10177))

#### 0.2.0 (2023-04-03)

##### Documentation Changes

* **Version:**  add doc for new functions of VersionPackageInfo ([dd490a9e](https://github.com/kratos-mc/kratos-core/commit/dd490a9e79a4162c079df10e54f1f25b01a937fa))

##### New Features

* **Version:**  support getting package info from VersionPackageInfoManager ([0a1e9c2d](https://github.com/kratos-mc/kratos-core/commit/0a1e9c2d8f6e3db0ca79836a18e4e2d4549598a2))

##### Other Changes

*  add CHANGELOG.md ([df1e4eb2](https://github.com/kratos-mc/kratos-core/commit/df1e4eb20fc1141754c624ef81b18f1ee6a9741f))

#### 0.2.0 (2023-03-31)

##### Other Changes

*  add CHANGELOG.md ([df1e4eb2](https://github.com/kratos-mc/kratos-core/commit/df1e4eb20fc1141754c624ef81b18f1ee6a9741f))

#### 0.2.0 (2023-03-31)

##### Chores

*  update .npmignore to ignore stuffs ([9fadc0ea](https://github.com/kratos-mc/kratos-core/commit/9fadc0eaae1822948deda85c1d2ed52737e9dd97))
*  update version name ([bbb29188](https://github.com/kratos-mc/kratos-core/commit/bbb29188417b714404f3ea27a0c8858c011b8c07))
*  clean up mock test ([5da5e86f](https://github.com/kratos-mc/kratos-core/commit/5da5e86f7eccfe36bde1ccd9e9af2fe5fc7ed8b3))
*  add release ci ([eb5c5e4f](https://github.com/kratos-mc/kratos-core/commit/eb5c5e4f25b6b2ed28418e7f54d625d447e32fec))
*  update yarn lockfile ([af0b0ba7](https://github.com/kratos-mc/kratos-core/commit/af0b0ba7ec1d383c698cad0e20c9b54ce082984e))
* **yarn.lock:**  update lockfile ([4db2346e](https://github.com/kratos-mc/kratos-core/commit/4db2346ec3f7edf6b16061e90362071bed90f8dc))

##### Continuous Integration

*  change cmd shell ([316f093a](https://github.com/kratos-mc/kratos-core/commit/316f093ab436bf91637ad1c5132233f8ed55d70b))

##### Documentation Changes

*  createAttemptDownload ([20619f50](https://github.com/kratos-mc/kratos-core/commit/20619f507b12742745ad5441a6b677263f1eee72))

##### New Features

*  using swc-node for running ts ([037d2753](https://github.com/kratos-mc/kratos-core/commit/037d27539e359edb18a444356a6da9829385537a))
* **download:**
  *  emit event for DownloadMatchingObserver on DownloadMatching ([24012b50](https://github.com/kratos-mc/kratos-core/commit/24012b504c61f53fdbc60f309d29138da0f23fca))
  *  DownloadMatching class ([2d380017](https://github.com/kratos-mc/kratos-core/commit/2d38001783039f0632c6e3d869bf1492f7dc942c))
* **workspace:**  add VersionWorkspace ([5eb00ecc](https://github.com/kratos-mc/kratos-core/commit/5eb00eccc6260569bb4e53e7acd8128bb4be32ae))

##### Bug Fixes

*  async/await for windows ([2cdf5a36](https://github.com/kratos-mc/kratos-core/commit/2cdf5a369eb37a0dc0c530a1b8f85fc2ee597d65))
*  mocking using createDownloadInformation ([f0c3412f](https://github.com/kratos-mc/kratos-core/commit/f0c3412fb411ccce84846186586277422750ad38))
*  EPERM on windows ([0ad87019](https://github.com/kratos-mc/kratos-core/commit/0ad87019568710c7574fea0ac11b11b41264d137))
*  download file permission ([ba481a6d](https://github.com/kratos-mc/kratos-core/commit/ba481a6db32d66f3fcc778d1b223ba12fe2d17d8))
* **version:**  path separator build ([fb9e321b](https://github.com/kratos-mc/kratos-core/commit/fb9e321bcb3742fd4b3c4394c22c0b730355257c))
* **DownloadProcess#startDownload:**  handle createWriteStream error ([d6301633](https://github.com/kratos-mc/kratos-core/commit/d63016336fc2ecbc82be04e31a3d62ff6db2747a))

##### Tests

*  use chai-as-promised for Promise test ([b61d4010](https://github.com/kratos-mc/kratos-core/commit/b61d4010d9c0d69c4448d634aebd56c5b302dcd1))
*  using join for testing ([fd8a2479](https://github.com/kratos-mc/kratos-core/commit/fd8a24796363c7bc0e79c253ea891c1a084acfdc))
*  improve debug trace, source map ([00781831](https://github.com/kratos-mc/kratos-core/commit/00781831083b7490e34fa6a1c739100552cebf12))
*  remove some no-sense logic expectation ([7b10103b](https://github.com/kratos-mc/kratos-core/commit/7b10103bd551ec4e11944cdfb5edd33fb6fdc7d2))
*  fix file error ([10e5a936](https://github.com/kratos-mc/kratos-core/commit/10e5a9367c251d6bc829080f57b77c81e18b5f50))
*  fix test output directory permission ([821ebb66](https://github.com/kratos-mc/kratos-core/commit/821ebb66b4b7e78ecc3e1a59abfa9d57abc5b78d))
*  fix window test path ([f07c1c99](https://github.com/kratos-mc/kratos-core/commit/f07c1c99fd6e05b5a62b83d1241f1b9e80699592))
* **version:**
  *  url includes test ([d4b23362](https://github.com/kratos-mc/kratos-core/commit/d4b23362c4987fa382fb27addc09659d95663bea))
  *  fix path sep windows test ([cc11504c](https://github.com/kratos-mc/kratos-core/commit/cc11504c50a5c76a4fc58046c3ec184a9c96c2f7))
  *  path as import ([fa6835ba](https://github.com/kratos-mc/kratos-core/commit/fa6835baf932bb8c7f94a30b99fc90aee857fe57))
* **download:**
  *  eliminate time-out exceed for long test ([686448cf](https://github.com/kratos-mc/kratos-core/commit/686448cfcffdcd49b8bcad4f7c7d563a1ebb4023))
  *  wrap Promise with fulfillment ([029afb99](https://github.com/kratos-mc/kratos-core/commit/029afb9922d5066473fc048ec941fc82f8cd8044))
  *  create unit test for DownloadMatchingObserver ([b0432d3e](https://github.com/kratos-mc/kratos-core/commit/b0432d3ea37537c997b0c861fb8673b2029566c1))
* **fixtures:**  use chai-as-promised as default ([d8598f8f](https://github.com/kratos-mc/kratos-core/commit/d8598f8f496b7a58bda4f2a775d24ccfad34f833))
* **workspace:**  coverage workspace module ([3ebd686c](https://github.com/kratos-mc/kratos-core/commit/3ebd686c34b0d0f527f427b49007d1c7d1130529))
* **dependencies:**  add chai-with-promised ([9a87d3b1](https://github.com/kratos-mc/kratos-core/commit/9a87d3b173df0284a691225e57a0702194054cbc))

