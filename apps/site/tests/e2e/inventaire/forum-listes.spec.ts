/**
 * Inventaire de la refonte, sections 3.1 (accueil du forum), 3.2 (un forum) et 3.9 (sujets non lus) de
 * docs/refonte/inventaire.md (carte 085). Rejoué en taille ordinateur (projet chromium) et en taille téléphone
 * (projet telephone). Les éléments sont cherchés par leur rôle, leur nom accessible ou leur texte, jamais par une
 * classe CSS : le test doit passer sans modification avant et après la refonte de ces écrans.
 *
 * Données préparées par le test (et supprimées à la fin) :
 * - un lecteur sans aucune visite enregistrée, pour qui tous les sujets sont non lus ;
 * - sous le forum « E2E Forum », onze sous-forums : un forum de tournois avec 35 sujets (dont un épinglé,
 *   un verrouillé, un tournoi annulé et un archivé), un forum vide, un forum verrouillé et huit forums de remplissage.
 *
 * L'accueil du forum garde sa liste en cache pendant 60 secondes (unstable_cache, sans étiquette invalidée) :
 * les sous-forums créés ici n'y apparaissent pas, et ce test ne vérifie sur l'accueil que ce qui ne dépend pas de ce
 * cache (les forums du jeu de données de base, les liens, le non-lu, qui est calculé à chaque visite).
 *
 * Des captures sont enregistrées dans test-results/ pour la relecture humaine (pas de comparaison au pixel).
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 1024;

const READER_ID = "e2e_inv_lecteur";
const TOURNAMENT_FORUM = { id: "e2e_inv_tournois", name: "Inv Forum Tournois", description: "Sous-forum de tournois de l'inventaire" };
const EMPTY_FORUM = { id: "e2e_inv_vide", name: "Inv Forum Vide" };
const LOCKED_FORUM = { id: "e2e_inv_verrou", name: "Inv Forum Verrouillé" };
const FILLER_COUNT = 8;
const TOURNAMENT_ID = "e2e_inv_tournoi";
const REGULAR_TOPICS = 31;

/** Supprime tout ce que ce test a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await withTestDb(async (prisma) => {
    const forums = await prisma.forum.findMany({ where: { id: { startsWith: "e2e_inv_" } }, select: { id: true } });
    const forumIds = forums.map((forum) => forum.id);
    const topicWhere = { forumId: { in: forumIds } };
    await prisma.topicView.deleteMany({ where: { OR: [{ userId: READER_ID }, { topic: topicWhere }] } });
    await prisma.post.deleteMany({ where: { topic: topicWhere } });
    await prisma.topic.deleteMany({ where: topicWhere });
    await prisma.tournament.deleteMany({ where: { id: TOURNAMENT_ID } });
    await prisma.forum.deleteMany({ where: { id: { in: forumIds } } });
    await prisma.user.deleteMany({ where: { id: READER_ID } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await withTestDb(async (prisma) => {
    await prisma.user.create({ data: { id: READER_ID, name: "Lecteur Inventaire", email: "lecteur-inventaire@e2e.test", hasFinishedOnboarding: true } });

    // Dates dans le passé : un sujet daté du futur resterait « non lu » même après « Tout marquer comme lu »
    const now = Date.now() - 2 * 60 * 60_000;
    const minutes = (count: number) => new Date(now + count * 60_000);
    await prisma.forum.create({
      data: { ...TOURNAMENT_FORUM, parentForumId: E2E.forumId, isTournamentForum: true, order: 1 },
    });
    await prisma.forum.create({ data: { ...EMPTY_FORUM, parentForumId: E2E.forumId, order: 2 } });
    await prisma.forum.create({ data: { ...LOCKED_FORUM, parentForumId: E2E.forumId, isLocked: true, order: 3 } });
    for (let index = 1; index <= FILLER_COUNT; index++) {
      await prisma.forum.create({
        data: { id: `e2e_inv_extra_${index}`, name: `Inv Forum Extra ${index}`, parentForumId: E2E.forumId, order: 3 + index },
      });
    }

    const topic = (id: string, title: string, updatedAt: Date, extra: Record<string, unknown> = {}) =>
      prisma.topic.create({
        data: {
          id,
          title,
          forumId: TOURNAMENT_FORUM.id,
          authorId: E2E.coachId,
          createdAt: updatedAt,
          updatedAt,
          views: 42,
          posts: { create: { content: `Message de ${title}`, authorId: E2E.coachId } },
          ...extra,
        },
      });

    // Le sujet épinglé est le plus ancien : il doit pourtant rester en tête de liste
    await topic("e2e_inv_topic_sticky", "Inv sujet épinglé", minutes(-24 * 60), { isSticky: true });
    for (let index = 1; index <= REGULAR_TOPICS; index++) {
      const number = String(index).padStart(2, "0");
      await topic(`e2e_inv_topic_${number}`, `Inv sujet ${number}`, minutes(-index));
    }
    await topic("e2e_inv_topic_locked", "Inv sujet verrouillé", minutes(-100), { isLocked: true });
    await topic("e2e_inv_topic_archived", "Inv sujet archivé", minutes(5), { isArchived: true });
    await prisma.tournament.create({
      data: { id: TOURNAMENT_ID, name: "Tournoi de l'inventaire", date: new Date("2026-01-10T10:00:00Z"), location: "Paris", organizerId: E2E.coachId, isCancelled: true },
    });
    // Le tournoi annulé est le sujet le plus récent du sous-forum : il apparaît comme « dernier sujet »
    await topic("e2e_inv_topic_tournament", "Inv tournoi annulé", minutes(1), { tournamentId: TOURNAMENT_ID });
  });
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
});

/**
 * Cherche une action visible dans la page. Sur téléphone, les actions de la colonne latérale sont dans le bloc
 * « Outils du forum », sous la liste (carte 156).
 */
