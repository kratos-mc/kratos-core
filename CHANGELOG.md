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

