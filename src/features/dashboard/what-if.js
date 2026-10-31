import { oneMeanZTest } from "@/lib/stats";

/**
 * A z-test whose statistic is exactly `z` (x̄ = z, μ₀ = 0, σ = 1, n = 1), so the
 * dashboard's what-if verdict uses the same critical values and decision rule
 * as the hypothesis module.
 * @param {number} z
 * @param {number} alpha
 * @param {'two'|'left'|'right'} tail
 */
export function whatIfZTest(z, alpha, tail) {
  const outcome = oneMeanZTest({ sampleMean: z, mu0: 0, sigma: 1, n: 1, alpha, tail });
  if (!outcome.ok) throw new Error(outcome.error.message);
  return outcome.value;
}
