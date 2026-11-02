import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ComputeButton } from "@/components/shared/compute-button";
import { NumberField } from "@/components/shared/number-field";
import { PageHeader } from "@/components/shared/page-header";
import { ResultCard } from "@/components/shared/result-card";
import { SolutionSteps } from "@/components/shared/solution-steps";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RSquaredGauge } from "@/features/regression/components/r-squared-gauge";
import { linearRegression } from "@/lib/stats";

describe("NumberField", () => {
  it("is labelled and announces its error", () => {
    render(
      <NumberField
        name="n"
        label="Sample size"
        symbol="n"
        value="abc"
        onChange={() => {}}
        error="Not a valid number"
      />,
    );
    const input = screen.getByLabelText(/Sample size/);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Not a valid number");
  });

  it("keeps the exact text the user types", async () => {
    const values = [];
    render(<NumberField name="x" label="X" value="" onChange={(value) => values.push(value)} />);
    await userEvent.type(screen.getByLabelText("X"), "1");
    expect(values).toEqual(["1"]);
  });
});

describe("SolutionSteps", () => {
  it("renders every step with substituted values rounded for display", () => {
    const result = linearRegression([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]);
    if (!result.ok) throw new Error("expected ok");
    render(<SolutionSteps steps={result.value.steps} />);
    expect(screen.getByText("Slope (b)")).toBeInTheDocument();
    expect(screen.getByText("Correlation coefficient (r)")).toBeInTheDocument();
    // b = 30 / 50 = 0.6000 at the default 4 decimals
    const slopeLine = screen.getByText(
      (_, el) => el?.tagName === "P" && el.textContent?.endsWith(" = 30 / 50 = 0.6000") === true,
    );
    expect(slopeLine).toBeInTheDocument();
  });
});

describe("ResultCard", () => {
  it("renders label, value, and hint with tone styling", () => {
    render(
      <ResultCard label="Correlation (r)" hint="Observed strength" tone="accept">
        0.8500
      </ResultCard>,
    );
    expect(screen.getByText("Correlation (r)")).toBeInTheDocument();
    expect(screen.getByText("0.8500")).toBeInTheDocument();
    expect(screen.getByText("Observed strength")).toBeInTheDocument();
  });
});

describe("ComputeButton", () => {
  it("renders with default label and handles clicks", async () => {
    let clicked = false;
    render(
      <ComputeButton
        onClick={() => {
          clicked = true;
        }}
      />,
    );
    const button = screen.getByRole("button", { name: "Compute" });
    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    expect(clicked).toBe(true);
  });
});

describe("PageHeader", () => {
  it("renders title, description and eyebrow badge", () => {
    render(
      <PageHeader
        eyebrow="Module 1"
        title="Simple Linear Regression"
        description="Fit linear equation"
      />,
    );
    expect(screen.getByRole("heading", { name: "Simple Linear Regression" })).toBeInTheDocument();
    expect(screen.getByText("Fit linear equation")).toBeInTheDocument();
    expect(screen.getByText("Module 1")).toBeInTheDocument();
  });
});

describe("ToggleGroup", () => {
  it("renders segmented items with proper roles and handles selection", async () => {
    let selected = "two";
    const { rerender } = render(
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={0}
        value={selected}
        onValueChange={(val) => {
          if (val) selected = val;
        }}
      >
        <ToggleGroupItem value="two">Two-tailed</ToggleGroupItem>
        <ToggleGroupItem value="right">Right-tailed</ToggleGroupItem>
      </ToggleGroup>,
    );
    const rightBtn = screen.getByRole("radio", { name: "Right-tailed" });
    await userEvent.click(rightBtn);
    expect(selected).toBe("right");

    rerender(
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={0}
        value={selected}
        onValueChange={(val) => {
          if (val) selected = val;
        }}
      >
        <ToggleGroupItem value="two">Two-tailed</ToggleGroupItem>
        <ToggleGroupItem value="right">Right-tailed</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole("radio", { name: "Right-tailed" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});

describe("RSquaredGauge", () => {
  it("renders concentric ring gauge without cap overlap at 100%", () => {
    const { container } = render(<RSquaredGauge rSquared={1} yLabel="Score" />);
    const gauge = screen.getByRole("img", {
      name: /r squared: 100\.00% of the variation in Score is explained/i,
    });
    expect(gauge).toBeInTheDocument();
    expect(screen.getByText("100.00%")).toBeInTheDocument();
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
    expect(circles[0].getAttribute("r")).toBe(circles[1].getAttribute("r"));
    expect(circles[1].getAttribute("stroke-linecap")).toBe("butt");
  });
});
