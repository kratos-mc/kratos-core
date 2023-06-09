import {
  mkdir,
  existsSync,
  PathLike,
  createWriteStream,
  WriteStream,
  WriteFileOptions,
  writeFile,
  ensureDir,
  ensureDirSync,
  exists,
  readJson,
  readJsonSync,
  writeJsonSync,
  readdirSync,
} from "fs-extra";
import { join, dirname } from "path";
import { Preconditions } from "./utils";
import { VersionManifest, VersionPackage } from "./version";

import * as path from "path";
import { version } from ".";
export interface WorkspaceInterface {
  /**
   * Get the current directory
   *
   * @returns the path name of the directory
   */
  getDirectory(): PathLike;
  /**
   * Make the sub-directory from current directory and resolve
   * the full path of generated directory.
   *
   * For instance, to make a sub-directory inside current directory, do as follows
   * ```
   *
   * await makeDirectory(`subDir`);
   * ```
   *
   * Note: Do not need to join parent directory
   *
   * @param path a sub directory path
   * @returns the full path of generated directory
   *
   */
  makeDirectory(path: PathLike): Promise<string>;

  /**
   * Write a file as current directory, or sub-path.
   *
   *
   *
   * @param writePath a path to write a file
   * @param data a content of a file as buffer
   * @param options write file options
   *
   * @returns the generated path of the file
   */
  writeAsFile(
    writePath: PathLike,
    data: Buffer,
    options?: WriteFileOptions
  ): Promise<string>;
}

export class Workspace implements WorkspaceInterface {
  private readonly directory: PathLike;

  constructor(directory: PathLike) {
    Preconditions.notNull(directory);
    this.directory = directory;

    !existsSync(this.directory) && ensureDirSync(this.directory.toString());
  }

  public getDirectory(): PathLike {
    return this.directory;
  }

  public async makeDirectory(_path: PathLike): Promise<string> {
    Preconditions.notNull(_path);
    const joinedPath = join(this.directory.toString(), _path.toString());
    this.ensurePath(joinedPath);

    await mkdir(join(this.directory.toString(), _path.toString()));

    return joinedPath;
  }

  private async ensurePath(_path: PathLike) {
    let dir = dirname(_path.toString());
    await ensureDir(dir);
  }

  public createWriter(_path: PathLike, options?: BufferEncoding): WriteStream {
    Preconditions.notNull(_path);

    const _path1 = join(this.getDirectory().toString(), _path.toString());
    // Ensure the directory first
    let dir = dirname(_path1.toString());
    ensureDirSync(dir);

    // Retrieves a write stream
    return createWriteStream(_path1, options);
  }

  public async writeAsFile(
    writePath: PathLike,
    data: Buffer,
    options?: WriteFileOptions
  ): Promise<string> {
    Preconditions.notNull(writePath);
    Preconditions.notNull(data);

    const _path = join(this.getDirectory().toString(), writePath.toString());
    await this.ensurePath(_path);
    await writeFile(_path, data, options);

    return _path;
  }
}

export class LauncherWorkspace extends Workspace {
  private readonly assetWorkspace: AssetWorkspace;
  private readonly versionWorkspace: VersionWorkspace;
  private readonly libraryWorkspace: LibraryWorkspace;
  constructor(directory: PathLike) {
    super(directory);

    this.assetWorkspace = new AssetWorkspace(
      join(directory.toString(), "assets")
    );

    this.versionWorkspace = new VersionWorkspace(
      join(directory.toString(), "versions")
    );

    this.libraryWorkspace = new LibraryWorkspace(
      join(directory.toString(), "libraries")
    );
  }

  public getAssetWorkspace(): AssetWorkspace {
    return this.assetWorkspace;
  }

  public getVersionWorkspace() {
    return this.versionWorkspace;
  }

  /**
   * Retrieves the instance of library workspace that initialed at constructor.
   *
   * @returns the instance of library workspace.
   */
  public getLibraryWorkspace() {
    return this.libraryWorkspace;
  }
}

export class AssetWorkspace extends Workspace {
  private indexesWorkspace: AssetIndexWorkspace;
  constructor(directory: PathLike) {
    super(directory);

    this.indexesWorkspace = new AssetIndexWorkspace(
      path.join(directory.toString(), "indexes")
    );
  }

  /**
   * Retrieves sub-directory path for ./<launcher directory>/assets/objects
   *
   * @returns a path of sub-directory
   */
  public getObjectsPath() {
    return join(this.getDirectory().toString(), "objects");
  }

  /**
   * Creates a write stream using assets file path format.
   * An asset file is stored in `/<first 2 letter of hash>/<full hash>`.
   *
   * @param hash an asset hash property to set file name
   * @param options an options for create a write stream
   * @returns a writable stream from {@link createWriteStream}
   */
  public createAssetWriter(
    hash: string,
    options?: BufferEncoding
  ): WriteStream {
    const filePath = join("objects", hash.slice(0, 2), hash);
    return this.createWriter(filePath, options);
  }

  /**
   * Retrieves the instance of asset indexes workspace.
   *
   * Asset indexes workspace represents `assets/indexes` directory
   * in minecraft launcher. It contains all asset indexes (mapping) data
   * for the game to determine which asset must be used for the game.
   *
   * @returns the instance of asset indexes workspace
   */
  public getAssetIndexesWorkspace() {
    return this.indexesWorkspace;
  }
}

export class VersionWorkspace extends Workspace {
  constructor(directory: PathLike) {
    super(directory);
  }

  /**
   * Makes the version_manifest_v2.json file path from {@link LauncherWorkspace}
   * as a parent directory.
   *
   * @returns a relative manifest path from launcher workspace.
   */
  public getManifestPath() {
    return path.join(
      this.getDirectory().toString(),
      "version_manifest_v2.json"
    );
  }

