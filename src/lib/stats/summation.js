// @ts-check

/**
 * Neumaier (improved Kahan–Babuška) compensated summation.
 * Keeps a running correction term so the result is accurate to within a few
 * ulps even when adding many values of very different magnitudes.
 *
 * @param {readonly number[]} values
 * @returns {number}
 */
export function compensatedSum(values) {
  let sum = 0;
  let compensation = 0;
  for (const value of values) {
    const t = sum + value;
    if (Math.abs(sum) >= Math.abs(value)) {
      compensation += sum - t + value;
    } else {
      compensation += value - t + sum;
    }
    sum = t;
  }
  return sum + compensation;
}
