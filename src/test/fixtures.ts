import { expect } from "chai";
import { exists } from "fs-extra";
import {
  getTestDirectoryPath,
  makeTestDirectory,
  removeTestDirectory,
} from "./utils/testOutput";

export async function mochaGlobalSetup() {
  console.log(`Building runtime directory at: ${getTestDirectoryPath()}`);

  await makeTestDirectory();
  expect(await exists(getTestDirectoryPath())).to.be.true;
}

export async function mochaGlobalTeardown() {
  await removeTestDirectory();
}
