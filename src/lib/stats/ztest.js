// @ts-check
import { criticalZ, pValue } from "./normal.js";
import { fail, ok } from "./result.js";
import {
  checkAlpha,
  checkClosedProbability,
  checkFinite,
  checkOpenProbability,
  checkSampleSize,
  checkSigma,
  checkTail,
} from "./validation.js";

/** @typedef {import('./normal.js').Tail} Tail */
/** @typedef {'one-mean' | 'one-proportion' | 'two-means' | 'two-proportions'} ZTestType */

/**
 * Substitution token: literal text, a computed number (formatted to the chosen
 * decimals), or a user input shown exactly as entered (`exact: true`).
 * @typedef {string | { value: number, exact?: boolean }} Token
 */

/**
 * @typedef {object} Step
 * @property {string} id
 * @property {string} title
 * @property {string} formula
 * @property {Token[]} substitution
 * @property {number | null} result
 * @property {string} explanation
 */

/**
 * @typedef {object} ZTestResult
 * @property {ZTestType} test
 * @property {Tail} tail
 * @property {number} alpha
 * @property {string} parameter      Symbol of the parameter tested, e.g. "μ".
 * @property {number} nullValue      Value of the parameter under H₀.
 * @property {{ null: string, alternative: string }} hypotheses
 * @property {number} estimate       Point estimate (x̄, p̂, x̄₁ − x̄₂, p̂₁ − p̂₂).
 * @property {number} standardError
 * @property {number} z
 * @property {{ lower: number | null, upper: number | null }} critical
 * @property {number} pValue
 * @property {boolean} reject        Decision by the critical-value rule.
 * @property {boolean} rejectByPValue Decision by the p-value rule (p ≤ α).
 * @property {string} conclusion
 * @property {Record<string, number>} details  Intermediate values (p̂, pooled p̄, …).
 * @property {Step[]} steps
 * @property {string[]} warnings
 */

export const TAIL_OPERATOR = /** @type {const} */ ({ two: "≠", right: ">", left: "<" });

/** @param {number} value @returns {{ value: number }} */
const v = (value) => ({ value });
/** @param {number} value @returns {{ value: number, exact: true }} */
const exact = (value) => ({ value, exact: true });

/**
 * @param {number} z
 * @param {Tail} tail
 * @param {{ lower: number | null, upper: number | null }} critical
 */
function inRejectionRegion(z, tail, critical) {
  if (tail === "two")
    return (
      z <= /** @type {number} */ (critical.lower) || z >= /** @type {number} */ (critical.upper)
    );
  if (tail === "right") return z >= /** @type {number} */ (critical.upper);
  return z <= /** @type {number} */ (critical.lower);
}

/**
 * Shared second half of every z-test: critical values, p-value, decision,
 * conclusion and the remaining solution steps.
 *
 * @param {object} spec
 * @param {ZTestType} spec.test
 * @param {Tail} spec.tail
 * @param {number} spec.alpha
 * @param {string} spec.parameter
 * @param {number} spec.nullValue
 * @param {number} spec.estimate
 * @param {number} spec.standardError
 * @param {Step[]} spec.setupSteps   Test-specific steps (estimate, standard error).
 * @param {Step} spec.zStep          Test-specific z computation step (result filled in here).
 * @param {Record<string, number>} spec.details
 * @param {string[]} spec.warnings
 * @returns {import('./result.js').Result<ZTestResult>}
 */
