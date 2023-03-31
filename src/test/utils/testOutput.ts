import { ensureDir, remove } from "fs-extra";

export function getTestDirectoryPath() {
  return process.env.TEST_OUTPUT || "test-output";
}

export function makeTestDirectory(): Promise<void> {
  return ensureDir(getTestDirectoryPath(), {
    mode: 0o2777,
  });
}

export function removeTestDirectory(): Promise<void> {
  return remove(getTestDirectoryPath());
}
