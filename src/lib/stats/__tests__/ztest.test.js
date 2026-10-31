// @ts-check
import { describe, expect, it } from "vitest";
import { criticalZ } from "../normal.js";
import { oneMeanZTest, oneProportionZTest, twoMeansZTest, twoProportionsZTest } from "../ztest.js";
import fixtures from "./fixtures/ztest.json";
import { expectRelClose, unwrap } from "./helpers.js";

const RUNNERS = {
  "one-mean": oneMeanZTest,
  "one-proportion": oneProportionZTest,
  "two-means": twoMeansZTest,
  "two-proportions": twoProportionsZTest,
};

describe("z-tests vs SciPy / statsmodels", () => {
  it.each(fixtures)("$test, $tail-tailed, α = $alpha", (fx) => {
    const run =
      /** @type {(input: any) => import('../result.js').Result<import('../ztest.js').ZTestResult>} */ (
        RUNNERS[/** @type {keyof typeof RUNNERS} */ (fx.test)]
      );
    const result = unwrap(run({ ...fx.input, alpha: fx.alpha, tail: fx.tail }));
    expectRelClose(result.z, fx.z, 1e-12, "z");
    expectRelClose(result.pValue, fx.pValue, 1e-11, "p");
    if (fx.critical.lower !== null)
      expectRelClose(/** @type {number} */ (result.critical.lower), fx.critical.lower, 2e-15);
    if (fx.critical.upper !== null)
      expectRelClose(/** @type {number} */ (result.critical.upper), fx.critical.upper, 2e-15);
    // The critical-value rule and the p-value rule must always agree.
    expect(result.reject).toBe(result.rejectByPValue);
    expect(result.reject).toBe(fx.pValue <= fx.alpha);
  });
});

