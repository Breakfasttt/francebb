/**
 * Inventaire de la refonte, section 3.3 (page d'un sujet du forum) et partie « Rendu des messages » de la section 2
 * de docs/refonte/inventaire.md (carte 086). Rejoué en taille ordinateur (projet chromium) et en taille téléphone
 * (projet telephone). Les éléments sont cherchés par leur rôle, leur nom accessible ou leur texte, jamais par une
 * classe CSS : le test doit passer sans modification avant et après la refonte de cet écran. Seules les ancres de
 * l'inventaire (id="post-<id>", id="quick-reply-area") servent à repérer un message ou la réponse rapide.
 *
 * Les actions rares d'un message peuvent se trouver directement sous le message ou dans un menu « Plus d'actions
 * sur ce message », et les statistiques de l'auteur dans une « fiche » ouverte par un appui sur son nom : les
 * petites fonctions d'aide ci-dessous cherchent aux deux endroits. C'est une adaptation de la façon de trouver
 * l'élément, pas un changement de ce qui est attendu.
 *
 * Données préparées par le test (et supprimées à la fin) :
 * - trois membres : l'auteur du sujet (avec numéro NAF, équipe, région, ligue et signature), un lecteur et un
 *   membre que le lecteur a bloqué ;
 * - un sujet principal de 45 messages (3 pages) avec, au début, une citation, un message de membre banni, un
 *   message de membre bloqué, un message modéré, un message supprimé, un message modifié et un message avec réaction ;
 * - un sujet de tournoi de 22 messages, un sujet verrouillé, un sous-forum verrouillé, un petit sujet pour les
 *   actions qui modifient (réponse rapide, modération, suppression) et un sujet de tournoi à supprimer.
 *
 * Des captures sont enregistrées dans test-results/ pour la relecture humaine (pas de comparaison au pixel).
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 1024;

const AUTHOR = { id: "e2e_suj_auteur", name: "Auteur Sujet" };
const READER = { id: "e2e_suj_lecteur", name: "Lecteur Sujet" };
const BLOCKED = { id: "e2e_suj_bloque", name: "Bloqué Sujet" };
const LIGUE = { id: "e2e_suj_ligue", name: "Ligue Sujet de Test", acronym: "LST" };

const TOPIC = { id: "e2e_suj_topic", title: "Inv sujet principal" };
const POST_COUNT = 45;
const postId = (n: number) => `e2e_suj_p${String(n).padStart(2, "0")}`;

const TOURNAMENT = { id: "e2e_suj_tournoi", name: "Tournoi du sujet inventaire" };
const TOURNAMENT_TOPIC = "e2e_suj_tournoi_topic";
const TOURNAMENT_POSTS = 22;
const tournamentPostId = (n: number) => `e2e_suj_t${String(n).padStart(2, "0")}`;

const LOCKED_TOPIC = "e2e_suj_verrou";
const LOCKED_FORUM = { id: "e2e_suj_forum_verrou", name: "Inv Sujet Forum Verrouillé" };
const LOCKED_FORUM_TOPIC = "e2e_suj_forum_verrou_topic";
const SMALL_TOPIC = "e2e_suj_petit";
const DELETABLE = { topic: "e2e_suj_jetable", tournament: "e2e_suj_tournoi_jetable", title: "Inv sujet à supprimer" };

const VIEWS = 4242;
const SIGNATURE = "Signature de l'auteur du sujet";

/** Supprime tout ce que ce test a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await withTestDb(async (prisma) => {
    const topicWhere = { OR: [{ id: { startsWith: "e2e_suj_" } }, { forumId: LOCKED_FORUM.id }] };
    const users = [AUTHOR.id, READER.id, BLOCKED.id];
    await prisma.moderationLog.deleteMany({ where: { targetId: { startsWith: "e2e_suj_" } } });
    await prisma.moderationReport.deleteMany({ where: { OR: [{ targetId: { startsWith: "e2e_suj_" } }, { reporterId: { in: users } }] } });
    await prisma.topicView.deleteMany({ where: { OR: [{ userId: { in: users } }, { topic: topicWhere }] } });
    await prisma.topicFollow.deleteMany({ where: { OR: [{ userId: { in: users } }, { topic: topicWhere }] } });
    await prisma.mention.deleteMany({ where: { OR: [{ post: { topic: topicWhere } }, { mentionedUserId: { in: users } }] } });
    await prisma.postReaction.deleteMany({ where: { OR: [{ post: { topic: topicWhere } }, { userId: { in: users } }] } });
    await prisma.post.deleteMany({ where: { OR: [{ topic: topicWhere }, { authorId: { in: users } }] } });
    await prisma.topic.deleteMany({ where: topicWhere });
    await prisma.tournament.deleteMany({ where: { id: { startsWith: "e2e_suj_" } } });
    await prisma.forum.deleteMany({ where: { id: LOCKED_FORUM.id } });
    await prisma.block.deleteMany({ where: { OR: [{ blockerId: { in: users } }, { blockedId: { in: users } }] } });
    await prisma.ligue.deleteMany({ where: { id: LIGUE.id } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await withTestDb(async (prisma) => {
    await prisma.user.create({
      data: {
        id: AUTHOR.id,
        name: AUTHOR.name,
        email: "auteur-sujet@e2e.test",
        hasFinishedOnboarding: true,
        nafNumber: "24680",
        equipe: "Orques de l'inventaire",
        region: "IDF",
        ligueCustom: "Ligue du garage",
        signature: SIGNATURE,
      },
    });
    // Date « tout est lu avant le… » ancienne (carte 166) : sans visite enregistrée, tout le sujet est non lu pour lui
    await prisma.user.create({
      data: { id: READER.id, name: READER.name, email: "lecteur-sujet@e2e.test", hasFinishedOnboarding: true, forumReadAllAt: new Date("2020-01-01T00:00:00Z") },
    });
    await prisma.user.create({ data: { id: BLOCKED.id, name: BLOCKED.name, email: "bloque-sujet@e2e.test", hasFinishedOnboarding: true } });
    await prisma.ligue.create({ data: { ...LIGUE, creatorId: AUTHOR.id, members: { connect: { id: AUTHOR.id } } } });
    await prisma.block.create({ data: { blockerId: READER.id, blockedId: BLOCKED.id } });

    // Dates dans le passé, une minute entre deux messages : l'ordre d'affichage est celui des numéros
    const base = Date.now() - 3 * 24 * 60 * 60_000;
    const at = (minutes: number) => new Date(base + minutes * 60_000);

    await prisma.forum.create({ data: { ...LOCKED_FORUM, parentForumId: E2E.forumId, isLocked: true, order: 50 } });

    const topic = (id: string, title: string, forumId: string, extra: Record<string, unknown> = {}) =>
      prisma.topic.create({ data: { id, title, forumId, authorId: AUTHOR.id, createdAt: at(0), updatedAt: at(0), ...extra } });
    const post = (id: string, topicId: string, minute: number, content: string, extra: Record<string, unknown> = {}) =>
      prisma.post.create({ data: { id, topicId, content, authorId: AUTHOR.id, createdAt: at(minute), updatedAt: at(minute), ...extra } });

    // Sujet principal
    await topic(TOPIC.id, TOPIC.title, E2E.forumId, { views: VIEWS });
    for (let n = 1; n <= POST_COUNT; n++) {
      let content = `Message numéro ${n} du sujet inventaire`;
      let extra: Record<string, unknown> = { authorId: n % 2 === 0 ? E2E.coachId : AUTHOR.id };
      if (n === 1) content = "Premier message de l'inventaire";
      if (n === 2) {
        content =
          `[quote=${AUTHOR.id}|${postId(1)}|${AUTHOR.name}]Premier message de l'inventaire[/quote]\n` +
          // Forme courte [quote=membre|message] : c'est la seule que reconnaît aujourd'hui getQuoteStatusMap
          `[quote=${AUTHOR.id}|${postId(6)}]Contenu supprimé e2e[/quote]\n` +
          `[quote=${AUTHOR.id}|${postId(5)}]Contenu modéré e2e[/quote]\n` +
          `Bonjour [mention=${READER.id}]${READER.name}[/mention] !`;
        extra = { authorId: E2E.modoId };
      }
      if (n === 3) {
        content = "Message du coach banni";
        extra = { authorId: E2E.bannedId };
      }
      if (n === 4) {
        content = "Message du membre bloqué";
        extra = { authorId: BLOCKED.id };
      }
      if (n === 5) {
        content = "Contenu modéré e2e";
        extra = { isModerated: true, moderatedBy: E2E.modoId, moderationReason: "Hors sujet e2e" };
      }
      if (n === 6) {
        content = "Contenu supprimé e2e";
        extra = { isDeleted: true };
      }
      if (n === 7) {
        content = "Message modifié e2e";
        extra = { updatedAt: at(n + 30) };
      }
      if (n === 8) {
        content = "Message avec une réaction";
        extra = { authorId: E2E.modoId, reactions: { create: { emoji: "👍", userId: E2E.modoId } } };
      }
      await post(postId(n), TOPIC.id, n, content, extra);
    }

    // Sujet de tournoi (organisé par l'auteur), 22 messages : le premier reste affiché en page 2
    await prisma.tournament.create({
      data: { id: TOURNAMENT.id, name: TOURNAMENT.name, date: new Date("2027-05-10T09:00:00Z"), location: "Lyon", organizerId: AUTHOR.id },
    });
    await topic(TOURNAMENT_TOPIC, "Inv sujet de tournoi", E2E.forumId, { tournamentId: TOURNAMENT.id });
    for (let n = 1; n <= TOURNAMENT_POSTS; n++) {
      await post(tournamentPostId(n), TOURNAMENT_TOPIC, n, n === 1 ? "Présentation du tournoi de l'inventaire" : `Message de tournoi ${n}`);
    }

    // Sujet verrouillé, sujet d'un forum verrouillé, petit sujet pour les actions qui modifient
    await topic(LOCKED_TOPIC, "Inv sujet verrouillé", E2E.forumId, { isLocked: true });
    await post("e2e_suj_v01", LOCKED_TOPIC, 1, "Message du sujet verrouillé");
    await topic(LOCKED_FORUM_TOPIC, "Inv sujet du forum verrouillé", LOCKED_FORUM.id);
    await post("e2e_suj_f01", LOCKED_FORUM_TOPIC, 1, "Message du forum verrouillé");
    await topic(SMALL_TOPIC, "Inv petit sujet", E2E.forumId);
    await post("e2e_suj_s01", SMALL_TOPIC, 1, "Message à modérer");
    await post("e2e_suj_s02", SMALL_TOPIC, 2, "Message à supprimer");
  });
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
});

const topicUrl = (id = TOPIC.id, query = "?page=1") => `/forum/topic/${id}${query}`;
const postCard = (page: Page, id: string) => page.locator(`[id="post-${id}"]`);
const MORE_ACTIONS = "Plus d'actions sur ce message";

/**
 * Zone des outils du sujet. Sur ordinateur, la page entière (colonne de droite). Sur téléphone, le panneau
 * « Outils du sujet », ouvert par le bouton de l'en-tête.
 */
