// @ts-check
import { describe, expect, it } from "vitest";
import { classifyCorrelation, linearRegression, MAX_POINTS, predict } from "../regression.js";
import fixtures from "./fixtures/regression.json";
import { expectRelClose, unwrap } from "./helpers.js";

describe("linearRegression — hand-worked textbook example", () => {
  // X: 1 2 3 4 5, Y: 2 4 5 4 5
  // n = 5, ΣX = 15, ΣY = 20, ΣXY = 66, ΣX² = 55, ΣY² = 86
  // b = (5·66 − 15·20) / (5·55 − 15²) = 30 / 50 = 0.6
  // a = 4 − 0.6·3 = 2.2
  // r = 30 / √(50 · (5·86 − 20²)) = 30 / √1500 = 0.774596669...
  const result = unwrap(linearRegression([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]));

  it("computes the column sums and means", () => {
    expect(result).toMatchObject({
      n: 5,
      sumX: 15,
      sumY: 20,
      sumXY: 66,
      sumX2: 55,
      sumY2: 86,
      meanX: 3,
      meanY: 4,
    });
  });

  it("computes b, a, r and r²", () => {
    expect(result.slope).toBeCloseTo(0.6, 15);
    expect(result.intercept).toBeCloseTo(2.2, 14);
    expect(result.r).toBeCloseTo(30 / Math.sqrt(1500), 15);
    expect(result.rSquared).toBeCloseTo(0.6, 15);
    expect(result.strength).toBe("Strong");
    expect(result.direction).toBe("positive");
  });

  it("builds the table rows with predictions and residuals", () => {
    expect(result.rows[0]).toMatchObject({ x: 1, y: 2, xy: 2, x2: 1, y2: 4 });
    expect(result.rows[0].predicted).toBeCloseTo(2.8, 14);
    expect(result.rows[0].residual).toBeCloseTo(-0.8, 14);
    expect(result.sse).toBeCloseTo(2.4, 13);
    expect(result.standardError).toBeCloseTo(Math.sqrt(0.8), 14);
  });

  it("shows the textbook numerator and denominator in the slope step", () => {
    const slope = result.steps.find((s) => s.id === "slope");
    const numbers = slope?.substitution
      .filter((t) => typeof t !== "string")
      .map((t) => /** @type {{value:number}} */ (t).value);
    expect(numbers?.slice(-3)).toEqual([30, 50, expect.closeTo(0.6, 15)]);
  });
});

describe("linearRegression vs SciPy linregress", () => {
  it.each(fixtures)("$name", (data) => {
    const result = unwrap(linearRegression(data.x, data.y));
    expect(result.n).toBe(data.n);
    expectRelClose(result.sumX, data.sumX, 1e-15, "ΣX");
    expectRelClose(result.sumY, data.sumY, 1e-15, "ΣY");
    expectRelClose(result.sumXY, data.sumXY, 1e-15, "ΣXY");
    expectRelClose(result.sumX2, data.sumX2, 1e-15, "ΣX²");
    expectRelClose(result.sumY2, data.sumY2, 1e-15, "ΣY²");
    expectRelClose(result.slope, data.slope, 1e-11, "b");
    expectRelClose(result.intercept, data.intercept, 1e-9, "a");
    expectRelClose(/** @type {number} */ (result.r), data.r, 1e-11, "r");
  });
});

