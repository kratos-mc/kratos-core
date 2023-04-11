import { LauncherWorkspace, VersionWorkspace } from "../workspace";
import { getTestDirectoryPath } from "./utils/testOutput";
import * as path from "path";
import { emptyDir, existsSync, readFileSync, remove } from "fs-extra";
import { expect } from "chai";
import { use } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import fetch from "node-fetch";
import { version, workspace } from "..";

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
      return Promise.all([
        emptyDir(versionWorkspace.getDirectory().toString()),
        expect(versionWorkspace.readManifest()).to.be.rejected,
      ]);
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

    it(`should reject with invalid write`, async () => {
      // Write invalid file
      await versionWorkspace.writeManifest(Buffer.from("Hello world"));
      return Promise.all([
        // Invalid json token
        expect(versionWorkspace.readManifest()).to.rejected,
      ]);
    });

    it(`should resolve with valid json file write operation`, async () => {
      // Write a json file
      await versionWorkspace.writeManifest(
        Buffer.from(JSON.stringify({ a: "b" }).toString())
      );
      return Promise.all([
        // Then check exists
        expect(versionWorkspace.existsManifest()).to.eventually.be.true,
        // And must have an "a" property
        expect(versionWorkspace.readManifest()).to.eventually.have.property(
          "a"
        ),
      ]);
    });

    it(`should be able to download a manifest and put as a file`, async () => {
      const manifest = await (
        await version.fetchVersionManifest()
      ).getRawManifest();

      await versionWorkspace.writeManifest(
        Buffer.from(JSON.stringify(manifest))
      );

      return expect(versionWorkspace.readManifest()).to.eventually.have.keys([
        "latest",
        "versions",
      ]);
    });

    it(`should return when getPackageDirectory`, async function () {
      const pkgDir = launcherWorkspace
        .getVersionWorkspace()
        .getPackageDirectory();
      return Promise.all([
        expect(pkgDir).to.eventually.be.a("string"),
        expect(pkgDir)
          .to.eventually.include("versions")
          .and.include("packages"),
      ]);
    });

    it(`should return if it does not have a package version`, async () => {
      const hasPackageVersion = launcherWorkspace
        .getVersionWorkspace()
        .hasPackageVersion("some-package-version");
      return expect(hasPackageVersion).to.eventually.be.false;
    });

    it(`should return if it have package version`, async () => {
      // save the package file first
      const versionPackage = await (
        await (await version.fetchVersionManifest())
          .getLatestReleasePackageInfo()
          .fetchPackage()
      ).getVersionPackage();

      // write a version package file into workspace
      await launcherWorkspace
        .getVersionWorkspace()
        .writeVersionPackage(
          versionPackage.id,
          Buffer.from(JSON.stringify(versionPackage))
        );

      const hasPackageVersion = launcherWorkspace
        .getVersionWorkspace()
        .hasPackageVersion(versionPackage.id);
      return expect(hasPackageVersion).to.eventually.be.true;
    });

    it(`should read a version package and return VersionPackage object`, async () => {
      // save the package file first
      const versionPackage = (
        await (await version.fetchVersionManifest())
          .getLatestReleasePackageInfo()
          .fetchPackage()
      ).getVersionPackage();

      // write a version package file into workspace
      await launcherWorkspace
        .getVersionWorkspace()
        .writeVersionPackage(
          versionPackage.id,
          Buffer.from(JSON.stringify(versionPackage))
        );

      return expect(
        launcherWorkspace
          .getVersionWorkspace()
          .readVersionPackage(versionPackage.id)
      ).to.eventually.be.deep.equal(versionPackage);
    });

    it(`should throw when read an non-exists version package`, () => {
      return expect(
        launcherWorkspace
          .getVersionWorkspace()
          .readVersionPackage("null-defined-or-undefined")
      ).to.be.rejectedWith(Error, /Version file path not found: /);
    });

    it(`should throw for invalid json character `, async () => {
      await launcherWorkspace
        .getVersionWorkspace()
        .writeVersionPackage(
          "x.y.z",
          Buffer.from("this is an invalid json format buffer")
        );
      return expect(
        launcherWorkspace.getVersionWorkspace().readVersionPackage("x.y.z")
      ).to.be.rejectedWith(Error, /Unexpected token/);
    });
  });
});

describe("`[unit] LibraryWorkspace", () => {
  it(`should have an access from launcher workspace`, async () => {
    const launcherWorkspace: workspace.LauncherWorkspace =
      new LauncherWorkspace(getTestDirectoryPath());
    // Should be accessible
    expect(launcherWorkspace.getLibraryWorkspace()).to.not.be.undefined;
    // Exists
    expect(existsSync(launcherWorkspace.getLibraryWorkspace().getDirectory()))
      .to.be.true;
  });

  it(`should ensure directory when contains pathname`, () => {
    const launcherWorkspace: workspace.LauncherWorkspace =
      new LauncherWorkspace(getTestDirectoryPath());
    const libraryWorkspace = launcherWorkspace.getLibraryWorkspace();

    libraryWorkspace.ensureDirname("a/b/c/d.jar");

    // Unix-like path separator test
    expect(
      existsSync(
        path.join(libraryWorkspace.getDirectory().toString(), "a", "b", "c")
      )
    ).to.be.true;

    // non-folder test
    libraryWorkspace.ensureDirname("z.jar");
  });
});

describe("[unit] AssetIndexWorkspace", () => {
  let launcherWorkspace: LauncherWorkspace = new workspace.LauncherWorkspace(
    getTestDirectoryPath()
  );
  let assetIndexesWorkspace = launcherWorkspace
    .getAssetWorkspace()
    .getAssetIndexesWorkspace();
  it(`should return correspond path`, () => {
    // should have a parent directory
    expect(assetIndexesWorkspace.getDirectory()).to.be.eq(
      path.join(getTestDirectoryPath(), "assets", "indexes")
    );
    // should have a file name
    expect(assetIndexesWorkspace.getIndexFilePath("3.json")).to.eq(
      path.join(getTestDirectoryPath(), "assets", "indexes", "3.json")
    );
  });

  it(`should read and write a file`, () => {
    expect(assetIndexesWorkspace.hasIndex("3.json")).to.be.false;
    expect(() => assetIndexesWorkspace.getIndex("3.json")).to.throws(
      /Asset index file not exists:/
    );

    expect(assetIndexesWorkspace.getAllIndexes()).to.have.lengthOf(0);

    // expect it to create a file and write something into it
    assetIndexesWorkspace.writeIndex("3.json", {
      objects: { "a/b/c": { hash: "123", size: 3 } },
    });

    expect(assetIndexesWorkspace.hasIndex("3.json")).to.be.true;
    const someAssetIndex: version.AssetIndex =
      assetIndexesWorkspace.getIndex("3.json");
    expect(someAssetIndex).to.not.be.undefined;
    expect(someAssetIndex).have.ownProperty("objects");

    // should the getAllIndexes work, and with filter
    expect(assetIndexesWorkspace.getAllIndexes()).to.be.an("array");
    expect(assetIndexesWorkspace.getAllIndexes()).to.have.lengthOf(1);

    expect(assetIndexesWorkspace.getAllIndexes(["3.json"])).to.be.an("array");
    expect(assetIndexesWorkspace.getAllIndexes(["3.json"])).to.have.lengthOf(0);
  });
});
