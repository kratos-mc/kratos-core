import fetch from "node-fetch";

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

/**
 * Represents a version package information.
 * This object uses for resolving version package
 */
export interface VersionPackageInfo {
  id: string;
  type: "release" | "snapshot" | "old_beta";
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

  public async fetchPackage(): Promise<VersionPackage> {
    return (await fetch(this.packageInfo.url, { method: "get" })).json();
  }
}

export type VersionPlatform = "linux" | "osx" | "windows";

export interface VersionPackage {
  minecraftArguments?: string;
  arguments?: {
    game: [
      | string
      | {
          rules: [
            {
              action: "allow" | "disallow";
              features: {
                has_custom_resolution?: true;
                is_demo_user?: true;
              };
            }
          ];
          value: string | string[];
        }
    ];

    jvm: [
      | string
      | {
          rules: [
            {
              action: "allow" | "disallow";
              os: {
                name?: VersionPlatform;
                version?: RegExp | string;
                arch?: "x86" | string;
              };
            }
          ];
          value: string[] | string;
        }
    ];
  };
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
  libraries: [
    {
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
      rules?: [
        {
          action: "allow" | "disallow";
          os?: {
            name?: VersionPlatform;
            version?: RegExp;
          };
        }
      ];
    }
  ];
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
  type: "snapshot" | "release";
}
