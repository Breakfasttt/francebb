/**
 * Inventaire de la refonte, sections 3.7 (créer un forum) et 3.8 (recherche avancée) de docs/refonte/inventaire.md,
 * et contenu des fenêtres de modération ouvertes depuis la page d'un sujet : déplacer le sujet, modifier son titre,
 * modérer un message, signaler un sujet ou un message (carte 088). Rejoué en taille ordinateur (projet chromium) et
 * en taille téléphone (projet telephone). Les éléments sont cherchés par leur rôle, leur nom accessible ou leur
 * texte, jamais par une classe CSS : le test doit passer sans modification avant et après la refonte de ces écrans.
 *
 * Sur téléphone, les filtres de la recherche peuvent être rangés dans un panneau ouvert par un bouton « Filtres » :
 * la petite fonction `filters` ci-dessous les cherche dans la page, puis dans ce panneau. C'est une adaptation de la
 * façon de trouver le champ, pas un changement de ce qui est attendu.
 *
 * Données préparées par le test (et supprimées à la fin), dans la catégorie « E2E Catégorie » :
 * - un forum « Inv Rech Racine » et son sous-forum « Inv Rech Enfant », et un forum « Inv Rech Plein » qui a déjà
 *   ses cinq sous-forums (le maximum) ;
 * - un membre « Auteur Recherche » ;
 * - quatre messages contenant le mot « zorglubine », écrits il y a 2 jours, 20 jours, 100 jours (par le coach de test)
 *   et 2 ans, dont un dans un sujet de tournoi du sous-forum ;
 * - un sujet de 25 messages contenant « paginatruc », pour la pagination des résultats et le lien vers un message
 *   de la deuxième page du sujet ;
 * - un sujet sur lequel les fenêtres de modération sont essayées.
 *
 * Des captures sont enregistrées dans test-results/ pour la relecture humaine (pas de comparaison au pixel).
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 1024;

const AUTHOR = { id: "e2e_rech_auteur", name: "Auteur Recherche" };
const ROOT_FORUM = { id: "e2e_rech_racine", name: "Inv Rech Racine" };
const CHILD_FORUM = { id: "e2e_rech_enfant", name: "Inv Rech Enfant" };
const FULL_FORUM = { id: "e2e_rech_plein", name: "Inv Rech Plein" };
const CREATED_FORUM = "Inv Rech Créé";

const ROOT_TOPIC = { id: "e2e_rech_topic_racine", title: "Inv Rech sujet racine", views: 777 };
const TOURNAMENT_TOPIC = { id: "e2e_rech_topic_tournoi", title: "Inv Rech sujet tournoi" };
const TOURNAMENT_ID = "e2e_rech_tournoi";
const PAGES_TOPIC = { id: "e2e_rech_topic_pages", title: "Inv Rech sujet pagination" };
const PAGES_POSTS = 25;
const pagePostId = (n: number) => `e2e_rech_page_${String(n).padStart(2, "0")}`;
const MODO_TOPIC = { id: "e2e_rech_topic_modo", title: "Inv Rech sujet modération", postId: "e2e_rech_post_modo" };

/** Les quatre messages qui contiennent le mot cherché, du plus récent au plus ancien. */
const KEYWORD = "zorglubine";
const POST = { recent: "e2e_rech_post_a", tournament: "e2e_rech_post_b", coach: "e2e_rech_post_c", old: "e2e_rech_post_d" };
const DAY = 24 * 60 * 60_000;

