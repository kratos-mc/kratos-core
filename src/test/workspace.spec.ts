import { LauncherWorkspace, VersionWorkspace } from "../workspace";
import { getTestDirectoryPath } from "./utils/testOutput";
import * as path from "path";
import { emptyDir, existsSync, readFileSync, remove } from "fs-extra";
import { expect } from "chai";
import { use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import fetch from "node-fetch";
import { version } from "..";

use(chaiAsPromised);

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

  describe(`VersionWorkspace`, () => {
    let versionWorkspace: VersionWorkspace | undefined;

    before(async () => {
      versionWorkspace = launcherWorkspace.getVersionWorkspace();

      expect(await versionWorkspace.existsManifest()).to.be.false;
      await emptyDir(versionWorkspace.getDirectory().toString());

      expect(versionWorkspace.readManifest()).to.be.rejected;
    });

    it(`should return a path of a manifest file`, () => {
      expect(versionWorkspace.getManifestPath()).to.be.eq(
        path.join(
          launcherWorkspace.getDirectory().toString(),
          "versions",
          "version_manifest_v2.json"
        )
      );
    });

    it(`should be able to do operation in manifest file`, async () => {
      // Write invalid file
      await versionWorkspace.writeManifest(Buffer.from("Hello world"));
      expect(await versionWorkspace.existsManifest()).to.be.true;
      expect(versionWorkspace.readManifest()).to.rejected;

      // Write a json file
      await versionWorkspace.writeManifest(
        Buffer.from(JSON.stringify({ a: "b" }).toString())
      );
      expect(await versionWorkspace.existsManifest()).to.be.true;
      expect(versionWorkspace.readManifest()).to.eventually.have.property("a");
    });

    it(`should be able to download a manifest and put as a file`, async () => {
      const manifest = await (
        await version.fetchVersionManifest()
      ).getRawManifest();

      await versionWorkspace.writeManifest(
        Buffer.from(JSON.stringify(manifest))
      );

      expect(versionWorkspace.readManifest()).to.eventually.eq(manifest);
    });

    it(`should be able to download a version package and set as a file`, async () => {
      const versionPackage = await (
        await (await version.fetchVersionManifest())
          .getLatestReleasePackageInfo()
          .fetchPackage()
      ).getVersionPackage();

      expect(versionWorkspace.hasPackageVersion(versionPackage.id)).that.be
        .eventually.false;
      expect(versionWorkspace.readVersionPackage(versionPackage.id)).to
        .eventually.rejected;

      await versionWorkspace.writeVersionPackage(
        versionPackage.id,
        Buffer.from(JSON.stringify(versionPackage))
      );

      expect(versionWorkspace.hasPackageVersion(versionPackage.id)).to
        .eventually.be.true;

      expect(
        versionWorkspace.readVersionPackage(versionPackage.id)
      ).to.eventually.eq(versionPackage);
    });
  });
});
