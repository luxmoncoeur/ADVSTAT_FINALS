// @ts-check
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { criticalZ, inverseNormalCdf, normalCdf, normalPdf, normalSf, pValue } from "../normal.js";
import { linearRegression } from "../regression.js";
import { compensatedSum } from "../summation.js";
import { oneMeanZTest } from "../ztest.js";

const value = fc.double({ min: -1e4, max: 1e4, noNaN: true, noDefaultInfinity: true });
const dataset = fc
  .integer({ min: 3, max: 40 })
  .chain((n) =>
    fc.tuple(
      fc.array(value, { minLength: n, maxLength: n }),
      fc.array(value, { minLength: n, maxLength: n }),
    ),
  )
  .filter(([xs, ys]) => new Set(xs).size > 1 && new Set(ys).size > 1);

// Realistic data as a student would type it: up to two decimal places.
const typed = fc.integer({ min: -1e6, max: 1e6 }).map((i) => i / 100);
const typedDataset = fc
  .integer({ min: 3, max: 40 })
  .chain((n) =>
    fc.tuple(
      fc.array(typed, { minLength: n, maxLength: n }),
      fc.array(typed, { minLength: n, maxLength: n }),
    ),
  )
  .filter(([xs, ys]) => new Set(xs).size > 1 && new Set(ys).size > 1);

describe("regression properties", () => {
  it("r is always within [−1, 1] and r² within [0, 1]", () => {
    fc.assert(
      fc.property(dataset, ([xs, ys]) => {
        const result = linearRegression(xs, ys);
        if (!result.ok) return true;
        const { r, rSquared } = result.value;
        return (
          r !== null && r >= -1 && r <= 1 && rSquared !== null && rSquared >= 0 && rSquared <= 1
        );
      }),
    );
  });

  it("r is symmetric: r(X, Y) = r(Y, X)", () => {
    fc.assert(
      fc.property(dataset, ([xs, ys]) => {
        const a = linearRegression(xs, ys);
        const b = linearRegression(ys, xs);
        if (!a.ok || !b.ok) return true;
        return (
          Math.abs(/** @type {number} */ (a.value.r) - /** @type {number} */ (b.value.r)) < 1e-9
        );
      }),
    );
  });

  it("r is unchanged by positive linear rescaling of X", () => {
    fc.assert(
      // k·X + c is itself rounded in floating point, so this uses typed data where
      // that rounding is negligible; arbitrary doubles can lose most of their digits.
      fc.property(
        typedDataset,
        fc.constantFrom(0.01, 0.5, 2, 12.5, 100),
        fc.integer({ min: -1000, max: 1000 }),
        ([xs, ys], k, c) => {
          const a = linearRegression(xs, ys);
          const b = linearRegression(
            xs.map((x) => k * x + c),
            ys,
          );
          if (!a.ok || !b.ok) return true;
          return (
            Math.abs(/** @type {number} */ (a.value.r) - /** @type {number} */ (b.value.r)) < 1e-7
          );
        },
      ),
    );
  });

  it("the slope has the same sign as r, and the line passes through (X̄, Ȳ)", () => {
    fc.assert(
      fc.property(dataset, ([xs, ys]) => {
        const result = linearRegression(xs, ys);
        if (!result.ok) return true;
        const { slope, r, intercept, meanX, meanY } = result.value;
        // A slope below the smallest double (~5e-324) underflows to 0; that can only
        // happen when every Y is itself within a few ulps of 0.
        const underflow = slope === 0 && Math.max(...ys.map(Math.abs)) < 1e-300;
        const sameSign =
          Math.abs(/** @type {number} */ (r)) < 1e-12 ||
          Math.sign(slope) === Math.sign(/** @type {number} */ (r)) ||
          underflow;
        const throughMeans =
          Math.abs(intercept + slope * meanX - meanY) <=
          1e-9 * (1 + Math.abs(meanY) + Math.abs(slope * meanX));
        return sameSign && throughMeans;
      }),
    );
  });

  it("residuals sum to zero", () => {
    fc.assert(
      fc.property(dataset, ([xs, ys]) => {
        const result = linearRegression(xs, ys);
        if (!result.ok) return true;
        const scale = 1 + Math.max(...ys.map(Math.abs));
        return (
          Math.abs(compensatedSum(result.value.rows.map((row) => row.residual))) <
          1e-9 * scale * xs.length
        );
      }),
    );
  });
});

describe("normal distribution properties", () => {
  const z = fc.double({ min: -8, max: 8, noNaN: true });

  it("is symmetric: Φ(−z) = 1 − Φ(z) and φ(−z) = φ(z)", () => {
    fc.assert(
      fc.property(
        z,
        (t) =>
          normalCdf(-t) === normalSf(t) &&
          normalPdf(-t) === normalPdf(t) &&
          Math.abs(normalCdf(t) + normalSf(t) - 1) < 1e-15,
      ),
    );
  });

  it("Φ is non-decreasing", () => {
    fc.assert(
      fc.property(z, z, (a, b) =>
        a <= b ? normalCdf(a) <= normalCdf(b) : normalCdf(a) >= normalCdf(b),
      ),
    );
  });

  it("Φ(Φ⁻¹(p)) ≈ p", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1e-12, max: 1 - 1e-12, noNaN: true }),
        (p) => Math.abs(normalCdf(inverseNormalCdf(p)) - p) <= 1e-14 * Math.max(p, 1e-3),
      ),
    );
  });

  it("two-tailed critical values are symmetric and wider than one-tailed", () => {
    fc.assert(
      fc.property(fc.double({ min: 1e-6, max: 0.999, noNaN: true }), (alpha) => {
        const two = criticalZ(alpha, "two");
        const right = criticalZ(alpha, "right");
        return (
          two.lower === -(/** @type {number} */ (two.upper)) &&
          /** @type {number} */ (two.upper) > /** @type {number} */ (right.upper)
        );
      }),
    );
  });

  it("p-values are in [0, 1] and the two-tailed p-value doubles the smaller tail", () => {
    fc.assert(
      fc.property(z, (t) => {
        const two = pValue(t, "two");
        return (
          two >= 0 &&
          two <= 1 &&
          Math.abs(two - Math.min(1, 2 * Math.min(pValue(t, "left"), pValue(t, "right")))) < 1e-15
        );
      }),
    );
  });
});

describe("z-test decision properties", () => {
  it("the critical-value rule agrees with the p-value rule away from the boundary", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -100, max: 100, noNaN: true }),
        fc.double({ min: 0.1, max: 50, noNaN: true }),
        fc.integer({ min: 1, max: 500 }),
        fc.constantFrom(0.1, 0.05, 0.01),
        fc.constantFrom("left", "right", "two"),
        (sampleMean, sigma, n, alpha, tail) => {
          const result = oneMeanZTest({
            sampleMean,
            mu0: 0,
            sigma,
            n,
            alpha,
            tail: /** @type {any} */ (tail),
          });
          if (!result.ok) return false;
          if (Math.abs(result.value.pValue - alpha) < 1e-12) return true;
          return result.value.reject === result.value.rejectByPValue;
        },
      ),
    );
  });
});

describe("compensatedSum", () => {
  it("is exact where naive summation loses digits", () => {
    expect(compensatedSum([1, 1e100, 1, -1e100])).toBe(2);
    expect(compensatedSum([0.1, 0.2, 0.3])).toBe(0.6);
  });
});
