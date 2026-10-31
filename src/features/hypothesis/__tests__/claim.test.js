import { describe, expect, it } from "vitest";
import {
  RELATIONS,
  claimConclusion,
  detectClaims,
  hypothesesFromClaim,
  nullValueFrom,
  numberAfter,
} from "../claim";

const first = (text) => detectClaims(text)[0];

describe("detectClaims", () => {
  it.each([
    ["Batteries last at least 500 hours.", "ge", "at least"],
    ["The bag weighs no more than 2 kg.", "le", "no more than"],
    ["Students sleep more than 7 hours.", "gt", "more than"],
    ["The rate is less than 60%.", "lt", "less than"],
    ["The mean is different from 50.", "ne", "different from"],
    ["The mean is equal to 50.", "eq", "equal to"],
    ["The wait is not less than 10 minutes.", "ge", "not less than"],
    ["Fees do not exceed 300 pesos.", "le", "do not exceed"],
    ["The coin is not fair.", "ne", "not fair"],
    ["The average has not changed.", "eq", "has not changed"],
  ])("%s → %s", (text, relation, phrase) => {
    const match = first(text);
    expect(match.relation).toBe(relation);
    expect(match.phrase.toLowerCase()).toBe(phrase);
  });

  it("prefers the longer phrase where they overlap", () => {
    const matches = detectClaims("It is no more than 5.");
    expect(matches).toHaveLength(1);
    expect(matches[0].relation).toBe("le");
  });

  it("keeps the original casing and returns matches in reading order", () => {
    const matches = detectClaims("AT LEAST 3, but less than 9");
    expect(matches.map((m) => m.phrase)).toEqual(["AT LEAST", "less than"]);
  });

  it("matches whole words only", () => {
    expect(detectClaims("The reabove value")).toEqual([]);
    expect(detectClaims("")).toEqual([]);
  });
});

describe("numberAfter", () => {
  it("reads the number a few words after the phrase", () => {
    expect(numberAfter(" 500 hours")).toEqual({ value: 500, percent: false });
    expect(numberAfter(" an average of 12.5 kg")).toEqual({ value: 12.5, percent: false });
    expect(numberAfter(" 60% of students")).toEqual({ value: 60, percent: true });
    expect(numberAfter(" 1,250 pesos")).toEqual({ value: 1250, percent: false });
    expect(numberAfter(" -3 degrees")).toEqual({ value: -3, percent: false });
  });

  it("ignores numbers that are too far away or in the next sentence", () => {
    expect(numberAfter(" the national average reported last year by 40")).toBeNull();
    expect(numberAfter(". In 2024")).toBeNull();
  });
});

describe("hypothesesFromClaim", () => {
  const subject = { parameter: "μ", value: "500" };

  it.each([
    ["eq", "h0", "μ = 500", "μ ≠ 500", "two"],
    ["ne", "ha", "μ = 500", "μ ≠ 500", "two"],
    ["gt", "ha", "μ = 500", "μ > 500", "right"],
    ["lt", "ha", "μ = 500", "μ < 500", "left"],
    ["ge", "h0", "μ = 500", "μ < 500", "left"],
    ["le", "h0", "μ = 500", "μ > 500", "right"],
  ])("%s: claim in %s, H₀ %s, Hₐ %s, %s-tailed", (relation, side, h0, ha, tail) => {
    const plan = hypothesesFromClaim(/** @type {any} */ (relation), subject);
    expect(plan.claimIn).toBe(side);
    expect(plan.h0).toBe(h0);
    expect(plan.ha).toBe(ha);
    expect(plan.tail).toBe(tail);
    expect(plan.claim).toBe(`μ ${RELATIONS[relation].symbol} 500`);
  });

  it("adds the textbook note only when H₀ is often written with ≤ or ≥", () => {
    expect(hypothesesFromClaim("ge", subject).reasons).toHaveLength(4);
    expect(hypothesesFromClaim("gt", subject).reasons).toHaveLength(4);
    expect(hypothesesFromClaim("eq", subject).reasons).toHaveLength(3);
    expect(hypothesesFromClaim("ne", subject).reasons).toHaveLength(3);
  });

  it("Hₐ is always the complement of the claim side", () => {
    for (const relation of /** @type {const} */ (["eq", "ne", "gt", "lt", "ge", "le"])) {
      const { claimIn, tail } = RELATIONS[relation];
      expect(["h0", "ha"]).toContain(claimIn);
      expect(["two", "left", "right"]).toContain(tail);
    }
  });
});

describe("nullValueFrom", () => {
  it("uses the number for a one-mean test", () => {
    expect(nullValueFrom({ id: "one-mean" }, { value: 500, percent: false })).toBe(500);
  });

  it("turns percentages into proportions and rejects impossible ones", () => {
    const test = { id: "one-proportion" };
    expect(nullValueFrom(test, { value: 60, percent: true })).toBe(0.6);
    expect(nullValueFrom(test, { value: 0.35, percent: false })).toBe(0.35);
    expect(nullValueFrom(test, { value: 60, percent: false })).toBeNull();
    expect(nullValueFrom(test, { value: 100, percent: true })).toBeNull();
  });

  it("never fills H₀ for two-sample tests or without a number", () => {
    expect(nullValueFrom({ id: "two-means" }, { value: 5, percent: false })).toBeNull();
    expect(nullValueFrom({ id: "two-proportions" }, { value: 5, percent: true })).toBeNull();
    expect(nullValueFrom({ id: "one-mean" }, null)).toBeNull();
  });
});

describe("claimConclusion", () => {
  it("covers the four textbook outcomes", () => {
    expect(claimConclusion("h0", true)).toBe("There is enough evidence to reject the claim.");
    expect(claimConclusion("h0", false)).toBe("There is not enough evidence to reject the claim.");
    expect(claimConclusion("ha", true)).toBe("There is enough evidence to support the claim.");
    expect(claimConclusion("ha", false)).toBe("There is not enough evidence to support the claim.");
  });
});
