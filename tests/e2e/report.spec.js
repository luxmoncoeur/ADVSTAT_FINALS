import { expect, test } from "@playwright/test";

test.describe("Printable report", () => {
  test("hypothesis report shows the full solution in a printable layout", async ({ page }) => {
    await page.goto("/hypothesis");
    await page.getByRole("button", { name: "Load example" }).click();
    await page.getByRole("button", { name: "Compute" }).click();
    await page.getByRole("button", { name: "Print / PDF" }).click();

    const report = page.locator("[data-print-report]");
    await expect(report.getByRole("heading", { name: "One mean z-test" })).toBeVisible();
    await expect(report.getByText("μ = 40", { exact: true })).toBeVisible();
    await expect(report.getByText("2.1600", { exact: true }).first()).toBeVisible();
    await expect(report.getByText("Reject H₀", { exact: true })).toBeVisible();
    await expect(report.getByRole("img", { name: /Standard normal curve/ })).toBeVisible();
    await expect(report.getByRole("heading", { name: "Step-by-step solution" })).toBeVisible();

    // When printing, only the report is laid out.
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("[data-slot=sidebar]").first()).toBeHidden();
    await expect(report).toBeVisible();
  });

  test("regression report includes the table and the solution", async ({ page }) => {
    await page.goto("/regression?example=study-hours");
    await expect(page.getByText("Ŷ = 46.5000 + 7.5000X").first()).toBeAttached();
    await page.getByRole("button", { name: "Print / PDF" }).click();

    const report = page.locator("[data-print-report]");
    await expect(report.getByRole("heading", { name: "Simple Linear Regression" })).toBeVisible();
    await expect(report.getByText("Ŷ = 46.5000 + 7.5000X").first()).toBeVisible();
    await expect(report.getByRole("table", { name: /Computation table/ })).toContainText(
      "ΣXY = 1,110",
    );
    await expect(report.getByRole("heading", { name: "Step-by-step solution" })).toBeVisible();

    await page.emulateMedia({ media: "print" });
    await expect(page.locator("[data-slot=sidebar]").first()).toBeHidden();
    await expect(report).toBeVisible();
  });
});
