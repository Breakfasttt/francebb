/**
 * Inventaire de la refonte, section 4 (tournois) de docs/refonte/inventaire.md (carte 089) : la liste `/tournois`
 * (grille, liste, pagination, recherche, filtres, pastilles des filtres actifs, tri, badges de statut), la création
 * et la modification d'un tournoi, le module d'inscription du sujet d'un tournoi, la saisie des résultats et le
 * classement final. Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet telephone). Les
 * éléments sont cherchés par leur rôle, leur nom accessible ou leur texte, jamais par une classe CSS : le test doit
 * passer sans modification avant et après la refonte de ces écrans.
 *
 * Sur téléphone, les filtres, le tri et le choix grille ou liste peuvent être rangés dans un panneau ouvert par un
 * bouton (« Ouvrir les filtres » ou « Filtres ») : la petite fonction `control` ci-dessous cherche chaque réglage
 * dans la page, puis dans ce panneau. C'est une adaptation de la façon de trouver le réglage, pas un changement de
 * ce qui est attendu.
 *
 * Données préparées par le test (et supprimées à la fin), toutes nommées « Inv Trn … » :
 * - un forum de tournois « Inv Trn Forum » dans la catégorie « E2E Catégorie », et une ligue « Inv Trn Ligue » ;
 * - un organisateur « Orga Tournoi Inv » et un second membre « Coéquipier Inv » ;
 * - deux tournois à venir aux caractéristiques opposées : « Inv Trn Alpha » (individuel, Bretagne, plateau, BB20,
 *   résurrection, NAF et CDF, logement, repas, vendredi, 10 €, 40 places, rattaché à la ligue) et « Inv Trn Beta »
 *   (par équipes de 3, Occitanie, Fumbbl, BB25, évolutif, CGO, TGE et TSC, 25 €, 16 places) ;
 * - un tournoi passé (« Inv Trn Ancien »), un tournoi terminé avec trois résultats (« Inv Trn Clos ») et un tournoi
 *   annulé (« Inv Trn Abandonné ») ;
 * - 22 tournois de remplissage à venir, pour la pagination (10 par page en grille, 20 en liste) ;
 * - quelques données de référence (région, département, plateforme…) pour les listes du formulaire de tournoi.
 *
 * Des captures sont enregistrées dans test-results/ pour la relecture humaine (pas de comparaison au pixel).
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

/**
 * Accès à la base de test. La petite base locale coupe parfois une connexion pendant que le site garde la sienne
 * (« Connection terminated unexpectedly ») : on réessaie alors, 10 fois au plus (withTestDb ne réessaie que
 * l'erreur « Server has closed the connection »).
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

const ORGA = { id: "e2e_trn_orga", name: "Orga Tournoi Inv" };
const MATE = { id: "e2e_trn_mate", name: "Coéquipier Inv" };
const FORUM = { id: "e2e_trn_forum", name: "Inv Trn Forum" };
const LIGUE = { id: "e2e_trn_ligue", name: "Inv Trn Ligue" };

const DAY = 24 * 60 * 60_000;
/** Date à midi, `days` jours après aujourd'hui (midi : pas de surprise de fuseau horaire). */
const inDays = (days: number) => {
  const date = new Date(Date.now() + days * DAY);
  date.setUTCHours(12, 0, 0, 0);
  return date;
};

const ALPHA = { id: "e2e_trn_alpha", topic: "e2e_trn_topic_alpha", name: "Inv Trn Alpha" };
const BETA = { id: "e2e_trn_beta", topic: "e2e_trn_topic_beta", name: "Inv Trn Beta" };
const OLD = { id: "e2e_trn_ancien", topic: "e2e_trn_topic_ancien", name: "Inv Trn Ancien" };
const DONE = { id: "e2e_trn_clos", topic: "e2e_trn_topic_clos", name: "Inv Trn Clos" };
const CANCELLED = { id: "e2e_trn_abandon", topic: "e2e_trn_topic_abandon", name: "Inv Trn Abandonné" };
const FILLERS = 22;
const fillerName = (n: number) => `Inv Trn Remplissage ${String(n).padStart(2, "0")}`;
const CREATED_NAME = "Inv Trn Créé par le membre";

/** Résultats déjà publiés du tournoi terminé (le premier coach est un membre du site). */
const DONE_RESULTS = [
  { coachName: ORGA.name, userId: ORGA.id, roster: "Orc", wins: 3, draws: 1, losses: 1, casualties: 7, points: 10, rank: 1 },
  { coachName: "Coach Externe Un", roster: "Skaven", wins: 2, draws: 1, losses: 2, casualties: 4, points: 7, rank: 2 },
  { coachName: "Coach Externe Deux", roster: "Halfling", wins: 0, draws: 0, losses: 5, casualties: 1, points: 0, rank: 3 },
];

/** Petit rapport NAF au format lu par `parseNafReport` : deux coachs, un match. */
const NAF_REPORT = `<?xml version="1.0"?>
<nafReport>
  <coaches>
    <coach><name>Importé Premier</name><number>11111</number><team>Dwarf</team></coach>
    <coach><name>Importé Second</name><number>22222</number><team>Wood Elf</team></coach>
  </coaches>
  <game>
    <timeStamp>2026-05-01 10:00</timeStamp>
    <playerRecord><name>Importé Premier</name><touchDowns>2</touchDowns><badlyHurt>1</badlyHurt></playerRecord>
    <playerRecord><name>Importé Second</name><touchDowns>1</touchDowns><badlyHurt>0</badlyHurt></playerRecord>
  </game>
</nafReport>`;

const REFERENCE_DATA = [
  { group: "REGION_FRANCE", key: "Bretagne", label: "Bretagne" },
  { group: "DEPARTEMENT_FRANCE", key: "35", label: "35 - Ille-et-Vilaine" },
  { group: "COACH_REGION", key: "R2-NO", label: "R2 - Nord-Ouest" },
  { group: "PLATFORM", key: "Tabletop", label: "Tabletop (Plateau)" },
  { group: "GAME_EDITION", key: "BB20", label: "Blood Bowl 2020" },
  { group: "TOURNAMENT_FORMAT", key: "Resurrection", label: "Résurrection" },
  { group: "TOURNAMENT_TYPE", key: "SWISS", label: "Tournoi - ronde suisse" },
];

