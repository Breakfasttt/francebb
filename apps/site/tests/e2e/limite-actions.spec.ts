/**
 * Limite d'actions par minute (carte 224) : un coach qui a déjà fait 20 recherches dans la minute voit « Doucement » ;
 * un modérateur n'est jamais limité. Le compteur est rempli directement dans la base (minute en cours et suivante,
 * pour ne pas dépendre du changement de minute pendant le test).
 */
import { test, expect } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "./fixtures";

const QUERY = "/forum/search?q=e2e";

async function fillSearchCounter(userId: string) {
  const start = new Date();
  start.setUTCSeconds(0, 0);
  await withTestDb(async (prisma) => {
    for (const windowStart of [start, new Date(start.getTime() + 60_000)]) {
      await prisma.actionCounter.upsert({
        where: { userId_action_windowStart: { userId, action: "SEARCH", windowStart } },
        create: { userId, action: "SEARCH", windowStart, count: 20 },
        update: { count: 20 },
      });
    }
  });
}

test.afterAll(async () => {
  await withTestDb((prisma) => prisma.actionCounter.deleteMany({ where: { userId: { in: [E2E.coachId, E2E.modoId] } } }));
});

test("un coach qui dépasse la limite de recherches voit « Doucement »", async ({ page }) => {
  await fillSearchCounter(E2E.coachId);
  await loginAs(page, E2E.coachId);
  await page.goto(QUERY, { waitUntil: "networkidle" });
  await expect(page.getByText("Trop de recherches")).toBeVisible();
  await expect(page.getByText("Doucement : attends une minute avant de recommencer.")).toBeVisible();
});

test("un modérateur n'est pas limité", async ({ page }) => {
  await fillSearchCounter(E2E.modoId);
  await loginAs(page, E2E.modoId);
  await page.goto(QUERY, { waitUntil: "networkidle" });
  await expect(page.getByText("Doucement : attends une minute avant de recommencer.")).toHaveCount(0);
});