  /**
   * Checks whether or not the version_manifest_v2.json file is exists.
   *
   * @returns true if the version manifest file was exists, false otherwise.
   */
  public existsManifest() {
    return exists(this.getManifestPath());
  }

  /**
   * Write a manifest file.
   *
   * @param buffer content to write into a file.
   * @param options a write file options, see {@link WriteFileOptions}
   * @returns a destination as path of the written file.
   *  In this case is the full path of version_manifest_v2.json file.
   */
  public async writeManifest(buffer: Buffer, options?: WriteFileOptions) {
    return this.writeAsFile("version_manifest_v2.json", buffer, options);
  }

  /**
   * Reads the version_manifest_v2.json and returns it.
   *
   * Either the manifest file is not found,
   * or the json file is invalid, an error will be throws.
   *
   * @returns the version manifest file as an object.
   */
  public async readManifest(): Promise<VersionManifest> {
    // Determine if the file is not found
    if (!(await this.existsManifest())) {
      throw new Error("Manifest file is not exist.");
    }

    // Read as a JSON file
    return (await readJson(this.getManifestPath(), {
      throws: true,
    })) as VersionManifest;
  }

  /**
   * Makes a package directory path from directory.
   * @returns the package directory path, at `<launcher dir workspace>/versions/packages`.
   */
  public async getPackageDirectory() {
    return path.join(this.getDirectory().toString(), "packages");
  }

  private async getPackageVersionFilePath(versionId: string) {
    Preconditions.notNull(versionId);

    return path.join(
      (await this.getPackageDirectory()).toString(),
      [versionId, "json"].join(".")
    );
  }

  /**
   * Checks if the version package was stored in package directory.
   *
   * @param versionId the minecraft package version id.
   * @returns true if exists, false otherwise.
   */
  public async hasPackageVersion(versionId: string) {
    return exists(await this.getPackageVersionFilePath(versionId));
  }

  /**
   * Writes a version package file.
   *
   * @param versionId the package version id
   * @param buffer the buffer to write
   * @param options an options for writing file, see {@link WriteFileOptions}
   */
  public async writeVersionPackage(
    versionId: string,
    buffer: Buffer,
    options?: WriteFileOptions
  ) {
    await ensureDir(await this.getPackageDirectory());

    await writeFile(
      await this.getPackageVersionFilePath(versionId),
      buffer,
      options
    );
  }

  /**
   * Reads the version packages as JSON file.
   *
   * If the file was not found, an error will be thrown
   *
   * @param versionId the package version id
   * @returns the package version as json
   */
  public async readVersionPackage(versionId: string): Promise<VersionPackage> {
    const filePath = await this.getPackageVersionFilePath(versionId);
    if (!(await exists(filePath))) {
      throw new Error(`Version file path not found: ${filePath}`);
    }

    return (await readJson(filePath, { throws: true })) as VersionPackage;
  }
}

class LibraryWorkspace extends Workspace {
  constructor(directory: PathLike) {
    super(directory);
  }

  /**
   * Ensures the dirname of the library path to not be exists.
   *
   * For examples, if the library pathname is /a/b/c/d.jar,
   * the function will make a directory `/libraries/a/b/c` if
   * is not exists. Otherwise, silently do nothing.
   *
   *
   * @param pathname the path of library to ensure a directory
   */
  public ensureDirname(pathname: string) {
    Preconditions.notNull(path);
    const absolutePath = path.resolve(this.getDirectory().toString(), pathname);
    ensureDirSync(dirname(absolutePath));
  }
}

class AssetIndexWorkspace extends Workspace {
  constructor(__: string) {
    super(__);
  }
  /**
   *
   * NOTE that the file name does not include any extension
   *
   * @param indexId
   * @returns
   */
  public getIndexFilePath(indexId: string) {
    return path.join(this.getDirectory().toString(), indexId);
  }

  /**
   * Finds and retrieves if the asset index of the file from `assets/indexes` is exists.
   * Otherwise, an Error will be thrown.
   *
   * @param indexId the version asset index id, mostly from package info.
   * @returns the asset index object parsed locally on disk.
   */
  public getIndex(indexId: string) {
    const filePath = this.getIndexFilePath(indexId);
    if (!existsSync(filePath)) {
      throw new Error(`Asset index file not exists: ${filePath}`);
    }

    return readJsonSync(filePath, { throws: true });
  }

  /**
   * Writes an asset index file into `assets/indexes/{indexId}`.
   * The file will be overwritten if it exists.
   *
   * @param indexId the version asset index id, mostly from package info.
   * @param assetIndex the asset index to write over the local disk file.
   */
  public writeIndex(indexId: string, assetIndex: version.AssetIndex) {
    const filePath = this.getIndexFilePath(indexId);
    writeJsonSync(filePath, assetIndex);
  }

  /**
   * Checks whether or not the index file is available on `assets/indexes/{indexId}`.
   *
   * @param indexId the version asset index id, mostly from package info.
   * @returns true if the file is exists, false otherwise.
   */
  public hasIndex(indexId: string) {
    const filePathName = this.getIndexFilePath(indexId);
    return existsSync(filePathName);
  }

  /**
   * Reveals all indexes file available on `assets/indexes/{indexId}`.
   * The `ignoreFiles` parameter works by using includes string function of JavaScript.
   *
   * @param ignoreFiles the filter to eliminate unnecessary files, as an array.
   * @returns the list of file name which was available on `assets/indexes/{indexId}`
   */
  public getAllIndexes(ignoreFiles?: string[]) {
    let result: string[] = readdirSync(this.getDirectory());
    if (ignoreFiles !== undefined) {
      result = result.filter((fileName) => !ignoreFiles.includes(fileName));
    }
    return result;
  }
}