function decide(spec) {
  const { test, tail, alpha, parameter, nullValue, estimate, standardError } = spec;
  if (!(standardError > 0) || !Number.isFinite(standardError)) {
    return fail(
      "ZERO_STANDARD_ERROR",
      "The standard error is 0, so z cannot be computed. This happens when every observation is a success or every observation is a failure.",
    );
  }
  const z = (estimate - nullValue) / standardError;
  if (!Number.isFinite(z))
    return fail("NON_FINITE", "The values are too large to compute a z statistic.");

  const critical = criticalZ(alpha, tail);
  const p = pValue(z, tail);
  const reject = inRejectionRegion(z, tail, critical);
  const operator = TAIL_OPERATOR[tail];
  const nullText = `${parameter} = ${nullValue}`;
  const altText = `${parameter} ${operator} ${nullValue}`;
  const conclusion = reject
    ? `Reject H₀. At α = ${alpha}, there is sufficient evidence to conclude that ${altText}.`
    : `Fail to reject H₀. At α = ${alpha}, there is not enough evidence to conclude that ${altText}.`;

  const zc = /** @type {number} */ (tail === "left" ? critical.lower : critical.upper);
  const criticalStep = {
    two: {
      formula: "z_(α/2) = Φ⁻¹(1 − α/2)",
      substitution: [
        "α = ",
        exact(alpha),
        ", α/2 = ",
        v(alpha / 2),
        " → critical values z = ±",
        v(zc),
      ],
      explanation: `In a two-tailed test, α is split equally between both tails (${alpha / 2} in each), so H₀ is rejected when z falls below −z_(α/2) or above +z_(α/2).`,
    },
    right: {
      formula: "z_α = Φ⁻¹(1 − α)",
      substitution: ["α = ", exact(alpha), " → critical value z = ", v(zc)],
      explanation:
        "In a right-tailed test, all of α sits in the upper tail, so H₀ is rejected when z is at or above the critical value.",
    },
    left: {
      formula: "−z_α = Φ⁻¹(α)",
      substitution: ["α = ", exact(alpha), " → critical value z = ", v(zc)],
      explanation:
        "In a left-tailed test, all of α sits in the lower tail, so H₀ is rejected when z is at or below the critical value.",
    },
  }[tail];

  const pStep = {
    two: {
      formula: "p = 2 · P(Z ≥ |z|)",
      substitution: ["p = 2 · P(Z ≥ ", v(Math.abs(z)), ") = ", v(p)],
    },
    right: { formula: "p = P(Z ≥ z)", substitution: ["p = P(Z ≥ ", v(z), ") = ", v(p)] },
    left: { formula: "p = P(Z ≤ z)", substitution: ["p = P(Z ≤ ", v(z), ") = ", v(p)] },
  }[tail];

  const decisionStep = {
    two: {
      formula: "Reject H₀ if |z| ≥ z_(α/2)",
      substitution: ["|z| = ", v(Math.abs(z)), reject ? " ≥ " : " < ", v(zc)],
    },
    right: {
      formula: "Reject H₀ if z ≥ z_α",
      substitution: ["z = ", v(z), reject ? " ≥ " : " < ", v(zc)],
    },
    left: {
      formula: "Reject H₀ if z ≤ −z_α",
      substitution: ["z = ", v(z), reject ? " ≤ " : " > ", v(zc)],
    },
  }[tail];

  /** @type {Step[]} */
  const steps = [
    {
      id: "hypotheses",
      title: "State the hypotheses",
      formula: `H₀: ${nullText}    Hₐ: ${altText}`,
      substitution: [
        `H₀: ${parameter} = `,
        exact(nullValue),
        `    Hₐ: ${parameter} ${operator} `,
        exact(nullValue),
      ],
      result: null,
      explanation: `H₀ is the claim of no difference. Hₐ uses "${operator}", so this is a ${tail === "two" ? "two" : tail}-tailed test.`,
    },
    {
      id: "critical",
      title: "Level of significance and critical value",
      formula: criticalStep.formula,
      substitution: criticalStep.substitution,
      result: zc,
      explanation: criticalStep.explanation,
    },
    ...spec.setupSteps,
    { ...spec.zStep, result: z },
    {
      id: "p-value",
      title: "p-value",
      formula: pStep.formula,
      substitution: pStep.substitution,
      result: p,
      explanation:
        "The p-value is the probability of getting a z at least this extreme if H₀ were true. Smaller p-values mean stronger evidence against H₀.",
    },
    {
      id: "decision",
      title: "Decision",
      formula: decisionStep.formula,
      substitution: [
        ...decisionStep.substitution,
        reject ? " → Reject H₀" : " → Fail to reject H₀",
      ],
      result: null,
      explanation: `Cross-check with the p-value: p ${p <= alpha ? "≤" : ">"} α (${alpha}), which leads to the same decision.`,
    },
  ];

  return ok({
    test,
    tail,
    alpha,
    parameter,
    nullValue,
    hypotheses: { null: nullText, alternative: altText },
    estimate,
    standardError,
    z,
    critical,
    pValue: p,
    reject,
    rejectByPValue: p <= alpha,
    conclusion,
    details: spec.details,
    steps,
    warnings: spec.warnings,
  });
}

/**
 * @param {Array<import('./validation.js').Failure | null>} checks
 */
function firstFailure(checks) {
  return checks.find((check) => check !== null) ?? null;
}

/**
 * One-sample z-test for a mean (population σ known).
 * z = (x̄ − μ₀) / (σ / √n)
 *
 * @param {{ sampleMean: number, mu0: number, sigma: number, n: number, alpha: number, tail: Tail }} input
 * @returns {import('./result.js').Result<ZTestResult>}
 */
