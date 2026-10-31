import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NumberField } from "@/components/shared/number-field";
import { SolutionSteps } from "@/components/shared/solution-steps";
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
