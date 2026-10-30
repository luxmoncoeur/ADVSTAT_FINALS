// @ts-check
import { fail } from "./result.js";

/** @typedef {import('./result.js').StatsError} StatsError */
/** @typedef {{ ok: false, error: StatsError }} Failure */

/**
 * @param {unknown} value
 * @returns {value is number}
 */
export function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * @param {unknown} value
 * @param {string} field
 * @param {string} label
 * @returns {Failure | null}
 */
export function checkFinite(value, field, label) {
  return isFiniteNumber(value)
    ? null
    : fail("NON_FINITE", `${label} must be a finite number.`, field);
}

/**
 * @param {unknown} value
 * @param {string} field
 * @param {string} label
 * @returns {Failure | null}
 */
export function checkSigma(value, field, label) {
  return (
    checkFinite(value, field, label) ??
    /** @type {number} */ (
      value > 0 ? null : fail("SIGMA_NONPOSITIVE", `${label} must be greater than 0.`, field)
    )
  );
}

/**
 * @param {unknown} value
 * @param {string} field
 * @param {string} label
 * @returns {Failure | null}
 */
export function checkSampleSize(value, field, label) {
  return Number.isSafeInteger(value) && /** @type {number} */ (value) >= 1
    ? null
    : fail("N_NOT_POSITIVE_INTEGER", `${label} must be a whole number of at least 1.`, field);
}

/**
 * @param {unknown} alpha
 * @returns {Failure | null}
 */
export function checkAlpha(alpha) {
  return isFiniteNumber(alpha) && alpha > 0 && alpha < 1
    ? null
    : fail("ALPHA_OUT_OF_RANGE", "The level of significance α must be between 0 and 1.", "alpha");
}

/**
 * Open-interval probability check, 0 < p < 1 (used for hypothesized proportions).
 * @param {unknown} value
 * @param {string} field
 * @param {string} label
 * @returns {Failure | null}
 */
export function checkOpenProbability(value, field, label) {
  return isFiniteNumber(value) && value > 0 && value < 1
    ? null
    : fail("PROBABILITY_OUT_OF_RANGE", `${label} must be between 0 and 1 (exclusive).`, field);
}

/**
 * Closed-interval probability check, 0 ≤ p ≤ 1 (used for sample proportions).
 * @param {unknown} value
 * @param {string} field
 * @param {string} label
 * @returns {Failure | null}
 */
export function checkClosedProbability(value, field, label) {
  return isFiniteNumber(value) && value >= 0 && value <= 1
    ? null
    : fail("PROBABILITY_OUT_OF_RANGE", `${label} must be between 0 and 1.`, field);
}

/**
 * @param {unknown} tail
 * @returns {Failure | null}
 */
export function checkTail(tail) {
  return tail === "left" || tail === "right" || tail === "two"
    ? null
    : fail("INVALID_TAIL", "Choose a left-tailed, right-tailed, or two-tailed test.", "tail");
}
