/**
 * Represents precondition class like in Guava, in order to assert
 * and report fail-fast informative.
 */
export class Preconditions {
  /**
   * Asserts and throws if the object `what` is undefined or null.
   *
   * This function compare if the what object is strictly
   * equal to undefined or null, since some special case still
   * become defined such as `false` or `0` as an number.
   *
   * ```
   * Preconditions.notNull(null); // throw "Expect not to be undefined"
   * Preconditions.notNull(undefined); // throw "Expect not to be undefined"
   * Preconditions.notNull(false); // not throw anything
   * Preconditions.notNull(0); // not throw anything
   * ```
   *
   * @param what an object to make a compare
   * @param message a message to report
   */
  public static notNull(what: any, message?: string) {
    if (what === undefined || what === null) {
      throw new Error(message || "Expect not to be undefined");
    }
  }
}
