/**
 * Inventaire de la refonte, section 5 « Accueil et pages fixes » de docs/refonte/inventaire.md (carte 090) :
 * l'accueil (titre sans logo, « Créer » une ligue ou un tournoi, prochains tournois, article ; refait par la carte 155,
 * puis par la carte 210 en deux accueils, visiteur et membre, qui partagent depuis le 17 novembre 2026 les mêmes
 * blocs), le guide
 * `/jouer`, la page `/media`, les statistiques (publiques et réservées à l'administrateur), la page des bannis et la
 * page introuvable (404). Les mentions légales ne sont pas vérifiées ici : leur texte est réécrit par la carte 126.
 * Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet telephone). Les éléments sont
 * cherchés par leur rôle, leur nom accessible ou leur texte, jamais par une classe CSS : le test doit passer sans
 * modification avant et après la refonte de ces écrans.
 *
 * Données préparées par le test (et supprimées ou remises en place à la fin), toutes nommées « Inv Accueil … » :
 * - un forum de tournois et quatre tournois à venir, chacun avec son sujet (seuls les trois plus proches doivent
 *   apparaître sur l'accueil) ;
 * - un article, pour le bloc « Articles » ;
 * - un administrateur, pour les statistiques réservées ;
 * - les réglages du guide `/jouer` (première section vide, sections 2 à 5 remplies, sixième vide) et les chaînes
 *   Twitch et YouTube de `/media`. Les valeurs d'avant le test sont remises à la fin.
 *
 * Le lien Discord de l'accueil vient d'un réglage de l'administration gardé en cache une heure par le site. Depuis la
 * carte 189, ses liens n'apparaissent que si ce réglage est rempli : le test accepte les deux cas (aucun lien, ou le
 * bouton de « Tu joues déjà », qui s'ouvre dans un nouvel onglet), sans changer ce réglage, et vérifie qu'aucun lien ne mène nulle part (« # »).
 *
 * La liste des prochains tournois est gardée en cache 60 secondes par le site (`unstable_cache`, étiquette
 * « home-tournaments »). Ce cache est enregistré sur le disque dans `.next` et survit au redémarrage du serveur de test,
 * alors que la base de test est recréée : avant de préparer ses données, le test efface donc ce cache du disque
 * (`clearHomeTournamentsCache`), puis recharge l'accueil jusqu'à voir ses tournois (carte 148).
 */
import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

/**
 * Efface du disque la liste des prochains tournois gardée en cache par l'accueil (`app/page.tsx`, étiquette
 * « home-tournaments »). Next.js range ce cache dans `.next/dev/cache/fetch-cache` (serveur de développement, celui
 * des tests) ou `.next/cache/fetch-cache` : un fichier JSON par entrée, avec ses étiquettes (`tags`). Les autres
 * entrées ne sont pas touchées. Un fichier illisible ou déjà supprimé est ignoré.
 */
function clearHomeTournamentsCache() {
  // Dossier .next de l'application, à partir de ce fichier (tests/e2e/inventaire/)
  const nextDir = path.join(__dirname, "..", "..", "..", ".next");
  for (const dir of [path.join(nextDir, "dev", "cache", "fetch-cache"), path.join(nextDir, "cache", "fetch-cache")]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      const full = path.join(dir, file);
      try {
        const entry = JSON.parse(fs.readFileSync(full, "utf-8")) as { tags?: string[] };
        if (entry.tags?.includes("home-tournaments")) fs.rmSync(full, { force: true });
      } catch {
        // Fichier qui n'est pas une entrée du cache, ou supprimé entre-temps
      }
    }
  }
}

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

/** Chaîne YouTube fictive (24 caractères, comme un vrai identifiant) : son flux est vide, la carte n'a pas d'image. */
const INV_YOUTUBE_ID = "UCinvaccueil1234567890ab";
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
  youtube_channels: `${INV_YOUTUBE_ID}|Inv Chaîne Accueil`,
};
const previousSettings = new Map<string, string | null>();

