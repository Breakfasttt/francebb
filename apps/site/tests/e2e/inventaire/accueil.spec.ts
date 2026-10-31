/**
 * Inventaire de la refonte, section 5 « Accueil et pages fixes » de docs/refonte/inventaire.md (carte 090) :
 * l'accueil (logo, tuiles, « Créer » une ligue ou un tournoi, prochains tournois, article aléatoire), le guide
 * `/jouer`, la page `/media`, les statistiques (publiques et réservées à l'administrateur), la page des bannis et la
 * page introuvable (404). Les mentions légales ne sont pas vérifiées ici : leur texte est réécrit par la carte 126.
 * Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet telephone). Les éléments sont
 * cherchés par leur rôle, leur nom accessible ou leur texte, jamais par une classe CSS : le test doit passer sans
 * modification avant et après la refonte de ces écrans.
 *
 * Données préparées par le test (et supprimées ou remises en place à la fin), toutes nommées « Inv Accueil … » :
 * - un forum de tournois et quatre tournois à venir, chacun avec son sujet (seuls les trois plus proches doivent
 *   apparaître sur l'accueil) ;
 * - un article, pour le bloc « Article aléatoire » ;
 * - un administrateur, pour les statistiques réservées ;
 * - les réglages du guide `/jouer` (première section vide, sections 2 à 5 remplies, sixième vide) et les chaînes
 *   Twitch et YouTube de `/media`. Les valeurs d'avant le test sont remises à la fin.
 *
 * Le lien Discord de l'accueil vient d'un réglage de l'administration gardé en cache une heure par le site : le test
 * vérifie seulement que la tuile existe et s'ouvre dans un nouvel onglet, sans changer ce réglage.
 */
import { test, expect, type Page } from "@playwright/test";
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

const FORUM_ID = "e2e_acc_forum";
const ADMIN_ID = "e2e_acc_admin";
const ARTICLE_ID = "e2e_acc_article";
const TOURNAMENTS = [1, 2, 3, 4].map((n) => ({ id: `e2e_acc_trn_${n}`, topicId: `e2e_acc_topic_${n}`, name: `Inv Accueil Tournoi ${n}` }));

/** Réglages du site modifiés par le test, remis à leur valeur d'avant à la fin. */
const SETTINGS: Record<string, string | null> = {
  how_to_play_what_is_bb: null,
  how_to_play_platforms: "Texte Inv de la section 2",
  how_to_play_community: "Texte Inv de la section 3",
  how_to_play_tournaments: "Texte Inv de la section 4",
  how_to_play_naf_cdf_rtc: "Texte Inv de la section 5",
  how_to_play_challenges: null,
  twitch_channels: "inv_twitch_a, inv_twitch_b",
  youtube_channels: "UCinvaccueil123",
};
const previousSettings = new Map<string, string | null>();

test.beforeAll(async () => {
  await db(async (prisma) => {
    const category = await prisma.category.findUniqueOrThrow({ where: { name: E2E.categoryName } });
    await prisma.forum.upsert({
      where: { id: FORUM_ID },
      update: {},
      create: { id: FORUM_ID, name: "Inv Accueil Forum", categoryId: category.id, isTournamentForum: true, order: 95 },
    });
    // Quatre tournois dans les heures qui viennent : ils passent avant tout autre tournoi à venir de la base
    await prisma.topic.deleteMany({ where: { id: { in: TOURNAMENTS.map((t) => t.topicId) } } });
    await prisma.tournament.deleteMany({ where: { id: { in: TOURNAMENTS.map((t) => t.id) } } });
    for (const [index, t] of TOURNAMENTS.entries()) {
      await prisma.tournament.create({
        data: {
          id: t.id, name: t.name, date: new Date(Date.now() + (index + 2) * 60 * 60_000), location: "Salle Inv",
          organizerId: E2E.coachId,
        },
      });
      await prisma.topic.create({
        data: {
          id: t.topicId, title: t.name, forumId: FORUM_ID, authorId: E2E.coachId, tournamentId: t.id,
          posts: { create: { content: "Présentation du tournoi Inv.", authorId: E2E.coachId } },
        },
      });
    }
    await prisma.article.upsert({
      where: { id: ARTICLE_ID },
      update: {},
      create: { id: ARTICLE_ID, title: "Inv Accueil Article", content: "Contenu de l'article Inv.", authorId: E2E.coachId },
    });
    await prisma.roleConfig.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", label: "Administrateur", power: 90, isBaseRole: true },
    });
    await prisma.user.upsert({
      where: { id: ADMIN_ID },
      update: { role: "ADMIN" },
      create: { id: ADMIN_ID, name: "Admin Accueil Inv", email: "admin-accueil@e2e.test", role: "ADMIN", hasFinishedOnboarding: true },
    });
    for (const [key, value] of Object.entries(SETTINGS)) {
      if (!previousSettings.has(key)) {
        const existing = await prisma.siteSetting.findUnique({ where: { key } });
        previousSettings.set(key, existing?.value ?? null);
      }
      if (value === null) await prisma.siteSetting.deleteMany({ where: { key } });
      else await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
  });
});