/** Supprime tout ce que ce test a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await db(async (prisma) => {
    const tournaments = await prisma.tournament.findMany({
      where: { OR: [{ id: { startsWith: "e2e_trn_" } }, { name: { startsWith: "Inv Trn" } }] },
      select: { id: true },
    });
    const tournamentIds = tournaments.map((tournament) => tournament.id);
    const topicWhere = { OR: [{ id: { startsWith: "e2e_trn_" } }, { forumId: FORUM.id }, { tournamentId: { in: tournamentIds } }] };
    await prisma.topicView.deleteMany({ where: { topic: topicWhere } });
    await prisma.topicFollow.deleteMany({ where: { topic: topicWhere } });
    await prisma.post.deleteMany({ where: { topic: topicWhere } });
    await prisma.topic.deleteMany({ where: topicWhere });
    await prisma.tournamentMercenary.deleteMany({ where: { tournamentId: { in: tournamentIds } } });
    await prisma.tournamentTeamMember.deleteMany({ where: { team: { tournamentId: { in: tournamentIds } } } });
    await prisma.tournamentTeam.deleteMany({ where: { tournamentId: { in: tournamentIds } } });
    await prisma.tournamentRegistration.deleteMany({ where: { tournamentId: { in: tournamentIds } } });
    await prisma.tournamentMatch.deleteMany({ where: { round: { tournamentId: { in: tournamentIds } } } });
    await prisma.tournamentRound.deleteMany({ where: { tournamentId: { in: tournamentIds } } });
    await prisma.tournamentResult.deleteMany({ where: { tournamentId: { in: tournamentIds } } });
    await prisma.tournament.deleteMany({ where: { id: { in: tournamentIds } } });
    await prisma.ligue.deleteMany({ where: { id: LIGUE.id } });
    await prisma.forum.deleteMany({ where: { id: FORUM.id } });
    await prisma.referenceData.deleteMany({ where: { id: { startsWith: "e2e_trn_" } } });
    await prisma.user.deleteMany({ where: { id: { in: [ORGA.id, MATE.id] } } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await db(async (prisma) => {
    const category = await prisma.category.findUniqueOrThrow({ where: { name: E2E.categoryName } });
    await prisma.user.create({ data: { id: ORGA.id, name: ORGA.name, email: "orga-tournoi@e2e.test", hasFinishedOnboarding: true } });
    await prisma.user.create({ data: { id: MATE.id, name: MATE.name, email: "coequipier-tournoi@e2e.test", hasFinishedOnboarding: true } });
    await prisma.forum.create({ data: { ...FORUM, categoryId: category.id, order: 60, isTournamentForum: true } });
    await prisma.ligue.create({ data: { id: LIGUE.id, name: LIGUE.name, acronym: "ITL", creatorId: ORGA.id } });
    for (const [index, item] of REFERENCE_DATA.entries()) {
      // Une donnée déjà présente (base de développement) est gardée telle quelle
      const exists = await prisma.referenceData.findUnique({ where: { group_key: { group: item.group, key: item.key } } });
      if (!exists) await prisma.referenceData.create({ data: { id: `e2e_trn_ref_${index}`, ...item, order: index } });
    }

    const tournamentWithTopic = async (
      ids: { id: string; topic: string; name: string },
      data: Record<string, unknown>
    ) => {
      await prisma.tournament.create({ data: { id: ids.id, name: ids.name, location: "Salle des fêtes", organizerId: ORGA.id, ...data } as never });
      await prisma.topic.create({
        data: {
          id: ids.topic,
          title: ids.name,
          forumId: FORUM.id,
          authorId: ORGA.id,
          tournamentId: ids.id,
          posts: { create: { id: `${ids.topic}_p1`, content: `Présentation de ${ids.name}`, authorId: ORGA.id } },
        },
      });
    };

    await tournamentWithTopic(ALPHA, {
      date: inDays(30), ville: "Rennes", region: "Bretagne", departement: "35", isTeam: false, platform: "Tabletop",
      gameEdition: "BB20", structure: "Resurrection", ruleset: "Eurobowl", isNAF: true, isCDF: true, lodgingAtVenue: true,
      mealsIncluded: true, fridayArrival: true, price: 10, maxParticipants: 40, ligueId: LIGUE.id,
    });
    await tournamentWithTopic(BETA, {
      date: inDays(60), ville: "Toulouse", region: "Occitanie", departement: "31", isTeam: true, coachsPerTeam: 3,
      platform: "Fumbbl", gameEdition: "BB25", structure: "Evolutif", isCGO: true, isTGE: true, isTSC: true, price: 25,
      maxParticipants: 16,
    });
    await tournamentWithTopic(OLD, { date: inDays(-30), ville: "Brest", region: "Bretagne", departement: "29", price: 5 });
    await tournamentWithTopic(DONE, { date: inDays(-10), ville: "Nantes", region: "Pays de la Loire", departement: "44", isFinished: true, price: 12 });
    await tournamentWithTopic(CANCELLED, { date: inDays(20), ville: "Lille", region: "Hauts-de-France", departement: "59", isCancelled: true, isFinished: true, price: 8 });
    await prisma.tournamentResult.createMany({ data: DONE_RESULTS.map((result) => ({ ...result, tournamentId: DONE.id })) });

    for (let n = 1; n <= FILLERS; n++) {
      await prisma.tournament.create({
        data: {
          id: `e2e_trn_fill_${n}`, name: fillerName(n), date: inDays(90 + n), location: "Gymnase", ville: "Dijon",
          region: "Bourgogne-Franche-Comte", departement: "21", price: 15, maxParticipants: 30, organizerId: ORGA.id,
        },
      });
    }
  });
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis.
// Chaque test enchaîne beaucoup de pages et d'écritures dans la base : temps permis triplé (test.slow).
test.beforeEach(async ({ page }) => {
  test.slow();
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
});

const listUrl = (params: Record<string, string> = {}) => `/tournois?${new URLSearchParams({ query: "Inv Trn", ...params }).toString()}`;

/** Les tournois affichés : un lien par tournoi, dont le nom commence par « Inv Trn ». */
const tournamentLinks = (page: Page) => page.getByRole("link", { name: /Inv Trn/ }).filter({ visible: true });

