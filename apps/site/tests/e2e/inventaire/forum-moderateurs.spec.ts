/**
 * Modérateurs propres à un forum (carte 225) : un coach inscrit comme modérateur d'un forum masque un message de ce
 * forum et de son sous-forum, mais n'a ni l'outil ni le droit dans un autre forum. L'administrateur l'inscrit et le
 * retire depuis l'administration, onglet Forums. Données créées par le test, effacées à la fin.
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

const COACH_MOD = { id: "e2e_fmod_coach", name: "Inv FMod Coach" };
const AUTHOR = { id: "e2e_fmod_author", name: "Inv FMod Auteur" };
const ADMIN = { id: "e2e_fmod_admin", name: "Inv FMod Admin" };
const CATEGORY = "Inv FMod Catégorie";
const FORUM_A = { id: "e2e_fmod_forum_a", name: "Inv FMod Ligue" };
const SUB_A = { id: "e2e_fmod_forum_a_sub", name: "Inv FMod Ligue annonces" };
const FORUM_B = { id: "e2e_fmod_forum_b", name: "Inv FMod Autre" };
const TOPICS = { a: "e2e_fmod_topic_a", sub: "e2e_fmod_topic_sub", b: "e2e_fmod_topic_b" };
const POSTS = { a: "e2e_fmod_post_a", sub: "e2e_fmod_post_sub", b: "e2e_fmod_post_b" };
const USER_IDS = [COACH_MOD.id, AUTHOR.id, ADMIN.id];
const MORE_ACTIONS = "Plus d'actions sur ce message";

const postCard = (page: Page, id: string) => page.locator(`[id="post-${id}"]`);

/** Action d'un message : directe, ou dans le menu « Plus d'actions » (liste sur ordinateur, panneau sur téléphone). */
async function postActionCount(page: Page, post: Locator, name: string): Promise<number> {
  const direct = await post.getByRole("button", { name }).filter({ visible: true }).count();
  if (direct > 0) return direct;
  const more = post.getByRole("button", { name: MORE_ACTIONS }).filter({ visible: true });
  if ((await more.count()) === 0) return 0;
  await more.first().click();
  const menu = page.getByRole("menu").or(page.getByRole("dialog", { name: MORE_ACTIONS })).first();
  await expect(menu).toBeVisible();
  const count = await page.getByRole("menuitem", { name }).or(page.getByRole("dialog", { name: MORE_ACTIONS }).getByRole("button", { name })).count();
  await page.keyboard.press("Escape");
  return count;
}

async function hidePost(page: Page, postId: string) {
  const post = postCard(page, postId);
  const direct = post.getByRole("button", { name: "Masquer" }).filter({ visible: true });
  if ((await direct.count()) > 0) await direct.first().click();
  else {
    await post.getByRole("button", { name: MORE_ACTIONS }).filter({ visible: true }).first().click();
    await page.getByRole("menuitem", { name: "Masquer" }).or(page.getByRole("dialog", { name: MORE_ACTIONS }).getByRole("button", { name: "Masquer" })).first().click();
  }
  await page.getByLabel("Raison du masquage").fill("Hors sujet");
  await page.getByRole("button", { name: "Masquer le message" }).click();
}

async function cleanUp() {
  await withTestDb(async (prisma) => {
    await prisma.moderationLog.deleteMany({ where: { OR: [{ moderatorId: { in: USER_IDS } }, { targetId: { in: USER_IDS } }] } });
    await prisma.post.deleteMany({ where: { id: { in: Object.values(POSTS) } } });
    await prisma.topic.deleteMany({ where: { id: { in: Object.values(TOPICS) } } });
    await prisma.forum.deleteMany({ where: { id: SUB_A.id } });
    await prisma.forum.deleteMany({ where: { id: { in: [FORUM_A.id, FORUM_B.id] } } });
    await prisma.category.deleteMany({ where: { name: CATEGORY } });
    await prisma.user.deleteMany({ where: { id: { in: USER_IDS } } });
  });
}

