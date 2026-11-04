/**
 * Notifications du site (carte 167) : une mention dans une réponse prévient le membre mentionné sous la cloche, sans
 * prévenir un membre qui n'a pas accès au forum ; l'auteur suit automatiquement le sujet auquel il répond ; la page
 * /notifications mène au bon message et marque la notification comme lue ; « Tout marquer comme lu » vide la pastille.
 * Lancement seul : `node scripts/e2e-db.mjs` puis `npx playwright test tests/e2e/inventaire/notifications.spec.ts` dans
 * apps/site (chemin sans « / » au début sous Git Bash).
 */
import { test, expect } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

const TOPIC = { id: "e2e_notif_topic", title: "Inv notifications sujet public" };
const SECRET_TOPIC = { id: "e2e_notif_secret", title: "Inv notifications sujet réservé" };
const REPLY = "Réponse des notifications pour";

async function cleanUp() {
  await withTestDb(async (prisma) => {
    const topicWhere = { id: { in: [TOPIC.id, SECRET_TOPIC.id] } };
    await prisma.notification.deleteMany({ where: { OR: [{ topic: topicWhere }, { userId: { in: [E2E.coachId, E2E.modoId] } }] } });
    await prisma.topicFollow.deleteMany({ where: { topic: topicWhere } });
    await prisma.topicView.deleteMany({ where: { topic: topicWhere } });
    await prisma.mention.deleteMany({ where: { post: { topic: topicWhere } } });
    await prisma.post.deleteMany({ where: { topic: topicWhere } });
    await prisma.topic.deleteMany({ where: topicWhere });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await withTestDb(async (prisma) => {
    for (const [topic, forumId] of [[TOPIC, E2E.forumId], [SECRET_TOPIC, E2E.secretForumId]] as const) {
      await prisma.topic.create({ data: { id: topic.id, title: topic.title, forumId, authorId: E2E.modoId } });
      await prisma.post.create({ data: { id: `${topic.id}_p1`, topicId: topic.id, authorId: E2E.modoId, content: "Premier message" } });
    }
    // Une notification de suivi non lue, sans message précis : lire le sujet ne la marque pas lue, seul « Tout marquer
    // comme lu » le fait
    await prisma.notification.create({ data: { userId: E2E.modoId, type: "FOLLOWED_REPLY", topicId: TOPIC.id, actorId: E2E.coachId } });
  });
});

test.afterAll(cleanUp);

test("[membre] mention sous la cloche, filtrée par les droits du forum, puis lue depuis /notifications", async ({ page }) => {
  // Le serveur de développement compile chaque page à sa première visite : plusieurs pages neuves dans ce test
  test.setTimeout(240_000);
  // Le coach répond dans le sujet public en mentionnant le modérateur
  await loginAs(page, E2E.coachId);
  await page.goto(`/forum/topic/${TOPIC.id}`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("Écrivez votre réponse ici...").fill(`${REPLY} [mention=${E2E.modoId}]Modo[/mention]`);
  await page.getByRole("button", { name: "Envoyer ma réponse" }).click();
  await expect(page.getByText(REPLY, { exact: false })).toBeVisible({ timeout: 20_000 });

  await expect.poll(() => withTestDb((prisma) => prisma.notification.count({
    where: { userId: E2E.modoId, type: "MENTION", topicId: TOPIC.id, readAt: null },
  })), { timeout: 30_000 }).toBe(1);
  // Abonnement automatique de l'auteur de la réponse
  await expect.poll(() => withTestDb((prisma) => prisma.topicFollow.count({ where: { userId: E2E.coachId, topicId: TOPIC.id } })), { timeout: 30_000 }).toBe(1);

  // Le modérateur mentionne le coach dans un forum réservé à l'équipe : le coach n'est pas prévenu
  await loginAs(page, E2E.modoId);
  await page.goto(`/forum/topic/${SECRET_TOPIC.id}`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("Écrivez votre réponse ici...").fill(`${REPLY} [mention=${E2E.coachId}]Coach[/mention]`);
  await page.getByRole("button", { name: "Envoyer ma réponse" }).click();
  await expect(page.getByText(REPLY, { exact: false })).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => withTestDb((prisma) => prisma.post.count({ where: { topicId: SECRET_TOPIC.id } })), { timeout: 30_000 }).toBe(2);
  expect(await withTestDb((prisma) => prisma.notification.count({ where: { userId: E2E.coachId, topicId: SECRET_TOPIC.id } }))).toBe(0);

  // Cloche du modérateur, en taille téléphone : pastille, puis la page et le lien vers le bon message
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  const bell = page.getByRole("link", { name: /^Notifications, 2 non lue/ }).first();
  await expect(bell).toBeVisible({ timeout: 30_000 });
  const box = await bell.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  await bell.click();
  await expect(page).toHaveURL(/\/notifications$/, { timeout: 60_000 });
  const row = page.getByRole("link", { name: /vous a mentionné dans/ });
  await expect(row).toBeVisible();
  await row.click();
  await expect(page).toHaveURL(new RegExp(`/forum/topic/${TOPIC.id}\\?page=1#post-`), { timeout: 60_000 });

  // La mention est lue ; « Tout marquer comme lu » lit la notification restante et vide la pastille
  await page.goto("/notifications", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: /^Notifications, 1 non lue/ }).first()).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Tout marquer comme lu" }).click();
  await expect(page.getByRole("button", { name: "Tout marquer comme lu" })).toHaveCount(0, { timeout: 30_000 });
  await expect(page.getByRole("link", { name: /^Notifications, 0 non lue/ }).first()).toBeVisible({ timeout: 30_000 });
});
