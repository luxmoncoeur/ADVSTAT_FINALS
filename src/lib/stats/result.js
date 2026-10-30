// @ts-check

/**
 * @typedef {'EMPTY'
 *   | 'N_TOO_SMALL'
 *   | 'TOO_MANY_POINTS'
 *   | 'LENGTH_MISMATCH'
 *   | 'NON_FINITE'
 *   | 'ZERO_VARIANCE_X'
 *   | 'SIGMA_NONPOSITIVE'
 *   | 'N_NOT_POSITIVE_INTEGER'
 *   | 'ALPHA_OUT_OF_RANGE'
 *   | 'PROBABILITY_OUT_OF_RANGE'
 *   | 'SUCCESSES_OUT_OF_RANGE'
 *   | 'ZERO_STANDARD_ERROR'
 *   | 'INVALID_TAIL'} StatsErrorCode
 */

/**
 * @typedef {object} StatsError
 * @property {StatsErrorCode} code
 * @property {string} message  Plain-language explanation shown to the user.
 * @property {string} [field]  Input field the error belongs to, if any.
 */

/**
 * @template T
 * @typedef {{ ok: true, value: T } | { ok: false, error: StatsError }} Result
 */

/**
 * @template T
 * @param {T} value
 * @returns {{ ok: true, value: T }}
 */
export function ok(value) {
  return { ok: true, value };
}

/**
 * @param {StatsErrorCode} code
 * @param {string} message
 * @param {string} [field]
 * @returns {{ ok: false, error: StatsError }}
 */
export function fail(code, message, field) {
  return { ok: false, error: field ? { code, message, field } : { code, message } };
}
