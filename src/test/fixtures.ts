import { expect, use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { exists } from "fs-extra";
import {
  getTestDirectoryPath,
  makeTestDirectory,
  removeTestDirectory,
} from "./utils/testOutput";

use(chaiAsPromised);

export async function mochaGlobalSetup() {
  console.log(`Building runtime directory at: ${getTestDirectoryPath()}`);

  await makeTestDirectory();
  expect(exists(getTestDirectoryPath())).to.be.eventually.true;
}

export async function mochaGlobalTeardown() {
  await removeTestDirectory();
  expect(exists(getTestDirectoryPath())).to.eventually.false;
}
