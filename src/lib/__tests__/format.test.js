// @ts-check
import { describe, expect, it } from "vitest";
import {
  formatExact,
  formatNumber,
  formatPercent,
  formatPValue,
  formatToken,
  roundHalfUp,
} from "../format.js";

describe("roundHalfUp", () => {
  it.each([
    [1.005, 2, 1.01],
    [2.675, 2, 2.68],
    [1.45, 1, 1.5],
    [-1.005, 2, -1.01],
    [0.12345, 4, 0.1235],
    [1.959963984540054, 4, 1.96],
    [1.959963984540054, 2, 1.96],
    [1e-7, 4, 1e-7],
  ])("roundHalfUp(%d, %d) = %d", (value, decimals, expected) => {
    expect(roundHalfUp(value, decimals)).toBe(expected);
  });
});

describe("formatNumber", () => {
  it.each([
    [0.6, 4, "0.6000"],
    [2.2000000000000006, 4, "2.2000"],
    [15, 4, "15"],
    [-3, 4, "−3"],
    [12345.6789, 2, "12,345.68"],
    [-0.7745966692414834, 4, "−0.7746"],
    [1.959963984540054, 4, "1.9600"],
    [0.00001234, 4, "1.234 × 10⁻⁵"],
    [-0.00001234, 4, "−1.234 × 10⁻⁵"],
    [0.00005, 4, "0.0001"],
    [2e20, 4, "2.000 × 10²⁰"],
    [0, 4, "0"],
    [null, 4, "—"],
    [Number.NaN, 4, "—"],
    [Infinity, 4, "∞"],
    [-Infinity, 4, "−∞"],
  ])("formatNumber(%d, %d) = %s", (value, decimals, expected) => {
    expect(formatNumber(value, decimals)).toBe(expected);
  });

  it("can force fixed decimals for integers", () => {
    expect(formatNumber(1, 4, { fixed: true })).toBe("1.0000");
    expect(formatNumber(0, 2, { fixed: true })).toBe("0.00");
  });
});

describe("formatPValue", () => {
  it.each([
    [0.0455002638963584, 4, "0.0455"],
    [0.00004, 4, "< 0.0001"],
    [7.6e-24, 4, "< 0.0001"],
    [0.00004, 6, "0.000040"],
    [1, 4, "1.0000"],
    [0, 4, "0.0000"],
  ])("formatPValue(%d, %d) = %s", (p, decimals, expected) => {
    expect(formatPValue(p, decimals)).toBe(expected);
  });
});

describe("formatExact / formatToken / formatPercent", () => {
  it("shows user inputs exactly", () => {
    expect(formatExact(0.05)).toBe("0.05");
    expect(formatExact(500)).toBe("500");
    expect(formatExact(-2.125)).toBe("−2.125");
    expect(formatExact(1234567)).toBe("1,234,567");
    expect(formatExact(Number.NaN)).toBe("—");
  });

  it("formats tokens", () => {
    expect(formatToken("b = ", 4)).toBe("b = ");
    expect(formatToken({ value: 0.12345 }, 4)).toBe("0.1235");
    expect(formatToken({ value: 0.12345, exact: true }, 2)).toBe("0.12345");
  });

  it("formats percentages", () => {
    expect(formatPercent(0.6, 4)).toBe("60.00%");
    expect(formatPercent(0.902500001, 2)).toBe("90%");
  });
});
