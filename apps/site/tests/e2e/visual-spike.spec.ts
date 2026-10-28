/**
 * Spike A (carte 021) : non-régression visuelle de l'intégration Tailwind v4.
 * 1er run (avant Tailwind) = captures de référence ; 2e run (après) = comparaison au pixel.
 */
import { test, expect } from "@playwright/test";

for (const path of ["/", "/forum", "/tournois"]) {
  test(`rendu inchangé ${path}`, async ({ page }) => {
    // Captures de référence prises sous Windows : comparaison locale uniquement (rendu des polices différent sous Linux)
    test.skip(!!process.env.CI, "captures de référence locales (Windows)");
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(page).toHaveScreenshot({ fullPage: false, animations: "disabled", maxDiffPixelRatio: 0.001 });
  });
}

test("une utilitaire Tailwind gagne sur le reset legacy", async ({ page }) => {
  await page.goto("/spike-tailwind");
  const probe = page.getByTestId("tw-probe");
  await expect(probe).toHaveCSS("padding-top", "16px");
  await expect(probe).toHaveCSS("margin-top", "8px");
});