/** Le lien d'un tournoi affiché (aucun si le tournoi n'est pas dans la liste). */
const showsTournament = (page: Page, name: string) => tournamentLinks(page).filter({ hasText: name });

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

/**
 * Réglage de la liste (filtre, tri, affichage) : visible dans la page, sinon dans le panneau des filtres du téléphone.
 */
async function control(page: Page, role: "combobox" | "checkbox" | "spinbutton" | "button" | "textbox", name: string | RegExp): Promise<Locator> {
  const onPage = page.getByRole(role, { name }).filter({ visible: true });
  if ((await onPage.count()) > 0) return onPage.first();
  const panel = await filterPanel(page);
  const inPanel = panel.getByRole(role, { name }).filter({ visible: true }).first();
  await expect(inPanel).toBeVisible();
  return inPanel;
}

/** Bouton qui retire une pastille de filtre actif (bouton ou lien selon la version). */
const removeChip = (page: Page, name: RegExp) =>
  page.getByRole("button", { name }).or(page.getByRole("link", { name })).filter({ visible: true }).first();

/** Ouvre le panneau « Plus » du téléphone s'il est fermé et le renvoie. */
async function openMore(page: Page): Promise<Locator> {
  const panel = page.getByRole("dialog", { name: "Plus" });
  if (!(await panel.isVisible())) {
    await page.getByRole("button", { name: "Plus", exact: true }).click();
    await expect(panel).toBeVisible();
  }
  return panel;
}

/** Cherche un outil du sujet visible dans la page ; sur téléphone, dans le panneau « Outils du sujet » (ou « Plus »). */
async function findTool(page: Page, role: "link" | "button", name: string | RegExp): Promise<Locator> {
  const onPage = page.getByRole(role, { name }).filter({ visible: true });
  if ((await onPage.count()) > 0 || !isPhone(page)) return onPage.first();
  const sheet = page.getByRole("dialog", { name: "Outils du sujet" });
  if (!(await sheet.isVisible())) {
    const opener = page.getByRole("button", { name: "Outils du sujet" }).filter({ visible: true });
    if ((await opener.count()) > 0) {
      await opener.first().click();
      await expect(sheet).toBeVisible();
    } else {
      return (await openMore(page)).getByRole(role, { name }).filter({ visible: true }).first();
    }
  }
  return sheet.getByRole(role, { name }).filter({ visible: true }).first();
}

/** Zone du tournoi dans son sujet (résumé, résultats, inscriptions). */
const tournamentRegion = (page: Page) => page.getByRole("region", { name: "Tournoi" });

/** Déplie la liste des inscriptions si elle est repliée. */
async function openRegistrations(page: Page) {
  const region = tournamentRegion(page);
  const toggle = region.getByRole("button", { name: /Gestion des Inscriptions/i });
  if ((await region.getByText(/Pré-inscri/).filter({ visible: true }).count()) === 0) await toggle.click();
  await expect(region.getByText(/Pré-inscri/).filter({ visible: true }).first()).toBeVisible();
}

/** Confirme dans la fenêtre de confirmation ouverte (bouton `name`). */
async function confirm(page: Page, name: string | RegExp) {
  const dialog = page.getByRole("dialog").filter({ has: page.getByRole("button", { name }) }).last();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name }).click();
  await expect(dialog).toBeHidden();
}

