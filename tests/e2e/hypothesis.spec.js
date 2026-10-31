import { expect, test } from "@playwright/test";

const shows = (page, text) => expect(page.getByText(text, { exact: true }).first()).toBeAttached();

/** Expected values worked by hand for each built-in example. */
const CASES = [
  // z = (510 − 500) / (30/√36) = 2
  { test: "One mean", z: "2.0000", critical: "±1.9600", p: "0.0455", decision: "Reject H₀" },
  // p̂ = 130/250 = 0.52, SE = √(0.6·0.4/250), z = −0.08/0.030984 = −2.5820
  { test: "One proportion", z: "−2.5820", critical: "−1.6449", p: "0.0049", decision: "Reject H₀" },
  // z = 3 / √(36/36 + 64/64) = 3/√2 = 2.1213
  { test: "Two means", z: "2.1213", critical: "±1.9600", p: "0.0339", decision: "Reject H₀" },
  // p̄ = 0.375, z = 0.15 / √(0.375·0.625·0.02) = 2.1909
  { test: "Two proportions", z: "2.1909", critical: "1.6449", p: "0.0142", decision: "Reject H₀" },
];

test.describe("Hypothesis testing", () => {
  for (const item of CASES) {
    test(`${item.test}: example gives the hand-computed answer`, async ({ page }) => {
      await page.goto("/hypothesis");
      await page.getByRole("radio", { name: new RegExp(item.test) }).click();
      await page.getByRole("button", { name: "Load example" }).click();
      await page.getByRole("button", { name: "Compute" }).click();
      await shows(page, item.z);
      await shows(page, item.critical);
      await shows(page, item.p);
      await expect(page.getByText(item.decision, { exact: true }).first()).toBeVisible();
      await expect(page.getByRole("img", { name: /Standard normal curve/ })).toBeVisible();
    });
  }

  test("a scenario card runs the test and explains the verdict", async ({ page }) => {
    await page.goto("/hypothesis");
    await page.getByRole("radio", { name: /One proportion/ }).click();
    // p̂ = 270/500 = 0.54, SE = √(0.25/500), z = 0.04 / 0.022361 = 1.7889
    await page.getByRole("button", { name: /Is the coin fair/ }).click();
    await expect(page.getByRole("heading", { name: "Fail to reject H₀" })).toBeVisible();
    await shows(page, "1.7889");
    await expect(
      page.getByText(/1\.7889 standard errors above the value in H₀ \(0\.5\)/),
    ).toBeVisible();
  });

  test("validates every input", async ({ page }) => {
    await page.goto("/hypothesis");
    await page.getByRole("button", { name: "Compute" }).click();
    await expect(page.getByText("Enter μ₀")).toBeVisible();
    await page.getByLabel(/Population standard deviation/).fill("-3");
    await page.getByLabel(/Hypothesized mean/).fill("100");
    await page.getByLabel(/Sample mean/).fill("104");
    await page.getByLabel(/Sample size/).fill("36");
    await page.getByRole("button", { name: "Compute" }).click();
    await expect(page.getByText(/must be greater than 0/)).toBeVisible();
  });

  test("custom α must be in (0, 0.5]", async ({ page }) => {
    await page.goto("/hypothesis");
    await page.getByRole("radio", { name: "Custom" }).click();
    await page.getByLabel("Custom α").fill("0.7");
    await expect(page.getByText("α must be greater than 0 and at most 0.5")).toBeVisible();
  });

  test("shows the z-table cell used for the critical value", async ({ page }) => {
    await page.goto("/hypothesis");
    await page.getByRole("button", { name: "Load example" }).click();
    await page.getByRole("button", { name: "Compute" }).click();
    await page.getByRole("tab", { name: "Z-table value" }).click();
    await expect(page.locator('td[aria-current="true"]')).toHaveText("0.9750");
  });
});