async function findAction(page: Page, role: "link" | "button", name: string | RegExp): Promise<Locator> {
  return page.getByRole(role, { name }).filter({ visible: true }).first();
}

/** Ferme le panneau « Plus » s'il est ouvert. */
async function closeMore(page: Page) {
  const panel = page.getByRole("dialog", { name: "Plus" });
  if (await panel.isVisible()) {
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
  }
}

/** Vérifie qu'aucune action de ce nom n'existe, ni dans la page ni dans le panneau « Plus ». */
async function expectNoAction(page: Page, role: "link" | "button", name: string | RegExp) {
  await expect(page.getByRole(role, { name, includeHidden: true })).toHaveCount(0);
}

/** Titres des sujets créés par ce test, dans l'ordre d'affichage. */
async function shownTopicTitles(page: Page): Promise<string[]> {
  const texts = await page.getByRole("link", { name: /Inv (sujet|tournoi)/ }).filter({ visible: true }).allTextContents();
  return texts.map((text) => text.match(/Inv (?:sujet (?:\d+|épinglé|verrouillé|archivé)|tournoi annulé)/)?.[0] ?? text);
}

/** Liens vers un sujet visibles dans la page (une ligne de liste par sujet). */
const topicLinks = (page: Page) => page.locator('a[href^="/forum/topic/"]').filter({ visible: true });

/** Remet le lecteur dans l'état « rien n'a été lu ». */
const resetReader = () => withTestDb((prisma) => prisma.topicView.deleteMany({ where: { userId: READER_ID } }));

const DATE = /\d{2}\/\d{2}\/\d{4}/;

/**
 * Passe à la page suivante par la pagination visible (nommée « Pagination ») : bouton « 2 » ou « next »
 * de l'ancienne pagination, ou lien « Page suivante » de la nouvelle.
 */
async function goToNextPage(page: Page) {
  const pager = page.getByRole("navigation", { name: "Pagination" }).filter({ visible: true }).first();
  await expect(pager).toBeVisible();
  await pager.getByRole("button", { name: /^(2|next)$/ }).or(pager.getByRole("link", { name: "Page suivante" })).first().click();
  await page.waitForURL(/[?&]page=2/);
  await page.waitForLoadState("networkidle");
}

/** Attend que la base indique l'état de verrouillage voulu (chaque lecture peut attendre que la base se libère). */
const expectForumLock = (id: string, isLocked: boolean) =>
  expect
    .poll(() => withTestDb((prisma) => prisma.forum.findUnique({ where: { id }, select: { isLocked: true } })), { timeout: 30_000 })
    .toEqual({ isLocked });