/** Supprime tout ce que ce test a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await withTestDb(async (prisma) => {
    const forums = await prisma.forum.findMany({
      where: { OR: [{ id: { startsWith: "e2e_rech_" } }, { name: { startsWith: "Inv Rech" } }] },
      select: { id: true },
    });
    const forumIds = forums.map((forum) => forum.id);
    const topicWhere = { OR: [{ id: { startsWith: "e2e_rech_" } }, { forumId: { in: forumIds } }] };
    await prisma.moderationLog.deleteMany({ where: { OR: [{ targetId: { startsWith: "e2e_rech_" } }, { targetId: { in: forumIds } }] } });
    await prisma.moderationReport.deleteMany({ where: { targetId: { startsWith: "e2e_rech_" } } });
    await prisma.topicView.deleteMany({ where: { topic: topicWhere } });
    await prisma.topicFollow.deleteMany({ where: { topic: topicWhere } });
    await prisma.post.deleteMany({ where: { OR: [{ topic: topicWhere }, { authorId: AUTHOR.id }] } });
    await prisma.topic.deleteMany({ where: topicWhere });
    await prisma.tournament.deleteMany({ where: { id: TOURNAMENT_ID } });
    // Les sous-forums d'abord : un forum parent ne peut pas être supprimé avant ses enfants
    await prisma.forum.deleteMany({ where: { id: { in: forumIds }, parentForumId: { not: null } } });
    await prisma.forum.deleteMany({ where: { id: { in: forumIds } } });
    await prisma.user.deleteMany({ where: { id: AUTHOR.id } });
  });
}

let categoryId = "";

test.beforeAll(async () => {
  await cleanUp();
  await withTestDb(async (prisma) => {
    const category = await prisma.category.findUniqueOrThrow({ where: { name: E2E.categoryName } });
    categoryId = category.id;
    await prisma.user.create({ data: { id: AUTHOR.id, name: AUTHOR.name, email: "auteur-recherche@e2e.test", hasFinishedOnboarding: true } });

    await prisma.forum.create({ data: { ...ROOT_FORUM, categoryId, order: 50 } });
    await prisma.forum.create({ data: { ...CHILD_FORUM, parentForumId: ROOT_FORUM.id, order: 1 } });
    await prisma.forum.create({ data: { ...FULL_FORUM, categoryId, order: 51 } });
    for (let index = 1; index <= 5; index++) {
      await prisma.forum.create({ data: { id: `e2e_rech_plein_${index}`, name: `Inv Rech Plein ${index}`, parentForumId: FULL_FORUM.id, order: index } });
    }

    const ago = (days: number) => new Date(Date.now() - days * DAY);
    await prisma.topic.create({
      data: {
        id: ROOT_TOPIC.id,
        title: ROOT_TOPIC.title,
        forumId: ROOT_FORUM.id,
        authorId: AUTHOR.id,
        views: ROOT_TOPIC.views,
        createdAt: ago(800),
        // Date du dernier message affichée dans le résultat (midi, pour ne pas dépendre du fuseau horaire)
        lastPostAt: new Date("2026-03-15T12:00:00Z"),
      },
    });
    await prisma.tournament.create({
      data: { id: TOURNAMENT_ID, name: "Tournoi de la recherche", date: new Date("2026-02-10T10:00:00Z"), location: "Lyon", organizerId: AUTHOR.id },
    });
    await prisma.topic.create({
      data: { id: TOURNAMENT_TOPIC.id, title: TOURNAMENT_TOPIC.title, forumId: CHILD_FORUM.id, authorId: AUTHOR.id, tournamentId: TOURNAMENT_ID, createdAt: ago(20) },
    });
    await prisma.post.createMany({
      data: [
        { id: POST.old, topicId: ROOT_TOPIC.id, authorId: AUTHOR.id, content: `Ancienne ${KEYWORD} oubliée`, createdAt: ago(730) },
        { id: POST.coach, topicId: ROOT_TOPIC.id, authorId: E2E.coachId, content: `Réponse du coach sur la ${KEYWORD}`, createdAt: ago(100) },
        { id: POST.tournament, topicId: TOURNAMENT_TOPIC.id, authorId: AUTHOR.id, content: `Compte rendu de ${KEYWORD} au tournoi`, createdAt: ago(20) },
        {
          id: POST.recent,
          topicId: ROOT_TOPIC.id,
          authorId: AUTHOR.id,
          content: `Début du message [b]la ${KEYWORD} magique[/b] et la suite du texte.`,
          createdAt: ago(2),
        },
      ],
    });

    await prisma.topic.create({ data: { id: PAGES_TOPIC.id, title: PAGES_TOPIC.title, forumId: ROOT_FORUM.id, authorId: AUTHOR.id, createdAt: ago(10) } });
    await prisma.post.createMany({
      data: Array.from({ length: PAGES_POSTS }, (_, index) => ({
        id: pagePostId(index + 1),
        topicId: PAGES_TOPIC.id,
        authorId: AUTHOR.id,
        content: `Message paginatruc numéro ${index + 1}`,
        createdAt: new Date(Date.now() - 5 * DAY + index * 60_000),
      })),
    });

    await prisma.topic.create({
      data: {
        id: MODO_TOPIC.id,
        title: MODO_TOPIC.title,
        forumId: ROOT_FORUM.id,
        authorId: AUTHOR.id,
        posts: { create: { id: MODO_TOPIC.postId, content: "Message sur lequel on essaie la modération", authorId: AUTHOR.id } },
      },
    });
  });
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
});

const searchUrl = (params: Record<string, string>) => `/forum/search?${new URLSearchParams(params).toString()}`;

/** Les liens « Voir » des résultats, dans l'ordre d'affichage. */
const resultLinks = (page: Page) => page.getByRole("link", { name: /^Voir/ }).filter({ visible: true });

