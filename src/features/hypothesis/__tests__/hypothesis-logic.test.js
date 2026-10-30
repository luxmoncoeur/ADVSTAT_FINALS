// @ts-check
import { describe, expect, it } from "vitest";
import { criticalZ } from "@/lib/stats";
import { buildCurve } from "../components/normal-curve-chart";
import { lookupZ, tableValue } from "../components/z-table-lookup";
import { readAlpha } from "../hooks/use-ztest";

describe("z-table lookup (as a student reads the printed table)", () => {
  it.each([
    [0.975, [1.96]],
    [0.95, [1.64, 1.65]],
    [0.995, [2.57, 2.58]],
    [0.9, [1.28]],
    [0.99, [2.33]],
  ])("area %d → z %j", (area, cells) => {
    expect(lookupZ(area).cells).toEqual(cells);
  });

  it("prints standard table values", () => {
    expect(tableValue(1.96)).toBe(0.975);
    expect(tableValue(0)).toBe(0.5);
    expect(tableValue(2.3)).toBe(0.9893);
  });
});

describe("normal curve regions", () => {
  it("splits the curve exactly at the critical values", () => {
    const critical = criticalZ(0.05, "two");
    const curve = buildCurve("two", critical, 2, 4);
    const upper = /** @type {number} */ (critical.upper);
    const atBoundary = curve.find((p) => p.x === upper);
    expect(atBoundary?.reject).toBeCloseTo(atBoundary?.density ?? 0, 15);
    expect(atBoundary?.accept).toBeCloseTo(atBoundary?.density ?? 0, 15);
    expect(curve.find((p) => p.x === 0)?.reject).toBeNull();
    expect(curve.find((p) => p.x === 3)?.accept).toBeNull();
  });

  it("shades only one tail for one-tailed tests", () => {
    const curve = buildCurve("right", criticalZ(0.05, "right"), 1, 4);
    expect(curve.find((p) => p.x === -3)?.reject).toBeNull();
    expect(curve.find((p) => p.x === 3)?.reject).not.toBeNull();
    // p-value area is everything at or beyond z = 1 in the right tail
    expect(curve.find((p) => p.x === 0.5)?.pArea).toBeNull();
    expect(curve.find((p) => p.x === 1.5)?.pArea).not.toBeNull();
  });
});

describe("readAlpha", () => {
  it("accepts presets and valid custom values", () => {
    expect(readAlpha("0.05", "")).toEqual({ value: 0.05, error: null });
    expect(readAlpha("custom", "0.025")).toEqual({ value: 0.025, error: null });
    expect(readAlpha("custom", "0.5")).toEqual({ value: 0.5, error: null });
  });

  it.each(["", "abc", "0", "-0.1", "0.6", "5%"])("rejects custom α %j", (text) => {
    expect(readAlpha("custom", text).error).not.toBeNull();
  });
});
