import { expect } from "chai";
import { DownloadProcess } from "../download";
import { download, version, kratos } from "./../index";

describe("[integrate] module resolve", () => {
  it(`should have download object`, () => {
    expect(kratos.download).not.to.be.undefined;
    expect(kratos.version).not.to.be.undefined;
    expect(download).not.to.be.undefined;
    expect(version).not.to.be.undefined;
  });
});
