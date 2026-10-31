/**
 * Inventaire de la refonte, section 10 (articles) de docs/refonte/inventaire.md (carte 095) : la liste `/articles`
 * (grille, liste, pagination, filtres `query`, `tag`, `author`, `sort` et `view`, « Réinitialiser », « Créer un
 * article »), la page d'un article (contenu, auteur, date, vues, tags, réactions), ses actions (modifier, supprimer,
 * modérer, annuler la modération, signaler) et le formulaire de création et de modification. Rejoué en taille
 * ordinateur (projet chromium) et en taille téléphone (projet telephone). Les éléments sont cherchés par leur rôle,
 * leur nom accessible ou leur texte, jamais par une classe CSS : le test doit passer sans modification avant et après
 * la refonte de ces écrans.
 *
 * Sur téléphone, un réglage ou une action peut être rangé dans un panneau : panneau des filtres (« Ouvrir les filtres »
 * ou « Filtres »), menu des actions de l'article (« ⋯ ») ou panneau « Plus » de la barre du bas. Les petites fonctions
 * `control` et `findAction` cherchent d'abord dans la page, puis dans ces panneaux. C'est une adaptation de la façon
 * de trouver l'élément, pas un changement de ce qui est attendu.
 *
 * Données préparées par le test (et supprimées à la fin), toutes nommées « Inv Art … » :
 * - trois membres : un auteur, un lecteur (qui écrit aussi un article) et un autre membre ;
 * - l'article « Inv Art Alpha » de l'auteur (contenu en BBCode, deux tags, 5 vues, deux réactions), l'article
 *   « Inv Art Beta » du lecteur, un article déjà modéré, un article à modérer, un article à supprimer, un article à
 *   modifier ;
 * - 22 articles de remplissage pour la pagination (12 par page en grille, 20 en liste) ;
 * - une ligue, pour la ligue liée d'un nouvel article.
 *
 * Des captures sont enregistrées dans test-results/ pour la relecture humaine (pas de comparaison au pixel).
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

/**
 * Accès à la base de test. La petite base locale coupe parfois une connexion pendant que le site garde la sienne
 * (« Connection terminated unexpectedly ») : on réessaie alors, 10 fois au plus.
 */