async function topicTools(page: Page): Promise<Locator> {
  if (!isPhone(page)) return page.locator("body");
  const sheet = page.getByRole("dialog", { name: "Outils du sujet" });
  if (await sheet.isVisible()) return sheet;
  const opener = page.getByRole("button", { name: "Outils du sujet" }).filter({ visible: true });
  if ((await opener.count()) > 0) {
    await opener.first().click();
    await expect(sheet).toBeVisible();
    return sheet;
  }
  return page.locator("body");
}

/** Cherche un outil du sujet visible dans la page, sinon dans la zone des outils du téléphone. */
async function findTool(page: Page, role: "link" | "button", name: string | RegExp): Promise<Locator> {
  const onPage = page.getByRole(role, { name }).filter({ visible: true });
  if ((await onPage.count()) > 0 || !isPhone(page)) return onPage.first();
  const scope = await topicTools(page);
  return scope.getByRole(role, { name }).filter({ visible: true }).first();
}

/** Ferme le panneau d'outils ou le panneau « Plus » s'il est ouvert. */
async function closePanels(page: Page) {
  for (const name of ["Outils du sujet", "Plus", MORE_ACTIONS]) {
    const panel = page.getByRole("dialog", { name });
    if (await panel.isVisible()) {
      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();
    }
  }
  if (await page.getByRole("menu").isVisible()) await page.keyboard.press("Escape");
}

/** Vérifie qu'aucun outil de ce nom n'existe, ni dans la page ni dans les panneaux. */
async function expectNoTool(page: Page, role: "link" | "button", name: string | RegExp) {
  await expect(page.getByRole(role, { name, includeHidden: true })).toHaveCount(0);
}

/**
 * Cherche une action d'un message : visible directement dans le message, ou dans le menu « Plus d'actions sur ce
 * message » (liste déroulante sur ordinateur, panneau sur téléphone), qu'elle ouvre au besoin.
 */
async function postAction(page: Page, post: Locator, name: string | RegExp, role: "button" | "link" = "button"): Promise<Locator> {
  const direct = post.getByRole(role, { name }).filter({ visible: true });
  if ((await direct.count()) > 0) return direct.first();
  const more = post.getByRole("button", { name: MORE_ACTIONS }).filter({ visible: true });
  if ((await more.count()) === 0) return direct.first();
  const menu = page.getByRole("menu").or(page.getByRole("dialog", { name: MORE_ACTIONS }));
  // Juste après un rechargement, le bouton peut être affiché avant d'être actif : on réessaie l'ouverture
  await expect(async () => {
    if (!(await menu.first().isVisible())) await more.first().click();
    await expect(menu.first()).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 15_000 });
  return page
    .getByRole("menuitem", { name })
    .or(page.getByRole("dialog", { name: MORE_ACTIONS }).getByRole(role, { name }))
    .filter({ visible: true })
    .first();
}

/** Vérifie qu'un message n'a pas cette action, ni directement ni dans son menu « ⋯ ». */
async function expectNoPostAction(page: Page, post: Locator, name: string | RegExp, role: "button" | "link" = "button") {
  await expect(post.getByRole(role, { name })).toHaveCount(0);
  const more = post.getByRole("button", { name: MORE_ACTIONS }).filter({ visible: true });
  if ((await more.count()) === 0) return;
  const menu = page.getByRole("menu").or(page.getByRole("dialog", { name: MORE_ACTIONS })).first();
  await expect(async () => {
    if (!(await menu.isVisible())) await more.first().click();
    await expect(menu).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 15_000 });
  await expect(page.getByRole("menuitem", { name }).or(page.getByRole("dialog", { name: MORE_ACTIONS }).getByRole(role, { name }))).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
}

/**
 * Zone où se lisent les informations de l'auteur d'un message : le message lui-même, ou la « fiche » de l'auteur
 * si un bouton « … fiche … » l'ouvre.
 */