test.describe("3.1 accueil du forum", () => {
  test("[tous] catégories repliables, forums, dernier sujet et liens", async ({ page }, testInfo) => {
    await page.goto("/forum", { waitUntil: "networkidle" });
    const forumLink = page.getByRole("link", { name: /^\s*E2E Forum(?! Secret)/ }).filter({ visible: true }).first();
    await expect(forumLink).toHaveAttribute("href", `/forum/${E2E.forumId}`);

    if (!isPhone(page)) {
      // Nombre de sujets, et dernier sujet avec son auteur et sa date (avant la refonte, absents sur téléphone)
      await expect(forumLink.getByText(/\d+\s*sujets?/)).toBeVisible();
      await expect(forumLink).toContainText(/Par\s+Coach E2E/i);
      await expect(forumLink).toContainText(DATE);
    }
    await page.screenshot({ path: testInfo.outputPath("accueil-visiteur.png"), fullPage: true });

    // Catégorie repliable : un appui sur son nom masque ses forums, un second les réaffiche
    await page.getByText(E2E.categoryName, { exact: true }).filter({ visible: true }).first().click();
    await expect(page.getByRole("link", { name: /^\s*E2E Forum(?! Secret)/ }).filter({ visible: true })).toHaveCount(0);
    await page.getByText(E2E.categoryName, { exact: true }).filter({ visible: true }).first().click();
    await expect(forumLink).toBeVisible();

    await expect(await findAction(page, "link", "Recherche avancée")).toHaveAttribute("href", "/forum/search");
    await expect(await findAction(page, "link", "Les membres")).toHaveAttribute("href", "/membres");
    await closeMore(page);

    // Réservé aux membres et aux modérateurs
    await expectNoAction(page, "button", "Tout marquer comme lu");
    await expectNoAction(page, "link", "Nouveau forum");
  });

  test("[tous] message après la suppression d'un sujet ou d'un forum, puis adresse nettoyée", async ({ page }) => {
    await page.goto("/forum?deletedForum=Forum%20disparu", { waitUntil: "networkidle" });
    await expect(page.getByText(/Forum supprimé/)).toBeVisible();
    await expect(page.getByText("Forum disparu")).toBeVisible();

    await page.goto("/forum?deletedTopic=Sujet%20disparu", { waitUntil: "networkidle" });
    await expect(page.getByText(/Sujet supprimé/)).toBeVisible();
    await expect(page.getByText("Sujet disparu")).toBeVisible();
    // Au bout de 8 secondes, le message disparaît et le paramètre est retiré de l'adresse
    await expect(page).not.toHaveURL(/deletedTopic/, { timeout: 15_000 });
    await expect(page.getByText(/Sujet supprimé/)).toHaveCount(0);
  });

  test("[membre] non-lus : lien vers la liste et « Tout marquer comme lu » avec confirmation", async ({ page }, testInfo) => {
    await resetReader();
    await loginAs(page, READER_ID);
    await page.goto("/forum", { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("accueil-membre.png"), fullPage: true });

    const unreadLink = await findAction(page, "link", /non lus/);
    await expect(unreadLink).toHaveAttribute("href", "/forum/unread");
    await expect(unreadLink).toContainText(/\d+/);

    // Le forum E2E contient du non-lu pour ce lecteur : son nom reste visible (la cloche est vérifiée sur les captures)
    await expect(page.getByRole("link", { name: /^\s*E2E Forum(?! Secret)/ }).filter({ visible: true }).first()).toBeVisible();

    await (await findAction(page, "button", "Tout marquer comme lu")).click();
    const dialog = page.getByRole("dialog", { name: "Tout marquer comme lu" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Confirmer" }).click();
    await expect(dialog).toBeHidden();

    await page.goto("/forum", { waitUntil: "networkidle" });
    await expectNoAction(page, "link", /non lus/);
    await expectNoAction(page, "button", "Tout marquer comme lu");
  });

  test("[membre] les forums réservés aux modérateurs sont masqués", async ({ page }) => {
    await loginAs(page, E2E.coachId);
    await page.goto("/forum", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: /^\s*E2E Forum(?! Secret)/ }).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(E2E.secretForumName)).toHaveCount(0);
    await expect(page.getByText(E2E.secretCategoryName)).toHaveCount(0);
    await expectNoAction(page, "link", "Nouveau forum");
  });

  test("[modo] forums réservés visibles et bouton « Nouveau forum »", async ({ page }, testInfo) => {
    await loginAs(page, E2E.modoId);
    await page.goto("/forum", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: new RegExp(E2E.secretForumName) }).filter({ visible: true }).first()).toHaveAttribute(
      "href",
      `/forum/${E2E.secretForumId}`
    );
    await expect(page.getByText(E2E.secretCategoryName, { exact: true }).filter({ visible: true }).first()).toBeVisible();
    await expect(await findAction(page, "link", "Nouveau forum")).toHaveAttribute("href", /^\/forum\/new-forum/);
    await page.screenshot({ path: testInfo.outputPath("accueil-modo.png"), fullPage: true });
  });
});

