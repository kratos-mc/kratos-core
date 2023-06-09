import fetch from "node-fetch";
import { PathLike } from "fs-extra";
import { sep } from "path";
import * as path from "path";

/**
 * Get a minecraft manifest url.
 * @returns a minecraft manifest url
 */
export function getManifestUrl() {
  return `https://piston-meta.mojang.com/mc/game/version_manifest_v2.json`;
}

/**
 * Fetch and receive a minecraft version manifest as json.
 *
 * @returns a received minecraft manifest version
 */
export async function fetchVersionManifest(): Promise<VersionManager> {
  const versionManifest: VersionManifest = await (
    await fetch(getManifestUrl(), { method: "get" })
  ).json();
  return new VersionManager(versionManifest);
}

/**
 * Utility class represents a manager loader for version
 */
export class VersionManager {
  private readonly manifest: VersionManifest;
  /**
   * The version package info map. This map only
   * construct when calling search version package info function.
   */
  private mapGameVersion: Map<string, VersionPackageInfo>;
  constructor(manifest: VersionManifest) {
    this.manifest = manifest;
  }

  /**
   * Gets and returns the search version map if is available. Otherwise,
   * construct a new map that contains a version id as a key,
   * and the package info as a value.
   *
   * @returns a search map from mapGameVersion variable
   */
  private getSearchMap(): Map<string, VersionPackageInfo> {
    if (this.mapGameVersion === undefined) {
      this.mapGameVersion = new Map();
      for (let index = 0; index < this.manifest.versions.length; index++) {
        const element = this.manifest.versions[index];
        this.mapGameVersion.set(element.id, element);
      }
    }
    return this.mapGameVersion;
  }

  /**
   * Get a package info from minecraft version (version id) such as `1.7.2`, `1.9`.
   *
   * @param version a version as minecraft version
   * @returns a package info if the version is found, undefined otherwise
   *
   */
  public getPackageInfo(version: string): VersionPackageInfo | undefined {
    const packageInfo = this.getSearchMap().get(version);
    if (packageInfo === undefined) {
      throw new Error(
        "Invalid or not found package info with version " + version
      );
    }
    return packageInfo;
  }

  public getLatestReleasePackageInfo(): VersionPackageInfoManager {
    const latestReleaseId = this.manifest.latest.release;
    const v: VersionPackageInfo = this.getPackageInfo(latestReleaseId);

    return new VersionPackageInfoManager(v);
  }

  public getPackageInfoAsManager(version: string) {
    const packageInfo = this.getPackageInfo(version);
    return new VersionPackageInfoManager(packageInfo);
  }

  /**
   * Returns a fetch manifest from memory as JavaScript object.
   *
   * @returns the manifest object
   */
  public getRawManifest(): VersionManifest {
    return this.manifest;
  }

  /**
   * Retrieves all package info from manifest.
   *
   * @returns all package info as an array.
   */
  public getAllPackagesInfo(): VersionPackageInfo[] {
    let arr = [];
    for (let v of this.getSearchMap().values()) {
      arr.push(v);
    }

    return arr;
  }

  /**
   * Retrieves a list of version id from manifest.
   *
   * @returns get all version id as string.
   */
  public getVersions(): string[] {
    let arr: string[] = [];
    for (let v of this.getSearchMap().keys()) {
      arr.push(v);
    }

    return arr;
  }
}

/**
 * Retrieves when fetch the manifest file.
 * Represents an object for manifest_v2.json
 */
export interface VersionManifest {
  /**
   * Latest Minecraft version
   */
  latest: {
    /**
     * Latest Minecraft release version id (1.7, 1.8, ...)
     */
    release: string;
    /**
     * Latest Minecraft snapshot version id (1.19.4-rc3, 22w12a, ...)
     */
    snapshot: string;
  };
  /**
   * The list of version package information
   */
  versions: VersionPackageInfo[];
}

export type VersionReleaseType = "release" | "snapshot" | "old_beta";

/**
 * Represents a version package information.
 * This object uses for resolving version package
 */