describe("oneMeanZTest — textbook example", () => {
  // n = 36, x̄ = 104, μ₀ = 100, σ = 12 → SE = 12/6 = 2, z = 4/2 = 2
  const input = { sampleMean: 104, mu0: 100, sigma: 12, n: 36 };

  it("rejects H₀ at α = 0.05 (two-tailed)", () => {
    const result = unwrap(oneMeanZTest({ ...input, alpha: 0.05, tail: "two" }));
    expect(result.standardError).toBe(2);
    expect(result.z).toBe(2);
    expect(result.critical.upper).toBeCloseTo(1.959963985, 9);
    expect(result.pValue).toBeCloseTo(0.0455002639, 10);
    expect(result.reject).toBe(true);
    expect(result.hypotheses).toEqual({ null: "μ = 100", alternative: "μ ≠ 100" });
    expect(result.conclusion).toBe(
      "Reject H₀. At α = 0.05, there is sufficient evidence to conclude that μ ≠ 100.",
    );
  });

  it("fails to reject H₀ at α = 0.01 (two-tailed)", () => {
    const result = unwrap(oneMeanZTest({ ...input, alpha: 0.01, tail: "two" }));
    expect(result.reject).toBe(false);
    expect(result.conclusion).toMatch(
      /^Fail to reject H₀\. At α = 0\.01, there is not enough evidence/,
    );
  });

  it("handles right- and left-tailed tests", () => {
    expect(unwrap(oneMeanZTest({ ...input, alpha: 0.05, tail: "right" })).reject).toBe(true);
    const left = unwrap(oneMeanZTest({ ...input, alpha: 0.05, tail: "left" }));
    expect(left.reject).toBe(false);
    expect(left.pValue).toBeCloseTo(0.9772498681, 10);
    expect(left.hypotheses.alternative).toBe("μ < 100");
  });

  it("rejects exactly at the critical value", () => {
    const boundary = /** @type {number} */ (criticalZ(0.05, "right").upper);
    const result = unwrap(
      oneMeanZTest({ sampleMean: boundary, mu0: 0, sigma: 1, n: 1, alpha: 0.05, tail: "right" }),
    );
    expect(result.z).toBe(result.critical.upper);
    expect(result.reject).toBe(true);
  });

  it("lists every solution step in order", () => {
    const result = unwrap(oneMeanZTest({ ...input, alpha: 0.05, tail: "two" }));
    expect(result.steps.map((s) => s.id)).toEqual([
      "hypotheses",
      "critical",
      "standard-error",
      "z",
      "p-value",
      "decision",
    ]);
    expect(result.steps.find((s) => s.id === "z")?.result).toBe(2);
  });

  it("fails cleanly when z overflows", () => {
    const result = oneMeanZTest({
      sampleMean: 1e308,
      mu0: -1e308,
      sigma: 1e-300,
      n: 1,
      alpha: 0.05,
      tail: "two",
    });
    expect(!result.ok && result.error.code).toBe("NON_FINITE");
  });

  it("warns when n < 30", () => {
    expect(
      unwrap(oneMeanZTest({ ...input, n: 25, alpha: 0.05, tail: "two" })).warnings,
    ).toHaveLength(1);
  });

  it.each([
    [{ sampleMean: Number.NaN }, "NON_FINITE", "sampleMean"],
    [{ mu0: Infinity }, "NON_FINITE", "mu0"],
    [{ sigma: 0 }, "SIGMA_NONPOSITIVE", "sigma"],
    [{ sigma: -3 }, "SIGMA_NONPOSITIVE", "sigma"],
    [{ n: 0 }, "N_NOT_POSITIVE_INTEGER", "n"],
    [{ n: 2.5 }, "N_NOT_POSITIVE_INTEGER", "n"],
    [{ alpha: 0 }, "ALPHA_OUT_OF_RANGE", "alpha"],
    [{ alpha: 1 }, "ALPHA_OUT_OF_RANGE", "alpha"],
    [{ tail: "both" }, "INVALID_TAIL", "tail"],
  ])("rejects %j", (override, code, field) => {
    const result = oneMeanZTest(
      /** @type {any} */ ({ ...input, alpha: 0.05, tail: "two", ...override }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatchObject({ code, field });
  });
});

describe("oneProportionZTest", () => {
  // x = 60, n = 100, p₀ = 0.5 → p̂ = 0.6, SE = 0.05, z = 2
  it("computes z from the number of successes", () => {
    const result = unwrap(
      oneProportionZTest({ successes: 60, n: 100, p0: 0.5, alpha: 0.05, tail: "right" }),
    );
    expect(result.details.sampleProportion).toBe(0.6);
    expect(result.standardError).toBe(0.05);
    expect(result.z).toBeCloseTo(2, 13);
    expect(result.reject).toBe(true);
    expect(result.steps.map((s) => s.id)).toContain("p-hat");
  });

  it("accepts a sample proportion directly", () => {
    const result = unwrap(
      oneProportionZTest({ sampleProportion: 0.6, n: 100, p0: 0.5, alpha: 0.05, tail: "two" }),
    );
    expect(result.z).toBeCloseTo(2, 13);
    expect(result.steps.map((s) => s.id)).not.toContain("p-hat");
  });

  it("warns when np₀ or n(1 − p₀) is below 10", () => {
    expect(
      unwrap(oneProportionZTest({ successes: 3, n: 20, p0: 0.1, alpha: 0.05, tail: "two" }))
        .warnings[0],
    ).toMatch(/np₀ = 2/);
  });

  it.each([
    [{ successes: 101 }, "SUCCESSES_OUT_OF_RANGE"],
    [{ successes: -1 }, "SUCCESSES_OUT_OF_RANGE"],
    [{ successes: 2.5 }, "SUCCESSES_OUT_OF_RANGE"],
    [{ p0: 0 }, "PROBABILITY_OUT_OF_RANGE"],
    [{ p0: 1 }, "PROBABILITY_OUT_OF_RANGE"],
    [{ n: -5 }, "N_NOT_POSITIVE_INTEGER"],
  ])("rejects %j", (override, code) => {
    const result = oneProportionZTest({
      successes: 60,
      n: 100,
      p0: 0.5,
      alpha: 0.05,
      tail: "two",
      ...override,
    });
    expect(!result.ok && result.error.code).toBe(code);
  });

  it("rejects a sample proportion outside [0, 1]", () => {
    const result = oneProportionZTest({
      sampleProportion: 1.2,
      n: 100,
      p0: 0.5,
      alpha: 0.05,
      tail: "two",
    });
    expect(!result.ok && result.error.code).toBe("PROBABILITY_OUT_OF_RANGE");
  });
});

describe("twoMeansZTest", () => {
  // x̄₁ = 85, σ₁ = 6, n₁ = 36; x̄₂ = 82, σ₂ = 8, n₂ = 64 → SE = √(1 + 1) = √2, z = 3/√2
  it("computes the two-sample z statistic", () => {
    const result = unwrap(
      twoMeansZTest({
        mean1: 85,
        sigma1: 6,
        n1: 36,
        mean2: 82,
        sigma2: 8,
        n2: 64,
        alpha: 0.05,
        tail: "two",
      }),
    );
    expect(result.estimate).toBe(3);
    expect(result.standardError).toBe(Math.SQRT2);
    expect(result.z).toBeCloseTo(3 / Math.SQRT2, 15);
    expect(result.parameter).toBe("μ₁ − μ₂");
    expect(result.reject).toBe(true);
  });

  it("subtracts a non-zero hypothesized difference D₀", () => {
    const result = unwrap(
      twoMeansZTest({
        mean1: 85,
        sigma1: 6,
        n1: 36,
        mean2: 82,
        sigma2: 8,
        n2: 64,
        delta0: 3,
        alpha: 0.05,
        tail: "right",
      }),
    );
    expect(result.z).toBe(0);
    expect(result.reject).toBe(false);
    expect(result.hypotheses.null).toBe("μ₁ − μ₂ = 3");
  });

  it("rejects an invalid σ₂", () => {
    const result = twoMeansZTest({
      mean1: 1,
      sigma1: 1,
      n1: 5,
      mean2: 1,
      sigma2: 0,
      n2: 5,
      alpha: 0.05,
      tail: "two",
    });
    expect(!result.ok && result.error.field).toBe("sigma2");
  });
});

describe("twoProportionsZTest", () => {
  it("pools the proportions under H₀", () => {
    const result = unwrap(
      twoProportionsZTest({ x1: 45, n1: 100, x2: 30, n2: 100, alpha: 0.05, tail: "two" }),
    );
    expect(result.details.pooledProportion).toBe(0.375);
    expect(result.estimate).toBeCloseTo(0.15, 15);
    expect(result.z).toBeCloseTo(0.15 / Math.sqrt(0.375 * 0.625 * 0.02), 14);
    expect(result.reject).toBe(true);
  });

  it("gives the same answer from sample proportions", () => {
    const counts = unwrap(
      twoProportionsZTest({ x1: 45, n1: 100, x2: 30, n2: 100, alpha: 0.05, tail: "two" }),
    );
    const props = unwrap(
      twoProportionsZTest({ p1: 0.45, n1: 100, p2: 0.3, n2: 100, alpha: 0.05, tail: "two" }),
    );
    expect(props.z).toBeCloseTo(counts.z, 13);
    expect(props.steps.map((s) => s.id)).not.toContain("p-hats");
  });

  it("fails when the pooled standard error is zero", () => {
    const result = twoProportionsZTest({
      x1: 10,
      n1: 10,
      x2: 20,
      n2: 20,
      alpha: 0.05,
      tail: "two",
    });
    expect(!result.ok && result.error.code).toBe("ZERO_STANDARD_ERROR");
  });

  it("warns about small success/failure counts", () => {
    const result = unwrap(
      twoProportionsZTest({ x1: 5, n1: 40, x2: 12, n2: 40, alpha: 0.05, tail: "left" }),
    );
    expect(result.warnings).toHaveLength(1);
  });

  it.each([
    [{ x1: 41 }, "x1"],
    [{ x2: -1 }, "x2"],
    [{ n1: 0 }, "n1"],
  ])("rejects %j", (override, field) => {
    const result = twoProportionsZTest({
      x1: 20,
      n1: 40,
      x2: 12,
      n2: 40,
      alpha: 0.05,
      tail: "two",
      ...override,
    });
    expect(!result.ok && result.error.field).toBe(field);
  });

  it("rejects a sample proportion outside [0, 1]", () => {
    const result = twoProportionsZTest({
      p1: 0.5,
      n1: 40,
      p2: 1.5,
      n2: 40,
      alpha: 0.05,
      tail: "two",
    });
    expect(!result.ok && result.error.field).toBe("p2");
  });
});
