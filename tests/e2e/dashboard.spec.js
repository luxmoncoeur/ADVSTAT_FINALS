import { expect, test } from "@playwright/test";

test("dashboard previews are interactive and link to the chosen dataset", async ({ page }) => {
  await page.goto("/");
  const stepper = page.getByRole("button", { name: "Next dataset" });
  await expect(page.getByText("Study hours vs. exam score", { exact: true })).toBeVisible();
  await stepper.click();
  await expect(page.getByText("Textbook example (5 points)", { exact: true })).toBeVisible();
  // r of the textbook data is 0.7746 and follows into the r interpreter.
  await expect(page.getByLabel(/Correlation r/)).toHaveValue("0.7746");

  const thumb = page.getByRole("slider", { name: "Observed z" });
  await thumb.focus();
  await expect(page.getByText("Reject H₀", { exact: true })).toBeVisible();
  for (let i = 0; i < 10; i += 1) await thumb.press("ArrowLeft");
  await expect(page.getByText("Fail to reject H₀")).toBeVisible();

  await page.getByRole("link", { name: "Open Linear Regression" }).click();
  await expect(page).toHaveURL(/dataset=textbook/);
  await expect(page.getByText(/Ŷ = 2\.2000 \+ 0\.6000X/).first()).toBeVisible();
});