async function authorCard(page: Page, post: Locator): Promise<Locator> {
  const opener = post.getByRole("button", { name: /fiche/i }).filter({ visible: true });
  if ((await opener.count()) === 0) return post;
  await opener.first().click();
  const dialog = page.getByRole("dialog").filter({ visible: true }).last();
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Passe à la page suivante par la pagination visible (ancienne pagination ou lien « Page suivante »). */
async function goToNextPage(page: Page) {
  const pager = page.getByRole("navigation", { name: "Pagination" }).filter({ visible: true }).first();
  await expect(pager).toBeVisible();
  await pager.getByRole("button", { name: /^(2|next)$/ }).or(pager.getByRole("link", { name: "Page suivante" })).first().click();
  await page.waitForURL(/[?&]page=2/);
  await page.waitForLoadState("networkidle");
}

/** Remet le lecteur dans l'état « rien n'a été lu ». */
const resetReader = () => withTestDb((prisma) => prisma.topicView.deleteMany({ where: { userId: READER.id } }));

/** Fixe un champ du sujet principal (archivé, épinglé…) directement dans la base. */
const setTopic = (id: string, data: Record<string, unknown>) => withTestDb((prisma) => prisma.topic.update({ where: { id }, data }));

const DATE = /\d{1,2} \S+ \d{4}/;

test.describe("3.3 lecture et navigation", () => {
  test("[membre] sans ?page=, saut au premier non-lu ; le sujet est marqué comme lu et les vues augmentent", async ({ page }) => {
    await resetReader();
    await loginAs(page, READER.id);
    const viewsBefore = (await withTestDb((prisma) => prisma.topic.findUnique({ where: { id: TOPIC.id }, select: { views: true } })))!.views;

    // Jamais lu : saut au premier message
    await page.goto(`/forum/topic/${TOPIC.id}`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(new RegExp(`\\?page=1#post-${postId(1)}$`));
    await expect
      .poll(() => withTestDb((prisma) => prisma.topicView.count({ where: { userId: READER.id, topicId: TOPIC.id } })), { timeout: 30_000 })
      .toBe(1);
    await expect
      .poll(async () => (await withTestDb((prisma) => prisma.topic.findUnique({ where: { id: TOPIC.id }, select: { views: true } })))!.views, { timeout: 30_000 })
      .toBeGreaterThan(viewsBefore);

    // Lu jusqu'au message 22 : saut au message 23, en page 2, qui est affiché à l'écran
    await withTestDb(async (prisma) => {
      const read = await prisma.post.findUnique({ where: { id: postId(22) }, select: { createdAt: true } });
      await prisma.topicView.update({
        where: { userId_topicId: { userId: READER.id, topicId: TOPIC.id } },
        data: { lastReadPostAt: read!.createdAt, lastPostId: postId(22) },
      });
    });
    await page.goto(`/forum/topic/${TOPIC.id}`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(new RegExp(`\\?page=2#post-${postId(23)}$`));
    await expect(postCard(page, postId(23))).toBeInViewport();
  });

  test("[tous] ancre #post-<id>, pagination de 20, page trop grande ramenée à la dernière", async ({ page }, testInfo) => {
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    await expect(postCard(page, postId(1))).toBeVisible();
    await expect(postCard(page, postId(20))).toBeAttached();
    await expect(postCard(page, postId(21))).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("sujet-visiteur.png"), fullPage: false });

    await goToNextPage(page);
    await expect(page).toHaveURL(new RegExp(`/forum/topic/${TOPIC.id}\\?page=2$`));
    await expect(postCard(page, postId(21))).toBeVisible();
    await expect(postCard(page, postId(40))).toBeAttached();
    await expect(postCard(page, postId(20))).toHaveCount(0);

    await page.goto(`/forum/topic/${TOPIC.id}?page=2#post-${postId(35)}`, { waitUntil: "networkidle" });
    await expect(postCard(page, postId(35))).toBeInViewport();

    // Page 99 : la pagination indique la dernière page (3)
    await page.goto(topicUrl(TOPIC.id, "?page=99"), { waitUntil: "networkidle" });
    const pager = page.getByRole("navigation", { name: "Pagination" }).filter({ visible: true }).first();
    await expect(pager.getByRole("button", { name: "3", exact: true }).and(pager.locator(":disabled")).or(pager.getByText("Page 3 sur 3"))).toBeVisible();
  });

  test("[tous] « Page N sur M » ouvre le choix d'une page ; « Première page » et « Dernier message » (carte 182)", async ({ page }, testInfo) => {
    // Téléphone : la largeur la plus étroite visée par le site, pour vérifier que la barre du bas tient sans défilement
    if (isPhone(page)) await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(topicUrl(TOPIC.id, "?page=3"), { waitUntil: "networkidle" });
    const pager = page.getByRole("navigation", { name: "Pagination" }).filter({ visible: true }).first();
    await expect(pager.getByRole("link", { name: "Première page" })).toHaveAttribute("href", `/forum/topic/${TOPIC.id}?page=1`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("barre-pages.png"), fullPage: false });

    await pager.getByRole("button", { name: "Page 3 sur 3 : choisir une page" }).click();
    const dialog = page.getByRole("dialog", { name: "Choisir une page" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Dernier message" })).toHaveAttribute("href", `/forum/topic/${TOPIC.id}?page=3#post-${postId(45)}`);
    await expect(dialog.getByRole("link", { name: "Page 3, page actuelle" })).toHaveAttribute("aria-current", "page");
    await page.screenshot({ path: testInfo.outputPath("choix-page.png"), fullPage: false });

    // De la dernière page à la première en deux appuis
    await dialog.getByRole("link", { name: "Première page" }).click();
    await expect(page).toHaveURL(/[?]page=1$/);
    await expect(postCard(page, postId(1))).toBeVisible();
    await expect(dialog).toBeHidden();

    // Téléphone, membre connecté : la barre du bas porte aussi « Répondre » ; elle tient sans déborder de 360 à 412 pixels
    if (isPhone(page)) {
      await loginAs(page, READER.id);
      for (const width of [360, 375, 412]) {
        await page.setViewportSize({ width, height: 780 });
        await page.goto(topicUrl(TOPIC.id, "?page=3"), { waitUntil: "networkidle" });
        await page.evaluate(() => window.scrollTo(0, 0));
        const bar = page.locator("[data-page-bottom-bar]");
        await expect(bar.getByRole("button", { name: "Répondre" })).toBeVisible();
        const right = await bar.evaluate((el) => Math.max(...[...el.querySelectorAll("a, button")].map((b) => b.getBoundingClientRect().right)));
        expect(right).toBeLessThanOrEqual(width);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`barre-membre-${width}.png`), fullPage: false });
      }
    }
  });

  test("[visiteur] « Envie de participer ? » en bas du sujet, avec retour au sujet après la connexion (carte 185)", async ({ page }) => {
    await page.goto(topicUrl(TOPIC.id, "?page=2"), { waitUntil: "networkidle" });
    const invite = page.getByRole("region", { name: "Envie de participer ?" });
    await expect(invite).toBeVisible();
    await expect(invite.getByRole("link", { name: "Se connecter ou créer un compte" })).toHaveAttribute(
      "href",
      `/auth/login?callbackUrl=${encodeURIComponent(`/forum/topic/${TOPIC.id}?page=2`)}`
    );
    // Un membre connecté ne voit pas l'encart
    await loginAs(page, READER.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    await expect(page.getByRole("region", { name: "Envie de participer ?" })).toHaveCount(0);
  });

  test("[tous] titre, badge « ARCHIVÉ », nom du forum, retour au forum et fil d'Ariane", async ({ page }) => {
    await setTopic(TOPIC.id, { isArchived: true });
    try {
      await page.goto(topicUrl(), { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { level: 1, name: new RegExp(TOPIC.title) })).toBeVisible();
      await expect(page.getByText("ARCHIVÉ", { exact: true }).filter({ visible: true })).toBeVisible();
      await expect(page.getByText(E2E.forumName, { exact: true }).filter({ visible: true }).first()).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Retour au forum" }).or(page.getByRole("link", { name: "Retour au forum" })).filter({ visible: true }).first()
      ).toBeVisible();

      const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
      await expect(breadcrumb.getByRole("link", { name: "Accueil Forum" })).toHaveAttribute("href", "/forum");
      await expect(breadcrumb.getByText(E2E.categoryName)).toBeVisible();
      await expect(breadcrumb.getByRole("link", { name: E2E.forumName })).toHaveAttribute("href", `/forum/${E2E.forumId}`);
      await expect(breadcrumb.getByText(TOPIC.title)).toBeVisible();
    } finally {
      await setTopic(TOPIC.id, { isArchived: false });
    }
  });

  test("[visiteur] un sujet réservé envoie vers la connexion ; [membre sans le rôle] page introuvable", async ({ page }) => {
    await page.goto(`/forum/topic/${E2E.secretTopicId}?page=1`);
    await expect(page).toHaveURL(new RegExp(`/auth/login\\?callbackUrl=.*${E2E.secretTopicId}`));

    await loginAs(page, READER.id);
    const response = await page.goto(`/forum/topic/${E2E.secretTopicId}?page=1`);
    expect(response?.status()).toBe(404);
  });

  test("[membre] les messages des membres bloqués et bannis sont masqués, puis affichables", async ({ page }, testInfo) => {
    await loginAs(page, READER.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });

    const blocked = postCard(page, postId(4));
    await expect(blocked.getByText(`Utilisateur bloqué : ${BLOCKED.name}`)).toBeVisible();
    await expect(blocked.getByText("Message du membre bloqué")).toHaveCount(0);
    await blocked.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath("message-bloque.png"), fullPage: false });
    await blocked.getByRole("button", { name: "Afficher le message" }).click();
    await expect(blocked.getByText("Message du membre bloqué")).toBeVisible();
    await expect(blocked.getByText(/AFFICHAGE TEMPORAIRE/)).toBeVisible();
    await blocked.getByRole("button", { name: "Masquer à nouveau" }).click();
    await expect(blocked.getByText("Message du membre bloqué")).toHaveCount(0);

    const banned = postCard(page, postId(3));
    await expect(banned.getByText("Coach banni : Banni E2E")).toBeVisible();
    await expect(banned.getByText("Message du coach banni")).toHaveCount(0);
    await banned.getByRole("button", { name: "Afficher le message" }).click();
    await expect(banned.getByText("Message du coach banni")).toBeVisible();
    await expect(banned.getByText(/AFFICHAGE TEMPORAIRE \(COACH BANNI\)/)).toBeVisible();
    await expect(banned.getByRole("button", { name: "Masquer à nouveau" })).toBeVisible();
  });
});

