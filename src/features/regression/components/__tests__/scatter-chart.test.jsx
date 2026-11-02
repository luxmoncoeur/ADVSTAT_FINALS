import { render, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RegressionScatterChart } from "../scatter-chart";
import { linearRegression } from "@/lib/stats";

describe("RegressionScatterChart with ScatterChart", () => {
  it("renders and triggers tooltip on all points across the domain", () => {
    // 8 points: x from 2 to 15, y from 62 to 95
    const res = linearRegression([2, 3, 5, 7, 9, 10, 12, 15], [62, 65, 70, 74, 80, 82, 88, 95]);
    const { container } = render(
      <RegressionScatterChart
        result={res.value}
        labels={{ x: "Hours studied", y: "Exam score" }}
        showResiduals={true}
        showMeans={true}
      />,
    );

    const symbols = container.querySelectorAll(".recharts-scatter-symbol");
    expect(symbols.length).toBe(8);

    // Verify regression line rendered and has pointer-events-none
    const line = container.querySelector(".recharts-line");
    expect(line).not.toBeNull();
    expect(line?.classList.contains("pointer-events-none")).toBe(true);

    // Verify reference lines/dots have pointer-events-none
    const refLines = container.querySelectorAll(".recharts-reference-line");
    expect(refLines.length).toBeGreaterThan(0);
    refLines.forEach((el) => {
      expect(el.classList.contains("pointer-events-none")).toBe(true);
    });

    const tipWrapper = container.querySelector(".recharts-tooltip-wrapper");

    // Test lowest point (Point #1, index 0 in lower section)
    fireEvent.mouseEnter(symbols[0]);
    expect(tipWrapper?.textContent).toContain("Point #1");
    expect(tipWrapper?.textContent).toContain("62");

    // Test middle point (Point #5, index 4 in middle section)
    fireEvent.mouseEnter(symbols[4]);
    expect(tipWrapper?.textContent).toContain("Point #5");
    expect(tipWrapper?.textContent).toContain("80");

    // Test highest point in upper section (Point #8, index 7)
    fireEvent.mouseEnter(symbols[7]);
    expect(tipWrapper?.textContent).toContain("Point #8");
    expect(tipWrapper?.textContent).toContain("95");

    // Mouse leave point
    fireEvent.mouseLeave(symbols[7]);
  });
});