/** Adresse attendue du lien d'un résultat : la bonne page du sujet et l'ancre du message. */
const postHref = (topicId: string, postId: string, topicPage = 1) => `/forum/topic/${topicId}?page=${topicPage}#post-${postId}`;

/**
 * Zone des filtres de la recherche (auteur, forum, période, tri). Sur ordinateur, la page. Sur téléphone, la page si
 * les filtres y sont visibles, sinon le panneau ouvert par le bouton « Filtres ».
 */
async function filters(page: Page): Promise<Locator> {
  if (await page.getByLabel("Auteur", { exact: true }).filter({ visible: true }).count()) return page.locator("body");
  await page.getByRole("button", { name: /^Filtres/ }).filter({ visible: true }).first().click();
  const panel = page.getByRole("dialog", { name: /Filtres/ });
  await expect(panel).toBeVisible();
  return panel;
}

/** Ouvre le panneau « Plus » du téléphone s'il est fermé et le renvoie. */
async function openMore(page: Page): Promise<Locator> {
  const panel = page.getByRole("dialog", { name: "Plus" });
  if (!(await panel.isVisible())) {
    await page.getByRole("button", { name: "Plus", exact: true }).click();
    await expect(panel).toBeVisible();
  }
  return panel;
}

/**
 * Cherche un outil du sujet visible dans la page ; sur téléphone, dans le panneau « Outils du sujet » ouvert par le
 * bouton de l'en-tête (même façon de faire que forum-sujet.spec.ts).
 */
async function findTool(page: Page, name: string | RegExp): Promise<Locator> {
  const onPage = page.getByRole("button", { name }).filter({ visible: true });
  if ((await onPage.count()) > 0 || !isPhone(page)) return onPage.first();
  const sheet = page.getByRole("dialog", { name: "Outils du sujet" });
  if (!(await sheet.isVisible())) {
    await page.getByRole("button", { name: "Outils du sujet" }).filter({ visible: true }).first().click();
    await expect(sheet).toBeVisible();
  }
  return sheet.getByRole("button", { name }).filter({ visible: true }).first();
}

/** Ouvre le menu « ⋯ » d'un message et renvoie l'action demandée (liste sur ordinateur, panneau sur téléphone). */
async function postAction(page: Page, postId: string, name: string): Promise<Locator> {
  const post = page.locator(`[id="post-${postId}"]`);
  const direct = post.getByRole("button", { name }).filter({ visible: true });
  if ((await direct.count()) > 0) return direct.first();
  const more = post.getByRole("button", { name: "Plus d'actions sur ce message" }).filter({ visible: true }).first();
  const menu = page.getByRole("menu").or(page.getByRole("dialog", { name: "Plus d'actions sur ce message" })).first();
  await expect(async () => {
    if (!(await menu.isVisible())) await more.click();
    await expect(menu).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 15_000 });
  return page
    .getByRole("menuitem", { name })
    .or(page.getByRole("dialog", { name: "Plus d'actions sur ce message" }).getByRole("button", { name }))
    .filter({ visible: true })
    .first();
}