test.describe("Modérateurs propres à un forum", () => {
  test.beforeEach(async () => {
    await cleanUp();
    await withTestDb(async (prisma) => {
      for (const role of [{ name: "ADMIN", label: "Administrateur", power: 90 }]) {
        await prisma.roleConfig.upsert({ where: { name: role.name }, update: {}, create: { ...role, isBaseRole: true } });
      }
      const base = { hasFinishedOnboarding: true };
      await prisma.user.create({ data: { ...base, id: COACH_MOD.id, name: COACH_MOD.name, email: "fmod-coach@e2e.test" } });
      await prisma.user.create({ data: { ...base, id: AUTHOR.id, name: AUTHOR.name, email: "fmod-author@e2e.test" } });
      await prisma.user.create({ data: { ...base, id: ADMIN.id, name: ADMIN.name, email: "fmod-admin@e2e.test", role: "ADMIN" } });
      const category = await prisma.category.create({ data: { name: CATEGORY, order: 900 } });
      await prisma.forum.create({ data: { id: FORUM_A.id, name: FORUM_A.name, categoryId: category.id, order: 1 } });
      await prisma.forum.create({ data: { id: SUB_A.id, name: SUB_A.name, parentForumId: FORUM_A.id, order: 1 } });
      await prisma.forum.create({ data: { id: FORUM_B.id, name: FORUM_B.name, categoryId: category.id, order: 2 } });
      for (const [key, forumId] of [["a", FORUM_A.id], ["sub", SUB_A.id], ["b", FORUM_B.id]] as const) {
        await prisma.topic.create({ data: { id: TOPICS[key], title: `Inv FMod sujet ${key}`, forumId, authorId: AUTHOR.id } });
        await prisma.post.create({ data: { id: POSTS[key], topicId: TOPICS[key], authorId: AUTHOR.id, content: `Inv FMod message ${key}` } });
      }
    });
  });

  test.afterAll(cleanUp);

  test("l'administrateur inscrit un modérateur de forum, qui modère ce forum et son sous-forum seulement", async ({ page }) => {
    // Avant : le coach n'a aucun outil de modération
    await loginAs(page, COACH_MOD.id);
    await page.goto(`/forum/topic/${TOPICS.a}`, { waitUntil: "networkidle" });
    expect(await postActionCount(page, postCard(page, POSTS.a), "Masquer")).toBe(0);

    // L'administrateur l'inscrit sur le forum A, depuis Administration > Forums
    await page.context().clearCookies();
    await loginAs(page, ADMIN.id);
    await page.goto("/administration?tab=structure", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: `Modifier le forum ${FORUM_A.name}` }).filter({ visible: true }).first().click();
    const panel = page.getByRole("dialog", { name: `Modifier : ${FORUM_A.name}` });
    await expect(panel.getByText("Modérateurs de ce forum")).toBeVisible();
    await panel.getByRole("textbox", { name: "Ajouter un membre…" }).fill("Inv FMod Co");
    await page.getByText(COACH_MOD.name, { exact: true }).filter({ visible: true }).first().click();
    await expect.poll(() => withTestDb((prisma) => prisma.forumModerator.count({ where: { forumId: FORUM_A.id, userId: COACH_MOD.id } })), { timeout: 15_000 }).toBe(1);
    await expect.poll(() => withTestDb((prisma) => prisma.moderationLog.count({ where: { action: "FORUM_MODERATOR_ADDED", targetId: COACH_MOD.id } }))).toBe(1);

    // Le coach masque un message du forum A, puis du sous-forum
    await page.context().clearCookies();
    await loginAs(page, COACH_MOD.id);
    for (const [topic, post] of [[TOPICS.a, POSTS.a], [TOPICS.sub, POSTS.sub]]) {
      await page.goto(`/forum/topic/${topic}`, { waitUntil: "networkidle" });
      await hidePost(page, post);
      await expect.poll(() => withTestDb(async (prisma) => (await prisma.post.findUnique({ where: { id: post }, select: { isModerated: true } }))?.isModerated), { timeout: 15_000 }).toBe(true);
    }

    // Dans le forum B, aucun outil de modération
    await page.goto(`/forum/topic/${TOPICS.b}`, { waitUntil: "networkidle" });
    expect(await postActionCount(page, postCard(page, POSTS.b), "Masquer")).toBe(0);
  });

  test("retiré par l'administrateur, le coach perd l'outil", async ({ page }) => {
    await withTestDb((prisma) => prisma.forumModerator.create({ data: { forumId: FORUM_A.id, userId: COACH_MOD.id } }));
    await loginAs(page, ADMIN.id);
    await page.goto("/administration?tab=structure", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: `Modifier le forum ${FORUM_A.name}` }).filter({ visible: true }).first().click();
    const panel = page.getByRole("dialog", { name: `Modifier : ${FORUM_A.name}` });
    await expect(panel.getByText(COACH_MOD.name)).toBeVisible();
    await panel.getByRole("button", { name: `Retirer ${COACH_MOD.name}` }).click();
    await expect.poll(() => withTestDb((prisma) => prisma.forumModerator.count({ where: { userId: COACH_MOD.id } })), { timeout: 15_000 }).toBe(0);

    await page.context().clearCookies();
    await loginAs(page, COACH_MOD.id);
    await page.goto(`/forum/topic/${TOPICS.a}`, { waitUntil: "networkidle" });
    expect(await postActionCount(page, postCard(page, POSTS.a), "Masquer")).toBe(0);
  });
});

test("un modérateur du site garde la main partout", async ({ page }) => {
  await loginAs(page, E2E.modoId);
  await page.goto(`/forum/topic/${E2E.topicId}`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
