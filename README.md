`kratos-core` is an open-source, elegant and battery-included Minecraft Launcher API module written in TypeScript in order to be the based of **KratosLauncher**.

[![Node.js CI](https://github.com/kratos-mc/kratos-core/actions/workflows/node.js.yml/badge.svg)](https://github.com/kratos-mc/kratos-core/actions/workflows/node.js.yml)  ![npm](https://img.shields.io/npm/v/kratos-core?style=plastic)  ![GitHub issues](https://img.shields.io/github/issues/kratos-mc/kratos-core)

 <!-- This module is using to build KratosLauncher. -->

# Features

- Allow to fetch, download, and search with fast access to minecraft manifest file.
- Handle versioning in Minecraft with zero-configuration and use only a small line of code.

# Install

<!-- TODO: fix this line after published -->

# Usage

## Basic usage

### Fetch the manifest

```ts
// Include examples code
```

using manifest manager examples

### Manage package from manifest

<!-- TODO: do something here -->

# Development

## Environment

This module was built on top of Bun.sh, which is a fast JavaScript runtime. However, NodeJS is a better option when you want to develop this module for cross-platform. Since, the requirement to certain build, run, and publish this module is:

- Node >= 14.17.6
- npm >= 8.4.1

## Scripts

- compile: Removes the `./out` if the file is exists and compile all `./src/**/*.ts`

- test: Executes mocha test
- coverage: Executes mocha test using nyc, a coverage cli tool
- build: Builds the source-code file and removes `./out/test`, this script is frequently using for pre-publish

# License

[MIT](LICENSE.md)