test.describe("3.2 un forum", () => {
  const forumUrl = `/forum/${TOURNAMENT_FORUM.id}`;

  test("[tous] titre, description, sujets triés, badge de tournoi et pagination de 30", async ({ page }, testInfo) => {
    await page.goto(forumUrl, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: TOURNAMENT_FORUM.name })).toBeVisible();
    await expect(page.getByText(TOURNAMENT_FORUM.description)).toBeVisible();

    // Épinglé en premier, puis du plus récent au plus ancien ; l'archivé n'apparaît pas
    const firstPage = await shownTopicTitles(page);
    expect(firstPage).toHaveLength(30);
    expect(firstPage.slice(0, 4)).toEqual(["Inv sujet épinglé", "Inv tournoi annulé", "Inv sujet 01", "Inv sujet 02"]);
    expect(firstPage).not.toContain("Inv sujet archivé");

    const tournamentRow = page.getByRole("link", { name: /Inv tournoi annulé/ }).filter({ visible: true }).first();
    await expect(tournamentRow).toHaveAttribute("href", "/forum/topic/e2e_inv_topic_tournament");
    await expect(tournamentRow.getByText("Annulé", { exact: true })).toBeVisible();
    await expect(tournamentRow.getByText(/Par\s+Coach E2E/i)).toBeVisible();
    if (!isPhone(page)) {
      // Messages, vues et dernière activité (avant la refonte, absents sur téléphone)
      await expect(tournamentRow.getByText(/\d+\s*(msgs?|messages?)/)).toBeVisible();
      await expect(tournamentRow.getByText(/42\s*vues/)).toBeVisible();
      await expect(tournamentRow).toContainText(DATE);
    }
    await page.screenshot({ path: testInfo.outputPath("forum-visiteur.png"), fullPage: true });

    // Pagination : l'adresse ?page=2 donne la suite (4 sujets), sans répéter l'épinglé
    await goToNextPage(page);
    await expect(page).toHaveURL(new RegExp(`${forumUrl}\\?page=2$`));
    const secondPage = await shownTopicTitles(page);
    expect(secondPage).toEqual(["Inv sujet 29", "Inv sujet 30", "Inv sujet 31", "Inv sujet verrouillé"]);

    // Un visiteur ne peut pas créer de sujet
    await expectNoAction(page, "link", /nouveau sujet/i);
  });

  test("[tous] sous-forums : 10 au plus, avec description, nombre de sujets, dernier sujet et badge", async ({ page }, testInfo) => {
    await page.goto(`/forum/${E2E.forumId}`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: E2E.forumName })).toBeVisible();

    const tournamentSub = page.getByRole("link", { name: new RegExp(TOURNAMENT_FORUM.name) }).filter({ visible: true }).first();
    await expect(tournamentSub).toHaveAttribute("href", `/forum/${TOURNAMENT_FORUM.id}`);
    await expect(tournamentSub).toContainText(TOURNAMENT_FORUM.description);
    const emptySub = page.getByRole("link", { name: new RegExp(EMPTY_FORUM.name) }).filter({ visible: true }).first();
    await expect(emptySub).toBeVisible();
    if (!isPhone(page)) {
      // Nombre de sujets, dernier sujet et badge (avant la refonte, absents sur téléphone)
      await expect(tournamentSub.getByText(/\d+\s*sujets?/)).toBeVisible();
      await expect(tournamentSub.getByText(/Inv tournoi annulé/)).toBeVisible();
      await expect(tournamentSub.getByText("Annulé", { exact: true })).toBeVisible();
      await expect(tournamentSub).toContainText(/Par\s+Coach E2E/i);
      await expect(emptySub.getByText("Aucun sujet")).toBeVisible();
    }

    // Onze sous-forums existent, dix sont affichés (rangés par ordre)
    await expect(page.getByRole("link", { name: /Inv Forum Extra 7/ }).filter({ visible: true })).toHaveCount(1);
    await expect(page.getByRole("link", { name: /Inv Forum Extra 8/ })).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("forum-sous-forums.png"), fullPage: true });

    // Liste vide
    await page.goto(`/forum/${EMPTY_FORUM.id}`, { waitUntil: "networkidle" });
    await expect(page.getByText("Aucun sujet dans ce forum pour le moment.")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("forum-vide.png"), fullPage: true });
  });

  test("[visiteur] un forum réservé envoie vers la connexion ; [membre sans le rôle] page introuvable", async ({ page }) => {
    await page.goto(`/forum/${E2E.secretForumId}`);
    await expect(page).toHaveURL(new RegExp(`/auth/login\\?callbackUrl=.*${E2E.secretForumId}`));

    await loginAs(page, E2E.coachId);
    const response = await page.goto(`/forum/${E2E.secretForumId}`);
    expect(response?.status()).toBe(404);
  });

  test("[membre] nouveau sujet, nouveau tournoi, recherche avancée et membres", async ({ page }, testInfo) => {
    await loginAs(page, E2E.coachId);
    await page.goto(forumUrl, { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("forum-membre.png"), fullPage: false });
    await expect(await findAction(page, "link", /nouveau sujet/i)).toHaveAttribute("href", `/forum/new-topic?forumId=${TOURNAMENT_FORUM.id}`);
    await expect(await findAction(page, "link", /nouveau tournoi/i)).toHaveAttribute("href", `/forum/new-tournament?forumId=${TOURNAMENT_FORUM.id}`);
    await expect(await findAction(page, "link", "Recherche avancée")).toHaveAttribute("href", `/forum/search?forumId=${TOURNAMENT_FORUM.id}`);
    await expect(await findAction(page, "link", "Les membres")).toHaveAttribute("href", "/membres");
    await closeMore(page);
    // Les outils d'administration sont réservés aux modérateurs
    await expectNoAction(page, "button", /Supprimer/);
    await expectNoAction(page, "button", /^Verrouiller/);

    // Forum ordinaire : pas de « Nouveau tournoi »
    await page.goto(`/forum/${E2E.forumId}`, { waitUntil: "networkidle" });
    await expect(await findAction(page, "link", /nouveau sujet/i)).toHaveAttribute("href", `/forum/new-topic?forumId=${E2E.forumId}`);
    await expectNoAction(page, "link", /nouveau tournoi/i);
  });

  test("[membre] forum verrouillé : bouton désactivé « Forum verrouillé » ; [modo] peut toujours créer", async ({ page }) => {
    await loginAs(page, E2E.coachId);
    await page.goto(`/forum/${LOCKED_FORUM.id}`, { waitUntil: "networkidle" });
    await expect(await findAction(page, "button", /Forum verrouillé/)).toBeDisabled();
    await expectNoAction(page, "link", /nouveau sujet/i);

    await loginAs(page, E2E.modoId);
    await page.goto(`/forum/${LOCKED_FORUM.id}`, { waitUntil: "networkidle" });
    await expect(await findAction(page, "link", /nouveau sujet/i)).toHaveAttribute("href", `/forum/new-topic?forumId=${LOCKED_FORUM.id}`);
    await expect(await findAction(page, "button", /^Déverrouiller/)).toBeVisible();
  });

  test("[modo] nouveau sous-forum : fenêtre « Limite atteinte » au-delà de 5", async ({ page }) => {
    await loginAs(page, E2E.modoId);
    await page.goto(`/forum/${E2E.forumId}`, { waitUntil: "networkidle" });
    const newForum = await findAction(page, "link", "Nouveau forum");
    await expect(newForum).toHaveAttribute("href", new RegExp(`^/forum/new-forum\\?.*parentForumId=${E2E.forumId}`));
    await newForum.click();
    await expect(page.getByRole("dialog", { name: "Limite atteinte" })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/forum/${E2E.forumId}$`));
  });

  test("[modo] verrouiller, déverrouiller puis supprimer un forum avec confirmation", async ({ page }, testInfo) => {
    const throwaway = { id: "e2e_inv_jetable", name: "Inv Forum Jetable" };
    await withTestDb(async (prisma) => {
      await prisma.forum.create({ data: { ...throwaway, parentForumId: E2E.forumId, order: 99 } });
      await prisma.forum.create({ data: { id: "e2e_inv_jetable_sous", name: "Inv Forum Jetable Sous", parentForumId: throwaway.id } });
      await prisma.topic.create({
        data: { id: "e2e_inv_topic_jetable", title: "Inv sujet jetable", forumId: throwaway.id, authorId: E2E.coachId, posts: { create: { content: "À supprimer", authorId: E2E.coachId } } },
      });
    });

    await loginAs(page, E2E.modoId);
    await page.goto(`/forum/${throwaway.id}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("forum-modo.png"), fullPage: false });

    await (await findAction(page, "button", /^Verrouiller/)).click();
    await closeMore(page);
    await expectForumLock(throwaway.id, true);
    await page.reload({ waitUntil: "networkidle" });
    await (await findAction(page, "button", /^Déverrouiller/)).click();
    await closeMore(page);
    await expectForumLock(throwaway.id, false);

    await page.reload({ waitUntil: "networkidle" });
    await (await findAction(page, "button", /Supprimer/)).click();
    const dialog = page.getByRole("dialog", { name: new RegExp(`Supprimer le forum.*${throwaway.name}`) });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Confirmer" }).click();
    await page.waitForURL(/\/forum\?deletedForum=/);
    await expect(page.getByText(/Forum supprimé/)).toBeVisible();

    // Le forum, son sous-forum et son sujet ont disparu
    const left = await withTestDb(async (prisma) => ({
      forums: await prisma.forum.count({ where: { id: { in: [throwaway.id, "e2e_inv_jetable_sous"] } } }),
      topics: await prisma.topic.count({ where: { id: "e2e_inv_topic_jetable" } }),
    }));
    expect(left).toEqual({ forums: 0, topics: 0 });
  });
});

