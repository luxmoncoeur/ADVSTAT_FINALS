// @ts-check
import { fail, ok } from "./result.js";
import { compensatedSum } from "./summation.js";
import { isFiniteNumber } from "./validation.js";

/**
 * A value inside a substitution: either literal text or a number the UI formats.
 * @typedef {string | { value: number }} Token
 */

/**
 * One line of the worked solution.
 * @typedef {object} Step
 * @property {string} id
 * @property {string} title
 * @property {string} formula        Symbolic formula, e.g. "X̄ = ΣX / n".
 * @property {Token[]} substitution  The formula with the actual values plugged in.
 * @property {number | null} result
 * @property {string} explanation    What the step means, in plain language.
 */

/**
 * @typedef {'Perfect' | 'Very strong' | 'Strong' | 'Moderate' | 'Weak' | 'Very weak' | 'None'} Strength
 * @typedef {'positive' | 'negative' | 'none'} Direction
 */

/**
 * @typedef {object} RegressionRow
 * @property {number} x
 * @property {number} y
 * @property {number} xy
 * @property {number} x2
 * @property {number} y2
 * @property {number} predicted  Ŷ = a + bX for this X.
 * @property {number} residual   Y − Ŷ.
 */

/**
 * @typedef {object} RegressionResult
 * @property {number} n
 * @property {number} sumX
 * @property {number} sumY
 * @property {number} sumXY
 * @property {number} sumX2
 * @property {number} sumY2
 * @property {number} meanX
 * @property {number} meanY
 * @property {number} sxx  Σ(X − X̄)²
 * @property {number} syy  Σ(Y − Ȳ)²
 * @property {number} sxy  Σ(X − X̄)(Y − Ȳ)
 * @property {number} slope      b
 * @property {number} intercept  a
 * @property {number | null} r   null when every Y is identical (r is undefined).
 * @property {number | null} rSquared
 * @property {Strength | null} strength
 * @property {Direction} direction
 * @property {number} sse  Sum of squared residuals Σ(Y − Ŷ)².
 * @property {number | null} standardError  √(SSE / (n − 2)); null when n = 2.
 * @property {number} minX
 * @property {number} maxX
 * @property {RegressionRow[]} rows
 * @property {Step[]} steps
 * @property {string[]} warnings
 */

export const MAX_POINTS = 10000;

/**
 * Interpretation scale for |r| (Evans, 1996). Classification uses |r| rounded
 * to 12 decimal places so floating-point noise (0.7999999999999999) cannot push
 * a boundary value into the wrong band.
 */
export const STRENGTH_SCALE = /** @type {const} */ ([
  { label: "Perfect", range: "|r| = 1" },
  { label: "Very strong", range: "0.80 ≤ |r| < 1" },
  { label: "Strong", range: "0.60 ≤ |r| < 0.80" },
  { label: "Moderate", range: "0.40 ≤ |r| < 0.60" },
  { label: "Weak", range: "0.20 ≤ |r| < 0.40" },
  { label: "Very weak", range: "0 < |r| < 0.20" },
  { label: "None", range: "r = 0" },
]);

/**
 * @param {number} value
 */
function roundTo12(value) {
  return Math.round(value * 1e12) / 1e12;
}

/**
 * @param {number} r
 * @returns {{ strength: Strength, direction: Direction }}
 */
export function classifyCorrelation(r) {
  const magnitude = roundTo12(Math.abs(r));
  const direction = magnitude === 0 ? "none" : r > 0 ? "positive" : "negative";
  /** @type {Strength} */
  let strength;
  if (magnitude === 1) strength = "Perfect";
  else if (magnitude >= 0.8) strength = "Very strong";
  else if (magnitude >= 0.6) strength = "Strong";
  else if (magnitude >= 0.4) strength = "Moderate";
  else if (magnitude >= 0.2) strength = "Weak";
  else if (magnitude > 0) strength = "Very weak";
  else strength = "None";
  return { strength, direction };
}

/**
 * @param {readonly number[]} values
 */
function allEqual(values) {
  return values.every((v) => v === values[0]);
}

/** @param {number} value @returns {{ value: number }} */
const v = (value) => ({ value });