test.describe("4 tournois : la liste /tournois", () => {
  test("[tous] grille (10) ou liste (20), pagination, recherche par nom", async ({ page }, testInfo) => {
    await page.goto("/tournois", { waitUntil: "networkidle" });
    // Recherche par nom : le champ écrit `query` dans l'adresse
    const search = await control(page, "textbox", /Rechercher/);
    await search.fill("Inv Trn");
    await page.waitForURL(/query=Inv/);
    await page.goto(listUrl(), { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("liste-grille.png"), fullPage: false });

    // Grille : 10 tournois par page (2 à venir + 22 de remplissage = 24 ; passé, terminé et annulé masqués)
    await expect(tournamentLinks(page)).toHaveCount(10);
    await expect(showsTournament(page, ALPHA.name)).toHaveCount(1);
    await expect(showsTournament(page, OLD.name)).toHaveCount(0);
    await expect(showsTournament(page, DONE.name)).toHaveCount(0);
    await expect(showsTournament(page, CANCELLED.name)).toHaveCount(0);
    // Pagination présente ; la page 3 de la grille montre les 4 derniers
    await expect(page.getByRole("navigation", { name: "Pagination" }).filter({ visible: true }).first()).toBeVisible();
    await page.goto(listUrl({ page: "3" }), { waitUntil: "networkidle" });
    await expect(tournamentLinks(page)).toHaveCount(4);

    // Liste : 20 tournois par page
    await page.goto(listUrl(), { waitUntil: "networkidle" });
    await (await control(page, "button", /liste/i)).click();
    await page.waitForURL(/view=list/);
    await page.waitForLoadState("networkidle");
    await page.keyboard.press("Escape");
    await expect(tournamentLinks(page)).toHaveCount(20);
    await page.screenshot({ path: testInfo.outputPath("liste-lignes.png"), fullPage: false });
    await page.goto(listUrl({ view: "list", page: "2" }), { waitUntil: "networkidle" });
    await expect(tournamentLinks(page)).toHaveCount(4);
    // Retour à la grille
    await (await control(page, "button", /grille|cartes/i)).click();
    await page.waitForURL(/view=grid/);
  });

  test("[tous] filtres : chaque réglage écrit son paramètre dans l'adresse", async ({ page }, testInfo) => {
    const cases: { role: "combobox" | "checkbox" | "spinbutton"; name: RegExp; value?: string; param: string; expected: string; options?: string[] }[] = [
      { role: "combobox", name: /^Région/, value: "Bretagne", param: "region", expected: "Bretagne" },
      { role: "combobox", name: /^Mode/, value: "true", param: "isTeam", expected: "true", options: ["Individuel", "Par équipe"] },
      { role: "combobox", name: /^Plateforme/, value: "Fumbbl", param: "platform", expected: "Fumbbl" },
      { role: "combobox", name: /^Version/, value: "BB20", param: "edition", expected: "BB20" },
      { role: "combobox", name: /^Structure/, value: "Evolutif", param: "structure", expected: "Evolutif" },
      { role: "checkbox", name: /NAF/, param: "isNAF", expected: "true" },
      { role: "checkbox", name: /CDF|Coupe de France/, param: "isCDF", expected: "true" },
      { role: "checkbox", name: /CGO|Grand Ouest/, param: "isCGO", expected: "true" },
      { role: "checkbox", name: /TGE|Grand Est/, param: "isTGE", expected: "true" },
      { role: "checkbox", name: /TSC|Sud-Centre/, param: "isTSC", expected: "true" },
      { role: "checkbox", name: /Logement/, param: "lodging", expected: "true" },
      { role: "checkbox", name: /Repas/, param: "meals", expected: "true" },
      { role: "checkbox", name: /vendredi/i, param: "friday", expected: "true" },
      { role: "spinbutton", name: /Prix max/, value: "20", param: "maxPrice", expected: "20" },
      { role: "spinbutton", name: /Places/, value: "20", param: "minPlaces", expected: "20" },
      { role: "checkbox", name: /passés/, param: "history", expected: "true" },
    ];
    let shot = false;
    for (const item of cases) {
      await page.goto(listUrl(), { waitUntil: "networkidle" });
      const field = await control(page, item.role, item.name);
      if (!shot) {
        await page.screenshot({ path: testInfo.outputPath("filtres.png"), fullPage: false });
        shot = true;
      }
      for (const option of item.options ?? []) await expect(field.getByRole("option", { name: option })).toBeAttached();
      if (item.role === "combobox") await field.selectOption(item.value!);
      else if (item.role === "checkbox") await field.click();
      else await field.fill(item.value!);
      await expect.poll(() => new URL(page.url()).searchParams.get(item.param), { message: item.param }).toBe(item.expected);
    }

    // Département : la liste suit la région choisie
    await page.goto(listUrl({ region: "Bretagne" }), { waitUntil: "networkidle" });
    const dept = await control(page, "combobox", /^Département/);
    await expect(dept.getByRole("option", { name: /^35/ })).toBeAttached();
    await expect(dept.getByRole("option", { name: /^31/ })).toHaveCount(0);
    await dept.selectOption("35");
    await expect.poll(() => new URL(page.url()).searchParams.get("dept"), { timeout: 30_000 }).toBe("35");
  });

  test("[tous] filtres : effet de chaque filtre sur les tournois affichés", async ({ page }) => {
    const cases: { params: Record<string, string>; shown: string[]; hidden: string[] }[] = [
      { params: { region: "Bretagne" }, shown: [ALPHA.name], hidden: [BETA.name, OLD.name] },
      { params: { dept: "31" }, shown: [BETA.name], hidden: [ALPHA.name] },
      { params: { isTeam: "true" }, shown: [BETA.name], hidden: [ALPHA.name] },
      { params: { isTeam: "false", region: "Bretagne" }, shown: [ALPHA.name], hidden: [BETA.name] },
      { params: { platform: "Fumbbl" }, shown: [BETA.name], hidden: [ALPHA.name] },
      { params: { edition: "BB20" }, shown: [ALPHA.name], hidden: [BETA.name] },
      { params: { structure: "Evolutif" }, shown: [BETA.name], hidden: [ALPHA.name] },
      { params: { isNAF: "true" }, shown: [ALPHA.name], hidden: [BETA.name] },
      { params: { isCDF: "true" }, shown: [ALPHA.name], hidden: [BETA.name] },
      { params: { isCGO: "true" }, shown: [BETA.name], hidden: [ALPHA.name] },
      { params: { isTGE: "true" }, shown: [BETA.name], hidden: [ALPHA.name] },
      { params: { isTSC: "true" }, shown: [BETA.name], hidden: [ALPHA.name] },
      { params: { lodging: "true" }, shown: [ALPHA.name], hidden: [BETA.name] },
      { params: { meals: "true" }, shown: [ALPHA.name], hidden: [BETA.name] },
      { params: { friday: "true" }, shown: [ALPHA.name], hidden: [BETA.name] },
      { params: { maxPrice: "12", region: "Occitanie" }, shown: [], hidden: [BETA.name] },
      { params: { maxPrice: "12", region: "Bretagne" }, shown: [ALPHA.name], hidden: [] },
      { params: { minPlaces: "35", region: "Bretagne" }, shown: [ALPHA.name], hidden: [] },
      { params: { minPlaces: "35", region: "Occitanie" }, shown: [], hidden: [BETA.name] },
      { params: { history: "true", region: "Bretagne" }, shown: [ALPHA.name, OLD.name], hidden: [] },
      // Lien « Voir tout » de la fiche d'une ligue (bug de l'inventaire « ?ligueId= n'est pas lu », vérifié ici)
      { params: { ligueId: LIGUE.id }, shown: [ALPHA.name], hidden: [BETA.name] },
    ];
    for (const item of cases) {
      await page.goto(listUrl(item.params), { waitUntil: "networkidle" });
      for (const name of item.shown) await expect(showsTournament(page, name), `${JSON.stringify(item.params)} montre ${name}`).toHaveCount(1);
      for (const name of item.hidden) await expect(showsTournament(page, name), `${JSON.stringify(item.params)} cache ${name}`).toHaveCount(0);
    }
  });

  test("[tous] pastilles des filtres actifs, tri, badges Passé, Terminé, Annulé ; une carte ouvre son sujet", async ({ page }, testInfo) => {
    await page.goto(listUrl({ region: "Bretagne", isNAF: "true" }), { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("pastilles.png"), fullPage: false });
    // Une pastille par filtre actif ; sa croix retire ce filtre seulement
    await removeChip(page, /Retirer le filtre.*Région/).click();
    await expect.poll(() => new URL(page.url()).searchParams.get("region"), { timeout: 30_000 }).toBeNull();
    expect(new URL(page.url()).searchParams.get("isNAF")).toBe("true");
    await page.waitForLoadState("networkidle");
    await expect(removeChip(page, /Retirer le filtre.*NAF/)).toBeVisible();

    // Tri : date, prix ou places, dans les deux sens
    await page.goto(listUrl(), { waitUntil: "networkidle" });
    const sort = await control(page, "combobox", /Trier/);
    for (const label of [/Date.*proche/, /Date.*lointain/, /Prix.*croissant/, /Prix.*décroissant/, /Places.*croissant/, /Places.*décroissant/]) {
      await expect(sort.getByRole("option", { name: label }).first()).toBeAttached();
    }
    await sort.selectOption("price_desc");
    await expect.poll(() => new URL(page.url()).searchParams.get("sort"), { timeout: 30_000 }).toBe("price_desc");
    await page.goto(listUrl({ sort: "price_desc" }), { waitUntil: "networkidle" });
    // 25 € (Beta) avant 15 € (remplissage) avant 10 € (Alpha) : Beta en tête, Alpha absent de la première page
    await expect(tournamentLinks(page).first()).toContainText(BETA.name);
    await page.goto(listUrl({ sort: "price_asc", history: "true" }), { waitUntil: "networkidle" });
    await expect(tournamentLinks(page).first()).toContainText(OLD.name); // 5 €, le moins cher
    await page.goto(listUrl({ sort: "date_desc" }), { waitUntil: "networkidle" });
    await expect(tournamentLinks(page).first()).toContainText(fillerName(FILLERS));

    // Badges de statut, avec l'historique
    await page.goto(listUrl({ history: "true", sort: "date_asc" }), { waitUntil: "networkidle" });
    await expect(showsTournament(page, OLD.name)).toContainText(/passé/i);
    await expect(showsTournament(page, DONE.name)).toContainText(/terminé/i);
    await expect(showsTournament(page, CANCELLED.name)).toContainText(/annulé/i);
    await expect(showsTournament(page, ALPHA.name)).not.toContainText(/passé|terminé|annulé/i);
    await page.screenshot({ path: testInfo.outputPath("badges.png"), fullPage: true });

    // Une carte ouvre le sujet du tournoi
    await page.goto(listUrl({ region: "Bretagne" }), { waitUntil: "networkidle" });
    await showsTournament(page, ALPHA.name).first().click();
    await page.waitForURL(new RegExp(`/forum/topic/${ALPHA.topic}`));
    await expect(page.getByRole("heading", { name: ALPHA.name }).first()).toBeVisible();
  });
});

