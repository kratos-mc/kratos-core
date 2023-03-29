import { version } from "./../index";
import { expect } from "chai";
import { AssetIndexManager, AssetMetadata, VersionPlatform } from "../version";

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

    expect(versionPkg.getVersionPackage()).to.be.a("object");
    expect(versionPkg.getVersionPackage()).to.keys([
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

    expect(oldVersionPkg.getVersionPackage()).to.be.a("object");
    expect(oldVersionPkg.getVersionPackage()).to.keys([
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

  describe("#VersionPackageManager", () => {
    let versionPkg: version.VersionPackageManager;

    before(async () => {
      versionPkg = await versionManager
        .getPackageInfoAsManager("1.19")
        .fetchPackage();
    });

    it(`should build a version package map`, async () => {
      const librariesMap = versionPkg.getLibrariesMap();
      expect(librariesMap).to.not.be.undefined;

      const assertionPlatformList: VersionPlatform | string[] = [
        "none",
        "linux",
        "osx",
        "windows",
      ];
      assertionPlatformList.forEach((item: any) => {
        let obj = librariesMap.get(item);
        expect(obj).not.to.be.undefined;
        expect(obj).to.have.length.gt(0);
      });
    });

    /**
     * Do assertion for built version
     *
     * @param platform a platform name
     */
    const assertLibrariesForPlatform = (platform: version.VersionPlatform) => {
      let libs = versionPkg.getLibraries({ platform });
      expect(libs).to.not.be.undefined;

      // Each item must be a library
      expect(libs).to.be.an("array");
      expect(libs).length.gt(0);
      expect(libs[0]).to.haveOwnProperty("name");
      expect(libs[0]).to.haveOwnProperty("downloads");

      // Must have some platform library
      expect(
        libs.some(
          (library) =>
            library.rules !== undefined &&
            library.rules.some(
              (rule) => rule.os !== undefined && rule.os.name === platform
            )
        )
      ).to.be.true;

      // Must have some general platform
      expect(libs.some((library) => library.rules === undefined)).to.be.true;
    };

    it(`should build library for compatible platform`, () => {
      ["linux", "windows", "osx"].forEach((platform: any) => {
        assertLibrariesForPlatform(platform);
      });
    });

    it(`should build library for non-platform `, () => {
      let libs = versionPkg.getLibraries();
      expect(libs).to.not.be.undefined;

      // Each item must be a library
      expect(libs).to.be.an("array");
      expect(libs).length.gt(0);
      expect(libs[0]).to.haveOwnProperty("name");
      expect(libs[0]).to.haveOwnProperty("downloads");
    });

    it(`should return asset index reference`, () => {
      expect(versionPkg.getAssetIndexReference()).not.to.be.undefined;
      expect(versionPkg.getAssetIndexReference().id).to.be.a("string");
      expect(versionPkg.getAssetIndexReference().sha1).to.be.a("string");
      expect(versionPkg.getAssetIndexReference().size).to.be.a("number");
      expect(versionPkg.getAssetIndexReference().totalSize).to.be.a("number");
      expect(versionPkg.getAssetIndexReference().url).to.be.a("string");
    });

    it(`should return is supported or not`, () => {
      expect(versionPkg.isUnsupported()).to.be.a("boolean");
    });

    it(`should fetch asset index`, async () => {
      const assetIndex = await versionPkg.fetchAssetIndex();
      expect(assetIndex).not.to.be.undefined;
      expect(assetIndex.objects).not.to.be.undefined;
      expect(Object.keys(assetIndex.objects).length).gt(0);
    });

    describe("requires assetIndex", () => {
      let assetIndex: version.AssetIndex | undefined;

      before(async () => {
        assetIndex = await versionPkg.fetchAssetIndex();
        expect(assetIndex).not.to.be.undefined;
        expect(assetIndex.objects).not.to.be.undefined;
        expect(Object.keys(assetIndex.objects).length).gt(0);
      });

      it(`should asset index manager property work`, () => {
        const assetIndexManager = new AssetIndexManager(assetIndex);

        expect(assetIndexManager.getAssetIndex()).to.be.eq(assetIndex);
        expect(assetIndexManager.getObjects()).to.be.eq(assetIndex.objects);
      });

      it(`should create an exactly download url and path suffix`, () => {
        const assetIndexManager = new AssetIndexManager(assetIndex);
        const firstAssetMetadata: AssetMetadata =
          assetIndex.objects[Object.keys(assetIndex.objects)[0]];

        expect(
          assetIndexManager.buildAssetDownloadUrl(firstAssetMetadata).pathname
        ).to.include(
          firstAssetMetadata.hash.slice(0, 2) +
            path.sep +
            firstAssetMetadata.hash
        );

        const pathSuffix =
          assetIndexManager.buildPathSuffix(firstAssetMetadata);
        expect(pathSuffix).to.include(
          firstAssetMetadata.hash.slice(0, 2) + "/" + firstAssetMetadata.hash
        );
      });
    });
  });
});