export interface VersionPackageInfo {
  id: string;
  type: VersionReleaseType;
  url: URL;
  time: string;
  releaseTime: string;
  sha1: string;
  complianceLevel: number;
}

export class VersionPackageInfoManager {
  private packageInfo: VersionPackageInfo;

  constructor(packageInfo: VersionPackageInfo) {
    this.packageInfo = packageInfo;
  }

  public isUnsupported(): boolean {
    return this.packageInfo.complianceLevel === 0;
  }

  public async fetchPackage(): Promise<VersionPackageManager> {
    return new VersionPackageManager(
      await (await fetch(this.packageInfo.url, { method: "get" })).json()
    );
  }

  /**
   * Retrieves a package info as Java object. {@link VersionPackageInfo}.
   *
   * @returns a raw package info as Java object
   */
  public getPackageInfo() {
    return this.packageInfo;
  }

  /**
   * Retrieves a package info id.
   *
   * @returns a package info id as string.
   */
  public getId() {
    return this.packageInfo.id;
  }

  /**
   * Retrieves a package type. It could be release, snapshot, or old_beta.
   *
   * @returns a package type.
   */
  public getPackageType() {
    return this.packageInfo.type;
  }
}

export type VersionPlatform = "linux" | "osx" | "windows";

export interface VersionPackage {
  minecraftArguments?: string;
  arguments?: {
    game: [
      | string
      | {
          rules: {
            action: "allow" | "disallow";
            features: {
              has_custom_resolution?: true;
              is_demo_user?: true;
            };
          }[];
          value: string | string[];
        }
    ];

    jvm: [
      | string
      | {
          rules: {
            action: "allow" | "disallow";
            os: {
              name?: VersionPlatform;
              version?: RegExp | string;
              arch?: "x86" | string;
            };
          }[];
          value: string[] | string;
        }
    ];
  };

  /**
   * An object that point to asset index file.
   * Asset index file is a JSON-formatted file that contains link to asset
   *
   * ```json
   * {
   *  "objects": {
   *    "icons/icon_16x16.png": {
   *      "hash": "a0d43b09bbd3a65039e074cf4699175b0c4724b8",
   *      "size": 947
   *    },
   *  "icons/icon_32x32.png": {
   *    "hash": "41b16434923a097ab3e037eb4cc961b5372c149a",
   *    "size": 2639
   *    }
   * }
   *
   * ```
   */
  assetIndex: AssetIndexReference;
  assets: string;
  complianceLevel: number;
  downloads: {
    [index: string]: {
      sha1: string;
      size: number;
      url: URL | string;
    };
  };
  id: string;
  javaVersion: {
    component: string;
    majorVersion: number;
  };
  libraries: VersionPackageLibrary[];
  logging?: {
    client: {
      argument: string;
      file: {
        id: string;
        sha1: string;
        size: number;
        url: URL;
      };
      type: string;
    };
  };

  mainClass: string;
  minimumLauncherVersion: number;
  releaseTime: string;
  time: string;
  type: VersionReleaseType;
}

export interface VersionPackageLibrary {
  downloads: {
    artifact?: {
      path: string;
      sha1: string;
      size: number;
      url: URL;
    };
    classifier?: {
      [index: string]: {
        // TODO: add bundler
      };
    };
  };
  extract?: {
    exclude: string[];
  };
  name: string;
  natives?: {
    [index: string]: string;
  };
  rules?: {
    action: "allow" | "disallow";
    os?: {
      name?: VersionPlatform;
      version?: RegExp;
    };
  }[];
}
export class VersionPackageManager {
  private versionPackage: VersionPackage;

  private librariesMap:
    | Map<VersionPlatform | "none", VersionPackageLibrary[]>
    | undefined;
  constructor(versionPackage: VersionPackage) {
    this.versionPackage = versionPackage;
  }

