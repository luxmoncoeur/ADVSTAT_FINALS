import { expect, test } from "@playwright/test";

test.describe("Claim → H₀/Hₐ helper", () => {
  test("reads an 'at least' claim, explains it and runs the test", async ({ page }) => {
    await page.goto("/hypothesis");
    await page.getByText("Not sure which is H₀ and Hₐ?").click();
    await page
      .getByLabel("The claim or word problem")
      .fill("A company claims its batteries last at least 500 hours on average.");

    // "at least" → ≥ includes equality, so the claim is H₀ and Hₐ is <.
    await expect(page.getByRole("radio", { name: "is at least" })).toBeChecked();
    await expect(page.getByText("so the claim is the null hypothesis H₀")).toBeVisible();
    await expect(page.getByText(/Some textbooks write H₀: μ ≥ 500/)).toBeVisible();

    await page.getByRole("button", { name: "Use these hypotheses" }).click();
    await expect(page.getByLabel("Hypothesized mean")).toHaveValue("500");
    await expect(page.getByText("Testing whether")).toContainText("μ < 500");

    // x̄ = 490, σ = 30, n = 36 → z = −10/5 = −2 < −1.6449: reject H₀, so reject the claim.
    await page.getByLabel("Sample mean").fill("490");
    await page.getByLabel("Population standard deviation").fill("30");
    await page.getByLabel("Sample size").fill("36");
    await page.getByRole("button", { name: "Compute" }).click();
    await expect(page.getByRole("heading", { name: "Reject H₀" })).toBeVisible();
    await expect(page.getByText("There is enough evidence to reject the claim.")).toBeVisible();
  });

  test("puts a 'more than' claim in Hₐ, and a manual pick overrides detection", async ({
    page,
  }) => {
    await page.goto("/hypothesis");
    await page.getByText("Not sure which is H₀ and Hₐ?").click();
    await page.getByLabel("The claim or word problem").fill("Students sleep more than 7 hours.");
    await expect(page.getByText("so the claim is the alternative hypothesis Hₐ")).toBeVisible();
    await page.getByRole("radio", { name: "is different from" }).click();
    await expect(page.getByText(/test is two-tailed/)).toBeVisible();
  });
});

test.describe("Printable report", () => {
  test("hypothesis report shows the full solution in a light, printable layout", async ({
    page,
  }) => {
    await page.goto("/hypothesis");
    await page.getByRole("button", { name: "Load example" }).click();
    await page.getByRole("button", { name: "Compute" }).click();
    await page.getByRole("button", { name: "Print / PDF" }).click();

    const report = page.locator("[data-print-report]");
    await expect(report.getByRole("heading", { name: "One mean z-test" })).toBeVisible();
    await expect(report.getByText("μ = 500", { exact: true })).toBeVisible();
    await expect(report.getByText("Reject H₀", { exact: true })).toBeVisible();
    await expect(report.getByRole("img", { name: /Standard normal curve/ })).toBeVisible();

    // When printing, only the report is laid out.
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("[data-slot=sidebar]").first()).toBeHidden();
    await expect(report).toBeVisible();
  });

  test("regression report includes the table and the solution", async ({ page }) => {
    await page.goto("/regression");
    await page.getByRole("button", { name: /Datasets/ }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Textbook example/ })
      .click();
    await expect(page.getByText("Ŷ = 2.2000 + 0.6000X").first()).toBeAttached();
    await page.getByRole("button", { name: "Print / PDF" }).click();
    const report = page.locator("[data-print-report]");
    await expect(report.getByRole("heading", { name: "Simple Linear Regression" })).toBeVisible();
    await expect(report.getByText("Ŷ = 2.2000 + 0.6000X").first()).toBeVisible();
    await expect(report.getByRole("heading", { name: "Computation table" })).toBeVisible();
    await expect(report.getByRole("heading", { name: "Step-by-step solution" })).toBeVisible();
  });
});
