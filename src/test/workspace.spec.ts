import { AssetWorkspace, LauncherWorkspace, Workspace } from "../workspace";
import { getTestDirectoryPath } from "./utils/testOutput";
import * as path from "path";
import { existsSync, readFileSync } from "fs-extra";
import { expect } from "chai";

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
  });
});
