import * as download from "./download";
import * as version from "./version";
import * as utils from "./utils";
import * as workspace from "./workspace";
/**
 * Represents kratos core object
 */
export const kratos = {
  /**
   * Represents the download module
   *
   */
  download,
  /**
   * Represents the version module
   */
  version,
  /**
   * Represents the utility module
   */
  utils,
  /**
   * Represents the workspace module
   */
  workspace,
};

export { download, version, utils, workspace };