async function db<T>(run: Parameters<typeof withTestDb<T>>[0]): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await withTestDb(run);
    } catch (error) {
      const cut = error instanceof Error && /Connection terminated|ECONNRESET|ConnectionClosed/.test(error.message);
      if (!cut || attempt >= 10) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 1024;

const AUTHOR = { id: "e2e_art_auteur", name: "Auteur Art Inv" };
const READER = { id: "e2e_art_lecteur", name: "Lecteur Art Inv" };
const OTHER = { id: "e2e_art_autre", name: "Autre Art Inv" };
const USERS = [AUTHOR, READER, OTHER];

const TAG_A = "InvArtTagA";
const TAG_B = "InvArtTagB";
const ALPHA = {
  id: "e2e_art_alpha", title: "Inv Art Alpha", content: "[b]Contenu en gras de l'article Alpha[/b] et une suite.",
  createdAt: new Date("2025-03-14T10:00:00Z"), views: 5,
};
const BETA = { id: "e2e_art_beta", title: "Inv Art Beta", content: "Contenu de l'article Beta." };
const MODERATED = { id: "e2e_art_modere", title: "Inv Art Déjà modéré", content: "Contenu caché de l'article modéré." };
const TO_MODERATE = { id: "e2e_art_a_moderer", title: "Inv Art À modérer", content: "Contenu de l'article à modérer." };
const DOOMED = { id: "e2e_art_suppr", title: "Inv Art À supprimer", content: "Contenu de l'article à supprimer." };
const EDITABLE = { id: "e2e_art_modif", title: "Inv Art À modifier", content: "[i]Contenu de l'article à modifier[/i]" };
const LIGUE = { id: "e2e_art_ligue", name: "Inv Art Ligue", acronym: "IAL" };
const FILLERS = 22;
const fillerTitle = (n: number) => `Inv Art Remplissage ${String(n).padStart(2, "0")}`;
const CREATED_TITLE = "Inv Art Créé par le lecteur";
const NEW_TAG = "InvArtNouveau";

/** Supprime tout ce que ce test a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await db(async (prisma) => {
    const articles = await prisma.article.findMany({ where: { OR: [{ id: { startsWith: "e2e_art_" } }, { title: { startsWith: "Inv Art" } }] }, select: { id: true } });
    const ids = articles.map((article) => article.id);
    await prisma.moderationReport.deleteMany({ where: { targetType: "ARTICLE", targetId: { in: ids } } });
    await prisma.moderationLog.deleteMany({ where: { targetId: { in: ids } } });
    await prisma.article.deleteMany({ where: { id: { in: ids } } });
    await prisma.articleTag.deleteMany({ where: { name: { startsWith: "InvArt" } } });
    await prisma.ligue.deleteMany({ where: { id: LIGUE.id } });
    await prisma.user.deleteMany({ where: { id: { in: USERS.map((user) => user.id) } } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await db(async (prisma) => {
    for (const [index, user] of USERS.entries()) {
      await prisma.user.create({ data: { ...user, email: `article-${index}@e2e.test`, hasFinishedOnboarding: true } });
    }
    await prisma.ligue.create({ data: { ...LIGUE, geographicalZone: "R2-NO", creatorId: OTHER.id } });
    const now = Date.now();
    // Remplissage : du plus ancien (01) au plus récent (22), tous plus anciens que les autres articles sauf Alpha
    for (let n = 1; n <= FILLERS; n++) {
      await prisma.article.create({
        data: { id: `e2e_art_fill_${n}`, title: fillerTitle(n), content: `Remplissage numéro ${n}.`, authorId: AUTHOR.id, createdAt: new Date(now - (100 - n) * 60_000) },
      });
    }
    await prisma.article.create({
      data: {
        ...ALPHA, authorId: AUTHOR.id,
        tags: { create: [{ name: TAG_A }, { name: TAG_B }] },
        reactions: { create: [{ userId: READER.id, emoji: "👍" }, { userId: OTHER.id, emoji: "👍" }] },
      },
    });
    await prisma.article.create({ data: { ...BETA, authorId: READER.id, createdAt: new Date(now - 60_000), tags: { connect: { name: TAG_B } } } });
    await prisma.article.create({
      data: { ...MODERATED, authorId: AUTHOR.id, isModerated: true, moderationReason: "Raison du test d'inventaire", moderatedBy: E2E.modoId },
    });
    for (const article of [TO_MODERATE, DOOMED, EDITABLE]) {
      await prisma.article.create({ data: { ...article, authorId: AUTHOR.id, createdAt: new Date(now - 200 * 60_000) } });
    }
  });
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis.
// Chaque test enchaîne beaucoup de pages et d'écritures dans la base : temps permis triplé (test.slow).
// La pastille des outils de développement de Next.js (`nextjs-portal`, en bas à gauche de l'écran) est masquée : elle
// n'existe pas sur le site en ligne, et sur téléphone elle intercepterait les appuis sur les boutons placés en bas à
// gauche d'un panneau (« Réinitialiser », première colonne des émojis).
test.beforeEach(async ({ page }) => {
  test.slow();
  await page.addInitScript(() => {
    localStorage.setItem("bbfrance_cookie_consent", "accepted");
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important; }";
      document.head.appendChild(style);
    });
  });
});

/** Adresses des articles affichés, dans l'ordre (un article peut avoir plusieurs liens vers la même page). */
async function shownArticles(page: Page): Promise<string[]> {
  const links = page.getByRole("link", { name: /Inv Art/ }).filter({ visible: true });
  const hrefs = await links.evaluateAll((elements) => elements.map((element) => element.getAttribute("href") ?? ""));
  return [...new Set(hrefs.filter((href) => /^\/articles\/(?!create|edit)[^/?]+$/.test(href)))];
}

/** Panneau des filtres du téléphone (ouvert par « Ouvrir les filtres » ou « Filtres »), ouvert au besoin. */
async function filterPanel(page: Page): Promise<Locator> {
  const panel = page.getByRole("dialog", { name: /Filtr/ }).filter({ visible: true });
  if ((await panel.count()) === 0) {
    // En développement, le bouton flottant historique est caché sous les widgets de développement (« Dev Auth ») :
    // le clic est envoyé directement au bouton
    await page.getByRole("button", { name: /^(Ouvrir les filtres|Filtres)/ }).filter({ visible: true }).first().dispatchEvent("click");
    await expect(panel.first()).toBeVisible();
  }
  return panel.first();
}

/** Réglage de la liste : visible dans la page, sinon dans le panneau des filtres. */
async function control(page: Page, role: "combobox" | "button" | "link" | "textbox", name: string | RegExp): Promise<Locator> {
  const onPage = page.getByRole(role, { name }).filter({ visible: true });
  if ((await onPage.count()) > 0) return onPage.first();
  const panel = await filterPanel(page);
  const inPanel = panel.getByRole(role, { name }).filter({ visible: true }).first();
  await expect(inPanel).toBeVisible();
  return inPanel;
}

/** Comme `control`, mais renvoie `null` si le réglage n'existe nulle part (panneau refermé). */
async function maybeControl(page: Page, role: "button" | "link", name: RegExp): Promise<Locator | null> {
  const onPage = page.getByRole(role, { name }).filter({ visible: true });
  if ((await onPage.count()) > 0) return onPage.first();
  if (!isPhone(page)) return null;
  const panel = await filterPanel(page);
  const inPanel = panel.getByRole(role, { name }).filter({ visible: true });
  if ((await inPanel.count()) > 0) return inPanel.first();
  await page.keyboard.press("Escape");
  return null;
}

/** Bouton ou lien selon la version (affichage en grille ou en liste, « Réinitialiser ») : dans la page, sinon dans le panneau des filtres. */
async function buttonOrLink(page: Page, name: RegExp): Promise<Locator> {
  const onPage = page.getByRole("button", { name }).or(page.getByRole("link", { name })).filter({ visible: true });
  if ((await onPage.count()) > 0) return onPage.first();
  const panel = await filterPanel(page);
  return panel.getByRole("button", { name }).or(panel.getByRole("link", { name })).filter({ visible: true }).first();
}

/** Une action de l'article sous forme de bouton, de lien ou d'entrée de menu. */
const actionIn = (scope: Page | Locator, name: RegExp) =>
  scope.getByRole("button", { name }).or(scope.getByRole("link", { name })).or(scope.getByRole("menuitem", { name })).filter({ visible: true });

/**
 * Cherche une action de la page d'un article : visible dans la page, sinon dans le menu des actions de l'article
 * (« ⋯ »), sinon, sur téléphone, dans le panneau « Plus ». Renvoie `null` si l'action n'existe nulle part ; les
 * panneaux ouverts pour rien sont refermés.
 */
async function findAction(page: Page, name: RegExp): Promise<Locator | null> {
  if ((await actionIn(page, name).count()) > 0) return actionIn(page, name).first();
  const opener = page.getByRole("button", { name: /Actions de l'article|Plus d'actions/ }).filter({ visible: true });
  if ((await opener.count()) > 0) {
    await opener.first().click();
    const menu = page.getByRole("menu").or(page.getByRole("dialog")).filter({ visible: true }).first();
    await expect(menu).toBeVisible();
    if ((await actionIn(menu, name).count()) > 0) return actionIn(menu, name).first();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  }
  if (isPhone(page)) {
    const more = page.getByRole("dialog", { name: "Plus" });
    await page.getByRole("button", { name: "Plus", exact: true }).click();
    await expect(more).toBeVisible();
    if ((await actionIn(more, name).count()) > 0) return actionIn(more, name).first();
    await page.keyboard.press("Escape");
    await expect(more).toBeHidden();
  }
  return null;
}

/**
 * Quitte le champ en cours de saisie avant d'appuyer sur un bouton. Sur téléphone, la barre du bas, cachée pendant la
 * saisie, réapparaît quand le champ perd le focus et décale la page : l'appui direct tomberait alors à côté du bouton.
 * Le test attend donc que la page soit stable, comme le ferait un coach.
 */
async function leaveField(page: Page) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(page.locator("html")).not.toHaveAttribute("data-typing", "true");
  await page.waitForTimeout(300);
}

