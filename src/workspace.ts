import {
  mkdir,
  mkdirSync,
  existsSync,
  PathLike,
  createWriteStream,
  WriteStream,
  WriteFileOptions,
  writeFile,
  ensureDir,
  ensureDirSync,
} from "fs-extra";
import { join, dirname } from "path";
import { Preconditions } from "./utils";

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

    !existsSync(this.directory) && mkdirSync(this.directory);
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

    // Ensure the directory first
    let dir = dirname(_path.toString());
    ensureDirSync(dir);

    // Retrieves a write stream
    return createWriteStream(
      join(this.directory.toString(), _path.toString()),
      options
    );
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
  constructor(directory: PathLike) {
    super(directory);

    this.assetWorkspace = new AssetWorkspace(
      join(directory.toString(), "assets")
    );
  }

  public getAssetWorkspace(): AssetWorkspace {
    return this.assetWorkspace;
  }
}

export class AssetWorkspace extends Workspace {
  constructor(directory: PathLike) {
    super(directory);
  }

  public createAssetWriter(
    hash: string,
    options?: BufferEncoding
  ): WriteStream {
    const filePath = join("objects", hash.slice(0, 2), hash);
    return this.createWriter(filePath, options);
  }
}
