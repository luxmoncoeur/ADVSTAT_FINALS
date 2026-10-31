// @ts-check
import { formatExact, formatNumber, formatPValue } from "@/lib/format";

const ESTIMATE_LABEL = {
  "one-mean": "sample mean x̄",
  "one-proportion": "sample proportion p̂",
  "two-means": "observed difference x̄₁ − x̄₂",
  "two-proportions": "observed difference p̂₁ − p̂₂",
};

/**
 * Percentage text for a probability, e.g. 0.0455 → "4.55%". Very small values
 * read "less than 0.01%" instead of a misleading 0.00%.
 * @param {number} p
 */
export function percentText(p) {
  if (p > 0 && p < 0.0001) return "less than 0.01%";
  return `${formatNumber(p * 100, 2, { fixed: true })}%`;
}

/**
 * Plain-language explanation of a z-test result, for the at-a-glance verdict.
 * Every number comes from the result; nothing is recomputed.
 *
 * @param {import('@/lib/stats/ztest').ZTestResult} result
 * @param {number} decimals
 */
export function explainResult(result, decimals) {
  const { z, tail, alpha, pValue, reject, nullValue, estimate, hypotheses } = result;
  const zc = /** @type {number} */ (
    tail === "left" ? result.critical.lower : result.critical.upper
  );
  const distance = formatNumber(Math.abs(z), decimals, { fixed: true });
  const side = z > 0 ? "above" : z < 0 ? "below" : "exactly at";

  const headline = reject
    ? `The data support Hₐ: ${hypotheses.alternative}.`
    : `Not enough evidence for Hₐ: ${hypotheses.alternative}.`;

  const where =
    z === 0
      ? `The ${ESTIMATE_LABEL[result.test]} (${formatNumber(estimate, decimals)}) equals the value in H₀ (${formatExact(nullValue)}).`
      : `The ${ESTIMATE_LABEL[result.test]} (${formatNumber(estimate, decimals)}) is ${distance} standard errors ${side} the value in H₀ (${formatExact(nullValue)}).`;

  const cutoffValue = formatNumber(zc, decimals, { fixed: true });
  const needed =
    tail === "two"
      ? `To reject H₀ at α = ${alpha} (two-tailed), z had to be beyond ±${formatNumber(Math.abs(zc), decimals, { fixed: true })}`
      : tail === "right"
        ? `To reject H₀ at α = ${alpha} (right-tailed), z had to be at least ${cutoffValue}`
        : `To reject H₀ at α = ${alpha} (left-tailed), z had to be at most ${cutoffValue}`;
  const cutoff = `${needed}. ${reject ? "It is, so z lands in the rejection region." : "It is not, so z stays in the acceptance region."}`;

  const oneIn =
    pValue >= 0.001 && pValue < 0.5
      ? ` (about 1 in ${Math.round(1 / pValue).toLocaleString("en-US")})`
      : "";
  const chance = `If H₀ were true, a result at least this extreme would happen ${percentText(pValue)} of the time${oneIn}. That is ${
    pValue <= alpha ? "at or below" : "above"
  } α = ${percentText(alpha)}, so the result is ${pValue <= alpha ? "" : "not "}statistically significant.`;

  return {
    headline,
    where,
    cutoff,
    chance,
    pText: formatPValue(pValue, decimals),
  };
}