  public getVersionPackage() {
    return this.versionPackage;
  }
  /**
   * @deprecated unexpected operation for old package.libraries format
   */
  private buildLibrariesMap() {
    const allPlatforms: VersionPlatform[] = ["linux", "osx", "windows"];
    this.librariesMap = new Map<
      VersionPlatform | "none",
      VersionPackageLibrary[]
    >();

    // initialize the map
    allPlatforms.forEach((platform) => {
      this.librariesMap.set(platform, new Array());
    });
    this.librariesMap.set("none", new Array());

    // distribute map
    for (let library of this.versionPackage.libraries) {
      // If the library have no rule
      if (!library.rules || library.rules.length === 0) {
        this.librariesMap.get("none").push(library);
        continue;
      }

      // Otherwise, add into a platform library
      for (let libraryRule of library.rules) {
        const platform = libraryRule.os.name;
        const action = libraryRule.action;

        if (action === "allow") {
          this.librariesMap.get(platform).push(library);
        }
      }
    }
  }

  /**
   * Retrieves the library map. If the map is undefined,
   * the function will construct it before return.
   *
   * @deprecated unexpected operation for old package.libraries format
   * @returns a {@link Map} object
   */
  public getLibrariesMap() {
    if (this.versionPackage !== undefined) {
      this.buildLibrariesMap();
    }
    return this.librariesMap;
  }

  public getLibraries(options?: {
    platform: VersionPlatform;
  }): VersionPackageLibrary[] {
    // let libraries: VersionPackageLibrary[] = [];
    // if (options !== undefined && options.platform !== undefined) {
    //   libraries.push(...this.getLibrariesMap().get(options.platform));
    // } else {
    //   ["linux", "osx", "windows"].forEach((ele: any) =>
    //     libraries.push(...this.getLibrariesMap().get(ele))
    //   );
    // }
    // libraries.push(...this.getLibrariesMap().get("none"));

    const results = [];

    // Iterate over package library and return matched library
    const packageLibraries = this.versionPackage.libraries;

    // Do assertion for every single library: O(n)
    for (const library of packageLibraries) {
      if (library.rules === undefined) {
        results.push(library);
        continue;
      }

      let acceptThisLibrary = true;
      for (const rule of library.rules) {
        if (rule.action === "disallow") {
          if (rule.os === undefined) {
            acceptThisLibrary = false;
            continue;
          }

          if (rule.os.name === undefined && rule.os.version === undefined) {
            console.log(rule, library);

            throw new Error(`Unexpected library rule case`);
          }

          if (options === undefined) {
            acceptThisLibrary = false;
            continue;
          }

          acceptThisLibrary = rule.os.name !== options.platform;
        } else {
          // rule.action === 'allow'
          if (
            rule.os !== undefined &&
            options !== undefined &&
            rule.os.name !== options.platform
          ) {
            acceptThisLibrary = false;
          }
        }
      }

      if (acceptThisLibrary) {
        results.push(library);
        continue;
      }
    }

    return results;
  }

  public getAssetIndexReference() {
    return this.versionPackage.assetIndex;
  }

  public isUnsupported(): boolean {
    return this.versionPackage.complianceLevel === 0;
  }

  public async fetchAssetIndex(): Promise<AssetIndex> {
    return (await fetch(this.versionPackage.assetIndex.url)).json();
  }
}

/**
 * Represents as JSON type file that point to
 * an asset index file, should be cached.
 *
 */
export interface AssetIndexReference {
  /**
   * The asset index id
   */
  id: string;
  /**
   * The checksum for the reference file
   */
  sha1: string;
  /**
   * The size of the resource file
   */
  size: number;
  /**
   * The total size of all assets
   */
  totalSize: number;
  /**
   * The url of asset index
   */
  url: URL;
}

export interface AssetIndex {
  objects: {
    [index: string]: AssetMetadata;
  };
}

/**
 * Represents asset general information like hash and size.
 */
export interface AssetMetadata {
  /**
   * The hash of the current file, encrypted using SHA1 algorithm
   */
  hash: string;
  /**
   * The size of the asset
   */
  size: number;
}

