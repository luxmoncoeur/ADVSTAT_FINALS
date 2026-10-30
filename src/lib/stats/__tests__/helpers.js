// @ts-check
import { expect } from "vitest";

/**
 * Relative error |actual − expected| / |expected| (absolute error when expected is 0).
 * @param {number} actual
 * @param {number} expected
 */
export function relativeError(actual, expected) {
  return expected === 0 ? Math.abs(actual) : Math.abs(actual - expected) / Math.abs(expected);
}

/**
 * @param {number} actual
 * @param {number} expected
 * @param {number} tolerance  Maximum relative error.
 * @param {string} [label]
 */
export function expectRelClose(actual, expected, tolerance, label = "") {
  const error = relativeError(actual, expected);
  expect(
    error,
    `${label} actual=${actual} expected=${expected} relErr=${error}`,
  ).toBeLessThanOrEqual(tolerance);
}

/**
 * Unwraps an ok Result or fails the test with its error message.
 * @template T
 * @param {import('../result.js').Result<T>} result
 * @returns {T}
 */
export function unwrap(result) {
  if (!result.ok)
    throw new Error(`Expected ok result, got ${result.error.code}: ${result.error.message}`);
  return result.value;
}