export function oneMeanZTest({ sampleMean, mu0, sigma, n, alpha, tail }) {
  const failure = firstFailure([
    checkFinite(sampleMean, "sampleMean", "The sample mean x̄"),
    checkFinite(mu0, "mu0", "The hypothesized mean μ₀"),
    checkSigma(sigma, "sigma", "The population standard deviation σ"),
    checkSampleSize(n, "n", "The sample size n"),
    checkAlpha(alpha),
    checkTail(tail),
  ]);
  if (failure) return failure;

  const sqrtN = Math.sqrt(n);
  const standardError = sigma / sqrtN;
  const difference = sampleMean - mu0;
  return decide({
    test: "one-mean",
    tail,
    alpha,
    parameter: "μ",
    nullValue: mu0,
    estimate: sampleMean,
    standardError,
    details: { standardError },
    warnings:
      n < 30
        ? [
            "The sample is small (n < 30). The z-test is valid only if the population is normally distributed.",
          ]
        : [],
    setupSteps: [
      {
        id: "standard-error",
        title: "Standard error of the mean",
        formula: "σ_x̄ = σ / √n",
        substitution: [
          "σ_x̄ = ",
          exact(sigma),
          " / √",
          exact(n),
          " = ",
          exact(sigma),
          " / ",
          v(sqrtN),
          " = ",
          v(standardError),
        ],
        result: standardError,
        explanation: "How much the sample mean is expected to vary from sample to sample.",
      },
    ],
    zStep: {
      id: "z",
      title: "Test statistic z",
      formula: "z = (x̄ − μ₀) / σ_x̄",
      substitution: [
        "z = (",
        exact(sampleMean),
        " − ",
        exact(mu0),
        ") / ",
        v(standardError),
        " = ",
        v(difference),
        " / ",
        v(standardError),
        " = ",
        v(difference / standardError),
      ],
      result: null,
      explanation: "How many standard errors the sample mean lies from the hypothesized mean.",
    },
  });
}

/**
 * One-sample z-test for a proportion.
 * z = (p̂ − p₀) / √(p₀(1 − p₀) / n)
 *
 * Give either `successes` (a whole number from 0 to n) or `sampleProportion`.
 *
 * @param {{ successes?: number, sampleProportion?: number, n: number, p0: number, alpha: number, tail: Tail }} input
 * @returns {import('./result.js').Result<ZTestResult>}
 */
export function oneProportionZTest({ successes, sampleProportion, n, p0, alpha, tail }) {
  const failure = firstFailure([
    checkSampleSize(n, "n", "The sample size n"),
    successes !== undefined
      ? checkSuccesses(successes, n, "successes", "The number of successes x")
      : checkClosedProbability(sampleProportion, "sampleProportion", "The sample proportion p̂"),
    checkOpenProbability(p0, "p0", "The hypothesized proportion p₀"),
    checkAlpha(alpha),
    checkTail(tail),
  ]);
  if (failure) return failure;

  const pHat = successes !== undefined ? successes / n : /** @type {number} */ (sampleProportion);
  const variance = (p0 * (1 - p0)) / n;
  const standardError = Math.sqrt(variance);
  const difference = pHat - p0;
  /** @type {string[]} */
  const warnings = [];
  if (n * p0 < 10 || n * (1 - p0) < 10) {
    warnings.push(
      `np₀ = ${round6(n * p0)} and n(1 − p₀) = ${round6(n * (1 - p0))} should both be at least 10 for the normal approximation to be accurate.`,
    );
  }

  /** @type {Step[]} */
  const setupSteps = [];
  if (successes !== undefined) {
    setupSteps.push({
      id: "p-hat",
      title: "Sample proportion",
      formula: "p̂ = x / n",
      substitution: ["p̂ = ", exact(successes), " / ", exact(n), " = ", v(pHat)],
      result: pHat,
      explanation: "The proportion of successes observed in the sample.",
    });
  }
  setupSteps.push({
    id: "standard-error",
    title: "Standard error of the proportion",
    formula: "σ_p̂ = √[p₀(1 − p₀) / n]",
    substitution: [
      "σ_p̂ = √[",
      exact(p0),
      "(1 − ",
      exact(p0),
      ") / ",
      exact(n),
      "] = √",
      v(variance),
      " = ",
      v(standardError),
    ],
    result: standardError,
    explanation: "Uses p₀ (not p̂) because the test assumes H₀ is true.",
  });

  return decide({
    test: "one-proportion",
    tail,
    alpha,
    parameter: "p",
    nullValue: p0,
    estimate: pHat,
    standardError,
    details: { sampleProportion: pHat, standardError },
    warnings,
    setupSteps,
    zStep: {
      id: "z",
      title: "Test statistic z",
      formula: "z = (p̂ − p₀) / σ_p̂",
      substitution: [
        "z = (",
        v(pHat),
        " − ",
        exact(p0),
        ") / ",
        v(standardError),
        " = ",
        v(difference),
        " / ",
        v(standardError),
        " = ",
        v(difference / standardError),
      ],
      result: null,
      explanation:
        "How many standard errors the sample proportion lies from the hypothesized proportion.",
    },
  });
}