describe("linearRegression — special cases", () => {
  it("gives r = ±1 for perfect lines and warns when n = 2", () => {
    expect(unwrap(linearRegression([1, 2, 3], [2, 4, 6])).strength).toBe("Perfect");
    const two = unwrap(linearRegression([3, 8], [4, -6]));
    expect(two.r).toBe(-1);
    expect(two.direction).toBe("negative");
    expect(two.standardError).toBeNull();
    expect(two.warnings[0]).toMatch(/only two points/);
  });

  it("gives a flat line and undefined r when every Y is the same", () => {
    const result = unwrap(linearRegression([1, 2, 3, 4], [7, 7, 7, 7]));
    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(7);
    expect(result.r).toBeNull();
    expect(result.rSquared).toBeNull();
    expect(result.strength).toBeNull();
    expect(result.direction).toBe("none");
    expect(result.steps.some((s) => s.id === "r")).toBe(false);
    expect(result.warnings.join(" ")).toMatch(/undefined/);
  });

  it("is exact for constant data that does not sum exactly (0.1 + 0.1 + 0.1)", () => {
    expect(unwrap(linearRegression([1, 2, 3], [0.1, 0.1, 0.1])).r).toBeNull();
    expect(linearRegression([0.1, 0.1, 0.1], [1, 2, 3]).ok).toBe(false);
  });

  it('reports a zero correlation as "None"', () => {
    const result = unwrap(linearRegression([1, 2, 3, 4, 5], [2, 1, 0, 1, 2]));
    expect(result.r).toBe(0);
    expect(result.strength).toBe("None");
    expect(result.direction).toBe("none");
  });

  it.each([
    [[1, 2], [1], "LENGTH_MISMATCH"],
    [[], [], "EMPTY"],
    [[1], [1], "N_TOO_SMALL"],
    [[2, 2, 2], [1, 2, 3], "ZERO_VARIANCE_X"],
    [[1, Number.NaN], [1, 2], "NON_FINITE"],
    [[1, 2], [1, Infinity], "NON_FINITE"],
    [[1e200, 2e200, 3e200], [1, 2, 3], "NON_FINITE"],
  ])("rejects %j / %j with %s", (xs, ys, code) => {
    const result = linearRegression(xs, ys);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe(code);
  });

  it("rejects more than MAX_POINTS points", () => {
    const xs = Array.from({ length: MAX_POINTS + 1 }, (_, i) => i);
    const result = linearRegression(xs, xs);
    expect(!result.ok && result.error.code).toBe("TOO_MANY_POINTS");
  });

  it("handles the maximum number of points", () => {
    const xs = Array.from({ length: MAX_POINTS }, (_, i) => i);
    const result = unwrap(
      linearRegression(
        xs,
        xs.map((x) => 3 * x + 1),
      ),
    );
    expect(result.slope).toBeCloseTo(3, 12);
    expect(result.intercept).toBeCloseTo(1, 8);
  });
});

describe("classifyCorrelation", () => {
  it.each([
    [1, "Perfect", "positive"],
    [-1, "Perfect", "negative"],
    [0.95, "Very strong", "positive"],
    [0.8, "Very strong", "positive"],
    [0.7999999999999999, "Very strong", "positive"],
    [0.79, "Strong", "positive"],
    [-0.6, "Strong", "negative"],
    [0.59, "Moderate", "positive"],
    [-0.4, "Moderate", "negative"],
    [0.39, "Weak", "positive"],
    [0.2, "Weak", "positive"],
    [0.19, "Very weak", "positive"],
    [-0.001, "Very weak", "negative"],
    [0, "None", "none"],
    [1e-14, "None", "none"],
  ])("r = %d → %s, %s", (r, strength, direction) => {
    expect(classifyCorrelation(r)).toEqual({ strength, direction });
  });
});

describe("predict", () => {
  const model = unwrap(linearRegression([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]));

  it("predicts within the data range", () => {
    const result = unwrap(predict(model, 3.5));
    expect(result.predicted).toBeCloseTo(4.3, 14);
    expect(result.extrapolated).toBe(false);
  });

  it("flags extrapolation outside the observed X range", () => {
    expect(unwrap(predict(model, 10)).extrapolated).toBe(true);
    expect(unwrap(predict(model, 0)).extrapolated).toBe(true);
  });

  it("rejects invalid X", () => {
    expect(predict(model, Number.NaN).ok).toBe(false);
    expect(predict({ slope: 1e300, intercept: 0, minX: 0, maxX: 1 }, 1e300).ok).toBe(false);
  });
});