/**
 * Simple linear regression of Y on X by least squares, with Pearson's r.
 *
 * Results are computed from centred sums (two-pass), which are numerically
 * stable even for data with a large offset; the textbook raw-sum formulas are
 * reproduced in `steps` for the worked solution. Because
 * nΣXY − ΣXΣY = n·Sxy and nΣX² − (ΣX)² = n·Sxx exactly, both routes give the
 * same answer.
 *
 * @param {readonly number[]} xs
 * @param {readonly number[]} ys
 * @returns {import('./result.js').Result<RegressionResult>}
 */
export function linearRegression(xs, ys) {
  if (xs.length !== ys.length) {
    return fail(
      "LENGTH_MISMATCH",
      `X has ${xs.length} values but Y has ${ys.length}. Every X needs a matching Y.`,
    );
  }
  const n = xs.length;
  if (n === 0) return fail("EMPTY", "Enter at least two (X, Y) data points.");
  if (n < 2) return fail("N_TOO_SMALL", "At least two data points are needed to fit a line.");
  if (n > MAX_POINTS)
    return fail(
      "TOO_MANY_POINTS",
      `Use at most ${MAX_POINTS.toLocaleString("en-US")} data points.`,
    );
  for (let i = 0; i < n; i += 1) {
    if (!isFiniteNumber(xs[i]) || !isFiniteNumber(ys[i])) {
      return fail("NON_FINITE", `Row ${i + 1} contains a value that is not a valid number.`);
    }
  }
  if (allEqual(xs)) {
    return fail(
      "ZERO_VARIANCE_X",
      "All X values are the same, so the line would be vertical and the slope b is undefined. Enter at least two different X values.",
    );
  }

  const sumX = compensatedSum(xs);
  const sumY = compensatedSum(ys);
  const meanX = sumX / n;
  const meanY = sumY / n;
  const constantY = allEqual(ys);

  // Deviations are divided by their largest magnitude before squaring, so the
  // sums of squares can neither overflow nor underflow; r is scale-invariant and
  // b only needs the ratio of the two scales.
  const dx = xs.map((x) => x - meanX);
  const dy = ys.map((y) => y - meanY);
  const scaleX = Math.max(...dx.map(Math.abs));
  const scaleY = constantY ? 0 : Math.max(...dy.map(Math.abs));
  const ux = dx.map((d) => d / scaleX);
  const uy = constantY ? [] : dy.map((d) => d / scaleY);
  const uxx = compensatedSum(ux.map((u) => u * u));
  const uyy = constantY ? 0 : compensatedSum(uy.map((u) => u * u));
  const uxy = constantY ? 0 : compensatedSum(ux.map((u, i) => u * uy[i]));

  const sxx = scaleX * scaleX * uxx;
  const syy = scaleY * scaleY * uyy;
  const sxy = scaleX * scaleY * uxy;
  const slope = ((uxy / uxx) * scaleY) / scaleX;
  const intercept = meanY - slope * meanX;
  const sumXY = compensatedSum(xs.map((x, i) => x * ys[i]));
  const sumX2 = compensatedSum(xs.map((x) => x * x));
  const sumY2 = compensatedSum(ys.map((y) => y * y));

  if (![sxx, syy, sxy, slope, intercept, sumXY, sumX2, sumY2].every(Number.isFinite)) {
    return fail(
      "NON_FINITE",
      "The values are too large to compute reliably. Try rescaling the data (for example, use thousands instead of units).",
    );
  }

  // With two distinct points the line fits exactly, so r is exactly ±1.
  const r = constantY
    ? null
    : n === 2
      ? Math.sign(uxy)
      : Math.max(-1, Math.min(1, uxy / (Math.sqrt(uxx) * Math.sqrt(uyy))));
  const rSquared = r === null ? null : r * r;
  const { strength, direction } =
    r === null
      ? { strength: null, direction: /** @type {Direction} */ ("none") }
      : classifyCorrelation(r);

  const rows = xs.map((x, i) => {
    const y = ys[i];
    const predicted = intercept + slope * x;
    return { x, y, xy: x * y, x2: x * x, y2: y * y, predicted, residual: y - predicted };
  });
  const sse = compensatedSum(rows.map((row) => row.residual * row.residual));
  const standardError = n > 2 ? Math.sqrt(sse / (n - 2)) : null;

  /** @type {string[]} */
  const warnings = [];
  if (n === 2)
    warnings.push(
      "With only two points the line passes through both exactly, so r is always ±1. Add more data for a meaningful correlation.",
    );
  if (constantY)
    warnings.push(
      "All Y values are the same, so the line is flat (b = 0) and the correlation coefficient r is undefined.",
    );

  const numerator = n * sxy; // = nΣXY − (ΣX)(ΣY)
  const denomX = n * sxx; // = nΣX² − (ΣX)²
  const denomY = n * syy; // = nΣY² − (ΣY)²

  /** @type {Step[]} */
  const steps = [
    {
      id: "mean-x",
      title: "Mean of X",
      formula: "X̄ = ΣX / n",
      substitution: ["X̄ = ", v(sumX), " / ", v(n), " = ", v(meanX)],
      result: meanX,
      explanation:
        "The average of the X values. The regression line always passes through the point (X̄, Ȳ).",
    },
    {
      id: "mean-y",
      title: "Mean of Y",
      formula: "Ȳ = ΣY / n",
      substitution: ["Ȳ = ", v(sumY), " / ", v(n), " = ", v(meanY)],
      result: meanY,
      explanation: "The average of the Y values.",
    },
    {
      id: "slope",
      title: "Slope (b)",
      formula: "b = [nΣXY − (ΣX)(ΣY)] / [nΣX² − (ΣX)²]",
      substitution: [
        "b = [",
        v(n),
        "(",
        v(sumXY),
        ") − (",
        v(sumX),
        ")(",
        v(sumY),
        ")] / [",
        v(n),
        "(",
        v(sumX2),
        ") − (",
        v(sumX),
        ")²]",
        " = ",
        v(numerator),
        " / ",
        v(denomX),
        " = ",
        v(slope),
      ],
      result: slope,
      explanation: `For every 1-unit increase in X, the predicted Y ${slope >= 0 ? "increases" : "decreases"} by |b| units.`,
    },
    {
      id: "intercept",
      title: "Y-intercept (a)",
      formula: "a = Ȳ − bX̄",
      substitution: ["a = ", v(meanY), " − (", v(slope), ")(", v(meanX), ") = ", v(intercept)],
      result: intercept,
      explanation: "The predicted value of Y when X = 0.",
    },
    {
      id: "equation",
      title: "Regression equation",
      formula: "Ŷ = a + bX",
      substitution: ["Ŷ = ", v(intercept), " + ", v(slope), "X"],
      result: null,
      explanation:
        "Use this equation to predict Y for a given X. Predictions are most reliable within the range of the observed X values.",
    },
  ];

  if (r !== null && rSquared !== null) {
    steps.push(
      {
        id: "r",
        title: "Correlation coefficient (r)",
        formula: "r = [nΣXY − (ΣX)(ΣY)] / √{[nΣX² − (ΣX)²][nΣY² − (ΣY)²]}",
        substitution: [
          "r = ",
          v(numerator),
          " / √[(",
          v(denomX),
          ")(",
          v(denomY),
          ")]",
          " = ",
          v(numerator),
          " / ",
          v(Math.sqrt(denomX) * Math.sqrt(denomY)),
          " = ",
          v(r),
        ],
        result: r,
        explanation: `r measures how closely the points follow a straight line, from −1 to +1. Here the relationship is ${strength === "None" ? "absent" : `${(strength ?? "").toLowerCase()} and ${direction}`}.`,
      },
      {
        id: "r-squared",
        title: "Coefficient of determination (r²)",
        formula: "r² = (r)²",
        substitution: ["r² = (", v(r), ")² = ", v(rSquared)],
        result: rSquared,
        explanation:
          "The proportion of the variation in Y that is explained by its linear relationship with X (multiply by 100 for a percentage).",
      },
    );
  }

  return ok({
    n,
    sumX,
    sumY,
    sumXY,
    sumX2,
    sumY2,
    meanX,
    meanY,
    sxx,
    syy,
    sxy,
    slope,
    intercept,
    r,
    rSquared,
    strength,
    direction,
    sse,
    standardError,
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    rows,
    steps,
    warnings,
  });
}

/**
 * Predict Y for a given X using the fitted line.
 * @param {Pick<RegressionResult, 'slope' | 'intercept' | 'minX' | 'maxX'>} model
 * @param {number} x
 * @returns {import('./result.js').Result<{ x: number, predicted: number, extrapolated: boolean }>}
 */
export function predict(model, x) {
  if (!isFiniteNumber(x)) return fail("NON_FINITE", "Enter a valid number for X.", "x");
  const predicted = model.intercept + model.slope * x;
  if (!Number.isFinite(predicted))
    return fail("NON_FINITE", "The prediction is too large to compute.", "x");
  return ok({ x, predicted, extrapolated: x < model.minX || x > model.maxX });
}