test.describe("3.8 recherche avancée", () => {
  test("[tous] filtres : mots-clés, auteur, forum (arborescence), période, tri ; les valeurs restent après la recherche", async ({ page }, testInfo) => {
    await page.goto("/forum/search", { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("recherche-vide.png"), fullPage: true });
    // Aucune recherche lancée : pas de résultats affichés
    await expect(page.getByText(/Aucun résultat/)).toHaveCount(0);
    await expect(resultLinks(page)).toHaveCount(0);

    await page.getByLabel("Mots-clés").filter({ visible: true }).fill(KEYWORD);
    const scope = await filters(page);
    await page.screenshot({ path: testInfo.outputPath("recherche-filtres.png"), fullPage: false });
    await scope.getByLabel("Auteur", { exact: true }).fill(AUTHOR.name);
    const forum = scope.getByLabel("Forum", { exact: true });
    // Arborescence : le sous-forum suit son parent, marqué d'une flèche
    await expect(forum.getByRole("option", { name: /Inv Rech Racine/ })).toBeAttached();
    await expect(forum.getByRole("option", { name: /↳.*Inv Rech Enfant/ })).toBeAttached();
    // Un visiteur ne voit pas les forums réservés aux modérateurs
    await expect(forum.getByRole("option", { name: new RegExp(E2E.secretForumName) })).toHaveCount(0);
    await forum.selectOption(ROOT_FORUM.id);
    const period = scope.getByLabel(/^(Période|Date)$/);
    for (const label of ["Toutes les dates", "Depuis 7 jours", "Depuis 1 mois", "Depuis 1 an"]) {
      await expect(period.getByRole("option", { name: label })).toBeAttached();
    }
    await period.selectOption("1y");
    const sort = scope.getByLabel("Trier par");
    await expect(sort.getByRole("option", { name: "Plus récents d'abord" })).toBeAttached();
    await sort.selectOption("asc");
    await scope.getByRole("button", { name: "Lancer la recherche" }).filter({ visible: true }).first().click();

    await page.waitForURL(/\/forum\/search\?/);
    const url = new URL(page.url());
    expect(url.searchParams.get("q")).toBe(KEYWORD);
    expect(url.searchParams.get("author")).toBe(AUTHOR.name);
    expect(url.searchParams.get("forumId")).toBe(ROOT_FORUM.id);
    expect(url.searchParams.get("date")).toBe("1y");
    expect(url.searchParams.get("sortBy")).toBe("asc");
    await page.waitForLoadState("networkidle");

    // Auteur, forum et sous-forum, moins d'un an, du plus ancien au plus récent : le tournoi (20 jours) puis le récent
    await expect(resultLinks(page)).toHaveCount(2);
    await expect(resultLinks(page).nth(0)).toHaveAttribute("href", postHref(TOURNAMENT_TOPIC.id, POST.tournament));
    await expect(resultLinks(page).nth(1)).toHaveAttribute("href", postHref(ROOT_TOPIC.id, POST.recent, 1));
    await page.screenshot({ path: testInfo.outputPath("recherche-resultats.png"), fullPage: true });

    // Les valeurs choisies sont reprises dans le formulaire
    await expect(page.getByLabel("Mots-clés").filter({ visible: true })).toHaveValue(KEYWORD);
    const again = await filters(page);
    await expect(again.getByLabel("Auteur", { exact: true })).toHaveValue(AUTHOR.name);
    await expect(again.getByLabel("Forum", { exact: true })).toHaveValue(ROOT_FORUM.id);
    await expect(again.getByLabel(/^(Période|Date)$/)).toHaveValue("1y");
    await expect(again.getByLabel("Trier par")).toHaveValue("asc");
  });

  test("[tous] chaque filtre restreint les résultats (adresse inchangée : q, author, forumId, date, sortBy)", async ({ page }) => {
    const expectResults = async (params: Record<string, string>, postIds: string[]) => {
      await page.goto(searchUrl(params), { waitUntil: "networkidle" });
      await expect(resultLinks(page)).toHaveCount(postIds.length);
      for (const [index, postId] of postIds.entries()) {
        await expect(resultLinks(page).nth(index)).toHaveAttribute("href", new RegExp(`#post-${postId}$`));
      }
    };
    // Période : 7 jours, 30 jours, 1 an, tout ; tri par défaut du plus récent au plus ancien
    await expectResults({ q: KEYWORD, date: "7d" }, [POST.recent]);
    await expectResults({ q: KEYWORD, date: "30d" }, [POST.recent, POST.tournament]);
    await expectResults({ q: KEYWORD, date: "1y" }, [POST.recent, POST.tournament, POST.coach]);
    await expectResults({ q: KEYWORD }, [POST.recent, POST.tournament, POST.coach, POST.old]);
    await expectResults({ q: KEYWORD, sortBy: "asc" }, [POST.old, POST.coach, POST.tournament, POST.recent]);
    // Auteur : les messages du coach sont écartés
    await expectResults({ q: KEYWORD, author: AUTHOR.name }, [POST.recent, POST.tournament, POST.old]);
    // Forum : un forum parent inclut ses sous-forums, un sous-forum ne contient que les siens
    await expectResults({ q: KEYWORD, forumId: CHILD_FORUM.id }, [POST.tournament]);
    await expectResults({ q: KEYWORD, forumId: ROOT_FORUM.id, date: "30d" }, [POST.recent, POST.tournament]);
  });

  test("[tous] un résultat : trophée, titre, forum, auteur, ancienneté, vues, dernier message, « Voir », extrait surligné", async ({ page }, testInfo) => {
    await page.goto(searchUrl({ q: KEYWORD, date: "7d" }), { waitUntil: "networkidle" });
    await expect(page.getByText(/\b1\b.*(résultat|trouvé)/)).toBeVisible();
    await expect(resultLinks(page)).toHaveCount(1);
    await expect(page.getByRole("link", { name: new RegExp(ROOT_TOPIC.title) })).toHaveAttribute("href", postHref(ROOT_TOPIC.id, POST.recent));
    await expect(resultLinks(page).first()).toHaveAttribute("href", postHref(ROOT_TOPIC.id, POST.recent));
    await expect(page.getByText(ROOT_FORUM.name).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(AUTHOR.name).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(/il y a/).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(new RegExp(`\\b${ROOT_TOPIC.views}\\b`)).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(/15\/03\/2026|15 mars 2026/).filter({ visible: true }).first()).toBeVisible();
    // Pas de trophée : ce n'est pas un sujet de tournoi
    await expect(page.getByRole("img", { name: "Tournoi" })).toHaveCount(0);

    // Extrait : le BBCode est retiré et le mot cherché est mis en valeur (fond coloré)
    const highlight = page.getByText(KEYWORD, { exact: true }).filter({ visible: true }).first();
    await expect(highlight).toBeVisible();
    const background = await highlight.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(background).not.toBe("rgba(0, 0, 0, 0)");
    await expect(page.getByText(/\[b\]/)).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("recherche-un-resultat.png"), fullPage: true });

    // Sujet de tournoi : trophée
    await page.goto(searchUrl({ q: KEYWORD, forumId: CHILD_FORUM.id }), { waitUntil: "networkidle" });
    await expect(page.getByRole("img", { name: "Tournoi" }).filter({ visible: true })).toHaveCount(1);
  });

  test("[tous] 20 résultats par page ; le lien mène au message, sur la bonne page du sujet", async ({ page }) => {
    await page.goto(searchUrl({ q: "paginatruc" }), { waitUntil: "networkidle" });
    await expect(page.getByText(/\b25\b.*(résultat|trouvé)/)).toBeVisible();
    await expect(resultLinks(page)).toHaveCount(20);
    // Le message le plus récent est le 25e du sujet : il est sur la deuxième page du sujet
    await expect(resultLinks(page).first()).toHaveAttribute("href", postHref(PAGES_TOPIC.id, pagePostId(25), 2));

    const pager = page.getByRole("navigation", { name: "Pagination" }).filter({ visible: true }).first();
    await expect(pager).toBeVisible();
    await pager.getByRole("button", { name: /^(2|next)$/ }).or(pager.getByRole("link", { name: "Page suivante" })).first().click();
    await page.waitForURL(/[?&]page=2/);
    await page.waitForLoadState("networkidle");
    expect(new URL(page.url()).searchParams.get("q")).toBe("paginatruc");
    await expect(resultLinks(page)).toHaveCount(5);
    await expect(resultLinks(page).last()).toHaveAttribute("href", postHref(PAGES_TOPIC.id, pagePostId(1), 1));

    // Bug de l'inventaire (section 18) : le lien atteint-il bien le message ?
    await page.goto(searchUrl({ q: "paginatruc" }), { waitUntil: "networkidle" });
    await resultLinks(page).first().click();
    await page.waitForURL(new RegExp(`/forum/topic/${PAGES_TOPIC.id}\\?page=2`));
    await expect(page.locator(`[id="post-${pagePostId(25)}"]`)).toBeInViewport();
  });

  test("[tous] message dédié quand la recherche ne donne rien", async ({ page }, testInfo) => {
    await page.goto(searchUrl({ q: "motintrouvablexyz" }), { waitUntil: "networkidle" });
    await expect(page.getByText(/Aucun résultat/)).toBeVisible();
    await expect(resultLinks(page)).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("recherche-aucun-resultat.png"), fullPage: false });
  });
});