/**
 * Two-sample z-test for the difference of means (both population σ known).
 * z = [(x̄₁ − x̄₂) − D₀] / √(σ₁²/n₁ + σ₂²/n₂)
 *
 * @param {{ mean1: number, sigma1: number, n1: number, mean2: number, sigma2: number, n2: number, delta0?: number, alpha: number, tail: Tail }} input
 * @returns {import('./result.js').Result<ZTestResult>}
 */
export function twoMeansZTest({ mean1, sigma1, n1, mean2, sigma2, n2, delta0 = 0, alpha, tail }) {
  const failure = firstFailure([
    checkFinite(mean1, "mean1", "The mean of sample 1 (x̄₁)"),
    checkSigma(sigma1, "sigma1", "σ₁"),
    checkSampleSize(n1, "n1", "n₁"),
    checkFinite(mean2, "mean2", "The mean of sample 2 (x̄₂)"),
    checkSigma(sigma2, "sigma2", "σ₂"),
    checkSampleSize(n2, "n2", "n₂"),
    checkFinite(delta0, "delta0", "The hypothesized difference D₀"),
    checkAlpha(alpha),
    checkTail(tail),
  ]);
  if (failure) return failure;

  const var1 = (sigma1 * sigma1) / n1;
  const var2 = (sigma2 * sigma2) / n2;
  const standardError = Math.sqrt(var1 + var2);
  const estimate = mean1 - mean2;
  const difference = estimate - delta0;

  return decide({
    test: "two-means",
    tail,
    alpha,
    parameter: "μ₁ − μ₂",
    nullValue: delta0,
    estimate,
    standardError,
    details: { difference: estimate, standardError },
    warnings:
      n1 < 30 || n2 < 30
        ? [
            "At least one sample is small (n < 30). The z-test is valid only if both populations are normally distributed.",
          ]
        : [],
    setupSteps: [
      {
        id: "difference",
        title: "Difference of sample means",
        formula: "x̄₁ − x̄₂",
        substitution: [exact(mean1), " − ", exact(mean2), " = ", v(estimate)],
        result: estimate,
        explanation: "The observed difference between the two sample means.",
      },
      {
        id: "standard-error",
        title: "Standard error of the difference",
        formula: "σ_(x̄₁−x̄₂) = √(σ₁²/n₁ + σ₂²/n₂)",
        substitution: [
          "√(",
          exact(sigma1),
          "²/",
          exact(n1),
          " + ",
          exact(sigma2),
          "²/",
          exact(n2),
          ") = √(",
          v(var1),
          " + ",
          v(var2),
          ") = ",
          v(standardError),
        ],
        result: standardError,
        explanation: "Combines the variability of both sample means.",
      },
    ],
    zStep: {
      id: "z",
      title: "Test statistic z",
      formula: "z = [(x̄₁ − x̄₂) − D₀] / σ_(x̄₁−x̄₂)",
      substitution: [
        "z = (",
        v(estimate),
        " − ",
        exact(delta0),
        ") / ",
        v(standardError),
        " = ",
        v(difference),
        " / ",
        v(standardError),
        " = ",
        v(difference / standardError),
      ],
      result: null,
      explanation:
        "How many standard errors the observed difference lies from the hypothesized difference D₀.",
    },
  });
}

/**
 * Two-sample z-test for the difference of proportions (pooled, H₀: p₁ = p₂).
 * z = (p̂₁ − p̂₂) / √[p̄(1 − p̄)(1/n₁ + 1/n₂)],  p̄ = (x₁ + x₂) / (n₁ + n₂)
 *
 * Give either `x1`/`x2` (successes) or `p1`/`p2` (sample proportions).
 *
 * @param {{ x1?: number, n1: number, x2?: number, n2: number, p1?: number, p2?: number, alpha: number, tail: Tail }} input
 * @returns {import('./result.js').Result<ZTestResult>}
 */
