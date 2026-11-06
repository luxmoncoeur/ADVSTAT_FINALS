import { expect, test } from "@playwright/test";

const PATHS = ["/", "/dashboard", "/regression", "/regression?example=study-hours", "/hypothesis", "/learn"];

/** Width of the page content beyond the screen, in CSS pixels (0 = no sideways scrolling). */
const overflow = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

for (const width of [320, 375]) {
  test.describe(`Phone layout at ${width} px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const path of PATHS) {
      test(`${path} does not scroll sideways`, async ({ page }) => {
        await page.goto(path);
        await expect.poll(() => overflow(page)).toBeLessThanOrEqual(0);
      });
    }

    test("opening the theme menu does not shift the page", async ({ page }) => {
      await page.goto("/dashboard");
      await page.getByRole("button", { name: "Change color theme" }).click();
      await expect(page.getByRole("menuitemradio", { name: "Dark" })).toBeVisible();
      expect(await overflow(page)).toBeLessThanOrEqual(0);
      expect(await page.evaluate(() => window.scrollX)).toBe(0);
    });
  });
}
