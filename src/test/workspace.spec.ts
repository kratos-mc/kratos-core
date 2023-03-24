import { LauncherWorkspace } from "../workspace";
import { getTestDirectoryPath } from "./utils/testOutput";
import * as path from "path";
import { existsSync, readFileSync } from "fs-extra";
import { expect } from "chai";
import fetch from "node-fetch";

describe("[unit] workspace", () => {
  let launcherWorkspace: LauncherWorkspace;
  before(() => {
    launcherWorkspace = new LauncherWorkspace(
      path.join(getTestDirectoryPath(), "launcher")
    );

    expect(existsSync(launcherWorkspace.getDirectory())).to.be.true;
  });

  it(`should create an asset directory`, async () => {
    const assetsWorkspace = launcherWorkspace.getAssetWorkspace();
    expect(assetsWorkspace).not.to.be.undefined;
    expect(existsSync(assetsWorkspace.getDirectory())).to.be.true;

    const writer = assetsWorkspace.createWriter("assets.file");
    expect(writer).not.to.be.undefined;

    const generatedPath = await assetsWorkspace.makeDirectory("at");
    expect(generatedPath).to.be.a("string");
    expect(existsSync(generatedPath)).to.be.true;
  });

  it(`should write a file`, async () => {
    const assetsWorkspace = launcherWorkspace.getAssetWorkspace();
    expect(assetsWorkspace).not.to.be.undefined;
    // Write /assets/a/b.file
    const abFile = await assetsWorkspace.writeAsFile(
      path.join("a", "b.file"),
      Buffer.from("int main (int** arg) { return 1; }")
    );

    expect(existsSync(abFile)).to.be.true;
    expect(readFileSync(abFile, "utf-8")).to.be.eq(
      "int main (int** arg) { return 1; }"
    );

    // super long name
    const superLongPath = await assetsWorkspace.writeAsFile(
      path.join(
        "super-long-for-some-release-without-aad-jhs-xmashda-danasdha",
        "none-s-for-some-release-without-aad-jhs-xmashda-danasdha",
        "nothing-to-shot.txt"
      ),
      Buffer.from("Hello world")
    );

    expect(existsSync(superLongPath)).to.be.true;
    expect(readFileSync(superLongPath, "utf-8")).to.be.eq("Hello world");
  });

  it(`should create asset writer and be writable`, async () => {
    const assetsWorkspace = launcherWorkspace.getAssetWorkspace();
    expect(assetsWorkspace).not.to.be.undefined;

    const resolver = new Promise<void>(async (res, rej) => {
      const downloadResource = await fetch(
        "https://resources.download.minecraft.net/a0/a0d43b09bbd3a65039e074cf4699175b0c4724b8",
        {
          method: "get",
        }
      );

      const writer = assetsWorkspace.createAssetWriter(
        "a0d43b09bbd3a65039e074cf4699175b0c4724b8"
      );

      downloadResource.body.pipe(writer);

      writer.on("close", res).on("error", rej);
    });

    await resolver;

    const destination = path.join(
      assetsWorkspace.getObjectsPath().toString(),
      "a0",
      "a0d43b09bbd3a65039e074cf4699175b0c4724b8"
    );

    expect(existsSync(destination)).to.be.true;
  });
});
