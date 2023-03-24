import { expect } from "chai";
import { Preconditions } from "./../utils";

describe("[unit] utils", () => {
  describe("Preconditions", () => {
    describe("notNull", () => {
      it(`should throw an exception as fail`, () => {
        expect(() => {
          Preconditions.notNull(null);
        }).to.throws(/Expect not to be undefined/);

        expect(() => {
          Preconditions.notNull(null, "must not be null");
        }).to.throws("must not be null");

        expect(() => {
          Preconditions.notNull(undefined);
        }).to.throws(/Expect not to be undefined/);

        expect(() => {
          Preconditions.notNull(1);
        }).to.not.throws(/Expect not to be undefined/);

        expect(() => {
          Preconditions.notNull("");
        }).to.not.throws(/Expect not to be undefined/);

        expect(() => {
          Preconditions.notNull(false);
        }).to.not.throws(/Expect not to be undefined/);

        expect(() => {
          Preconditions.notNull({});
        }).to.not.throws(/Expect not to be undefined/);
      });
    });
  });
});