test.describe("3.3 sujet de tournoi", () => {
  test("[tous] résumé, résultats quand il est terminé, inscriptions, premier message gardé en page 2", async ({ page }, testInfo) => {
    await page.goto(topicUrl(TOURNAMENT_TOPIC), { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: TOURNAMENT.name })).toBeVisible();
    await expect(page.getByRole("button", { name: /Gestion des Inscriptions/i })).toBeVisible();
    await expect(page.getByText("Résultats du Tournoi")).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("tournoi.png"), fullPage: false });

    // Page 2 : le premier message reste affiché avant les messages 21 et 22
    await page.goto(topicUrl(TOURNAMENT_TOPIC, "?page=2"), { waitUntil: "networkidle" });
    await expect(postCard(page, tournamentPostId(1))).toBeVisible();
    await expect(postCard(page, tournamentPostId(1))).toContainText("Présentation du tournoi de l'inventaire");
    await expect(postCard(page, tournamentPostId(21))).toBeVisible();

    // Tournoi terminé : le bloc des résultats apparaît (sans résultat saisi, seulement pour qui peut les publier)
    await withTestDb((prisma) => prisma.tournament.update({ where: { id: TOURNAMENT.id }, data: { isFinished: true } }));
    try {
      await loginAs(page, AUTHOR.id);
      await page.goto(topicUrl(TOURNAMENT_TOPIC), { waitUntil: "networkidle" });
      await expect(page.getByText("Résultats du Tournoi")).toBeVisible();
    } finally {
      await withTestDb((prisma) => prisma.tournament.update({ where: { id: TOURNAMENT.id }, data: { isFinished: false } }));
    }
  });
});