/**
 * Represents the asset index controller.
 *
 * AssetIndexManager can take the {@link AssetIndex} (asset index object)
 * and give powerful utilities functions in order to quickly and easily handle it.
 *
 *```
 * const assetIndex: AssetIndex = await versionPkg.fetchAssetIndex();
 *
 * const assetIndexManager = new AssetIndexManager(assetIndex);
 *
 * assetIndexManager.getAssetIndex(); // returns the assetIndex object that you passed from constructor param
 * ```
 *
 */
export class AssetIndexManager {
  private assetIndex: AssetIndex;
  constructor(assetIndex: AssetIndex) {
    this.assetIndex = assetIndex;
  }

  /**
   * The resource url to download resource which sponsored by Minecraft.
   *
   * @returns the resource url provided from Minecraft
   */
  public getResourceUrl() {
    return `https://resources.download.minecraft.net/`;
  }

  /**
   * Retrieves the asset index ({@link AssetIndex}).
   *
   * @returns the asset index
   */
  public getAssetIndex() {
    return this.assetIndex;
  }

  /**
   * The objects value inside assetIndex as a list of object represents as an sub-object struct.
   *
   * In most case, the objects value inside assetIndex will look like
   *
   * ```
   * objects: {
   *    "asset-a": {
   *        "hash": ...,
   *        "size": ...,
   *    },
   *    "asset-b": {
   *        "hash": ...,
   *        "size": ...,
   *    },
   * }
   * ```
   *
   * @returns the objects value.
   */
  public getObjects() {
    return this.assetIndex.objects;
  }

  /**
   * Creates a download url for the asset from {@link AssetMetadata}.
   *
   * @deprecated use {@link AssetMetadataManager}
   * @param assetMetadata the asset metadata to get a hash
   * @returns the asset downloadable resource
   */
  public buildAssetDownloadUrl(assetMetadata: AssetMetadata) {
    const url = new URL(this.getResourceUrl());
    url.pathname = assetMetadata.hash.slice(0, 2) + sep + assetMetadata.hash;

    return url;
  }

  /**
   * Builds a path suffix represents asset file path.
   *
   * @deprecated use {@link AssetMetadataManager}
   * @param assetMetadata an asset metadata to build a suffix path
   * @returns a suffix of path to create file
   */
  public buildPathSuffix(assetMetadata: AssetMetadata): PathLike {
    let path = "";
    path += assetMetadata.hash.slice(0, 2);
    path += sep;
    path += assetMetadata.hash;

    return path;
  }
}

export class AssetMetadataManager {
  private assetMetadata: AssetMetadata;

  constructor(assetMetadata: AssetMetadata) {
    if (assetMetadata === undefined) {
      throw new Error(`Invalid asset metadata`);
    }
    this.assetMetadata = assetMetadata;
  }

  /**
   * Builds a path suffix represents asset file path.
   * The examples path correspond /<first-2-hash>/<whole-hash>.
   *
   * Examples `/da/da39a3ee5e6b4b0d3255bfef95601890afd80709/`.
   *
   * This path was concatenated using path.join()
   *
   * @returns a suffix of path to create file
   */
  public buildPathSuffix(): PathLike {
    return path.join(
      this.assetMetadata.hash.slice(0, 2),
      this.assetMetadata.hash
    );
  }

  /**
   * Creates a download url for the asset from {@link AssetMetadata}.
   *
   * @returns the asset downloadable resource
   */
  public buildAssetDownloadUrl() {
    const url = new URL(this.getResourceUrl());
    url.pathname =
      this.assetMetadata.hash.slice(0, 2) + sep + this.assetMetadata.hash;

    return url;
  }

  /**
   * The resource url to download resource which sponsored by Minecraft.
   *
   * @returns the resource url provided from Minecraft
   */
  public getResourceUrl() {
    return `https://resources.download.minecraft.net/`;
  }

  /**
   * Retrieves the hash of asset metadata.
   */
  public getHash() {
    return this.assetMetadata.hash;
  }

  /**
   * Retrieves an asset metadata size.
   */
  public getSize() {
    return this.assetMetadata.size;
  }
}
