/**
 * Carte 069 : le profil d'un membre connecté (rôle, bannissement) est relu en base à chaque lecture de sa session.
 * Un bannissement ou une rétrogradation faits pendant qu'il navigue prennent donc effet dès sa page suivante,
 * sans attendre qu'il se reconnecte. Les deux membres de ces tests sont créés puis supprimés par le test lui-même,
 * pour ne pas changer les membres partagés par les autres tests.
 */
import { test, expect } from "@playwright/test";
import { loginAs, withTestDb } from "./fixtures";

const LIVE_COACH_ID = "e2e_live_coach";
const LIVE_ADMIN_ID = "e2e_live_admin";

test("un membre banni pendant sa session est envoyé vers /banned dès sa page suivante", async ({ page }) => {
  await withTestDb((prisma) =>
    prisma.user.upsert({
      where: { id: LIVE_COACH_ID },
      update: { isBanned: false, banReason: null },
      create: { id: LIVE_COACH_ID, name: "Coach à bannir E2E", email: "live-coach@e2e.test", hasFinishedOnboarding: true },
    })
  );

  try {
    await loginAs(page, LIVE_COACH_ID);
    await page.goto("/forum");
    await expect(page).toHaveURL(/\/forum/);

    // Bannissement fait en base pendant que le membre est connecté, comme le ferait un modérateur
    await withTestDb((prisma) =>
      prisma.user.update({ where: { id: LIVE_COACH_ID }, data: { isBanned: true, banReason: "Test e2e" } })
    );

    await page.goto("/forum");
    await page.waitForURL(/\/banned/);
  } finally {
    await withTestDb((prisma) => prisma.user.delete({ where: { id: LIVE_COACH_ID } }));
  }
});

test("un administrateur rétrogradé pendant sa session perd l'accès à /administration dès sa page suivante", async ({ page }) => {
  await withTestDb(async (prisma) => {
    // Le jeu de données commun n'a pas de rôle administrateur : User.role pointe vers la table RoleConfig
    await prisma.roleConfig.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", label: "Administrateur", power: 90, isBaseRole: true },
    });
    await prisma.user.upsert({
      where: { id: LIVE_ADMIN_ID },
      update: { role: "ADMIN" },
      create: { id: LIVE_ADMIN_ID, name: "Admin à rétrograder E2E", email: "live-admin@e2e.test", role: "ADMIN", hasFinishedOnboarding: true },
    });
  });

  try {
    await loginAs(page, LIVE_ADMIN_ID);
    await page.goto("/administration");
    await expect(page.getByText("Gestion avancée de la plateforme")).toBeVisible();

    // Rétrogradation faite en base pendant que l'administrateur est connecté
    await withTestDb((prisma) => prisma.user.update({ where: { id: LIVE_ADMIN_ID }, data: { role: "COACH" } }));

    await page.goto("/administration");
    await expect(page).not.toHaveURL(/\/administration/);
    await expect(page.getByText("Gestion avancée de la plateforme")).toBeHidden();
  } finally {
    await withTestDb((prisma) => prisma.user.delete({ where: { id: LIVE_ADMIN_ID } }));
  }
});
