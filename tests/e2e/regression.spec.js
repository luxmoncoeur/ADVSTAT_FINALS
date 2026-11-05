import { expect, test } from "@playwright/test";

/** The exact text shown for a result (CountUp keeps the final value in an sr-only span). */
const shows = (page, text) => expect(page.getByText(text, { exact: true }).first()).toBeAttached();

test.describe("Simple linear regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/regression");
  });

  test("computes the sample dataset correctly", async ({ page }) => {
    await page.getByRole("button", { name: /Datasets/ }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Study hours/ })
      .click();
    // Paper Section 2.1.6: b = 375 / 50 = 7.5, a = (345 − 7.5·15) / 5 = 46.5, r = 375 / √142500 ≈ 0.9934
    await shows(page, "Ŷ = 46.5000 + 7.5000X");
    await shows(page, "0.9934");
    await shows(page, "Very strong positive");
    await expect(page.getByRole("img", { name: /Scatter diagram of 5 points/ })).toBeVisible();
  });

  test("accepts pasted data in two rows and shows the worked solution", async ({ page }) => {
    await page.getByRole("tab", { name: "Paste" }).click();
    await page.getByLabel(/Paste from a spreadsheet/).fill("X: 1 2 3 4 5\nY: 2 4 5 4 5");
    await page.getByRole("button", { name: "Use this data" }).click();
    await shows(page, "Ŷ = 2.2000 + 0.6000X");
    await shows(page, "Strong positive");
    await page.getByRole("tab", { name: "Computation table" }).click();
    await expect(page.getByRole("table", { name: /Computation table/ })).toContainText("66");
  });

  test("switching decimals re-rounds every result", async ({ page }) => {
    await page.getByRole("button", { name: /Datasets/ }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Study hours/ })
      .click();
    await page.getByRole("combobox", { name: /Decimal places/ }).click();
    await page.getByRole("option", { name: "2" }).click();
    await shows(page, "Ŷ = 46.50 + 7.50X");
  });

  test("rejects invalid cells instead of guessing", async ({ page }) => {
    await page.getByRole("textbox", { name: "Row 1, X" }).fill("1");
    await page.getByRole("textbox", { name: "Row 1, Y" }).fill("2");
    await page.getByRole("textbox", { name: "Row 2, X" }).fill("3,5");
    await page.getByRole("textbox", { name: "Row 2, Y" }).fill("4");
    await page.getByRole("button", { name: "Compute" }).click();
    await expect(page.getByText(/Fix 1 row with missing or invalid values/)).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Row 2, X" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("explains why r is undefined when all Y values are equal", async ({ page }) => {
    await page.getByRole("tab", { name: "Paste" }).click();
    await page.getByLabel(/Paste from a spreadsheet/).fill("1 5\n2 5\n3 5");
    await page.getByRole("button", { name: "Use this data" }).click();
    await expect(page.getByText(/correlation coefficient r is undefined/)).toBeVisible();
  });

  test("loads and computes directly when navigating with example query param", async ({ page }) => {
    await page.goto("/regression?example=advertising#results");
    await shows(page, "Ad spend vs. sales");
    await expect(page.getByText(/Computed from sample/)).toBeVisible();
    await expect(page.getByText("Step-by-step solution")).toBeVisible();
  });

  test("Clear empties a dataset opened from the URL and keeps it empty", async ({ page }) => {
    await page.goto("/regression?example=advertising");
    await expect(page.getByText(/Computed from sample/)).toBeVisible();
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page).not.toHaveURL(/example=/);
    await expect(page.getByText("Start with a dataset")).toBeVisible();
    await expect(page.getByText(/Computed from sample/)).toHaveCount(0);
  });

  test("the sample banner follows the data, not the URL", async ({ page }) => {
    await page.goto("/regression?example=advertising");
    await expect(page.getByText(/Computed from sample/)).toBeVisible();

    await page.getByRole("button", { name: /Datasets/ }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Study hours/ })
      .click();
    await shows(page, "Ŷ = 46.5000 + 7.5000X");
    await expect(page.getByText("Ad spend vs. sales")).toHaveCount(0);

    // Edited data is no longer the sample, so the banner goes away.
    await page.getByRole("textbox", { name: "Row 1, X" }).fill("99");
    await expect(page.getByText(/Computed from sample/)).toHaveCount(0);
  });
});
