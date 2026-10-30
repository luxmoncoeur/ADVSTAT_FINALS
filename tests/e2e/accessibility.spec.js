import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", name: "dashboard" },
  {
    path: "/regression",
    name: "regression with results",
    prepare: async (page) => {
      await page.getByRole("button", { name: "Load example" }).first().click();
      await page.getByRole("menuitem", { name: /Study hours/ }).click();
    },
  },
  {
    path: "/hypothesis",
    name: "hypothesis with results",
    prepare: async (page) => {
      await page.getByRole("button", { name: "Load example" }).click();
      await page.getByRole("button", { name: "Compute" }).click();
    },
  },
  { path: "/learn", name: "learn" },
];

for (const scheme of ["light", "dark"]) {
  test.describe(`Accessibility (${scheme})`, () => {
    test.use({ colorScheme: scheme });
    for (const entry of PAGES) {
      test(`${entry.name} has no serious WCAG 2.2 AA violations`, async ({ page }) => {
        await page.goto(entry.path);
        await entry.prepare?.(page);
        // Let entrance animations settle so contrast is measured on the final colours.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 500) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(1800);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .exclude("[data-sonner-toaster]")
          .analyze();
        const serious = results.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical",
        );
        expect(
          serious.map(
            (v) =>
              `${v.id}: ${v.nodes
                .map((n) => n.target.join(" "))
                .slice(0, 3)
                .join(", ")}`,
          ),
        ).toEqual([]);
      });
    }
  });
}

test("keyboard users can reach the main content and run a test", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard flow is checked on desktop and tablet");
  await page.goto("/hypothesis");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.getByRole("button", { name: "Load example" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Compute" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Reject H₀", { exact: true }).first()).toBeVisible();
});
