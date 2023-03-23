import { emptyDir, remove } from "fs-extra";

export function getTestDirectoryPath() {
  return process.env.TEST_OUTPUT || "test-output";
}

export function makeTestDirectory(): Promise<void> {
  return emptyDir(getTestDirectoryPath());
}

export function removeTestDirectory(): Promise<void> {
  return remove(getTestDirectoryPath());
}