test.beforeAll(async () => {
  clearHomeTournamentsCache();
  await db(async (prisma) => {
    const category = await prisma.category.findUniqueOrThrow({ where: { name: E2E.categoryName } });
    await prisma.forum.upsert({
      where: { id: FORUM_ID },
      update: {},
      create: { id: FORUM_ID, name: "Inv Accueil Forum", categoryId: category.id, isTournamentForum: true, order: 95 },
    });
    // Quatre tournois dans les heures qui viennent : ils passent avant tout autre tournoi à venir de la base.
    // Restes d'un lancement interrompu : les messages d'abord, sinon la suppression des sujets échoue sur la
    // contrainte Post_topicId_fkey (un message doit appartenir à un sujet existant).
    await prisma.post.deleteMany({ where: { topicId: { in: TOURNAMENTS.map((t) => t.topicId) } } });
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

/**
 * Bloc « Derniers sujets du forum » du visiteur (depuis le 17 novembre 2026, le même bloc que le membre qui a tout lu) :
 * le sujet public et le sujet du forum réservé à la modération passent en tête, leur dernier message daté d'une heure
 * dans le futur ; leurs dates d'origine sont remises à la fin. Les tailles ordinateur et téléphone tournent en même
 * temps et touchent les mêmes sujets : seule la date d'origine (dans le passé) est gardée pour être remise.
 */
test.describe("accueil, sujets du forum", () => {
  const originals = new Map<string, Date>();

  test.beforeAll(async () => {
    await db(async (prisma) => {
      for (const id of [E2E.topicId, E2E.secretTopicId]) {
        const topic = await prisma.topic.findUniqueOrThrow({ where: { id }, select: { lastPostAt: true } });
        // Une autre taille a déjà avancé la date : on ne garde que la vraie date d'origine
        if (topic.lastPostAt.getTime() < Date.now()) originals.set(id, topic.lastPostAt);
        await prisma.topic.update({ where: { id }, data: { lastPostAt: new Date(Date.now() + 3_600_000) } });
      }
    });
  });

  test.afterAll(async () => {
    await db(async (prisma) => {
      for (const [id, lastPostAt] of originals) await prisma.topic.update({ where: { id }, data: { lastPostAt } });
    });
  });

  test("un visiteur voit les sujets publics, jamais ceux d'un forum réservé", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const block = content(page).getByRole("region", { name: "Derniers sujets du forum" });
    await expect(block.getByRole("link", { name: new RegExp(E2E.topicTitle) })).toHaveAttribute("href", `/forum/topic/${E2E.topicId}`);
    await expect(block.getByText(E2E.secretTopicTitle)).toHaveCount(0);
    // « Aller au forum » (44 pixels de haut), discret, et pas de phrase « Tu as tout lu » pour un visiteur
    expect((await block.getByRole("link", { name: /^Aller au forum/ }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(block.getByText(/Tu as tout lu/)).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("accueil-sujets-visiteur.png"), fullPage: true });
  });

  // Depuis la carte 210, un membre connecté a son propre accueil, sans « Derniers messages » : ce qui lui est réservé
  // y apparaît dans « Non lus au forum ». Un membre ordinaire n'y voit jamais le sujet du forum réservé ; un
  // modérateur, oui (son compte de test n'a jamais ouvert ce sujet).
  test("non-lus du membre : jamais un sujet réservé, sauf pour un modérateur", async ({ page }) => {
    test.setTimeout(120_000);
    // Le sujet réservé devient « non lu » pour tous le temps du test : son dernier message passe dans le futur
    // (date d'origine remise à la fin), plus récent que toute lecture des comptes de test
    const original = await db((prisma) => prisma.topic.findUniqueOrThrow({ where: { id: E2E.secretTopicId }, select: { lastPostAt: true } }));
    await db((prisma) => prisma.topic.update({ where: { id: E2E.secretTopicId }, data: { lastPostAt: new Date(Date.now() + 3_600_000) } }));
    try {
      await loginAs(page, E2E.coachId);
      await page.goto("/", { waitUntil: "networkidle" });
      // Sans non-lu, le bloc montre les sujets récents (titre « Derniers sujets du forum ») : le sujet réservé non plus
      const coachBlock = content(page).getByRole("region", { name: /Non lus au forum|Derniers sujets du forum/ });
      await expect(coachBlock).toBeVisible();
      await expect(coachBlock.getByText(E2E.secretTopicTitle)).toHaveCount(0);

      await loginAs(page, E2E.modoId);
      await page.goto("/", { waitUntil: "networkidle" });
      const modoBlock = content(page).getByRole("region", { name: "Non lus au forum" });
      await expect(modoBlock.getByRole("link", { name: new RegExp(E2E.secretTopicTitle) })).toHaveAttribute("href", `/forum/topic/${E2E.secretTopicId}`);
    } finally {
      await db((prisma) => prisma.topic.update({ where: { id: E2E.secretTopicId }, data: { lastPostAt: original.lastPostAt } }));
    }
  });
});

test.describe("accueil", () => {
  test("accueil du visiteur : la bande du haut, puis le tableau de bord", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const main = content(page);
    // Le titre est un texte (aucun logo ni écusson, DESIGN.md)
    await expect(main.getByRole("heading", { level: 1, name: /Blood Bowl en France/i })).toBeVisible();

    // La bande du haut : l'action principale (seul bouton rouge), puis « Découvrir le jeu »
    const intro = main.getByRole("region", { name: /Blood Bowl en France/i });
    await expect(intro.getByRole("link", { name: "Créer mon compte" })).toHaveAttribute("href", "/auth/login");
    await expect(intro.getByRole("link", { name: "Découvrir le jeu" })).toHaveAttribute("href", "/jouer");
    // Plus de camps « Nouveau coach ? » / « Tu joues déjà » ni de repères de défilement
    await expect(main.getByRole("region", { name: "Nouveau coach ?" })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Sections de l'accueil" })).toHaveCount(0);

    // Flux principal (forum, tournois, articles) puis contexte (classement, ligues, ressources, médias) : à droite sur
    // ordinateur, dessous sur téléphone
    const flow = ["Derniers sujets du forum", "Prochains tournois", "Articles"];
    const context = [/^Classement \d{4}$/, "Dernières ligues", "Ressources", "Médias"];
    let previousTop = -Infinity;
    for (const name of flow) {
      const box = (await main.getByRole("region", { name }).boundingBox())!;
      expect(box.y).toBeGreaterThan(previousTop);
      previousTop = box.y;
    }
    const forumBox = (await main.getByRole("region", { name: "Derniers sujets du forum" }).boundingBox())!;
    const rankingBox = (await main.getByRole("region", { name: context[0] }).boundingBox())!;
    if (testInfo.project.name === "telephone") expect(rankingBox.y).toBeGreaterThan(previousTop);
    else expect(rankingBox.x).toBeGreaterThan(forumBox.x + forumBox.width - 1);
    previousTop = -Infinity;
    for (const name of context) {
      const box = (await main.getByRole("region", { name }).boundingBox())!;
      expect(box.y).toBeGreaterThan(previousTop);
      previousTop = box.y;
    }

    // Discord : au plus un lien, dans un nouvel onglet ; aucun lien ne mène nulle part
    const discord = main.getByRole("link", { name: /^Discord/ });
    expect([0, 1]).toContain(await discord.count());
    for (const link of await discord.all()) await expect(link).toHaveAttribute("target", "_blank");
    await expect(main.locator('a[href="#"]')).toHaveCount(0);

    // Pas de « Créer » vers la connexion dans les en-têtes de bloc pour un visiteur
    for (const name of ["Écrire un article", "Proposer une ressource", "Créer une ligue"]) {
      await expect(main.getByRole("link", { name })).toHaveCount(0);
    }
    await page.screenshot({ path: testInfo.outputPath("accueil-visiteur.png"), fullPage: true });
  });

  test("« Créer » mène directement au formulaire pour un membre", async ({ page }) => {
    await loginAs(page, E2E.coachId);
    await page.goto("/", { waitUntil: "networkidle" });
    const hrefs = await content(page).getByRole("link", { name: /Créer/ })
      .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
    expect(hrefs).toContain("/ligues/create");
    expect(hrefs).toContainEqual(expect.stringMatching(/^\/forum\/new-tournament\?forumId=/));
  });

  // Accueil du membre (carte 210, revu le 16 novembre 2026) : une seule colonne, dans l'ordre fixé par le responsable
  // du projet, sans bandeau d'accueil ni pastilles de rubriques ; des repères de défilement sur ordinateur seulement
  test("accueil du membre : le flux puis le contexte", async ({ page }, testInfo) => {
    await loginAs(page, E2E.coachId);
    await page.goto("/", { waitUntil: "networkidle" });
    const main = content(page);
    await expect(main.getByRole("heading", { level: 1, name: /^Salut / })).toHaveCount(0);
    await expect(main.getByRole("link", { name: /^Aller au forum/ })).toHaveAttribute("href", "/forum");
    // Flux principal puis contexte, chacun dans son ordre (deux colonnes sur ordinateur, une sur téléphone)
    for (const order of [[/Non lus au forum|Derniers sujets du forum/, "Prochains tournois", "Articles"], [/^Classement \d{4}$/, /Ligues de ta région|Dernières ligues/, "Ressources", "Médias"]]) {
      let previousTop = -Infinity;
      for (const name of order) {
        const box = (await main.getByRole("region", { name }).boundingBox())!;
        expect(box.y).toBeGreaterThan(previousTop);
        previousTop = box.y;
      }
    }
    await expect(main.getByRole("link", { name: "Écrire un article" })).toHaveAttribute("href", "/articles/create");
    await expect(main.getByRole("link", { name: "Proposer une ressource" })).toHaveAttribute("href", "/ressources/submit");
    await expect(main.getByRole("link", { name: "Voir les ligues sur la carte" })).toHaveAttribute("href", "/carte?vue=ligues");
    // Un seul « Créer un tournoi », celui de l'en-tête du bloc, même quand la liste est vide
    await expect(main.getByRole("region", { name: "Prochains tournois" }).getByRole("link", { name: /Créer un tournoi/ })).toHaveCount(1);
    // Statistiques (pied de page), Membres et Jouer (panneau « Plus ») ne sont plus sur l'accueil
    for (const href of ["/statistiques", "/membres", "/jouer"]) {
      await expect(main.locator(`a[href="${href}"]`)).toHaveCount(0);
    }
    await expect(page.getByRole("navigation", { name: "Sections de l'accueil" })).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("accueil-membre.png"), fullPage: true });
  });

  test("prochains tournois et article", async ({ page }, testInfo) => {
    test.setTimeout(150_000);
    // La liste des prochains tournois est gardée en cache 60 secondes par le site : on recharge jusqu'à la voir
    await expect(async () => {
      await page.goto("/", { waitUntil: "networkidle" });
      const main = content(page);
      await expect(main.getByRole("heading", { name: /prochains tournois/i })).toBeVisible({ timeout: 2_000 });
      // Cherchés dans leur bloc : leurs sujets peuvent aussi figurer dans « Derniers sujets du forum »
      const tournaments = main.getByRole("region", { name: /prochains tournois/i });
      for (const t of TOURNAMENTS.slice(0, 3)) {
        await expect(tournaments.getByRole("link", { name: new RegExp(t.name) })).toHaveAttribute("href", `/forum/topic/${t.topicId}`, { timeout: 2_000 });
      }
      await expect(tournaments.getByRole("link", { name: new RegExp(TOURNAMENTS[3].name) })).toHaveCount(0);
    }).toPass({ timeout: 120_000, intervals: [5_000] });

    const main = content(page);
    // L'article du bloc « Articles » est tiré au hasard parmi ceux de la base : n'importe lequel convient
    const titles = await db((prisma) => prisma.article.findMany({ select: { id: true, title: true } }));
    const pattern = new RegExp(titles.map((a) => a.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"));
    const article = main.getByRole("region", { name: "Articles" }).getByRole("link", { name: pattern });
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
      ["Communauté et ligues", "Texte Inv de la section 3"],
      ["Rejoindre un tournoi", "Texte Inv de la section 4"],
      ["NAF, CdF & RTC", "Texte Inv de la section 5"],
    ]) {
      await expect(main.getByRole("heading", { name: title })).toBeVisible();
      await expect(main.getByText(text)).toBeVisible();
    }
    // Sixième section vide : masquée
    await expect(main.getByRole("heading", { name: "Challenges régionaux" })).toHaveCount(0);
    // Plus d'illustrations générées (DESIGN.md)
    await expect(main.locator("img")).toHaveCount(0);

    const next = main.getByRole("link", { name: /^Étape suivante/ });
    expect(await next.count()).toBeGreaterThanOrEqual(4);
    await expect(next.first()).toHaveAttribute("href", "#how_to_play_platforms");
    await next.first().click();
    await expect(page).toHaveURL(/#how_to_play_platforms$/);

    await expect(main.getByRole("link", { name: "Créer mon compte" })).toHaveAttribute("href", "/auth/login");
    await expect(main.getByRole("link", { name: "Parcourir le forum" })).toHaveAttribute("href", "/forum");
    await page.screenshot({ path: testInfo.outputPath("jouer.png"), fullPage: true });
  });

  test("/media : directs Twitch après accord, chaînes YouTube avec lecture au clic", async ({ page }, testInfo) => {
    // Les lecteurs chargent des pages extérieures : on n'attend pas la fin de toutes les requêtes
    await page.goto("/media", { waitUntil: "domcontentloaded" });
    const main = content(page);
    // Twitch : aucun lecteur avant l'accord (cookies de Twitch), un lien vers chaque chaîne
    await expect(main.locator("iframe[src*='twitch.tv']")).toHaveCount(0);
    await expect(main.getByRole("button", { name: "Afficher le contenu Twitch" })).toHaveCount(2);
    const twitchLinks = main.getByRole("link", { name: /Voir sur Twitch/ });
    const hrefs = await twitchLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(hrefs).toEqual(expect.arrayContaining(["https://twitch.tv/inv_twitch_a", "https://twitch.tv/inv_twitch_b"]));
    await expect(twitchLinks.first()).toHaveAttribute("target", "_blank");
    // Après l'accord, le lecteur de cette chaîne se charge, et seulement lui
    await main.getByRole("button", { name: "Afficher le contenu Twitch" }).first().click();
    await expect(main.getByTitle(/Direct de inv_twitch_a/)).toHaveAttribute("src", /player\.twitch\.tv\/\?channel=inv_twitch_a/);
    await expect(main.locator("iframe[src*='twitch.tv']")).toHaveCount(1);

    // YouTube : le nom de la chaîne et son lien ; le lecteur (youtube-nocookie) ne se charge qu'au clic
    await expect(main.getByText("Inv Chaîne Accueil", { exact: true })).toBeVisible();
    await expect(main.getByRole("link", { name: /Voir sur YouTube/ })).toHaveAttribute("href", `https://www.youtube.com/channel/${INV_YOUTUBE_ID}`);
    await expect(main.locator("iframe[src*='youtube']")).toHaveCount(0);
    await main.getByRole("button", { name: "Lire les vidéos de Inv Chaîne Accueil" }).click();
    await expect(main.getByTitle("Vidéos de Inv Chaîne Accueil")).toHaveAttribute("src", new RegExp(String.raw`youtube-nocookie\.com/embed/videoseries\?list=` + INV_YOUTUBE_ID.replace(/^UC/, "UU")));
    await page.screenshot({ path: testInfo.outputPath("media.png"), fullPage: true });
  });

  const PUBLIC_STATS = [/utilisateurs/i, /^ligues$/i, /^articles$/i, /sujets/i, /vues/i, /en ligne/i];
  // Carte 175 : plus de « Quota restant » (quota d'un ancien service d'e-mail, qui n'est plus utilisé)
  const ADMIN_STATS = [/(e-?mails|courriels) du mois/i, /quota (de )?stockage/i, /taille (bdd|de la base)/i, /rapports|signalements/i, /^ressources$/i];

  test("/statistiques : chiffres publics, sans la partie réservée", async ({ page }) => {
    await page.goto("/statistiques", { waitUntil: "networkidle" });
    const main = content(page);
    for (const label of PUBLIC_STATS) await expect(main.getByText(label).first()).toBeVisible();
    for (const label of ADMIN_STATS.slice(0, 4)) await expect(main.getByText(label)).toHaveCount(0);

    // Un modérateur n'est pas administrateur : il ne voit pas non plus la partie réservée
    await loginAs(page, E2E.modoId);
    await page.goto("/statistiques", { waitUntil: "networkidle" });
    await expect(content(page).getByText(/quota (de )?stockage/i)).toHaveCount(0);
  });

  test("/statistiques : partie réservée à l'administrateur", async ({ page }, testInfo) => {
    await loginAs(page, ADMIN_ID);
    await page.goto("/statistiques", { waitUntil: "networkidle" });
    const main = content(page);
    for (const label of [...PUBLIC_STATS, ...ADMIN_STATS]) await expect(main.getByText(label).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("statistiques-admin.png"), fullPage: true });
  });

  test("/banned : raison du bannissement et déconnexion", async ({ page }, testInfo) => {
    await loginAs(page, E2E.bannedId);
    await page.goto("/banned", { waitUntil: "networkidle" });
    const main = content(page);
    await expect(main.getByRole("heading", { name: /compte banni/i })).toBeVisible();
    await expect(main.getByText("Test e2e")).toBeVisible();
    // Carte 221 : « Retour à l'accueil » renvoyait ici ; la seule sortie est la déconnexion, sans navigation autour
    await expect(main.getByRole("button", { name: "Me déconnecter" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navigation principale" })).toHaveCount(0);
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
