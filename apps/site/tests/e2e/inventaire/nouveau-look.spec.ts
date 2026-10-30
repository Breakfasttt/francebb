/**
 * Bandeau « Nouveau look » (carte 083) : un membre qui avait un autre thème avant la bascule vers Vestiaire
 * peut y revenir en un clic ; le bandeau ne revient pas ensuite. Un membre sans ancien thème ne le voit pas.
 */
import { test, expect } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

test("le bandeau propose l'ancien thème et le rétablit", async ({ page }) => {
  await withTestDb((prisma) => prisma.user.update({ where: { id: E2E.coachId }, data: { theme: "vestiaire", previousTheme: "saison3" } }));
  try {
    await loginAs(page, E2E.coachId);
    await page.goto("/forum", { waitUntil: "networkidle" });
    const banner = page.getByRole("region", { name: "Nouveau look du site" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Revenir à « Saison 3 »" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "saison3");
    await expect(banner).toBeHidden();
    const saved = await withTestDb((prisma) => prisma.user.findUnique({ where: { id: E2E.coachId }, select: { theme: true } }));
    expect(saved?.theme).toBe("saison3");

    // Choix mémorisé : le bandeau ne revient pas à la page suivante
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.getByRole("region", { name: "Nouveau look du site" })).toHaveCount(0);
  } finally {
    await withTestDb((prisma) => prisma.user.update({ where: { id: E2E.coachId }, data: { theme: "vestiaire", previousTheme: null } }));
  }
});

test("pas de bandeau pour un membre sans ancien thème", async ({ page }) => {
  await loginAs(page, E2E.modoId);
  await page.goto("/forum", { waitUntil: "networkidle" });
  await expect(page.getByRole("region", { name: "Nouveau look du site" })).toHaveCount(0);
});