test.describe("3.3 un message", () => {
  test("[tous] auteur : nom, rôle, statistiques, date, modifié le, numéro et signature", async ({ page }, testInfo) => {
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    const first = postCard(page, postId(1));
    await expect(first).toContainText(AUTHOR.name);
    await expect(first).toContainText("Coach");
    await expect(first).toContainText(DATE);
    await expect(first).toContainText(/#1(?!\d)/);
    await expect(first).toContainText(SIGNATURE);
    await expect(first).not.toContainText(/modifié le/i);
    await expect(postCard(page, postId(2))).toContainText("Modérateur");
    await expect(postCard(page, postId(7))).toContainText(/modifié le/i);

    // Statistiques (affichées sur ordinateur ; avant la refonte, présentes mais masquées sur téléphone)
    const card = await authorCard(page, first);
    const hiddenOnPhone = isPhone(page) && card === first;
    const shown = async (locator: Locator) => (hiddenOnPhone ? expect(locator).toBeAttached() : expect(locator).toBeVisible());
    const naf = card.getByRole("link", { name: "24680", includeHidden: hiddenOnPhone });
    await shown(naf);
    await expect(naf).toHaveAttribute("href", /member\.thenaf\.net.*coach=24680/);
    await shown(card.getByText("Orques de l'inventaire"));
    await shown(card.getByText("R1 - Île-de-France"));
    const ligue = card.getByRole("link", { name: LIGUE.acronym, includeHidden: hiddenOnPhone });
    await shown(ligue);
    await expect(ligue).toHaveAttribute("href", `/ligue/${LIGUE.id}`);
    await shown(card.getByText("Ligue du garage"));
    await page.screenshot({ path: testInfo.outputPath("fiche-auteur-visiteur.png"), fullPage: false });

    // Un visiteur n'a ni « Profil » ni « MP »
    await expect(page.getByRole("link", { name: /^profil$/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^MP$/ })).toHaveCount(0);
  });

  test("[membre] « Profil » et « MP », sauf « MP » sur ses propres messages", async ({ page }, testInfo) => {
    await loginAs(page, READER.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    let card = await authorCard(page, postCard(page, postId(1)));
    await expect(card.getByRole("link", { name: /^profil$/i }).filter({ visible: true })).toHaveAttribute("href", `/spy/${AUTHOR.id}`);
    await expect(card.getByRole("link", { name: /^MP$/ }).filter({ visible: true })).toHaveAttribute("href", `/messagerie?userId=${AUTHOR.id}`);
    await page.screenshot({ path: testInfo.outputPath("fiche-auteur-membre.png"), fullPage: false });
    await closePanels(page);

    await loginAs(page, AUTHOR.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    card = await authorCard(page, postCard(page, postId(1)));
    await expect(card.getByRole("link", { name: /^profil$/i }).filter({ visible: true })).toHaveAttribute("href", `/spy/${AUTHOR.id}`);
    await expect(card.getByRole("link", { name: /^MP$/ })).toHaveCount(0);
  });

  test("[tous] partager : copie du lien du message avec « Lien copié ! »", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(topicUrl(TOPIC.id, "?page=2"), { waitUntil: "networkidle" });
    const post = postCard(page, postId(21));
    await (await postAction(page, post, "Partager ce message")).click();
    await expect(page.getByText("Lien copié !").filter({ visible: true }).first()).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(new RegExp(`/forum/topic/${TOPIC.id}\\?page=2#post-${postId(21)}$`));
  });

  test("[membre] marquer comme non lu à partir d'ici, puis retour au premier non-lu", async ({ page }) => {
    await resetReader();
    await loginAs(page, READER.id);
    await page.goto(topicUrl(TOPIC.id, "?page=2"), { waitUntil: "networkidle" });
    await expect.poll(() => withTestDb((prisma) => prisma.topicView.count({ where: { userId: READER.id, topicId: TOPIC.id } })), { timeout: 30_000 }).toBe(1);
    await (await postAction(page, postCard(page, postId(25)), "Marquer comme non lu à partir d'ici")).click();
    // Le membre reste sur le sujet, avec une notification (carte 169) ; avant, il était renvoyé à l'accueil du forum
    await expect(page.getByText("Sujet marqué comme non lu à partir de ce message.").filter({ visible: true }).first()).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/forum/topic/${TOPIC.id}\\?page=2`));
    await page.goto(`/forum/topic/${TOPIC.id}`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(new RegExp(`\\?page=2#post-${postId(25)}$`));
  });

  test("[membre, pas l'auteur] signaler un message ; ni l'auteur ni un visiteur ne le peuvent", async ({ page }, testInfo) => {
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    await expectNoPostAction(page, postCard(page, postId(1)), "Signaler ce message");
    await expectNoPostAction(page, postCard(page, postId(1)), "Marquer comme non lu à partir d'ici");

    await loginAs(page, READER.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    const post = postCard(page, postId(1));
    if (await post.getByRole("button", { name: MORE_ACTIONS }).filter({ visible: true }).count()) {
      await post.getByRole("button", { name: MORE_ACTIONS }).filter({ visible: true }).first().click();
      await page.screenshot({ path: testInfo.outputPath("menu-message-membre.png"), fullPage: false });
      await page.keyboard.press("Escape");
    }
    await (await postAction(page, post, "Signaler ce message")).click();
    const dialog = page.getByRole("dialog", { name: "Signaler un contenu" });
    await expect(dialog).toBeVisible();
    for (const reason of ["Spam / Publicité", "Harcèlement / Insultes", "Contenu inapproprié / NSFW", "Bot", "Autre (préciser ci-dessous)"]) {
      await expect(dialog.getByRole("button", { name: reason })).toBeVisible();
    }
    await expect(dialog.getByPlaceholder(/Détaillez votre signalement/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await loginAs(page, AUTHOR.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    await expectNoPostAction(page, postCard(page, postId(1)), "Signaler ce message");
  });

  test("[tous] message supprimé, message modéré (bandeau, contenu pour l'auteur et le modo)", async ({ page }) => {
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    const deleted = postCard(page, postId(6));
    await expect(deleted.getByText("Ce message a été supprimé par son auteur")).toBeVisible();
    await expect(deleted.getByText("Contenu supprimé e2e")).toHaveCount(0);

    const moderated = postCard(page, postId(5));
    await expect(moderated.getByText(/modéré par Modo E2E, raison : Hors sujet e2e/)).toBeVisible();
    await expect(moderated.getByText(/masqué par la modération/)).toBeVisible();
    await expect(moderated.getByText("Contenu modéré e2e")).toHaveCount(0);

    await loginAs(page, READER.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    await expect(postCard(page, postId(6)).getByRole("button", { name: "Citer" })).toHaveCount(0);
    await expect(postCard(page, postId(5)).getByText("Contenu modéré e2e")).toHaveCount(0);

    for (const viewer of [AUTHOR.id, E2E.modoId]) {
      await loginAs(page, viewer);
      await page.goto(topicUrl(), { waitUntil: "networkidle" });
      const post = postCard(page, postId(5));
      await expect(post.getByText(/modéré par Modo E2E/)).toBeVisible();
      await expect(post.getByText("Contenu modéré e2e")).toBeVisible();
      await expect(post.getByText(/visible par vous seul et les modérateurs/)).toBeVisible();
    }
  });

  test("[modo] modérer (raison obligatoire) puis restaurer avec confirmation", async ({ page }, testInfo) => {
    await loginAs(page, E2E.modoId);
    await page.goto(topicUrl(SMALL_TOPIC), { waitUntil: "networkidle" });
    let post = postCard(page, "e2e_suj_s01");
    await page.screenshot({ path: testInfo.outputPath("sujet-modo.png"), fullPage: false });
    await (await postAction(page, post, "Modérer")).click();
    await expect(page.getByText(`Modérer le message de ${AUTHOR.name}`)).toBeVisible();
    const confirm = page.getByRole("button", { name: "Confirmer la modération" });
    await expect(confirm).toBeDisabled();
    await page.getByLabel("Raison de la modération").fill("Raison du test");
    await confirm.click();
    await expect(post.getByText(/modéré par Modo E2E, raison : Raison du test/)).toBeVisible({ timeout: 20_000 });

    post = postCard(page, "e2e_suj_s01");
    await (await postAction(page, post, "Restaurer")).click();
    const dialog = page.getByRole("dialog", { name: "Restaurer le message" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Restaurer" }).click();
    await expect(postCard(page, "e2e_suj_s01").getByText(/modéré par/)).toHaveCount(0, { timeout: 20_000 });
  });

  test("[tous] réactions ; [membre] 10 émojis, une seule réaction, remplacée ou retirée", async ({ page }, testInfo) => {
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    const visitorPost = postCard(page, postId(8));
    await expect(visitorPost.getByRole("button", { name: /👍\s*1/ })).toBeVisible();
    await expect(visitorPost.getByRole("button", { name: "Ajouter une réaction" })).toHaveCount(0);

    await loginAs(page, READER.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    const post = postCard(page, postId(8));
    await post.getByRole("button", { name: "Ajouter une réaction" }).click();
    for (const emoji of ["👍", "❤️", "😂", "😢", "😡", "🔥", "👀", "🎉", "👎", "🍻"]) {
      await expect(page.getByRole("button", { name: emoji, exact: true }).filter({ visible: true })).toBeVisible();
    }
    await page.screenshot({ path: testInfo.outputPath("reactions.png"), fullPage: false });
    await page.getByRole("button", { name: "🔥", exact: true }).filter({ visible: true }).click();
    await expect(post.getByRole("button", { name: /🔥\s*1/, pressed: true })).toBeVisible();
    await expect(post.getByRole("button", { name: /👍\s*1/, pressed: false })).toBeVisible();

    // Un autre émoji remplace la réaction
    await post.getByRole("button", { name: "Ajouter une réaction" }).click();
    await page.getByRole("button", { name: "😂", exact: true }).filter({ visible: true }).click();
    await expect(post.getByRole("button", { name: /😂\s*1/, pressed: true })).toBeVisible();
    await expect(post.getByRole("button", { name: /🔥/ })).toHaveCount(0);
    await expect
      .poll(() => withTestDb((prisma) => prisma.postReaction.findMany({ where: { postId: postId(8), userId: READER.id }, select: { emoji: true } })), { timeout: 30_000 })
      .toEqual([{ emoji: "😂" }]);

    // Le même émoji retire la réaction
    await post.getByRole("button", { name: /😂\s*1/ }).click();
    await expect(post.getByRole("button", { name: /😂/ })).toHaveCount(0);
    await expect
      .poll(() => withTestDb((prisma) => prisma.postReaction.count({ where: { postId: postId(8), userId: READER.id } })), { timeout: 30_000 })
      .toBe(0);
  });

  test("[membre] « Citer » ajoute la citation sans ses citations, garde la position et le brouillon (carte 183)", async ({ page }) => {
    await expect(async () => {
      await page.goto(topicUrl(), { waitUntil: "networkidle" });
      await expect(page.getByRole("button", { name: "Citer" })).toHaveCount(0);
    }).toPass();

    await loginAs(page, READER.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    // Un brouillon déjà tapé : la citation s'ajoute à la fin, sans le remplacer
    const editor = page.getByPlaceholder("Écrivez votre réponse ici...");
    await editor.fill("Mon brouillon");

    await postCard(page, postId(1)).scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);
    await postCard(page, postId(1)).getByRole("button", { name: "Citer" }).click();
    await expect(page.getByText("Citation ajoutée").first()).toBeVisible();
    await expect(editor).toHaveValue(new RegExp(`^Mon brouillon\\n\\[quote=${AUTHOR.id}\\|${postId(1)}\\|${AUTHOR.name}\\]Premier message`));
    // La page n'a pas défilé jusqu'à la réponse : la position de lecture est gardée
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThan(5);
    await expect(page.locator("#quick-reply-area")).not.toBeInViewport();

    // Le message n°2 contient trois citations : elles ne sont pas recopiées, seul son propre texte l'est
    await postCard(page, postId(2)).getByRole("button", { name: "Citer" }).click();
    await expect(editor).toHaveValue(new RegExp(`\\[quote=${E2E.modoId}\\|${postId(2)}\\|[^\\]]*\\]Bonjour \\[mention=`));
    const value = await editor.inputValue();
    expect(value).not.toContain("Contenu supprimé e2e");
    expect(value).not.toContain(`[quote=${AUTHOR.id}|${postId(6)}]`);

    // « Voir ma réponse » mène à la réponse rapide
    await expect(page.getByRole("button", { name: "Voir ma réponse" })).toHaveCount(1);
    await page.getByRole("button", { name: "Voir ma réponse" }).dispatchEvent("click");
    await expect(page.locator("#quick-reply-area")).toBeInViewport();

    // ?quotePostId= : même règle sur la page de réponse
    await page.goto(`/forum/topic/${TOPIC.id}/reply?quotePostId=${postId(2)}`, { waitUntil: "networkidle" });
    const replyEditor = page.locator('textarea[name="content"]');
    await expect(replyEditor).toHaveValue(new RegExp(`^\\[quote=${E2E.modoId}\\|${postId(2)}\\|[^\\]]*\\]Bonjour \\[mention=`));
    expect(await replyEditor.inputValue()).not.toContain("Contenu supprimé e2e");

    // Sujet verrouillé : un membre qui ne peut pas répondre ne voit plus « Citer » (carte 111)
    await page.goto(topicUrl(LOCKED_TOPIC), { waitUntil: "networkidle" });
    await expect(postCard(page, "e2e_suj_v01")).toBeVisible();
    await expect(postCard(page, "e2e_suj_v01").getByRole("button", { name: "Citer" })).toHaveCount(0);
  });

  test("[membre] « Citer la sélection » ne cite que le passage sélectionné dans un seul message (carte 183)", async ({ page }) => {
    await loginAs(page, READER.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    const quoteSelection = page.getByRole("button", { name: "Citer la sélection" });

    /** Sélectionne, comme le ferait le coach, un passage du texte affiché d'un message (ou de deux messages). */
    const select = (fromPost: string, fromText: string, toPost: string, toText: string) =>
      page.evaluate(
        ({ fromPost, fromText, toPost, toText }) => {
          const textNode = (post: string, text: string) => {
            const root = document.querySelector(`[id="post-${post}"] [data-quote-post-id]`) ?? document.querySelector(`[id="post-${post}"]`)!;
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
              const at = node.textContent!.indexOf(text);
              if (at >= 0) return { node, at };
            }
            throw new Error(`Texte introuvable : ${text}`);
          };
          const from = textNode(fromPost, fromText);
          const to = textNode(toPost, toText);
          const range = document.createRange();
          range.setStart(from.node, from.at);
          range.setEnd(to.node, to.at + toText.length);
          const selection = window.getSelection()!;
          selection.removeAllRanges();
          selection.addRange(range);
        },
        { fromPost, fromText, toPost, toText }
      );

    // Sélection à cheval sur deux messages : pas de bouton
    await postCard(page, postId(9)).scrollIntoViewIfNeeded();
    await select(postId(9), "numéro 9", postId(10), "numéro 10");
    await page.waitForTimeout(500);
    await expect(quoteSelection).toHaveCount(0);

    // Un message masqué par la modération ne se cite pas : il n'est pas marqué comme citable
    await expect(postCard(page, postId(5)).locator("[data-quote-post-id]")).toHaveCount(0);

    // Passage d'un seul message : le bouton apparaît à l'écran, à 44 pixels de haut au moins
    await select(postId(10), "numéro 10 du sujet", postId(10), "numéro 10 du sujet");
    await expect(quoteSelection).toBeVisible();
    await expect(quoteSelection).toBeInViewport();
    expect((await quoteSelection.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    // Clic envoyé directement : sur la version de développement, les boutons « Dev Theme » et « Dev Auth » occupent le
    // bas de l'écran du téléphone (ils n'existent pas sur le site en ligne)
    await quoteSelection.dispatchEvent("click");

    const editor = page.getByPlaceholder("Écrivez votre réponse ici...");
    // Le message n°10 est du coach de test : seul le passage sélectionné est cité, en texte brut
    await expect(editor).toHaveValue(new RegExp(`^\\[quote=${E2E.coachId}\\|${postId(10)}\\|[^\\]]*\\]numéro 10 du sujet\\[/quote\\]\\n$`));
    await expect(page.getByText("Citation ajoutée").first()).toBeVisible();
    await expect(quoteSelection).toHaveCount(0);
  });

  test("[auteur, modo] « Modifier » (tournoi : page du tournoi) ; [auteur] « Supprimer » avec confirmation", async ({ page }) => {
    await loginAs(page, READER.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    await expectNoPostAction(page, postCard(page, postId(1)), /^Modifier/, "link");
    await expectNoPostAction(page, postCard(page, postId(1)), /^Supprimer$/);

    await loginAs(page, E2E.modoId);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    await expect(await postAction(page, postCard(page, postId(1)), /^Modifier/, "link")).toHaveAttribute("href", `/forum/post/${postId(1)}/edit`);
    await closePanels(page);
    await expectNoPostAction(page, postCard(page, postId(1)), /^Supprimer$/);

    await loginAs(page, AUTHOR.id);
    await page.goto(topicUrl(TOURNAMENT_TOPIC), { waitUntil: "networkidle" });
    await expect(await postAction(page, postCard(page, tournamentPostId(1)), /^Modifier/, "link")).toHaveAttribute("href", `/forum/edit-tournament/${TOURNAMENT.id}`);
    await closePanels(page);
    await expect(await postAction(page, postCard(page, tournamentPostId(3)), /^Modifier/, "link")).toHaveAttribute("href", `/forum/post/${tournamentPostId(3)}/edit`);
    await closePanels(page);

    await page.goto(topicUrl(SMALL_TOPIC), { waitUntil: "networkidle" });
    await (await postAction(page, postCard(page, "e2e_suj_s02"), /^Supprimer$/)).click();
    const dialog = page.getByRole("dialog", { name: "Supprimer le message" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Supprimer" }).click();
    await expect(postCard(page, "e2e_suj_s02").getByText("Ce message a été supprimé par son auteur")).toBeVisible({ timeout: 20_000 });
  });
});

test.describe("2 rendu des messages", () => {
  test("[tous] citation à onglets, citation d'un message supprimé ou modéré, mention", async ({ page }) => {
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    const post = postCard(page, postId(2));
    await expect(post.getByText("Citation").first()).toBeVisible();
    await expect(post.getByRole("link", { name: `@${AUTHOR.name}` }).first()).toHaveAttribute("href", `/spy/${AUTHOR.id}`);
    // Lien permanent du message cité (carte 169), qui mène à la bonne page du sujet même depuis une autre page
    await expect(post.getByRole("link", { name: "Voir le message" }).first()).toHaveAttribute("href", `/forum/post/${postId(1)}`);
    await expect(post.getByText("Ce message a été supprimé par son auteur")).toBeVisible();
    await expect(post.getByText("Le contenu de ce message a été masqué par la modération.")).toBeVisible();
    await expect(post.getByRole("link", { name: `@${READER.name}` })).toHaveAttribute("href", `/spy/${READER.id}`);

    // Mention de soi-même : lien vers son propre profil
    await loginAs(page, READER.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    await expect(postCard(page, postId(2)).getByRole("link", { name: `@${READER.name}` })).toHaveAttribute("href", "/profile");
  });

  test("[tous] un schéma [bbscheme] affiche le lecteur : lecture, image par image, vitesse", async ({ page }) => {
    await page.goto(`/forum/topic/${E2E.bbschemeTopicId}?page=1`, { waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: "Lecture" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Image précédente" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Image suivante" })).toBeVisible();
    await expect(page.getByRole("spinbutton")).toBeVisible();
  });
});

test.describe("3.3 réponse rapide", () => {
  test("[membre] éditeur et « Envoyer ma réponse » ; l'éditeur est vidé et le nouveau message affiché", async ({ page }, testInfo) => {
    await page.goto(topicUrl(SMALL_TOPIC), { waitUntil: "networkidle" });
    await expect(page.locator("#quick-reply-area")).toHaveCount(0);

    await loginAs(page, READER.id);
    await page.goto(topicUrl(SMALL_TOPIC), { waitUntil: "networkidle" });
    const editor = page.getByPlaceholder("Écrivez votre réponse ici...");
    await editor.fill("Réponse rapide de l'inventaire");
    await page.screenshot({ path: testInfo.outputPath("reponse-rapide.png"), fullPage: false });
    await page.getByRole("button", { name: "Envoyer ma réponse" }).click();
    const reply = page.getByText("Réponse rapide de l'inventaire", { exact: true });
    await expect(reply).toBeVisible({ timeout: 20_000 });
    await expect(reply).toBeInViewport();
    await expect(page.getByPlaceholder("Écrivez votre réponse ici...")).toHaveValue("");
  });

  test("[membre] sujet ou forum verrouillé : encart « Sujet verrouillé » et bandeau ; [modo] peut répondre", async ({ page }, testInfo) => {
    await loginAs(page, READER.id);
    await page.goto(topicUrl(LOCKED_TOPIC), { waitUntil: "networkidle" });
    await expect(page.getByText(/Vous ne pouvez plus répondre à ce sujet/)).toBeVisible();
    await expect(page.getByPlaceholder("Écrivez votre réponse ici...")).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("sujet-verrouille.png"), fullPage: false });
    let tools = await topicTools(page);
    await expect(tools.getByText("Sujet verrouillé", { exact: true }).filter({ visible: true }).first()).toBeVisible();
    await closePanels(page);

    await page.goto(topicUrl(LOCKED_FORUM_TOPIC), { waitUntil: "networkidle" });
    await expect(page.getByText(/Vous ne pouvez plus répondre à ce sujet/)).toBeVisible();
    tools = await topicTools(page);
    await expect(tools.getByText("Forum verrouillé", { exact: true }).filter({ visible: true }).first()).toBeVisible();
    await closePanels(page);

    await loginAs(page, E2E.modoId);
    await page.goto(topicUrl(LOCKED_TOPIC), { waitUntil: "networkidle" });
    await expect(page.getByPlaceholder("Écrivez votre réponse ici...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Envoyer ma réponse" })).toBeVisible();
  });
});

test.describe("3.3 outils du sujet", () => {
  test("[tous] vues, « Dernier message » et « Haut de page »", async ({ page }) => {
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    const tools = await topicTools(page);
    await expect(tools.getByText(/4\s?2\d\d/).filter({ visible: true }).first()).toBeVisible();
    await expect(await findTool(page, "link", "Dernier message")).toHaveAttribute("href", `/forum/topic/${TOPIC.id}?page=3#post-${postId(45)}`);
    await closePanels(page);
    await expectNoTool(page, "button", /^Répondre$/);
    await expectNoTool(page, "button", /^Suivre le sujet$/);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
    await (await findTool(page, "button", "Haut de page")).click();
    await closePanels(page);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  });

  test("[membre] « Répondre », suivre le sujet, signaler le sujet ; pas de « Modifier le titre »", async ({ page }, testInfo) => {
    await loginAs(page, READER.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    await (await findTool(page, "button", /^Répondre$/)).click();
    await closePanels(page);
    await expect(page.locator("#quick-reply-area")).toBeInViewport();

    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    await topicTools(page);
    await page.screenshot({ path: testInfo.outputPath("outils-membre.png"), fullPage: false });
    await (await findTool(page, "button", "Suivre le sujet")).click();
    await expect(await findTool(page, "button", "Arrêter de suivre")).toBeVisible();
    await expect.poll(() => withTestDb((prisma) => prisma.topicFollow.count({ where: { userId: READER.id, topicId: TOPIC.id } })), { timeout: 30_000 }).toBe(1);
    await (await findTool(page, "button", "Arrêter de suivre")).click();
    await expect(await findTool(page, "button", "Suivre le sujet")).toBeVisible();
    await expect.poll(() => withTestDb((prisma) => prisma.topicFollow.count({ where: { userId: READER.id, topicId: TOPIC.id } })), { timeout: 30_000 }).toBe(0);
    await closePanels(page);

    await (await findTool(page, "button", /^Signaler( le sujet)?$/)).click();
    const dialog = page.getByRole("dialog", { name: "Signaler un contenu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(TOPIC.title)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await closePanels(page);

    await expectNoTool(page, "button", "Modifier le titre");
    await expectNoTool(page, "button", /^Épingler$/);
  });

  test("[auteur] « Modifier le titre » avec smileys ; pas de signalement de son propre sujet", async ({ page }) => {
    await loginAs(page, AUTHOR.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    await (await findTool(page, "button", "Modifier le titre")).click();
    const dialog = page.getByRole("dialog", { name: "Modifier le titre du sujet" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Insérer un smiley" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await closePanels(page);
    await expectNoTool(page, "button", /^Signaler( le sujet)?$/);
  });

  test("[orga] gestion du tournoi avec confirmations ; pas de « Modifier le titre » sur un tournoi", async ({ page }, testInfo) => {
    await loginAs(page, AUTHOR.id);
    await page.goto(topicUrl(TOURNAMENT_TOPIC), { waitUntil: "networkidle" });
    await expectNoTool(page, "button", "Modifier le titre");
    await expect(await findTool(page, "button", "Modifier le tournoi")).toBeVisible();
    await topicTools(page);
    await page.screenshot({ path: testInfo.outputPath("outils-orga.png"), fullPage: false });

    const confirmThenCancel = async (button: string | RegExp, title: string) => {
      await (await findTool(page, "button", button)).click();
      const dialog = page.getByRole("dialog", { name: title });
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Annuler", exact: true }).click();
      await expect(dialog).toBeHidden();
      await closePanels(page);
    };
    await confirmThenCancel("Terminer le tournoi", "Terminer le tournoi");
    await confirmThenCancel(/Bloquer (les )?inscriptions/, "Bloquer les inscriptions");
    await confirmThenCancel("Annuler le tournoi", "Annuler le tournoi");
    await expectNoTool(page, "link", "Publier les résultats");

    await withTestDb((prisma) => prisma.tournament.update({ where: { id: TOURNAMENT.id }, data: { isFinished: true } }));
    try {
      await page.goto(topicUrl(TOURNAMENT_TOPIC), { waitUntil: "networkidle" });
      await expect(await findTool(page, "link", "Publier les résultats")).toHaveAttribute("href", `/forum/tournament/${TOURNAMENT.id}/results`);
      await closePanels(page);
      await confirmThenCancel("Réouvrir le tournoi", "Réouvrir le tournoi");
      await expectNoTool(page, "button", "Terminer le tournoi");
    } finally {
      await withTestDb((prisma) => prisma.tournament.update({ where: { id: TOURNAMENT.id }, data: { isFinished: false } }));
    }

    // Un membre qui n'organise pas n'a pas ces outils
    await loginAs(page, READER.id);
    await page.goto(topicUrl(TOURNAMENT_TOPIC), { waitUntil: "networkidle" });
    await expectNoTool(page, "button", "Modifier le tournoi");
  });

  test("[modo] épingler, archiver, verrouiller, déplacer", async ({ page }, testInfo) => {
    // Six bascules, chacune vérifiée dans la base puis suivie d'un rechargement : plus long que le délai ordinaire
    test.setTimeout(180_000);
    await loginAs(page, E2E.modoId);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    await topicTools(page);
    await page.screenshot({ path: testInfo.outputPath("outils-modo.png"), fullPage: false });
    await closePanels(page);

    const field = (name: "isSticky" | "isArchived" | "isLocked") =>
      withTestDb(async (prisma) => (await prisma.topic.findUnique({ where: { id: TOPIC.id }, select: { [name]: true } }))?.[name]);
    const toggle = async (button: RegExp, name: "isSticky" | "isArchived" | "isLocked", expected: boolean) => {
      await (await findTool(page, "button", button)).click();
      await closePanels(page);
      await expect.poll(() => field(name), { timeout: 30_000 }).toBe(expected);
      await page.reload({ waitUntil: "networkidle" });
    };
    try {
      await toggle(/^Épingler$/, "isSticky", true);
      await toggle(/^Désépingler$/, "isSticky", false);
      await toggle(/^Archiver$/, "isArchived", true);
      await toggle(/^Désarchiver$/, "isArchived", false);
      await toggle(/^Verrouiller/, "isLocked", true);
      await toggle(/^Déverrouiller/, "isLocked", false);
    } finally {
      await setTopic(TOPIC.id, { isSticky: false, isArchived: false, isLocked: false });
    }

    await (await findTool(page, "button", /^Déplacer/)).click();
    const dialog = page.getByRole("dialog", { name: "Déplacer le sujet" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("option", { name: E2E.forumName, exact: true })).toBeAttached();
    // La fenêtre générique a son propre bouton « Annuler » en plus de celui du formulaire : Échap la ferme
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await closePanels(page);
  });

  // Suppression douce (carte 165) : le sujet et son tournoi restent en base, marqués supprimés, et se restaurent
  test("[modo] supprimer le sujet avec une raison, puis le restaurer : rien n'est effacé", async ({ page }) => {
    await withTestDb(async (prisma) => {
      await prisma.tournament.create({
        data: { id: DELETABLE.tournament, name: "Tournoi à supprimer", date: new Date("2027-06-01T09:00:00Z"), location: "Nantes", organizerId: AUTHOR.id },
      });
      await prisma.topic.create({
        data: {
          id: DELETABLE.topic,
          title: DELETABLE.title,
          forumId: E2E.forumId,
          authorId: AUTHOR.id,
          tournamentId: DELETABLE.tournament,
          posts: { create: { id: "e2e_suj_j01", content: "Message à supprimer avec le sujet", authorId: AUTHOR.id } },
        },
      });
    });

    await loginAs(page, E2E.modoId);
    await page.goto(topicUrl(DELETABLE.topic), { waitUntil: "networkidle" });
    await (await findTool(page, "button", /^Supprimer (le )?sujet$/)).click();
    const dialog = page.getByRole("dialog", { name: "Supprimer le sujet" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Rien n'est effacé/)).toBeVisible();
    await dialog.getByLabel(/Raison de la suppression/).fill("Sujet de test");
    await dialog.getByRole("button", { name: "Supprimer le sujet" }).click();
    await page.waitForURL(/\/forum\?deletedTopic=/);

    const left = await withTestDb(async (prisma) => ({
      topic: await prisma.topic.findUnique({ where: { id: DELETABLE.topic }, select: { isDeleted: true, deletionReason: true } }),
      tournaments: await prisma.tournament.count({ where: { id: DELETABLE.tournament } }),
    }));
    expect(left).toEqual({ topic: { isDeleted: true, deletionReason: "Sujet de test" }, tournaments: 1 });

    // Le modérateur voit encore le sujet, avec le bandeau et « Restaurer le sujet »
    await page.goto(topicUrl(DELETABLE.topic), { waitUntil: "networkidle" });
    await expect(page.getByText("Sujet supprimé", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Restaurer le sujet" }).filter({ visible: true }).first().click();
    await page.getByRole("dialog", { name: "Restaurer le sujet" }).getByRole("button", { name: "Restaurer le sujet" }).click();
    await expect(page.getByText("Sujet supprimé", { exact: true })).toHaveCount(0, { timeout: 20_000 });
    const restored = await withTestDb((prisma) => prisma.topic.findUnique({ where: { id: DELETABLE.topic }, select: { isDeleted: true } }));
    expect(restored).toEqual({ isDeleted: false });
  });

  // Carte 169 : scinder un sujet (messages cochés vers un nouveau sujet), puis fusionner le nouveau sujet dans l'ancien
  test("[modo] scinder un sujet, puis fusionner le nouveau sujet dans l'ancien", async ({ page }, testInfo) => {
    const suffix = testInfo.project.name.replace(/\W/g, "");
    const source = { id: `e2e_suj_scinder_${suffix}`, title: `Inv sujet à scinder ${suffix}` };
    const splitPost = (n: number) => `e2e_suj_scinder_${suffix}_p${n}`;
    const newTitle = `Inv sujet scindé ${suffix}`;
    await withTestDb(async (prisma) => {
      await prisma.topic.create({ data: { id: source.id, title: source.title, forumId: E2E.forumId, authorId: AUTHOR.id, createdAt: new Date(Date.now() - 60 * 60_000) } });
      for (let n = 1; n <= 4; n++) {
        await prisma.post.create({
          data: { id: splitPost(n), topicId: source.id, authorId: n === 3 ? READER.id : AUTHOR.id, content: `Message ${n} à scinder`, createdAt: new Date(Date.now() - (60 - n) * 60_000) },
        });
      }
    });

    let newTopicId: string | undefined;
    try {
      await loginAs(page, E2E.modoId);
      await page.goto(topicUrl(source.id), { waitUntil: "networkidle" });
      await (await findTool(page, "button", "Scinder le sujet")).click();
      await closePanels(page);
      // Le premier message reste dans le sujet : il n'a pas de case
      await expect(postCard(page, splitPost(1)).getByRole("checkbox")).toHaveCount(0);
      await postCard(page, splitPost(3)).getByRole("checkbox", { name: "Déplacer ce message vers le nouveau sujet" }).check();
      await postCard(page, splitPost(4)).getByRole("checkbox", { name: "Déplacer ce message vers le nouveau sujet" }).check();
      // Barre collée en bas sur téléphone, colonne des outils sur ordinateur
      await expect(page.getByText("2 messages choisis").filter({ visible: true }).first()).toBeVisible();
      const scinder = page.getByRole("button", { name: /^Scinder les messages choisis/ }).filter({ visible: true }).first();
      expect((await scinder.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
      await scinder.click();

      const splitDialog = page.getByRole("dialog", { name: "Scinder le sujet" });
      await expect(splitDialog).toBeVisible();
      await splitDialog.getByLabel("Titre du nouveau sujet").fill(newTitle);
      await expect(splitDialog.getByLabel("Forum du nouveau sujet")).toHaveValue(E2E.forumId);
      await splitDialog.getByRole("button", { name: "Créer le nouveau sujet" }).click();
      await page.waitForURL((url) => url.pathname.startsWith("/forum/topic/") && !url.pathname.endsWith(source.id));

      const afterSplit = await withTestDb(async (prisma) => {
        const created = await prisma.topic.findFirst({ where: { title: newTitle }, select: { id: true, authorId: true, lastPostId: true } });
        const sourceTopic = await prisma.topic.findUnique({ where: { id: source.id }, select: { lastPostId: true } });
        return {
          created,
          sourceLast: sourceTopic?.lastPostId,
          sourcePosts: await prisma.post.count({ where: { topicId: source.id } }),
          newPosts: created ? await prisma.post.count({ where: { topicId: created.id } }) : 0,
        };
      });
      newTopicId = afterSplit.created?.id;
      // Le nouveau sujet a pour auteur celui du plus ancien message déplacé ; les deux sujets ont leur dernier message à jour
      expect(afterSplit).toEqual({
        created: { id: newTopicId, authorId: READER.id, lastPostId: splitPost(4) },
        sourceLast: splitPost(2),
        sourcePosts: 2,
        newPosts: 2,
      });

      // Fusion du nouveau sujet dans l'ancien, cherché par son titre
      await (await findTool(page, "button", "Fusionner avec un autre sujet")).click();
      const mergeDialog = page.getByRole("dialog", { name: "Fusionner avec un autre sujet" });
      await expect(mergeDialog).toBeVisible();
      await mergeDialog.getByLabel("Sujet d'arrivée").fill(source.title);
      await mergeDialog.getByRole("button", { name: new RegExp(source.title) }).click();
      await mergeDialog.getByRole("button", { name: /^Fusionner dans/ }).click();
      await page.waitForURL(new RegExp(`/forum/topic/${source.id}`));

      const afterMerge = await withTestDb(async (prisma) => ({
        sourcePosts: await prisma.post.count({ where: { topicId: source.id } }),
        sourceLast: (await prisma.topic.findUnique({ where: { id: source.id }, select: { lastPostId: true } }))?.lastPostId,
        merged: await prisma.topic.findUnique({ where: { id: newTopicId }, select: { isDeleted: true } }),
        logs: await prisma.moderationLog.count({ where: { targetId: source.id, action: { in: ["TOPIC_SPLIT", "TOPIC_MERGED"] } } }),
      }));
      expect(afterMerge).toEqual({ sourcePosts: 4, sourceLast: splitPost(4), merged: { isDeleted: true }, logs: 2 });
    } finally {
      await withTestDb(async (prisma) => {
        const ids = [source.id, ...(newTopicId ? [newTopicId] : [])];
        await prisma.moderationLog.deleteMany({ where: { targetId: { in: ids } } });
        await prisma.notification.deleteMany({ where: { topicId: { in: ids } } });
        await prisma.topicView.deleteMany({ where: { topicId: { in: ids } } });
        await prisma.topicFollow.deleteMany({ where: { topicId: { in: ids } } });
        await prisma.post.deleteMany({ where: { topicId: { in: ids } } });
        await prisma.topic.deleteMany({ where: { id: { in: ids } } });
      });
    }
  });

  test("[membre] et [visiteur] n'ont pas les outils de modération", async ({ page }) => {
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    for (const name of [/^Épingler$/, /^Archiver$/, /^Déplacer/, /^Verrouiller/, /^Supprimer (le )?sujet$/, /^Modérer$/]) {
      await expectNoTool(page, "button", name);
    }
    await loginAs(page, READER.id);
    await page.goto(topicUrl(), { waitUntil: "networkidle" });
    for (const name of [/^Épingler$/, /^Archiver$/, /^Déplacer/, /^Verrouiller/, /^Supprimer (le )?sujet$/]) {
      await expectNoTool(page, "button", name);
    }
    await expectNoPostAction(page, postCard(page, postId(1)), /^Modérer$/);
  });
});