test.describe("3.7 créer un forum", () => {
  test("[membre] est renvoyé vers le forum", async ({ page }) => {
    await loginAs(page, E2E.coachId);
    await page.goto("/forum/new-forum", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/forum$/);
  });

  test("[modo] champs ; erreurs : nom vide, nom déjà pris, plus de 5 sous-forums", async ({ page }, testInfo) => {
    await loginAs(page, E2E.modoId);
    await page.goto(`/forum/new-forum?categoryId=${categoryId}&parentForumId=${FULL_FORUM.id}`, { waitUntil: "networkidle" });
    const name = page.getByLabel("Nom du forum");
    await expect(name).toBeVisible();
    await expect(page.getByLabel("Description")).toBeVisible();
    await expect(page.getByLabel(/^Catégorie/)).toHaveValue(categoryId);
    await expect(page.getByLabel(/^Forum parent/)).toHaveValue(FULL_FORUM.id);
    const after = page.getByLabel("Insérer après");
    await expect(after.getByRole("option", { name: /Au début/ })).toBeAttached();
    await expect(after.getByRole("option", { name: /Inv Rech Plein 5/ })).toBeAttached();
    await page.screenshot({ path: testInfo.outputPath("nouveau-forum.png"), fullPage: true });

    const submit = page.getByRole("button", { name: "Créer le forum" });
    // Nom vide : le navigateur refuse l'envoi
    await submit.click();
    expect(await name.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
    await expect(page).toHaveURL(/\/forum\/new-forum/);
    // Nom fait seulement d'espaces : refusé par le serveur
    await name.fill("   ");
    await submit.click();
    await expect(page.getByText("Le nom du forum est obligatoire.")).toBeVisible();
    // Plus de 5 sous-forums
    await name.fill("Inv Rech Sixième");
    await submit.click();
    await expect(page.getByText(/nombre maximum de sous-forums \(5\)/)).toBeVisible();
    // Nom déjà pris
    await name.fill(E2E.forumName);
    await submit.click();
    await expect(page.getByText(`Un forum porte déjà le nom « ${E2E.forumName} ».`)).toBeVisible();
    await expect(page).toHaveURL(/\/forum\/new-forum/);
    await expect(name).toHaveValue(E2E.forumName);

    await expect(page.getByRole("link", { name: "Annuler" })).toHaveAttribute("href", "/forum");
  });

  test("[modo] création d'un sous-forum : catégorie, forum parent, « Insérer après »", async ({ page }) => {
    await loginAs(page, E2E.modoId);
    await page.goto("/forum/new-forum", { waitUntil: "networkidle" });
    await page.getByLabel("Nom du forum").fill(CREATED_FORUM);
    await page.getByLabel("Description").fill("Forum créé par le test d'inventaire");
    await page.getByLabel(/^Catégorie/).selectOption(categoryId);
    const parent = page.getByLabel(/^Forum parent/);
    await expect(parent.getByRole("option", { name: ROOT_FORUM.name })).toBeAttached();
    await parent.selectOption(ROOT_FORUM.id);
    const after = page.getByLabel("Insérer après");
    await expect(after.getByRole("option", { name: new RegExp(CHILD_FORUM.name) })).toBeAttached();
    await after.selectOption(CHILD_FORUM.id);
    await page.getByRole("button", { name: "Créer le forum" }).click();
    await page.waitForURL(new RegExp(`/forum/${ROOT_FORUM.id}$`));
    const created = await withTestDb((prisma) => prisma.forum.findUnique({ where: { name: CREATED_FORUM } }));
    expect(created?.parentForumId).toBe(ROOT_FORUM.id);
    expect(created?.description).toBe("Forum créé par le test d'inventaire");
    await withTestDb((prisma) => prisma.forum.delete({ where: { name: CREATED_FORUM } }));
  });
});

test.describe("fenêtres de modération et de signalement", () => {
  const topicField = <K extends "forumId" | "title">(field: K) =>
    withTestDb(async (prisma) => (await prisma.topic.findUnique({ where: { id: MODO_TOPIC.id }, select: { [field]: true } }))?.[field]);

  test("[modo] déplacer le sujet : liste des forums, puis déplacement", async ({ page }, testInfo) => {
    await loginAs(page, E2E.modoId);
    await page.goto(`/forum/topic/${MODO_TOPIC.id}`, { waitUntil: "networkidle" });
    try {
      await (await findTool(page, /^Déplacer/)).click();
      const dialog = page.getByRole("dialog", { name: "Déplacer le sujet" });
      await expect(dialog).toBeVisible();
      const confirm = dialog.getByRole("button", { name: "Confirmer le déplacement" });
      await expect(confirm).toBeDisabled();
      await dialog.getByRole("combobox").selectOption({ label: CHILD_FORUM.name });
      await page.screenshot({ path: testInfo.outputPath("fenetre-deplacer.png"), fullPage: false });
      await confirm.click();
      await expect.poll(() => topicField("forumId"), { timeout: 20_000 }).toBe(CHILD_FORUM.id);
    } finally {
      await withTestDb((prisma) => prisma.topic.update({ where: { id: MODO_TOPIC.id }, data: { forumId: ROOT_FORUM.id } }));
    }
  });

  test("[modo] modifier le titre : smileys, aperçu, enregistrement", async ({ page }, testInfo) => {
    await loginAs(page, E2E.modoId);
    await page.goto(`/forum/topic/${MODO_TOPIC.id}`, { waitUntil: "networkidle" });
    try {
      await (await findTool(page, "Modifier le titre")).click();
      const dialog = page.getByRole("dialog", { name: "Modifier le titre du sujet" });
      await expect(dialog).toBeVisible();
      const input = dialog.getByRole("textbox");
      await expect(input).toHaveValue(MODO_TOPIC.title);
      await dialog.getByRole("button", { name: /Insérer un smiley/ }).click();
      await expect(dialog.getByText(/Aperçu du titre/)).toBeVisible();
      await input.fill("Inv Rech titre modifié");
      await page.screenshot({ path: testInfo.outputPath("fenetre-titre.png"), fullPage: false });
      await dialog.getByRole("button", { name: "Enregistrer" }).click();
      await expect.poll(() => topicField("title"), { timeout: 20_000 }).toBe("Inv Rech titre modifié");
      await expect(dialog).toBeHidden();
    } finally {
      await withTestDb((prisma) => prisma.topic.update({ where: { id: MODO_TOPIC.id }, data: { title: MODO_TOPIC.title } }));
    }
  });

  test("[modo] modérer un message : raison obligatoire, annuler, confirmer", async ({ page }, testInfo) => {
    await loginAs(page, E2E.modoId);
    await page.goto(`/forum/topic/${MODO_TOPIC.id}`, { waitUntil: "networkidle" });
    try {
      await (await postAction(page, MODO_TOPIC.postId, "Modérer")).click();
      const title = page.getByText(`Modérer le message de ${AUTHOR.name}`);
      await expect(title).toBeVisible();
      const confirm = page.getByRole("button", { name: "Confirmer la modération" });
      await expect(confirm).toBeDisabled();
      await page.screenshot({ path: testInfo.outputPath("fenetre-moderer.png"), fullPage: false });
      await page.getByRole("button", { name: "Annuler" }).filter({ visible: true }).last().click();
      await expect(title).toBeHidden();

      await (await postAction(page, MODO_TOPIC.postId, "Modérer")).click();
      await page.getByLabel("Raison de la modération").fill("Raison de la recherche");
      await confirm.click();
      await expect(page.locator(`[id="post-${MODO_TOPIC.postId}"]`).getByText(/raison : Raison de la recherche/)).toBeVisible({ timeout: 20_000 });
    } finally {
      await withTestDb((prisma) =>
        prisma.post.update({ where: { id: MODO_TOPIC.postId }, data: { isModerated: false, moderationReason: null, moderatedBy: null } })
      );
    }
  });

  test("[membre] signaler le sujet et un message : raisons, précisions, envoi", async ({ page }, testInfo) => {
    await loginAs(page, E2E.coachId);
    await page.goto(`/forum/topic/${MODO_TOPIC.id}`, { waitUntil: "networkidle" });
    await (await findTool(page, /^Signaler( le sujet)?$/)).click();
    let dialog = page.getByRole("dialog", { name: "Signaler un contenu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(MODO_TOPIC.title)).toBeVisible();
    for (const reason of ["Spam / Publicité", "Harcèlement / Insultes", "Contenu inapproprié / NSFW", "Bot", "Autre (préciser ci-dessous)"]) {
      await expect(dialog.getByRole("button", { name: reason })).toBeVisible();
    }
    // Sans raison : notification d'erreur
    await dialog.getByRole("button", { name: "Envoyer le signalement" }).click();
    await expect(page.getByText("Veuillez choisir une raison")).toBeVisible();
    await dialog.getByRole("button", { name: "Bot" }).click();
    await dialog.getByPlaceholder(/Détaillez votre signalement/).fill("Précision du test de recherche");
    await page.screenshot({ path: testInfo.outputPath("fenetre-signaler.png"), fullPage: false });
    await dialog.getByRole("button", { name: "Envoyer le signalement" }).click();
    await expect(page.getByText("Signalement envoyé à l'équipe")).toBeVisible();
    await expect(dialog).toBeHidden();
    const topicReport = await withTestDb((prisma) => prisma.moderationReport.findFirst({ where: { targetId: MODO_TOPIC.id } }));
    expect(topicReport).toMatchObject({ reason: "Bot", details: "Précision du test de recherche", targetType: "TOPIC", reporterId: E2E.coachId });

    await (await postAction(page, MODO_TOPIC.postId, "Signaler ce message")).click();
    dialog = page.getByRole("dialog", { name: "Signaler un contenu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(`Message de ${AUTHOR.name}`)).toBeVisible();
    await dialog.getByRole("button", { name: "Spam / Publicité" }).click();
    await dialog.getByRole("button", { name: "Envoyer le signalement" }).click();
    await expect(dialog).toBeHidden();
    await expect
      .poll(() => withTestDb((prisma) => prisma.moderationReport.count({ where: { targetId: MODO_TOPIC.postId, targetType: "POST" } })))
      .toBe(1);
  });

  test("[membre, téléphone] la fenêtre de signalement s'ouvre depuis le panneau « Plus » et passe au-dessus de lui", async ({ page }) => {
    test.skip(!isPhone(page), "le panneau « Plus » n'existe que sur téléphone");
    await loginAs(page, E2E.coachId);
    await page.goto(`/forum/topic/${MODO_TOPIC.id}`, { waitUntil: "networkidle" });
    const panel = await openMore(page);
    await panel.getByRole("button", { name: /^Signaler( le sujet)?$/ }).click();
    const dialog = page.getByRole("dialog", { name: "Signaler un contenu" });
    await expect(dialog).toBeVisible();
    // Un appui sur une raison et sur « Annuler » atteint bien la fenêtre (rien ne la recouvre)
    await dialog.getByRole("button", { name: "Bot" }).click();
    await dialog.getByRole("button", { name: "Annuler" }).click();
    await expect(dialog).toBeHidden();
  });
});
