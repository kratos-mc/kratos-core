import { version } from "./../index";
import { expect } from "chai";

describe("[unit] manifest -", () => {
  let versionManager: version.VersionManager;

  before(async () => {
    versionManager = await version.fetchVersionManifest();
  });

  it("should return manifest url ", () => {
    const manifestUrl = version.getManifestUrl();
    expect(manifestUrl).to.be.a.string;
    expect(manifestUrl).to.be.eq(
      `https://piston-meta.mojang.com/mc/game/version_manifest_v2.json`
    );
  });

  it("should fetch manifest and response raw ", async () => {
    const manifestAsJson = await versionManager.getRawManifest();

    // expect(manifestAsJson).to.be.string;
    expect(manifestAsJson).to.have.property("latest");
    expect(manifestAsJson).to.have.property("versions");

    expect(manifestAsJson.latest).to.be.a("object");
    expect(manifestAsJson.versions).to.be.an("array").and.length.greaterThan(0);
  });

  it(`should get package info method operated`, async () => {
    const packageInfo = versionManager.getPackageInfo("1.8"); // My favorite option and it stable, too

    expect(packageInfo).to.not.be.undefined;
    expect(packageInfo).keys([
      "id",
      "type",
      "url",
      "complianceLevel",
      "releaseTime",
      "sha1",
      "time",
    ]);

    // Coverage the test-case with the map that constructed
    const someReleasePackageInfo = versionManager.getPackageInfo("1.8");
    expect(someReleasePackageInfo).to.not.be.undefined;
    expect(packageInfo).keys([
      "id",
      "type",
      "url",
      "complianceLevel",
      "releaseTime",
      "sha1",
      "time",
    ]);
  });

  it(`should throw when not found package info`, async () => {
    expect(() => {
      versionManager.getPackageInfo("non-release-version");
    }).to.throws(/Invalid or not found package info with version/);
  });

  it(`should get a package info manager`, async () => {
    expect(versionManager.getPackageInfoAsManager("1.8")).to.not.be.undefined;
  });

  it(`should fetch package data`, async () => {
    // For complianceLevel = 1
    const versionPkg = await versionManager
      .getPackageInfoAsManager("1.19")
      .fetchPackage();

    expect(versionPkg).to.be.a("object");
    expect(versionPkg).to.keys([
      "arguments",
      "assetIndex",
      "assets",
      "complianceLevel",
      "downloads",
      "id",
      "libraries",
      "logging",
      "mainClass",
      "minimumLauncherVersion",
      "javaVersion",
      "releaseTime",
      "time",
      "type",
    ]);

    // For complianceLevel = 0
    const oldVersionPkg = await versionManager
      .getPackageInfoAsManager("1.8")
      .fetchPackage();

    expect(oldVersionPkg).to.be.a("object");
    expect(oldVersionPkg).to.keys([
      "minecraftArguments",
      "assetIndex",
      "assets",
      "complianceLevel",
      "downloads",
      "id",
      "libraries",
      "logging",
      "mainClass",
      "minimumLauncherVersion",
      "javaVersion",
      "releaseTime",
      "time",
      "type",
    ]);
  });

  it(`should report unsupported version`, async () => {
    expect(versionManager.getLatestReleasePackageInfo().isUnsupported()).to.be
      .false;

    expect(versionManager.getPackageInfoAsManager("b1.1_01").isUnsupported()).to
      .be.true;
  });
});