/**
 * Déconnexion : la page est d'abord quittée, puis les cookies sont effacés. Sinon, une requête encore en cours sur la
 * page précédente (le compteur de vues d'un article, par exemple) peut répondre après l'effacement et reposer le cookie
 * de session, qui est rafraîchi à chaque réponse.
 */
async function logout(page: Page) {
  await page.goto("about:blank");
  await page.context().clearCookies();
}

/** Écrit dans un champ de filtre puis valide par Entrée (l'ancienne version appliquait le filtre à Entrée). */
async function typeFilter(page: Page, name: RegExp, value: string) {
  const field = await control(page, "textbox", name);
  await field.fill(value);
  await field.press("Enter");
}

test.describe("Inventaire 10 : articles", () => {
  test("[tous] /articles : grille, liste, pagination, filtres query, tag, author, sort et view, « Réinitialiser »", async ({ page }, testInfo) => {
    await page.goto("/articles", { waitUntil: "networkidle" });
    // Recherche : le champ écrit `query` dans l'adresse
    await typeFilter(page, /Rechercher|Titre, contenu/i, "Inv Art Remplissage");
    await page.waitForURL(/query=Inv/);
    if (isPhone(page)) await page.keyboard.press("Escape");

    // Grille : 12 articles par page (22 articles de remplissage)
    await page.goto("/articles?query=Inv+Art+Remplissage", { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("articles-grille.png"), fullPage: false });
    expect(await shownArticles(page)).toHaveLength(12);
    await expect(page.getByRole("navigation", { name: "Pagination" }).filter({ visible: true }).first()).toBeVisible();
    await page.goto("/articles?query=Inv+Art+Remplissage&page=2", { waitUntil: "networkidle" });
    expect(await shownArticles(page)).toHaveLength(10);

    // Liste : 20 articles par page
    await page.goto("/articles?query=Inv+Art+Remplissage", { waitUntil: "networkidle" });
    await (await buttonOrLink(page, /liste/i)).click();
    await page.waitForURL(/view=list/);
    await page.waitForLoadState("networkidle");
    if (isPhone(page)) await page.keyboard.press("Escape");
    expect(await shownArticles(page)).toHaveLength(20);
    await page.screenshot({ path: testInfo.outputPath("articles-liste.png"), fullPage: false });
    await page.goto("/articles?view=list&query=Inv+Art+Remplissage&page=2", { waitUntil: "networkidle" });
    expect(await shownArticles(page)).toHaveLength(2);
    await (await buttonOrLink(page, /grille/i)).click();
    await page.waitForURL(/view=grid/);
    if (isPhone(page)) await page.keyboard.press("Escape");

    // Tag : choisi parmi les suggestions, il écrit `tag` dans l'adresse
    await page.goto("/articles?query=Inv+Art", { waitUntil: "networkidle" });
    const tagField = await control(page, "textbox", /tag/i);
    await tagField.fill("InvArtTag");
    await page.getByRole("button", { name: TAG_A }).filter({ visible: true }).first().click();
    await page.waitForURL(new RegExp(`tag=${TAG_A}`));
    await page.waitForLoadState("networkidle");
    if (isPhone(page)) await page.keyboard.press("Escape");
    expect(await shownArticles(page)).toEqual([`/articles/${ALPHA.id}`]);
    await page.goto(`/articles?query=Inv+Art&tag=${TAG_B}`, { waitUntil: "networkidle" });
    expect((await shownArticles(page)).sort()).toEqual([`/articles/${ALPHA.id}`, `/articles/${BETA.id}`].sort());

    // Auteur : écrit `author` dans l'adresse
    await page.goto("/articles?query=Inv+Art", { waitUntil: "networkidle" });
    await typeFilter(page, /auteur/i, "Lecteur Art");
    await page.waitForURL(/author=Lecteur/);
    await page.waitForLoadState("networkidle");
    if (isPhone(page)) await page.keyboard.press("Escape");
    expect(await shownArticles(page)).toEqual([`/articles/${BETA.id}`]);

    // Tri : écrit `sort` dans l'adresse ; récents, anciens, titre A-Z, populaires
    await page.goto("/articles?query=Inv+Art", { waitUntil: "networkidle" });
    await (await control(page, "combobox", /Trier/)).selectOption("title_asc");
    await page.waitForURL(/sort=title_asc/);
    await page.waitForLoadState("networkidle");
    if (isPhone(page)) await page.keyboard.press("Escape");
    expect((await shownArticles(page))[0]).toBe(`/articles/${ALPHA.id}`);
    await page.goto("/articles?query=Inv+Art+Remplissage&sort=date_desc", { waitUntil: "networkidle" });
    expect((await shownArticles(page))[0]).toBe("/articles/e2e_art_fill_22");
    await page.goto("/articles?query=Inv+Art+Remplissage&sort=date_asc", { waitUntil: "networkidle" });
    expect((await shownArticles(page))[0]).toBe("/articles/e2e_art_fill_1");
    await page.goto("/articles?query=Inv+Art&sort=reactions_desc", { waitUntil: "networkidle" });
    expect((await shownArticles(page))[0]).toBe(`/articles/${ALPHA.id}`);

    // Les filtres sont lus dans l'adresse
    await page.goto(`/articles?view=list&query=Inv+Art&tag=${TAG_B}&author=Auteur+Art`, { waitUntil: "networkidle" });
    expect(await shownArticles(page)).toEqual([`/articles/${ALPHA.id}`]);

    // « Réinitialiser » (bouton ou lien selon la version) retire les filtres
    await (await buttonOrLink(page, /Réinitialiser/)).click();
    await page.waitForURL((url) => !url.search.includes("tag=") && !url.search.includes("author="));
  });

  test("[membre] « Créer un article »", async ({ page }) => {
    // Un visiteur ne voit pas le bouton
    await page.goto("/articles", { waitUntil: "networkidle" });
    expect(await maybeControl(page, "link", /Créer un article/i)).toBeNull();

    await loginAs(page, READER.id);
    await page.goto("/articles", { waitUntil: "networkidle" });
    const create = await control(page, "link", /Créer un article|^Créer/i);
    await expect(create).toHaveAttribute("href", "/articles/create");
    await create.click();
    await page.waitForURL(/\/articles\/create$/);
  });

  test("[tous] /articles/[id] : contenu, auteur, date, vues, tags, réactions émoji", async ({ page }, testInfo) => {
    await db((prisma) => prisma.article.update({ where: { id: ALPHA.id }, data: { views: ALPHA.views } }));
    await page.goto(`/articles/${ALPHA.id}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("article-visiteur.png"), fullPage: true });
    await expect(page.getByRole("heading", { name: ALPHA.title }).first()).toBeVisible();
    // Contenu en BBCode converti : le texte en gras est mis en forme
    const bold = page.getByText("Contenu en gras de l'article Alpha").first();
    await expect(bold).toBeVisible();
    expect(await bold.evaluate((element) => getComputedStyle(element).fontWeight)).toMatch(/^(700|bold|[6-9]00)$/);
    // Auteur (lien vers son profil), date, vues, tags
    await expect(page.getByRole("link", { name: AUTHOR.name }).filter({ visible: true }).first()).toHaveAttribute("href", `/spy/${AUTHOR.id}`);
    await expect(page.getByText(/14 mars 2025/).first()).toBeVisible();
    await expect(page.getByText(/\b5\s*(fois|vues?)\b/).first()).toBeVisible();
    await expect(page.getByText(TAG_A, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(TAG_B, { exact: true }).first()).toBeVisible();
    // Réactions : visibles pour un visiteur, qui ne peut pas réagir
    const thumbs = page.getByRole("button", { name: /^👍\s*2/ }).filter({ visible: true }).first();
    await expect(thumbs).toBeVisible();
    await expect(thumbs).toBeDisabled();
    await expect(page.getByRole("button", { name: /Ajouter une réaction|Réagir/ }).filter({ visible: true })).toHaveCount(0);

    // Un membre ajoute une réaction, puis la retire
    await loginAs(page, AUTHOR.id);
    await page.goto(`/articles/${ALPHA.id}`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Ajouter une réaction|Réagir/ }).filter({ visible: true }).first().click();
    await page.getByRole("button", { name: "🔥", exact: true }).filter({ visible: true }).first().click();
    await expect.poll(() => db((prisma) => prisma.articleReaction.count({ where: { articleId: ALPHA.id, userId: AUTHOR.id, emoji: "🔥" } }))).toBe(1);
    await page.screenshot({ path: testInfo.outputPath("article-reactions.png"), fullPage: false });
    await page.getByRole("button", { name: /^🔥\s*1/ }).filter({ visible: true }).first().click();
    await expect.poll(() => db((prisma) => prisma.articleReaction.count({ where: { articleId: ALPHA.id, userId: AUTHOR.id } }))).toBe(0);
  });

  test("[auteur, modo] /articles/[id] : Modifier, Supprimer", async ({ page }) => {
    const expectations = [
      { who: AUTHOR.id, allowed: true },
      { who: E2E.modoId, allowed: true },
      { who: READER.id, allowed: false },
      { who: null, allowed: false },
    ];
    for (const expectation of expectations) {
      await logout(page);
      if (expectation.who) await loginAs(page, expectation.who);
      await page.goto(`/articles/${ALPHA.id}`, { waitUntil: "networkidle" });
      const edit = await findAction(page, /^Modifier/);
      expect(edit !== null, `Modifier pour ${expectation.who}`).toBe(expectation.allowed);
      if (edit) {
        await expect(edit).toHaveAttribute("href", `/articles/edit/${ALPHA.id}`);
        await page.keyboard.press("Escape");
      }
      await page.goto(`/articles/${ALPHA.id}`, { waitUntil: "networkidle" });
      const remove = await findAction(page, /^Supprimer/);
      expect(remove !== null, `Supprimer pour ${expectation.who}`).toBe(expectation.allowed);
      if (remove) await page.keyboard.press("Escape");
    }

    // Le modérateur supprime un article, après confirmation
    await logout(page);
    await loginAs(page, E2E.modoId);
    await page.goto(`/articles/${DOOMED.id}`, { waitUntil: "networkidle" });
    await (await findAction(page, /^Supprimer/))!.click();
    const dialog = page.getByRole("dialog", { name: /Supprimer/ });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: /^(Supprimer|Confirmer)/ }).click();
    await page.waitForURL(/\/articles$/);
    await expect.poll(() => db((prisma) => prisma.article.count({ where: { id: DOOMED.id } }))).toBe(0);
  });

  test("[modo] /articles/[id] : modérer, annuler la modération ; un article modéré n'est visible que par son auteur et les modos", async ({ page }, testInfo) => {
    // Article déjà modéré : contenu masqué pour un visiteur et pour un autre membre
    await page.goto(`/articles/${MODERATED.id}`, { waitUntil: "networkidle" });
    await expect(page.getByText(/masqué par la modération/).first()).toBeVisible();
    await expect(page.getByText(MODERATED.content)).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("article-modere-visiteur.png"), fullPage: false });
    await loginAs(page, READER.id);
    await page.goto(`/articles/${MODERATED.id}`, { waitUntil: "networkidle" });
    await expect(page.getByText(MODERATED.content)).toHaveCount(0);
    // L'auteur et le modérateur le voient, avec la raison de la modération
    for (const who of [AUTHOR.id, E2E.modoId]) {
      await logout(page);
      await loginAs(page, who);
      await page.goto(`/articles/${MODERATED.id}`, { waitUntil: "networkidle" });
      await expect(page.getByText(MODERATED.content).first()).toBeVisible();
      await expect(page.getByText(/Raison du test d'inventaire/).first()).toBeVisible();
    }

    // Seul un modérateur peut modérer
    for (const who of [AUTHOR.id, READER.id]) {
      await logout(page);
      await loginAs(page, who);
      await page.goto(`/articles/${TO_MODERATE.id}`, { waitUntil: "networkidle" });
      expect(await findAction(page, /^Modérer/), `Modérer pour ${who}`).toBeNull();
    }

    // Le modérateur modère l'article, avec une raison
    await logout(page);
    await loginAs(page, E2E.modoId);
    await page.goto(`/articles/${TO_MODERATE.id}`, { waitUntil: "networkidle" });
    await (await findAction(page, /^Modérer/))!.click();
    const moderate = page.getByRole("dialog", { name: /Modérer/ });
    await expect(moderate).toBeVisible();
    await moderate.getByRole("textbox", { name: /Raison/ }).fill("Modéré par le test d'inventaire");
    await moderate.getByRole("button", { name: /Confirmer la modération/ }).click();
    await expect(moderate).toBeHidden();
    await expect.poll(() => db((prisma) => prisma.article.findUnique({ where: { id: TO_MODERATE.id }, select: { isModerated: true, moderationReason: true } })))
      .toEqual({ isModerated: true, moderationReason: "Modéré par le test d'inventaire" });

    // Puis il annule la modération, après confirmation
    await page.goto(`/articles/${TO_MODERATE.id}`, { waitUntil: "networkidle" });
    await (await findAction(page, /^(Restaurer|Annuler la modération)/))!.click();
    const restore = page.getByRole("dialog", { name: /Annuler la modération|Restaurer/ });
    await expect(restore).toBeVisible();
    await restore.getByRole("button", { name: /^(Restaurer|Annuler la modération|Confirmer)$/ }).click();
    await expect.poll(() => db((prisma) => prisma.article.findUnique({ where: { id: TO_MODERATE.id }, select: { isModerated: true } }))).toEqual({ isModerated: false });
  });

  test("[membre, pas l'auteur] /articles/[id] : signaler", async ({ page }) => {
    // Un visiteur et l'auteur ne peuvent pas signaler
    await page.goto(`/articles/${ALPHA.id}`, { waitUntil: "networkidle" });
    expect(await findAction(page, /Signaler/)).toBeNull();
    await loginAs(page, AUTHOR.id);
    await page.goto(`/articles/${ALPHA.id}`, { waitUntil: "networkidle" });
    expect(await findAction(page, /Signaler/)).toBeNull();

    await logout(page);
    await loginAs(page, READER.id);
    await page.goto(`/articles/${ALPHA.id}`, { waitUntil: "networkidle" });
    const report = await findAction(page, /Signaler/);
    expect(report).not.toBeNull();
    await report!.click();
    const dialog = page.getByRole("dialog", { name: /Signaler/ });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Spam / Publicité" }).click();
    await dialog.getByRole("button", { name: /Envoyer le signalement/ }).click();
    await expect(dialog).toBeHidden();
    await expect.poll(() => db((prisma) => prisma.moderationReport.count({ where: { targetId: ALPHA.id, targetType: "ARTICLE", reporterId: READER.id } }))).toBe(1);
  });

  test("[membre / auteur, modo] /articles/create, /articles/edit/[id] : titre, tags avec suggestions, ligue liée, contenu BBCode", async ({ page }, testInfo) => {
    const field = (name: RegExp) => page.getByRole("textbox", { name }).filter({ visible: true }).first();

    // Création par un membre
    await loginAs(page, READER.id);
    await page.goto("/articles/create", { waitUntil: "networkidle" });
    await field(/^Titre/).fill(CREATED_TITLE);
    // Tags : un tag existant choisi parmi les suggestions, puis un nouveau tag validé par Entrée
    await field(/tag|Stratégie/i).fill("InvArtTag");
    await page.getByRole("button", { name: TAG_A }).filter({ visible: true }).first().click();
    await field(/tag|Stratégie/i).fill(NEW_TAG);
    await field(/tag|Stratégie/i).press("Enter");
    await expect(page.getByText(NEW_TAG, { exact: true }).first()).toBeVisible();
    // Ligue liée : recherche, puis choix dans les résultats
    await field(/ligue/i).fill("Inv Art Lig");
    await page.getByText(`${LIGUE.name} (${LIGUE.acronym})`).first().click();
    // Contenu en BBCode
    await field(/Contenu|Rédigez/).fill("[b]Article écrit par le test[/b]");
    await leaveField(page);
    await page.screenshot({ path: testInfo.outputPath("article-creation.png"), fullPage: true });
    await page.getByRole("button", { name: /Publier/ }).filter({ visible: true }).first().click();
    await page.waitForURL(/\/articles\/(?!create|edit)[^/?]+$/);
    const created = await db((prisma) => prisma.article.findFirst({ where: { title: CREATED_TITLE }, include: { tags: { select: { name: true } } } }));
    expect(created).toMatchObject({ content: "[b]Article écrit par le test[/b]", authorId: READER.id, ligueId: LIGUE.id });
    expect(created?.tags.map((tag) => tag.name).sort()).toEqual([NEW_TAG, TAG_A].sort());
    await expect(page.getByRole("heading", { name: CREATED_TITLE }).first()).toBeVisible();

    // Un visiteur est envoyé vers la connexion
    await logout(page);
    await page.goto("/articles/create", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/auth\/login/);

    // Modification par l'auteur : formulaire prérempli
    await loginAs(page, AUTHOR.id);
    await page.goto(`/articles/edit/${EDITABLE.id}`, { waitUntil: "networkidle" });
    await expect(field(/^Titre/)).toHaveValue(EDITABLE.title);
    await expect(field(/Contenu|Rédigez/)).toHaveValue(EDITABLE.content);
    await expect(field(/ligue/i)).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("article-modification.png"), fullPage: true });
    await field(/^Titre/).fill(`${EDITABLE.title} (modifié)`);
    await field(/tag|Stratégie/i).fill(TAG_B);
    await field(/tag|Stratégie/i).press("Enter");
    await leaveField(page);
    await page.getByRole("button", { name: /Mettre à jour|Enregistrer/ }).filter({ visible: true }).first().click();
    await page.waitForURL(new RegExp(`/articles/${EDITABLE.id}$`));
    const edited = await db((prisma) => prisma.article.findUnique({ where: { id: EDITABLE.id }, include: { tags: { select: { name: true } } } }));
    expect(edited?.title).toBe(`${EDITABLE.title} (modifié)`);
    expect(edited?.tags.map((tag) => tag.name)).toEqual([TAG_B]);

    // Le modérateur ouvre aussi le formulaire ; un autre membre est renvoyé vers l'article ; un visiteur vers la connexion
    await logout(page);
    await loginAs(page, E2E.modoId);
    await page.goto(`/articles/edit/${EDITABLE.id}`, { waitUntil: "networkidle" });
    await expect(field(/^Titre/)).toHaveValue(`${EDITABLE.title} (modifié)`);
    await logout(page);
    await loginAs(page, READER.id);
    await page.goto(`/articles/edit/${EDITABLE.id}`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(new RegExp(`/articles/${EDITABLE.id}$`));
    await logout(page);
    await page.goto(`/articles/edit/${EDITABLE.id}`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