export function twoProportionsZTest({ x1, n1, x2, n2, p1, p2, alpha, tail }) {
  const useCounts = x1 !== undefined || x2 !== undefined;
  const failure = firstFailure([
    checkSampleSize(n1, "n1", "n₁"),
    checkSampleSize(n2, "n2", "n₂"),
    useCounts ? checkSuccesses(x1, n1, "x1", "x₁") : checkClosedProbability(p1, "p1", "p̂₁"),
    useCounts ? checkSuccesses(x2, n2, "x2", "x₂") : checkClosedProbability(p2, "p2", "p̂₂"),
    checkAlpha(alpha),
    checkTail(tail),
  ]);
  if (failure) return failure;

  const successes1 = useCounts ? /** @type {number} */ (x1) : /** @type {number} */ (p1) * n1;
  const successes2 = useCounts ? /** @type {number} */ (x2) : /** @type {number} */ (p2) * n2;
  const pHat1 = useCounts ? successes1 / n1 : /** @type {number} */ (p1);
  const pHat2 = useCounts ? successes2 / n2 : /** @type {number} */ (p2);
  const pooled = (successes1 + successes2) / (n1 + n2);
  const inverseSum = 1 / n1 + 1 / n2;
  const standardError = Math.sqrt(pooled * (1 - pooled) * inverseSum);
  const estimate = pHat1 - pHat2;

  /** @type {string[]} */
  const warnings = [];
  if ([successes1, n1 - successes1, successes2, n2 - successes2].some((count) => count < 10)) {
    warnings.push(
      "Each sample should have at least 10 successes and 10 failures for the normal approximation to be accurate.",
    );
  }

  /** @type {Step[]} */
  const setupSteps = [];
  if (useCounts) {
    setupSteps.push({
      id: "p-hats",
      title: "Sample proportions",
      formula: "p̂₁ = x₁ / n₁,  p̂₂ = x₂ / n₂",
      substitution: [
        "p̂₁ = ",
        exact(successes1),
        " / ",
        exact(n1),
        " = ",
        v(pHat1),
        ",  p̂₂ = ",
        exact(successes2),
        " / ",
        exact(n2),
        " = ",
        v(pHat2),
      ],
      result: null,
      explanation: "The proportion of successes in each sample.",
    });
  }
  setupSteps.push(
    {
      id: "pooled",
      title: "Pooled proportion",
      formula: "p̄ = (x₁ + x₂) / (n₁ + n₂)",
      substitution: [
        "p̄ = (",
        useCounts ? exact(successes1) : v(successes1),
        " + ",
        useCounts ? exact(successes2) : v(successes2),
        ") / (",
        exact(n1),
        " + ",
        exact(n2),
        ") = ",
        v(pooled),
      ],
      result: pooled,
      explanation:
        "Under H₀ both populations share one proportion, so both samples are combined to estimate it.",
    },
    {
      id: "standard-error",
      title: "Standard error of the difference",
      formula: "σ_(p̂₁−p̂₂) = √[p̄(1 − p̄)(1/n₁ + 1/n₂)]",
      substitution: [
        "√[",
        v(pooled),
        "(1 − ",
        v(pooled),
        ")(1/",
        exact(n1),
        " + 1/",
        exact(n2),
        ")] = ",
        v(standardError),
      ],
      result: standardError,
      explanation: "The expected variability of p̂₁ − p̂₂ if H₀ is true.",
    },
  );

  return decide({
    test: "two-proportions",
    tail,
    alpha,
    parameter: "p₁ − p₂",
    nullValue: 0,
    estimate,
    standardError,
    details: {
      sampleProportion1: pHat1,
      sampleProportion2: pHat2,
      pooledProportion: pooled,
      standardError,
    },
    warnings,
    setupSteps,
    zStep: {
      id: "z",
      title: "Test statistic z",
      formula: "z = (p̂₁ − p̂₂) / σ_(p̂₁−p̂₂)",
      substitution: [
        "z = (",
        v(pHat1),
        " − ",
        v(pHat2),
        ") / ",
        v(standardError),
        " = ",
        v(estimate),
        " / ",
        v(standardError),
        " = ",
        v(estimate / standardError),
      ],
      result: null,
      explanation: "How many standard errors apart the two sample proportions are.",
    },
  });
}

/**
 * @param {unknown} successes
 * @param {number} n
 * @param {string} field
 * @param {string} label
 */
function checkSuccesses(successes, n, field, label) {
  return Number.isSafeInteger(successes) &&
    /** @type {number} */ (successes) >= 0 &&
    /** @type {number} */ (successes) <= n
    ? null
    : fail("SUCCESSES_OUT_OF_RANGE", `${label} must be a whole number from 0 to ${n}.`, field);
}

/** @param {number} value */
function round6(value) {
  return Math.round(value * 1e6) / 1e6;
}
