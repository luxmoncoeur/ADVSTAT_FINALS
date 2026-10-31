// @ts-check
import { describe, expect, it } from "vitest";
import {
  criticalZ,
  erfc,
  inverseNormalCdf,
  normalCdf,
  normalPdf,
  normalSf,
  pValue,
} from "../normal.js";
import fixtures from "./fixtures/normal.json";
import { expectRelClose } from "./helpers.js";

/**
 * Tolerances are the measured worst case against SciPy, rounded up. The error
 * grows in the far tails only because z/√2 is rounded before erfc is applied
 * (relative error ≈ z²·2⁻⁵³), which no double-precision method can avoid.
 * @param {number} z
 */
const cdfTolerance = (z) => (Math.abs(z) < 5 ? 5e-15 : Math.abs(z) < 20 ? 5e-14 : 2e-13);

describe("normalCdf / normalSf / normalPdf vs SciPy", () => {
  it.each(fixtures.cdf)("z = %d", (z, cdf, sf, pdf) => {
    if (cdf > 1e-300) expectRelClose(normalCdf(z), cdf, cdfTolerance(z), "cdf");
    if (sf > 1e-300) expectRelClose(normalSf(z), sf, cdfTolerance(z), "sf");
    if (pdf > 1e-300) expectRelClose(normalPdf(z), pdf, 1e-15, "pdf");
  });

  it("handles the centre, infinities and NaN", () => {
    expect(normalCdf(0)).toBe(0.5);
    expect(normalSf(0)).toBe(0.5);
    expect(normalCdf(Infinity)).toBe(1);
    expect(normalCdf(-Infinity)).toBe(0);
    expect(normalSf(Infinity)).toBe(0);
    expect(Number.isNaN(normalCdf(Number.NaN))).toBe(true);
    expect(erfc(0)).toBe(1);
    expect(erfc(1e-20)).toBe(1);
  });
});

describe("inverseNormalCdf vs SciPy", () => {
  it.each(fixtures.ppf)("p = %d", (p, q) => {
    expectRelClose(inverseNormalCdf(p), q, 2e-15, "ppf");
  });

  it("returns ±∞ at the ends and NaN outside [0, 1]", () => {
    expect(inverseNormalCdf(0)).toBe(-Infinity);
    expect(inverseNormalCdf(1)).toBe(Infinity);
    expect(inverseNormalCdf(0.5)).toBe(0);
    expect(Number.isNaN(inverseNormalCdf(-0.1))).toBe(true);
    expect(Number.isNaN(inverseNormalCdf(1.1))).toBe(true);
    expect(Number.isNaN(inverseNormalCdf(Number.NaN))).toBe(true);
  });
});

describe("criticalZ", () => {
  it("matches the textbook z-table values", () => {
    expect(criticalZ(0.05, "two").upper).toBeCloseTo(1.959963985, 9);
    expect(criticalZ(0.05, "two").lower).toBeCloseTo(-1.959963985, 9);
    expect(criticalZ(0.05, "right").upper).toBeCloseTo(1.644853627, 9);
    expect(criticalZ(0.05, "left").lower).toBeCloseTo(-1.644853627, 9);
    expect(criticalZ(0.01, "two").upper).toBeCloseTo(2.575829304, 9);
    expect(criticalZ(0.01, "right").upper).toBeCloseTo(2.326347874, 9);
    expect(criticalZ(0.1, "two").upper).toBeCloseTo(1.644853627, 9);
    expect(criticalZ(0.1, "right").upper).toBeCloseTo(1.281551566, 9);
  });

  it.each(fixtures.critical)(
    "α = $alpha, $tail-tailed matches SciPy",
    ({ alpha, tail, lower, upper }) => {
      const result = criticalZ(alpha, /** @type {'two'|'left'|'right'} */ (tail));
      if (lower === null) expect(result.lower).toBeNull();
      else expectRelClose(/** @type {number} */ (result.lower), lower, 2e-15);
      if (upper === null) expect(result.upper).toBeNull();
      else expectRelClose(/** @type {number} */ (result.upper), upper, 2e-15);
    },
  );

  it("rejects invalid α and tails", () => {
    expect(() => criticalZ(0, "two")).toThrow(RangeError);
    expect(() => criticalZ(1, "two")).toThrow(RangeError);
    expect(() => criticalZ(Number.NaN, "two")).toThrow(RangeError);
    expect(() => criticalZ(0.05, /** @type {any} */ ("both"))).toThrow(RangeError);
  });
});

describe("pValue", () => {
  it("computes left, right and two-tailed areas", () => {
    expect(pValue(1.959963984540054, "two")).toBeCloseTo(0.05, 14);
    expect(pValue(-1.959963984540054, "two")).toBeCloseTo(0.05, 14);
    expect(pValue(1.644853626951473, "right")).toBeCloseTo(0.05, 14);
    expect(pValue(-1.644853626951473, "left")).toBeCloseTo(0.05, 14);
    expect(pValue(0, "two")).toBe(1);
    expect(pValue(2, "two")).toBeCloseTo(0.04550026389635842, 15);
  });

  it("keeps full precision for tiny tail areas", () => {
    expectRelClose(pValue(10, "right"), 7.619853024160527e-24, 1e-13);
    expectRelClose(pValue(-10, "two"), 1.5239706048321054e-23, 1e-13);
  });

  it("rejects unknown tails", () => {
    expect(() => pValue(1, /** @type {any} */ ("up"))).toThrow(RangeError);
  });
});