test.describe("4 tournois : création et modification", () => {
  test("[membre] /forum/new-tournament : formulaire complet, choix du lieu sur une carte, création", async ({ page }, testInfo) => {
    await loginAs(page, E2E.coachId);
    await page.goto(`/forum/new-tournament?forumId=${FORUM.id}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("nouveau-tournoi.png"), fullPage: true });

    // Tous les champs du formulaire
    const fields: [string, string | RegExp][] = [
      ["textbox", /^Titre/],
      ["textbox", /^Date de début/],
      ["textbox", /^Date de fin/],
      ["combobox", /Région de tournoi/],
      ["combobox", /^Région \(France\)/],
      ["combobox", /^Département/],
      ["textbox", /^Ville/],
      ["textbox", /Adresse/],
      ["checkbox", /En équipe/],
      ["spinbutton", /Nombre de coachs max/],
      ["spinbutton", /Nombre de rondes/],
      ["checkbox", /^NAF$/],
      ["checkbox", /^CGO$/],
      ["checkbox", /^TGE$/],
      ["checkbox", /^TSC$/],
      ["combobox", /^Plateforme/],
      ["combobox", /^Édition/],
      ["combobox", /^Format/],
      ["combobox", /^Type de tournoi/],
      ["textbox", /^Ruleset/],
      ["spinbutton", /^Prix (d'|de l')?inscription/i],
      ["spinbutton", /^Prix (du )?repas/i],
      ["spinbutton", /^Prix (du )?logement/i],
      ["checkbox", /Repas inclus/],
      ["checkbox", /Dodo sur place|Logement sur place/],
      ["checkbox", /Accueil (le )?vendredi/],
      ["textbox", /Présentation/],
    ];
    for (const [role, name] of fields) {
      await expect(page.getByRole(role as "textbox", { name }).first(), `${role} ${name}`).toBeAttached();
    }
    // La case « CDF » (Coupe de France) est réservée aux modérateurs et aux administrateurs (carte 162)
    await expect(page.getByRole("checkbox", { name: /^CDF$/ })).toHaveCount(0);
    // Les dates sont des champs de date
    await expect(page.getByLabel(/^Date de début/).first()).toHaveAttribute("type", "date");
    // Ligue organisatrice et commissaires : champs de recherche
    await expect(page.getByRole("textbox", { name: /ligue/i }).first()).toBeAttached();
    await expect(page.getByRole("textbox", { name: /commissaire/i }).first()).toBeAttached();
    // En équipe : nombre de coachs par équipe et système d'appariement
    await page.getByRole("checkbox", { name: /En équipe/ }).first().check({ force: true });
    await expect(page.getByRole("spinbutton", { name: /Coachs par équipe/i }).first()).toBeVisible();
    await expect(page.getByRole("combobox", { name: /appariement/i }).first()).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: /Nombre d'équipes max/ }).first()).toBeAttached();
    await page.getByRole("checkbox", { name: /En équipe/ }).first().uncheck({ force: true });

    // Choix du lieu sur la carte : fenêtre avec recherche d'adresse (géocodage) et validation
    await page.getByRole("button", { name: /Choisir sur la carte/ }).filter({ visible: true }).first().click();
    const map = page.getByRole("dialog", { name: /Localisation|lieu/i });
    await expect(map).toBeVisible();
    await expect(map.getByRole("textbox", { name: /adresse/i })).toBeVisible();
    await expect(map.getByRole("button", { name: /^Rechercher/ })).toBeVisible();
    await expect(map.getByRole("button", { name: /Valider ce lieu/ })).toBeDisabled();
    await page.screenshot({ path: testInfo.outputPath("carte-lieu.png"), fullPage: false });
    await map.getByRole("button", { name: /^Annuler/ }).first().click();
    await expect(map).toBeHidden();

    // Création
    await page.getByRole("textbox", { name: /^Titre/ }).first().fill(CREATED_NAME);
    await page.getByLabel(/^Date de début/).first().fill(inDays(45).toISOString().slice(0, 10));
    await page.getByRole("textbox", { name: /^Ville/ }).first().fill("Vannes");
    await page.getByRole("checkbox", { name: /^NAF$/ }).first().check({ force: true });
    await page.getByRole("spinbutton", { name: /^Prix (d'|de l')?inscription/i }).first().fill("18");
    await page.getByRole("textbox", { name: /Présentation/ }).first().fill("Règlement du tournoi créé par le test.");
    await page.getByRole("button", { name: "Publier le tournoi" }).filter({ visible: true }).first().click();
    await page.waitForURL(/\/forum\/topic\//, { timeout: 30_000 });
    const created = await db((prisma) => prisma.tournament.findFirst({ where: { name: CREATED_NAME } }));
    expect(created).toMatchObject({ ville: "Vannes", isNAF: true, price: 18, organizerId: E2E.coachId });
    await expect(page.getByRole("heading", { name: CREATED_NAME }).first()).toBeVisible();
  });

  test("[orga] /forum/edit-tournament/[id] : modifier le tournoi ; refusé à un autre membre", async ({ page }) => {
    await loginAs(page, E2E.coachId);
    await page.goto(`/forum/edit-tournament/${BETA.id}`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(new RegExp(`/forum/topic/${BETA.topic}`));

    await page.context().clearCookies();
    await loginAs(page, ORGA.id);
    await page.goto(`/forum/edit-tournament/${BETA.id}`, { waitUntil: "networkidle" });
    // Les valeurs du tournoi sont reprises dans le formulaire
    await expect(page.getByRole("textbox", { name: /^Titre/ }).first()).toHaveValue(BETA.name);
    await expect(page.getByRole("checkbox", { name: /En équipe/ }).first()).toBeChecked();
    await expect(page.getByRole("spinbutton", { name: /^Prix (d'|de l')?inscription/i }).first()).toHaveValue("25");
    await page.getByRole("spinbutton", { name: /^Prix (d'|de l')?inscription/i }).first().fill("27");
    await page.getByRole("button", { name: "Enregistrer les modifications" }).filter({ visible: true }).first().click();
    await page.waitForURL(new RegExp(`/forum/topic/${BETA.topic}`), { timeout: 30_000 });
    await expect.poll(async () => (await db((prisma) => prisma.tournament.findUnique({ where: { id: BETA.id } })))?.price, { timeout: 30_000 }).toBe(27);
    await db((prisma) => prisma.tournament.update({ where: { id: BETA.id }, data: { price: 25 } }));
  });
});

test.describe("4 tournois : inscriptions", () => {
  test("[membre] s'inscrire puis se désinscrire (tournoi individuel)", async ({ page }, testInfo) => {
    await loginAs(page, E2E.coachId);
    await page.goto(`/forum/topic/${ALPHA.topic}`, { waitUntil: "networkidle" });
    const region = tournamentRegion(page);
    await expect(region.getByRole("heading", { name: ALPHA.name })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("fiche-tournoi.png"), fullPage: false });

    await region.getByRole("button", { name: "Me pré-inscrire" }).click();
    await expect.poll(() => db((prisma) => prisma.tournamentRegistration.findFirst({ where: { tournamentId: ALPHA.id, userId: E2E.coachId } }).then((r) => r?.status)), { timeout: 30_000 }).toBe("PRE_REGISTERED");
    await page.reload({ waitUntil: "networkidle" });
    await region.getByRole("button", { name: /Annuler mon inscription/ }).click();
    await confirm(page, "Quitter le tournoi");
    await expect.poll(() => db((prisma) => prisma.tournamentRegistration.count({ where: { tournamentId: ALPHA.id, userId: E2E.coachId } })), { timeout: 30_000 }).toBe(0);
  });

  test("[membre] se déclarer mercenaire ; créer, modifier et supprimer une équipe (tournoi par équipes)", async ({ page }, testInfo) => {
    await loginAs(page, E2E.coachId);
    await page.goto(`/forum/topic/${BETA.topic}`, { waitUntil: "networkidle" });
    const region = tournamentRegion(page);

    await region.getByRole("button", { name: "Être mercenaire" }).click();
    await expect.poll(() => db((prisma) => prisma.tournamentMercenary.count({ where: { tournamentId: BETA.id, userId: E2E.coachId } })), { timeout: 30_000 }).toBe(1);
    await page.reload({ waitUntil: "networkidle" });
    await region.getByRole("button", { name: "Retirer mercenaire" }).click();
    await expect.poll(() => db((prisma) => prisma.tournamentMercenary.count({ where: { tournamentId: BETA.id, userId: E2E.coachId } })), { timeout: 30_000 }).toBe(0);
    await page.reload({ waitUntil: "networkidle" });

    // Créer une équipe
    await region.getByRole("button", { name: "Inscrire une équipe" }).click();
    let sheet = page.getByRole("dialog", { name: "Inscrire une équipe" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("textbox", { name: /coéquipier/i })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("equipe.png"), fullPage: false });
    await sheet.getByRole("textbox", { name: /Nom de l'équipe/ }).fill("Les Gobelins Inv");
    await sheet.getByRole("button", { name: "Valider l'inscription" }).click();
    await expect.poll(() => db((prisma) => prisma.tournamentTeam.findFirst({ where: { tournamentId: BETA.id, captainId: E2E.coachId } }).then((t) => t?.name)), { timeout: 30_000 }).toBe("Les Gobelins Inv");

    // La modifier
    await page.reload({ waitUntil: "networkidle" });
    await region.getByRole("button", { name: /Modifier mon équipe/ }).click();
    sheet = page.getByRole("dialog", { name: "Modifier l'équipe" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("textbox", { name: /Nom de l'équipe/ })).toHaveValue("Les Gobelins Inv");
    await sheet.getByRole("textbox", { name: /Nom de l'équipe/ }).fill("Les Gobelins Renommés");
    await sheet.getByRole("button", { name: "Enregistrer les modifications" }).click();
    await expect.poll(() => db((prisma) => prisma.tournamentTeam.findFirst({ where: { tournamentId: BETA.id, captainId: E2E.coachId } }).then((t) => t?.name)), { timeout: 30_000 }).toBe("Les Gobelins Renommés");

    // Détails de l'équipe, depuis la liste des inscriptions
    await page.reload({ waitUntil: "networkidle" });
    await openRegistrations(page);
    await region.getByRole("button", { name: /Les Gobelins Renommés/ }).first().click();
    const details = page.getByRole("dialog", { name: /Les Gobelins Renommés/ });
    await expect(details).toBeVisible();
    await expect(details).toContainText(/Capitaine/i);
    await page.keyboard.press("Escape");
    await expect(details).toBeHidden();

    // La supprimer
    await region.getByRole("button", { name: /Désinscrire mon équipe/ }).click();
    await confirm(page, "Supprimer l'équipe");
    await expect.poll(() => db((prisma) => prisma.tournamentTeam.count({ where: { tournamentId: BETA.id, captainId: E2E.coachId } })), { timeout: 30_000 }).toBe(0);
  });

  test("[orga] statut d'inscription et de paiement ; ouvrir ou fermer les inscriptions", async ({ page }, testInfo) => {
    const registration = await db((prisma) =>
      prisma.tournamentRegistration.create({ data: { tournamentId: ALPHA.id, userId: MATE.id, status: "PRE_REGISTERED", paymentStatus: "NOT_PAID" } })
    );
    const current = () => db((prisma) => prisma.tournamentRegistration.findUnique({ where: { id: registration.id } }));
    try {
      // Un simple membre ne voit pas les réglages de l'organisateur
      await loginAs(page, E2E.coachId);
      await page.goto(`/forum/topic/${ALPHA.topic}`, { waitUntil: "networkidle" });
      await openRegistrations(page);
      await expect(tournamentRegion(page).getByText(MATE.name).first()).toBeVisible();
      await expect(tournamentRegion(page).getByRole("button", { name: /^Valider/ })).toHaveCount(0);

      await page.context().clearCookies();
      await loginAs(page, ORGA.id);
      await page.goto(`/forum/topic/${ALPHA.topic}`, { waitUntil: "networkidle" });
      await openRegistrations(page);
      const region = tournamentRegion(page);
      await page.screenshot({ path: testInfo.outputPath("inscriptions-orga.png"), fullPage: false });
      await region.getByRole("button", { name: /^Valider/ }).click();
      await expect.poll(async () => (await current())?.status, { timeout: 30_000 }).toBe("REGISTERED");
      await page.reload({ waitUntil: "networkidle" });
      await openRegistrations(page);
      const payment = region.getByRole("combobox", { name: /Statut de paiement/ });
      for (const label of [/attente/i, /Payé/, /Sur place/, /Invité/]) await expect(payment.getByRole("option", { name: label })).toBeAttached();
      await payment.selectOption("PAID");
      await expect.poll(async () => (await current())?.paymentStatus, { timeout: 30_000 }).toBe("PAID");
      await region.getByRole("button", { name: /attente/i }).click();
      await expect.poll(async () => (await current())?.status, { timeout: 30_000 }).toBe("WAITING_LIST");
      await page.reload({ waitUntil: "networkidle" });
      await openRegistrations(page);
      await region.getByRole("button", { name: /pré-inscription/i }).click();
      await expect.poll(async () => (await current())?.status, { timeout: 30_000 }).toBe("PRE_REGISTERED");

      // Fermer puis rouvrir les inscriptions (outils du sujet)
      await page.reload({ waitUntil: "networkidle" });
      await (await findTool(page, "button", /Bloquer (les )?inscriptions/)).click();
      await confirm(page, /Bloquer/);
      await expect.poll(async () => (await db((prisma) => prisma.tournament.findUnique({ where: { id: ALPHA.id } })))?.registrationsLocked, { timeout: 30_000 }).toBe(true);
      await page.reload({ waitUntil: "networkidle" });
      await expect(tournamentRegion(page).getByText(/Inscriptions closes/i).first()).toBeVisible();
      await (await findTool(page, "button", /Réouvrir les inscriptions/)).click();
      await confirm(page, /Réouvrir|Débloquer|Confirmer/);
      await expect.poll(async () => (await db((prisma) => prisma.tournament.findUnique({ where: { id: ALPHA.id } })))?.registrationsLocked, { timeout: 30_000 }).toBe(false);
    } finally {
      await db(async (prisma) => {
        await prisma.tournamentRegistration.deleteMany({ where: { id: registration.id } });
        await prisma.tournament.update({ where: { id: ALPHA.id }, data: { registrationsLocked: false } });
      });
    }
  });
});

test.describe("4 tournois : résultats", () => {
  test("[orga] /results : classement, rondes, import NAF, effacer ; terminer, annuler, réouvrir", async ({ page }, testInfo) => {
    // Un simple membre est renvoyé vers le sujet
    await loginAs(page, E2E.coachId);
    await page.goto(`/forum/tournament/${DONE.id}/results`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(new RegExp(`/forum/topic/${DONE.topic}`));
    await page.context().clearCookies();

    await loginAs(page, ORGA.id);
    await page.goto(`/forum/tournament/${DONE.id}/results`, { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("resultats-saisie.png"), fullPage: true });
    // Classement déjà publié, repris dans l'éditeur
    const coachNames = page.getByRole("textbox", { name: /Nom du coach/ });
    await expect(coachNames).toHaveCount(3);
    await expect(coachNames.first()).toHaveValue(ORGA.name);

    // Ajouter un coach
    await page.getByRole("button", { name: /Ajouter un coach/ }).first().click();
    await expect(coachNames).toHaveCount(4);
    await coachNames.nth(3).fill("Coach Ajouté");
    await page.getByRole("spinbutton", { name: /Victoires/ }).nth(3).fill("2");

    // Rondes et matchs
    await page.getByRole("tab", { name: /Rondes/ }).or(page.getByRole("button", { name: /Rondes/ })).first().click();
    await page.getByRole("button", { name: /Ajouter une ronde/ }).first().click();
    await expect(page.getByText(/Ronde 1/).first()).toBeVisible();
    await page.getByRole("button", { name: /Nouveau match|Ajouter un match/i }).first().click();
    await expect(page.getByRole("combobox", { name: /Coach 1/ }).or(page.getByRole("textbox", { name: /Coach 1/ })).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("resultats-rondes.png"), fullPage: true });

    // Publier
    await page.getByRole("button", { name: /Publier les résultats/ }).first().click();
    await page.waitForURL(new RegExp(`/forum/topic/${DONE.topic}`), { timeout: 30_000 });
    await expect.poll(() => db((prisma) => prisma.tournamentResult.count({ where: { tournamentId: DONE.id } })), { timeout: 30_000 }).toBe(4);
    expect(await db((prisma) => prisma.tournamentRound.count({ where: { tournamentId: DONE.id } }))).toBe(1);

    // Import d'un rapport NAF : remplace le classement et les rondes
    await page.goto(`/forum/tournament/${DONE.id}/results`, { waitUntil: "networkidle" });
    await page.getByLabel(/rapport NAF/i).setInputFiles({ name: "rapport.xml", mimeType: "text/xml", buffer: Buffer.from(NAF_REPORT) });
    await expect(coachNames).toHaveCount(2);
    await expect(coachNames.first()).toHaveValue("Importé Premier");

    // Effacer les résultats, avec confirmation
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /Vider les résultats/ }).first().click();
    const confirmButton = page.getByRole("dialog").getByRole("button", { name: /Vider/ });
    await page.waitForTimeout(500);
    if (await confirmButton.count()) await confirmButton.first().click();
    await expect.poll(() => db((prisma) => prisma.tournamentResult.count({ where: { tournamentId: DONE.id } })), { timeout: 30_000 }).toBe(0);
    await db((prisma) => prisma.tournamentResult.createMany({ data: DONE_RESULTS.map((result) => ({ ...result, tournamentId: DONE.id })) }));

    // Terminer, réouvrir, annuler (outils du sujet)
    const state = () => db((prisma) => prisma.tournament.findUnique({ where: { id: BETA.id } }));
    try {
      await page.goto(`/forum/topic/${BETA.topic}`, { waitUntil: "networkidle" });
      await (await findTool(page, "button", "Terminer le tournoi")).click();
      await confirm(page, /^Terminer$/);
      await expect.poll(async () => (await state())?.isFinished, { timeout: 30_000 }).toBe(true);
      await page.reload({ waitUntil: "networkidle" });
      await (await findTool(page, "button", "Réouvrir le tournoi")).click();
      await confirm(page, /^Réouvrir$/);
      await expect.poll(async () => (await state())?.isFinished, { timeout: 30_000 }).toBe(false);
      await page.reload({ waitUntil: "networkidle" });
      await (await findTool(page, "button", "Annuler le tournoi")).click();
      await confirm(page, /^Annuler le tournoi$/);
      await expect.poll(async () => (await state())?.isCancelled, { timeout: 30_000 }).toBe(true);
    } finally {
      await db((prisma) => prisma.tournament.update({ where: { id: BETA.id }, data: { isFinished: false, isCancelled: false } }));
    }
  });

  test("[tous] /results/view : classement final", async ({ page }, testInfo) => {
    await page.goto(`/forum/tournament/${DONE.id}/results/view`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /Classement final/i })).toBeVisible();
    await expect(page.getByText(DONE.name).first()).toBeVisible();
    for (const result of DONE_RESULTS) {
      await expect(page.getByText(result.coachName).first()).toBeVisible();
      await expect(page.getByText(result.roster).first()).toBeVisible();
      await expect(page.getByText(`${result.wins}/${result.draws}/${result.losses}`).first()).toBeVisible();
    }
    // Le coach membre du site mène à sa fiche publique (carte 134) ; le lien de retour mène au sujet
    await expect(page.getByRole("link", { name: ORGA.name })).toHaveAttribute("href", `/spy/${ORGA.id}`);
    await expect(page.getByRole("link", { name: /Retour au sujet/ }).first()).toHaveAttribute("href", `/forum/topic/${DONE.topic}`);
    await page.screenshot({ path: testInfo.outputPath("classement-final.png"), fullPage: true });
    // Sans résultat publié : page introuvable
    const missing = await page.goto(`/forum/tournament/${ALPHA.id}/results/view`);
    expect(missing?.status()).toBe(404);
  });
});