test.afterAll(async () => {
  await db(async (prisma) => {
    await prisma.post.deleteMany({ where: { topicId: { in: TOURNAMENTS.map((t) => t.topicId) } } });
    await prisma.topic.deleteMany({ where: { id: { in: TOURNAMENTS.map((t) => t.topicId) } } });
    await prisma.tournament.deleteMany({ where: { id: { in: TOURNAMENTS.map((t) => t.id) } } });
    await prisma.forum.deleteMany({ where: { id: FORUM_ID } });
    await prisma.article.deleteMany({ where: { id: ARTICLE_ID } });
    await prisma.user.deleteMany({ where: { id: ADMIN_ID } });
    for (const [key, value] of previousSettings) {
      if (value === null) await prisma.siteSetting.deleteMany({ where: { key } });
      else await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
  });
});

/** Contenu propre à la page (la coquille, avec sa navigation et son pied de page, est en dehors). */
const content = (page: Page) => page.getByRole("main").first();

/** Les tuiles de l'accueil : début du nom accessible et adresse visée. */
const TILES: [RegExp, string][] = [
  [/^Jouer/, "/jouer"],
  [/^Forum/, "/forum"],
  [/^Ligues/, "/ligues"],
  [/^Tournois/, "/tournois"],
  [/^La Carte/, "/carte"],
  [/^Championnat de France/, "/classement"],
  [/^Articles/, "/articles"],
  [/^Ressources/, "/ressources"],
  [/^BBScheme/, "/bbscheme"],
  [/^Quizz/, "/bbquizz"],
];

test.describe("accueil", () => {
  test("logo, tuiles et liens « Créer » pour un visiteur", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const main = content(page);
    // Avant la refonte, le grand logo n'existait que sur ordinateur (sur téléphone, l'accueil n'avait aucun logo)
    if ((page.viewportSize()?.width ?? 1280) > 1024) {
      await expect(main.getByRole("img", { name: "Blood Bowl France" })).toBeVisible();
    }
    for (const [name, href] of TILES) {
      await expect(main.getByRole("link", { name }).first()).toHaveAttribute("href", href);
    }
    const discord = main.getByRole("link", { name: /Discord/ });
    await expect(discord).toBeVisible();
    await expect(discord).toHaveAttribute("target", "_blank");

    // « Créer » une ligue ou un tournoi envoie un visiteur vers la connexion, en gardant la page visée
    const create = main.getByRole("link", { name: /Créer/ });
    await expect(create).toHaveCount(2);
    const hrefs = await create.evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
    expect(hrefs).toContainEqual(expect.stringMatching(/^\/auth\/login\?callbackUrl=.*new-tournament.*forumId/));
    const ligueIndex = hrefs.findIndex((href) => /^\/auth\/login\?callbackUrl=(\/|%2F)ligues(\/|%2F)create$/.test(href));
    expect(ligueIndex).toBeGreaterThanOrEqual(0);
    const ligueCreate = create.nth(ligueIndex);
    await page.screenshot({ path: testInfo.outputPath("accueil-visiteur.png"), fullPage: true });
    await ligueCreate.click();
    await expect(page).toHaveURL(/\/auth\/login\?callbackUrl=(\/|%2F)ligues(\/|%2F)create/);
  });

  test("« Créer » mène directement au formulaire pour un membre", async ({ page }) => {
    await loginAs(page, E2E.coachId);
    await page.goto("/", { waitUntil: "networkidle" });
    const hrefs = await content(page).getByRole("link", { name: /Créer/ })
      .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
    expect(hrefs).toContain("/ligues/create");
    expect(hrefs).toContainEqual(expect.stringMatching(/^\/forum\/new-tournament\?forumId=/));
  });

  test("prochains tournois et article aléatoire", async ({ page }, testInfo) => {
    test.setTimeout(150_000);
    // La liste des prochains tournois est gardée en cache 60 secondes par le site : on recharge jusqu'à la voir
    await expect(async () => {
      await page.goto("/", { waitUntil: "networkidle" });
      const main = content(page);
      await expect(main.getByRole("heading", { name: /prochains tournois/i })).toBeVisible({ timeout: 2_000 });
      for (const t of TOURNAMENTS.slice(0, 3)) {
        await expect(main.getByRole("link", { name: new RegExp(t.name) })).toHaveAttribute("href", `/forum/topic/${t.topicId}`, { timeout: 2_000 });
      }
      await expect(main.getByRole("link", { name: new RegExp(TOURNAMENTS[3].name) })).toHaveCount(0);
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    const main = content(page);
    await expect(main.getByRole("heading", { name: /article aléatoire/i })).toBeVisible();
    // L'article est tiré au hasard parmi ceux de la base : n'importe lequel convient
    const titles = await db((prisma) => prisma.article.findMany({ select: { id: true, title: true } }));
    const pattern = new RegExp(titles.map((a) => a.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"));
    const article = main.getByRole("link", { name: pattern });
    await expect(article).toBeVisible();
    expect(titles.map((a) => `/articles/${a.id}`)).toContain(await article.getAttribute("href"));
    await page.screenshot({ path: testInfo.outputPath("accueil-blocs.png"), fullPage: true });
  });
});

test.describe("pages fixes", () => {
  test("/jouer : guide, sections vides masquées sauf la première, liens et boutons", async ({ page }, testInfo) => {
    await page.goto("/jouer", { waitUntil: "networkidle" });
    const main = content(page);
    // Première section affichée même vide, avec un texte d'attente
    await expect(main.getByRole("heading", { name: "C'est quoi Blood Bowl ?" })).toBeVisible();
    await expect(main.getByText("Contenu en cours de rédaction")).toBeVisible();
    for (const [title, text] of [
      ["Comment y jouer ?", "Texte Inv de la section 2"],
      ["Communauté & Ligues", "Texte Inv de la section 3"],
      ["Rejoindre un Tournoi", "Texte Inv de la section 4"],
      ["NAF, CdF & RTC", "Texte Inv de la section 5"],
    ]) {
      await expect(main.getByRole("heading", { name: title })).toBeVisible();
      await expect(main.getByText(text)).toBeVisible();
      await expect(main.getByRole("img", { name: title })).toBeVisible();
    }
    // Sixième section vide : masquée
    await expect(main.getByRole("heading", { name: "Challenges Régionaux" })).toHaveCount(0);

    const next = main.getByRole("link", { name: /Prochaine étape/ });
    expect(await next.count()).toBeGreaterThanOrEqual(4);
    await expect(next.first()).toHaveAttribute("href", "#how_to_play_platforms");
    await next.first().click();
    await expect(page).toHaveURL(/#how_to_play_platforms$/);

    await expect(main.getByRole("link", { name: "Créer mon compte" })).toHaveAttribute("href", "/auth/login");
    await expect(main.getByRole("link", { name: "Parcourir le forum" })).toHaveAttribute("href", "/forum");
    await page.screenshot({ path: testInfo.outputPath("jouer.png"), fullPage: true });
  });

  test("/media : lecteurs Twitch avec leur lien, listes de lecture YouTube", async ({ page }, testInfo) => {
    // Les lecteurs chargent des pages extérieures : on n'attend pas la fin de toutes les requêtes
    await page.goto("/media", { waitUntil: "domcontentloaded" });
    const main = content(page);
    for (const channel of ["inv_twitch_a", "inv_twitch_b"]) {
      await expect(main.getByTitle(new RegExp(channel))).toHaveAttribute("src", new RegExp(`player\\.twitch\\.tv/\\?channel=${channel}`));
    }
    const twitchLinks = main.getByRole("link", { name: /Twitch/ });
    const hrefs = await twitchLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs).toEqual(expect.arrayContaining(["https://twitch.tv/inv_twitch_a", "https://twitch.tv/inv_twitch_b"]));
    await expect(twitchLinks.first()).toHaveAttribute("target", "_blank");
    await expect(main.getByTitle(/YouTube/)).toHaveAttribute("src", /youtube\.com\/embed\/videoseries\?list=UUinvaccueil123/);
    await page.screenshot({ path: testInfo.outputPath("media.png"), fullPage: true });
  });

  const PUBLIC_STATS = [/utilisateurs/i, /^ligues$/i, /^articles$/i, /sujets/i, /vues/i, /en ligne/i];
  const ADMIN_STATS = [/(e-?mails|courriels) du mois/i, /quota restant/i, /quota (de )?stockage/i, /taille (bdd|de la base)/i, /rapports|signalements/i, /^ressources$/i];

  test("/statistiques : chiffres publics, sans la partie réservée", async ({ page }) => {
    await page.goto("/statistiques", { waitUntil: "networkidle" });
    const main = content(page);
    for (const label of PUBLIC_STATS) await expect(main.getByText(label).first()).toBeVisible();
    for (const label of ADMIN_STATS.slice(0, 4)) await expect(main.getByText(label)).toHaveCount(0);

    // Un modérateur n'est pas administrateur : il ne voit pas non plus la partie réservée
    await loginAs(page, E2E.modoId);
    await page.goto("/statistiques", { waitUntil: "networkidle" });
    await expect(content(page).getByText(/quota restant/i)).toHaveCount(0);
  });

  test("/statistiques : partie réservée à l'administrateur", async ({ page }, testInfo) => {
    await loginAs(page, ADMIN_ID);
    await page.goto("/statistiques", { waitUntil: "networkidle" });
    const main = content(page);
    for (const label of [...PUBLIC_STATS, ...ADMIN_STATS]) await expect(main.getByText(label).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("statistiques-admin.png"), fullPage: true });
  });

  test("/banned : raison du bannissement et retour", async ({ page }, testInfo) => {
    await loginAs(page, E2E.bannedId);
    await page.goto("/banned", { waitUntil: "networkidle" });
    const main = content(page);
    await expect(main.getByRole("heading", { name: /compte banni/i })).toBeVisible();
    await expect(main.getByText("Test e2e")).toBeVisible();
    await expect(main.getByRole("link", { name: /retour à l.accueil/i })).toHaveAttribute("href", "/");
    await page.screenshot({ path: testInfo.outputPath("banni.png"), fullPage: true });
  });

  test("page introuvable « Terrain impraticable ! »", async ({ page }, testInfo) => {
    const response = await page.goto("/inv-page-qui-n-existe-pas", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(404);
    const main = content(page);
    await expect(main.getByRole("heading", { name: /terrain impraticable/i })).toBeVisible();
    await expect(main.getByRole("link", { name: /accueil/i })).toHaveAttribute("href", "/");
    await page.screenshot({ path: testInfo.outputPath("404.png"), fullPage: true });
  });
});