test.describe("3.9 sujets non lus", () => {
  test("[visiteur] est renvoyé vers la connexion", async ({ page }) => {
    await page.goto("/forum/unread");
    await expect(page).toHaveURL(/\/auth\/login\?callbackUrl=.*forum.*unread/);
  });

  test("[membre] liste paginée par 20, marquer un sujet puis tout comme lu, liste vide", async ({ page }, testInfo) => {
    await resetReader();
    await loginAs(page, READER_ID);
    await page.goto("/forum/unread", { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("non-lus.png"), fullPage: true });

    await expect(topicLinks(page)).toHaveCount(20);
    // Le sujet le plus récent est en tête : titre, forum et auteur
    const first = page.getByRole("link", { name: /Inv tournoi annulé/ }).filter({ visible: true }).first();
    await expect(first).toBeVisible();
    await expect(first).toContainText(TOURNAMENT_FORUM.name);
    await expect(first).toContainText("Coach E2E");
    if (!isPhone(page)) {
      // Nombre de messages et date du dernier message, et pagination (avant la refonte, absents sur téléphone)
      await expect(page.getByText(/\d+\s*(msgs?|messages?)/).filter({ visible: true }).first()).toBeVisible();
      await goToNextPage(page);
      await expect(page).toHaveURL(/\/forum\/unread\?page=2$/);
    } else {
      await page.goto("/forum/unread?page=2", { waitUntil: "networkidle" });
    }

    expect(await topicLinks(page).count()).toBeGreaterThan(0);

    // Marquer un sujet comme lu : il quitte la liste
    await page.goto("/forum/unread", { waitUntil: "networkidle" });
    const firstHref = await topicLinks(page).first().getAttribute("href");
    await page.getByRole("button", { name: "Marquer ce sujet comme lu" }).filter({ visible: true }).first().click();
    await expect(page.locator(`a[href="${firstHref}"]`).filter({ visible: true })).toHaveCount(0);

    // Tout marquer comme lu, avec confirmation, puis liste vide avec un retour au forum
    await page.getByRole("button", { name: "Tout marquer comme lu" }).filter({ visible: true }).first().click();
    const dialog = page.getByRole("dialog", { name: "Tout marquer comme lu" });
    await dialog.getByRole("button", { name: "Confirmer" }).click();
    await expect(dialog).toBeHidden();
    await page.goto("/forum/unread", { waitUntil: "networkidle" });
    await expect(page.getByText(/Vous êtes à jour/)).toBeVisible();
    const back = page.getByRole("link", { name: /forum/i }).filter({ visible: true }).filter({ hasText: /Retour/ });
    await expect(back.first()).toHaveAttribute("href", "/forum");
    await page.screenshot({ path: testInfo.outputPath("non-lus-vide.png"), fullPage: false });
  });
});
