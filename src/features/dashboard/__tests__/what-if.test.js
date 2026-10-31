import { describe, expect, it } from "vitest";
import { pValue } from "@/lib/stats";
import { whatIfZTest } from "../what-if";

describe("whatIfZTest", () => {
  it("uses the slider value as the test statistic", () => {
    for (const z of [-3.5, -1.96, 0, 0.42, 2, 3.99]) {
      expect(whatIfZTest(z, 0.05, "two").z).toBe(z);
    }
  });

  it("matches the textbook decisions at α = 0.05", () => {
    expect(whatIfZTest(2, 0.05, "two").reject).toBe(true);
    expect(whatIfZTest(1.9, 0.05, "two").reject).toBe(false);
    expect(whatIfZTest(1.7, 0.05, "right").reject).toBe(true);
    expect(whatIfZTest(1.7, 0.05, "left").reject).toBe(false);
    expect(whatIfZTest(-1.7, 0.05, "left").reject).toBe(true);
  });

  it("reports the same p-value as the engine", () => {
    for (const tail of /** @type {const} */ (["two", "left", "right"])) {
      expect(whatIfZTest(1.23, 0.1, tail).pValue).toBe(pValue(1.23, tail));
    }
  });
});
