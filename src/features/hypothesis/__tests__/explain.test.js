// @ts-check
import { describe, expect, it } from "vitest";
import { oneMeanZTest, oneProportionZTest, twoMeansZTest } from "@/lib/stats";
import { scenariosFor, TESTS, TEST_ORDER } from "../config";
import { explainResult, percentText } from "../explain";
import { buildInput, fieldsFor, readAlpha } from "../hooks/use-ztest";

/** @param {any} result */
const ok = (result) => {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
};

describe("explainResult", () => {
  it("explains a rejection in plain language (battery example)", () => {
    // z = (510 − 500) / (30 / 6) = 2, p = 0.0455
    const text = explainResult(
      ok(oneMeanZTest({ sampleMean: 510, mu0: 500, sigma: 30, n: 36, alpha: 0.05, tail: "two" })),
      4,
    );
    expect(text.headline).toBe("The data support Hₐ: μ ≠ 500.");
    expect(text.where).toBe(
      "The sample mean x̄ (510) is 2.0000 standard errors above the value in H₀ (500).",
    );
    expect(text.cutoff).toBe(
      "To reject H₀ at α = 0.05 (two-tailed), z had to be beyond ±1.9600. It is, so z lands in the rejection region.",
    );
    expect(text.chance).toBe(
      "If H₀ were true, a result at least this extreme would happen 4.55% of the time (about 1 in 22). That is at or below α = 5.00%, so the result is statistically significant.",
    );
  });

  it("explains a non-significant left-tailed result", () => {
    const result = ok(
      oneMeanZTest({ sampleMean: 99, mu0: 100, sigma: 15, n: 25, alpha: 0.05, tail: "left" }),
    );
    const text = explainResult(result, 2);
    expect(text.headline).toBe("Not enough evidence for Hₐ: μ < 100.");
    expect(text.where).toMatch(/0\.33 standard errors below/);
    expect(text.cutoff).toMatch(/at most −1\.64\. It is not/);
    expect(text.chance).toMatch(/above α = 5\.00%, so the result is not statistically significant/);
  });

  it("describes proportions and differences with the right label", () => {
    expect(
      explainResult(
        ok(oneProportionZTest({ successes: 60, n: 100, p0: 0.5, alpha: 0.05, tail: "right" })),
        4,
      ).where,
    ).toMatch(/^The sample proportion p̂ \(0\.6000\)/);
    expect(
      explainResult(
        ok(
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
        ),
        4,
      ).where,
    ).toMatch(/^The observed difference x̄₁ − x̄₂ \(3\)/);
  });

  it("handles z = 0 and tiny p-values", () => {
    expect(
      explainResult(
        ok(oneMeanZTest({ sampleMean: 5, mu0: 5, sigma: 1, n: 4, alpha: 0.05, tail: "two" })),
        4,
      ).where,
    ).toMatch(/equals the value in H₀/);
    expect(percentText(1e-9)).toBe("less than 0.01%");
    expect(percentText(0.05)).toBe("5.00%");
  });
});

describe("practice scenarios", () => {
  // Hand-computed decisions for every scenario (see comments in config.js).
  const EXPECTED = {
    "one-mean": [true, true, false],
    "one-proportion": [true, false, true],
    "two-means": [true, false, false],
    "two-proportions": [true, false, true],
  };

  it.each(TEST_ORDER)("%s scenarios all compute with the expected decision", (testId) => {
    const decisions = scenariosFor(testId).map((scenario) => {
      const { input, errors } = buildInput({
        test: TESTS[testId],
        fields: fieldsFor(testId, "counts"),
        values: scenario.values,
        tail: scenario.tail,
        alpha: readAlpha(scenario.alpha, ""),
      });
      expect(errors).toEqual({});
      return ok(TESTS[testId].run(input)).reject;
    });
    expect(decisions).toEqual(EXPECTED[testId]);
  });
});
