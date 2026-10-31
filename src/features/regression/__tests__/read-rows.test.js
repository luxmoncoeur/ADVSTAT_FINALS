// @ts-check
import { describe, expect, it } from "vitest";
import { niceScale } from "@/lib/chart-utils";
import { readRows } from "../hooks/use-regression";

describe("readRows", () => {
  it("ignores blank rows and keeps valid pairs in order", () => {
    const result = readRows([
      { id: "a", x: "1", y: "2" },
      { id: "b", x: "", y: "" },
      { id: "c", x: " 3.5 ", y: "-4" },
    ]);
    expect(result).toEqual({ xs: [1, 3.5], ys: [2, -4], errors: {}, filled: 2 });
  });

  it("flags missing and invalid cells per row", () => {
    const result = readRows([
      { id: "a", x: "1", y: "" },
      { id: "b", x: "1,5", y: "2" },
    ]);
    expect(result.errors).toEqual({ a: { y: "Missing Y" }, b: { x: "Not a number" } });
    expect(result.xs).toEqual([]);
  });
});

describe("niceScale", () => {
  it("produces round tick steps that cover the data", () => {
    const { domain, ticks } = niceScale([56.4, 100.7]);
    expect(domain[0]).toBeLessThanOrEqual(56.4);
    expect(domain[1]).toBeGreaterThanOrEqual(100.7);
    const step = ticks[1] - ticks[0];
    const mantissa = step / 10 ** Math.floor(Math.log10(step));
    expect([1, 2, 2.5, 5]).toContain(mantissa);
    ticks.forEach((tick, i) => expect(tick).toBeCloseTo(ticks[0] + i * step, 10));
    expect(ticks).toEqual([40, 60, 80, 100, 120]);
  });

  it("handles tiny and constant ranges", () => {
    expect(niceScale([0.001, 0.002]).ticks.length).toBeGreaterThan(2);
    expect(niceScale([5, 5]).ticks.length).toBeGreaterThan(1);
  });
});
