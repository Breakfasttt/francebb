/**
 * Inventaire de la refonte, section 12 (classement du Championnat de France, CDF) de docs/refonte/inventaire.md
 * (carte 097) : la page `/classement` (onglets Année, Glissant, Par roster, Hall of Fame et Archives ; choix de l'année
 * et de l'archive ; lignes dépliables avec les 4 meilleurs tournois, le lien vers le profil et vers le tournoi ; fenêtre
 * d'aide « Calcul des points CDF »), les actions de la modération (archiver l'année avec confirmation, éditer une
 * archive, importer des archives depuis l'ancien site, créer une archive), la suppression d'une archive par un
 * administrateur (confirmation en deux étapes) et l'éditeur d'archives `/classement/edit-archive[?year=]`.
 * Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet telephone). Les éléments sont cherchés
 * par leur rôle, leur nom accessible ou leur texte, jamais par une classe CSS : le test doit passer sans modification
 * avant et après la refonte de ces écrans.
 *
 * Les actions de la modération peuvent être des boutons de la page ou des entrées du menu « Gestion du classement » :
 * la petite fonction `modAction` cherche d'abord dans la page, puis dans ce menu. Une ligne du classement peut être
 * dépliée par un bouton « Détails … » : `expandRow` l'ouvre s'il existe (avant la refonte, le détail était toujours
 * affiché). Ce sont des adaptations de la façon de trouver l'élément, pas un changement de ce qui est attendu.
 *
 * L'import depuis l'ancien site (teamfrancebb.fr) est vérifié jusqu'à la fenêtre qui demande l'année : l'import
 * lui-même interroge ce site depuis le serveur, ce que le test ne fait pas.
 *
 * Données préparées par le test (et supprimées à la fin), toutes nommées « Inv CDF … » ou « Coach CDF … » :
 * - quatre membres : le coach « Coach CDF Alpha », un modérateur, un administrateur et un membre à lier dans l'éditeur ;
 * - cinq tournois CDF terminés de l'année en cours (du 2 au 6 janvier, pour rester dans l'année et dans les 12 mois
 *   glissants quel que soit le jour du test), chacun avec son sujet du forum, et un tournoi CDF de l'année précédente ;
 * - un second coach, « Coach CDF Beta », qui n'est pas membre du site ;
 * - deux archives anciennes (1995, à consulter et à modifier, et 1994, à supprimer).
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

const YEAR = new Date().getFullYear();
const PREVIOUS_YEAR = YEAR - 1;

const COACH = { id: "e2e_cdf_coach", name: "Coach CDF Alpha", nafNumber: "990001" };
const MODO = { id: "e2e_cdf_modo", name: "Modo CDF Inv", role: "MODERATOR" };
const ADMIN = { id: "e2e_cdf_admin", name: "Admin CDF Inv", role: "ADMIN" };
const LINKED = { id: "e2e_cdf_lie", name: "Membre CDF Lié", nafNumber: "990077" };
const USERS = [COACH, MODO, ADMIN, LINKED];
const OTHER_COACH = "Coach CDF Beta";

/** Tournois de l'année en cours : « Coach CDF Alpha » en joue cinq ; seuls les 4 meilleurs comptent (100 points). */
const TOURNAMENTS = [40, 30, 20, 10, 5].map((points, index) => ({
  id: `e2e_cdf_t${index + 1}`,
  topicId: `e2e_cdf_topic${index + 1}`,
  name: `Inv CDF Tournoi ${index + 1}`,
  date: new Date(Date.UTC(YEAR, 0, 2 + index, 12)),
  points,
}));
const OLD_TOURNAMENT = { id: "e2e_cdf_old", name: "Inv CDF Tournoi Ancien", date: new Date(Date.UTC(PREVIOUS_YEAR, 5, 15, 12)), points: 60 };

const ARCHIVE_COACH = "Coach CDF Archive";
const REMOVED_COACH = "Coach CDF À retirer";
const ARCHIVE_TOURNAMENT = "Inv CDF Tournoi d'archive";
const ARCHIVE = {
  year: 1995,
  name: "Inv CDF Archive 1995",
  data: [
    { id: "NAME-Coach CDF Archive", name: ARCHIVE_COACH, nafNumber: "990095", userId: null, totalPoints: 77, count: 2, bestResults: [{ name: ARCHIVE_TOURNAMENT, rank: 1, points: 77 }] },
    { id: "NAME-Coach CDF À retirer", name: REMOVED_COACH, nafNumber: "", userId: null, totalPoints: 10, count: 1, bestResults: [] },
  ],
};
const DOOMED_ARCHIVE = { year: 1994, name: "Inv CDF Archive 1994", data: [{ id: "NAME-Coach CDF Vieux", name: "Coach CDF Vieux", userId: null, totalPoints: 33, count: 1, bestResults: [] }] };
const CREATED_YEAR = 1993;
const ARCHIVE_YEARS = [ARCHIVE.year, DOOMED_ARCHIVE.year, CREATED_YEAR];

/** Supprime tout ce que ce test a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await db(async (prisma) => {
    const userIds = USERS.map((user) => user.id);
    await prisma.rankingArchive.deleteMany({ where: { OR: [{ year: { in: ARCHIVE_YEARS } }, { archivedById: { in: userIds } }] } });
    await prisma.moderationLog.deleteMany({ where: { moderatorId: { in: userIds } } });
    await prisma.topic.deleteMany({ where: { id: { startsWith: "e2e_cdf_" } } });
    await prisma.tournament.deleteMany({ where: { id: { startsWith: "e2e_cdf_" } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  });
}

/** Remet les archives dans leur état de départ : 1995 et 1994 présentes, ni l'année précédente ni 1993 archivées. */
async function resetArchives() {
  await db(async (prisma) => {
    const userIds = USERS.map((user) => user.id);
    await prisma.rankingArchive.deleteMany({ where: { OR: [{ year: CREATED_YEAR }, { year: PREVIOUS_YEAR, archivedById: { in: userIds } }] } });
    for (const archive of [ARCHIVE, DOOMED_ARCHIVE]) {
      const data = { name: archive.name, data: JSON.stringify(archive.data) };
      await prisma.rankingArchive.upsert({ where: { year: archive.year }, update: data, create: { ...data, year: archive.year, archivedById: MODO.id } });
    }
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await db(async (prisma) => {
    // Le rôle ADMIN est une ligne de RoleConfig, absente du jeu de données commun des tests
    await prisma.roleConfig.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", label: "Administrateur", power: 90, isBaseRole: true },
    });
    for (const [index, user] of USERS.entries()) {
      await prisma.user.create({ data: { ...user, email: `classement-${index}@e2e.test`, hasFinishedOnboarding: true } });
    }
    const base = { location: "Paris", isCDF: true, isFinished: true, organizerId: MODO.id, typeCDF: "INDIVIDUEL" };
    for (const [index, tournament] of TOURNAMENTS.entries()) {
      await prisma.tournament.create({ data: { ...base, id: tournament.id, name: tournament.name, date: tournament.date, endDate: tournament.date } });
      await prisma.topic.create({ data: { id: tournament.topicId, title: tournament.name, forumId: E2E.forumId, authorId: MODO.id, tournamentId: tournament.id } });
      await prisma.tournamentResult.create({
        data: { tournamentId: tournament.id, coachName: COACH.name, userId: COACH.id, nafNumber: COACH.nafNumber, roster: "InvOrc", points: tournament.points, rank: 1 },
      });
      if (index === 0) {
        await prisma.tournamentResult.create({ data: { tournamentId: tournament.id, coachName: OTHER_COACH, roster: "InvElf", points: 25, rank: 2 } });
      }
    }
    await prisma.tournament.create({ data: { ...base, id: OLD_TOURNAMENT.id, name: OLD_TOURNAMENT.name, date: OLD_TOURNAMENT.date, endDate: OLD_TOURNAMENT.date } });
    await prisma.tournamentResult.create({
      data: { tournamentId: OLD_TOURNAMENT.id, coachName: COACH.name, userId: COACH.id, nafNumber: COACH.nafNumber, roster: "InvOrc", points: OLD_TOURNAMENT.points, rank: 1 },
    });
  });
  await resetArchives();
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis.
// Chaque test enchaîne beaucoup de pages et d'écritures dans la base : temps permis triplé (test.slow).
// La pastille des outils de développement de Next.js (`nextjs-portal`) est masquée : elle n'existe pas sur le site en
// ligne, et sur téléphone elle intercepterait les appuis sur les boutons placés en bas à gauche.
test.beforeEach(async ({ page }) => {
  test.slow();
  await resetArchives();
  await page.addInitScript(() => {
    localStorage.setItem("bbfrance_cookie_consent", "accepted");
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important; }";
      document.head.appendChild(style);
    });
  });
});

const visible = (locator: Locator) => locator.filter({ visible: true }).first();

/** Onglet du classement (un onglet ou, avant la refonte, un bouton). */
const tab = (page: Page, name: RegExp) => visible(page.getByRole("tab", { name }).or(page.getByRole("button", { name })));

const TABS = {
  year: /^(Classement|Année) \d{4}$/,
  rolling: /Glissant/,
  roster: /Par roster/i,
  hof: /^Hall of Fame$/,
  archives: /^Archives$/,
};

const actionIn = (scope: Page | Locator, name: RegExp) =>
  scope.getByRole("button", { name }).or(scope.getByRole("link", { name })).or(scope.getByRole("menuitem", { name })).filter({ visible: true });

/**
 * Cherche une action de la modération : un bouton ou un lien de la page, sinon une entrée du menu « Gestion du
 * classement ». Renvoie `null` si l'action n'existe pas ; le menu ouvert pour rien est refermé.
 */
async function modAction(page: Page, name: RegExp): Promise<Locator | null> {
  const direct = actionIn(page, name);
  if ((await direct.count()) > 0) return direct.first();
  const opener = page.getByRole("button", { name: /^Gestion du classement/ }).filter({ visible: true });
  if ((await opener.count()) === 0) return null;
  await opener.first().click();
  const menu = page.getByRole("menu").or(page.getByRole("dialog")).filter({ visible: true }).first();
  await expect(menu).toBeVisible();
  const item = actionIn(menu, name);
  if ((await item.count()) > 0) return item.first();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  return null;
}

/** Aucune action de la modération n'est proposée (ni bouton, ni menu « Gestion du classement »). */
async function expectNoModeration(page: Page) {
  for (const name of [/^Archiver/, /Modifier l'archive/, /^Importer/, /Manuel|Créer une archive|Nouvelle archive/, /^Supprimer/]) {
    expect(await modAction(page, name), `action ${name} inattendue`).toBeNull();
  }
}

/** Ouvre le détail d'un coach (ses meilleurs tournois) s'il est replié derrière un bouton « Détails … ». */
async function expandRow(page: Page, coach: string) {
  const toggle = page.getByRole("button", { name: new RegExp(`^Détails.*${coach}`) }).filter({ visible: true });
  if ((await toggle.count()) > 0 && (await toggle.first().getAttribute("aria-expanded")) !== "true") {
    await toggle.first().click();
    await expect(toggle.first()).toHaveAttribute("aria-expanded", "true");
  }
}

/** Ouvre `/classement` et attend que le classement soit chargé (le coach de l'année en cours est affiché). */
async function openRanking(page: Page) {
  await page.goto("/classement", { waitUntil: "networkidle" });
  await expect(tab(page, TABS.year)).toBeVisible();
  await expect(visible(page.getByText(COACH.name, { exact: true }))).toBeVisible();
}

/** Ouvre l'onglet « Archives » et choisit une archive dans la liste. */
async function openArchive(page: Page, year: number) {
  await tab(page, TABS.archives).click();
  const select = visible(page.getByRole("combobox", { name: "Choisir une archive" }));
  await expect(select).toBeVisible();
  await select.selectOption(`CDF_${year}`);
}

/**
 * Quitte le champ en cours de saisie avant d'appuyer sur un bouton. Sur téléphone, la barre du bas, cachée pendant la
 * saisie, réapparaît quand le champ perd le focus et décale la page : l'appui direct tomberait alors à côté du bouton.
 */
async function leaveField(page: Page) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(page.locator("html")).not.toHaveAttribute("data-typing", "true");
  await page.waitForTimeout(300);
}

/** Lit l'archive d'une année dans la base (ou `null`). */
async function readArchive(year: number) {
  return db(async (prisma) => {
    const archive = await prisma.rankingArchive.findUnique({ where: { year } });
    return archive ? { name: archive.name, data: JSON.parse(archive.data) as Array<Record<string, unknown>> } : null;
  });
}

/** Champs de l'éditeur d'archives, retrouvés par leur nom accessible. Une ligne par coach : même rang dans chaque liste. */
const editor = (page: Page) => ({
  year: page.getByRole("spinbutton", { name: /^Année/ }),
  name: page.getByRole("textbox", { name: /^Nom de l'archive/i }),
  coach: page.getByRole("textbox", { name: /^Nom du coach/ }),
  naf: page.getByRole("textbox", { name: /^Numéro NAF/ }),
  member: page.getByRole("textbox", { name: /Lier|membre/i }),
  points: page.getByRole("spinbutton", { name: /^Points total/ }),
  count: page.getByRole("spinbutton", { name: /^Nombre de tournois/ }),
  details: page.getByRole("button", { name: /^Détails/ }),
  remove: page.getByRole("button", { name: /^Supprimer la ligne/ }),
  save: visible(page.getByRole("button", { name: /^Enregistrer/ })),
});

/** Rang de la ligne dont le nom du coach vaut `name` (les lignes sont triées par points). */
async function rowIndex(page: Page, name: string): Promise<number> {
  const values = await editor(page).coach.evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  const index = values.indexOf(name);
  expect(index, `ligne de « ${name} »`).toBeGreaterThanOrEqual(0);
  return index;
}

test.describe("Inventaire 12 : classement du Championnat de France", () => {
  test("[tous] /classement : onglets, choix de l'année et de l'archive, lignes dépliables, aide", async ({ page }, testInfo) => {
    await openRanking(page);
    for (const name of Object.values(TABS)) await expect(tab(page, name)).toBeVisible();

    // Onglet de l'année en cours : 4 meilleurs tournois sur 5, soit 100 points
    await expect(visible(page.getByText(OTHER_COACH, { exact: true }))).toBeVisible();
    await expect(visible(page.getByText("100", { exact: true }))).toBeVisible();
    await expandRow(page, COACH.name);
    for (const tournament of TOURNAMENTS.slice(0, 4)) {
      const link = visible(page.getByRole("link", { name: tournament.name, exact: true }));
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", `/forum/topic/${tournament.topicId}`);
    }
    await expect(page.getByRole("link", { name: TOURNAMENTS[4].name, exact: true })).toHaveCount(0);
    const profile = visible(page.getByRole("link", { name: `Voir le profil de ${COACH.name}` }));
    await expect(profile).toBeVisible();
    await expect(profile).toHaveAttribute("href", `/spy/${COACH.id}`);
    await page.screenshot({ path: testInfo.outputPath("classement-annee.png"), fullPage: false });

    // Choix d'une autre année (calculée) : l'année précédente
    const yearSelect = visible(page.getByRole("combobox", { name: "Choisir l'année" }));
    await yearSelect.selectOption(`CDF_${PREVIOUS_YEAR}`);
    await expect(visible(page.getByText("60", { exact: true }))).toBeVisible();
    await expandRow(page, COACH.name);
    await expect(visible(page.getByText(OLD_TOURNAMENT.name, { exact: true }))).toBeVisible();

    // Classement glissant (12 derniers mois)
    await tab(page, TABS.rolling).click();
    await expect(visible(page.getByText(COACH.name, { exact: true }))).toBeVisible();

    // Par roster : le meilleur coach de chaque roster
    await tab(page, TABS.roster).click();
    await expect(visible(page.getByText("InvOrc", { exact: true }))).toBeVisible();
    await expect(visible(page.getByText("InvElf", { exact: true }))).toBeVisible();
    await expect(visible(page.getByText(OTHER_COACH, { exact: true }))).toBeVisible();

    // Hall of Fame : le podium de chaque année, archives comprises
    await tab(page, TABS.hof).click();
    await expect(visible(page.getByText(String(ARCHIVE.year), { exact: true }))).toBeVisible();
    await expect(visible(page.getByText(ARCHIVE_COACH, { exact: true }))).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("classement-hof.png"), fullPage: false });

    // Archives : choix d'une archive, puis détail d'une ligne
    await openArchive(page, ARCHIVE.year);
    await expect(visible(page.getByText(ARCHIVE_COACH, { exact: true }))).toBeVisible();
    await expect(visible(page.getByText("77", { exact: true }))).toBeVisible();
    await expandRow(page, ARCHIVE_COACH);
    await expect(visible(page.getByText(ARCHIVE_TOURNAMENT, { exact: true }))).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("classement-archive.png"), fullPage: false });

    // Fenêtre d'aide « Calcul des points CDF »
    await visible(page.getByRole("button", { name: /Comment sont calculés les points/ })).click();
    const help = page.getByRole("dialog", { name: /Calcul des points CDF/i });
    await expect(help).toBeVisible();
    await expect(help.getByText(/4 meilleurs résultats/)).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("classement-aide.png"), fullPage: false });
    await page.keyboard.press("Escape");
    await expect(help).toBeHidden();

    // Un visiteur n'a aucune action de modération, et l'éditeur d'archives le renvoie au classement
    await expectNoModeration(page);
    await page.goto("/classement/edit-archive?year=1995");
    await page.waitForURL(/\/classement$/);
  });

  test("[membre] /classement : aucune action de modération", async ({ page }) => {
    await loginAs(page, E2E.coachId);
    await openRanking(page);
    await expectNoModeration(page);
    await openArchive(page, ARCHIVE.year);
    await expect(visible(page.getByText(ARCHIVE_COACH, { exact: true }))).toBeVisible();
    await expectNoModeration(page);
    await page.goto("/classement/edit-archive");
    await page.waitForURL(/\/classement$/);
  });

  test("[modo] /classement : archiver l'année, éditer une archive, importer, créer une archive", async ({ page }, testInfo) => {
    await loginAs(page, MODO.id);
    await openRanking(page);

    // Archiver l'année précédente, après confirmation
    await visible(page.getByRole("combobox", { name: "Choisir l'année" })).selectOption(`CDF_${PREVIOUS_YEAR}`);
    await expect(visible(page.getByText("60", { exact: true }))).toBeVisible();
    const archiveAction = await modAction(page, /^Archiver/);
    expect(archiveAction).not.toBeNull();
    await archiveAction!.click();
    const confirm = page.getByRole("dialog", { name: /archivage/i });
    await expect(confirm).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("classement-archiver.png"), fullPage: false });
    await confirm.getByRole("button", { name: /^(Confirmer|Archiver)/ }).click();
    await expect.poll(async () => (await readArchive(PREVIOUS_YEAR))?.data.length ?? 0).toBeGreaterThan(0);

    // Sur une archive : pas de suppression pour un modérateur ; import et création possibles
    await page.goto("/classement", { waitUntil: "networkidle" });
    await openArchive(page, ARCHIVE.year);
    await expect(visible(page.getByText(ARCHIVE_COACH, { exact: true }))).toBeVisible();
    expect(await modAction(page, /^Supprimer/)).toBeNull();

    const importAction = await modAction(page, /^Importer/);
    expect(importAction).not.toBeNull();
    await importAction!.click();
    const importDialog = page.getByRole("dialog", { name: /Importer des archives/ });
    await expect(importDialog).toBeVisible();
    await expect(importDialog.getByRole("spinbutton", { name: /Année/ })).toBeVisible();
    await expect(importDialog.getByRole("button", { name: /Lancer l'import/ })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("classement-import.png"), fullPage: false });
    await page.keyboard.press("Escape");
    await expect(importDialog).toBeHidden();

    const editAction = await modAction(page, /Modifier l'archive/);
    expect(editAction).not.toBeNull();
    await editAction!.click();
    await page.waitForURL(new RegExp(`/classement/edit-archive\\?year=${ARCHIVE.year}$`));
    await expect(editor(page).name).toHaveValue(ARCHIVE.name);

    await page.goto("/classement", { waitUntil: "networkidle" });
    await openArchive(page, ARCHIVE.year);
    const createAction = await modAction(page, /Manuel|Créer une archive|Nouvelle archive/);
    expect(createAction).not.toBeNull();
    await createAction!.click();
    await page.waitForURL(/\/classement\/edit-archive$/);
    await expect(editor(page).year).toHaveValue(String(YEAR));
  });

  test("[admin] /classement : supprimer une archive (deux confirmations)", async ({ page }) => {
    await loginAs(page, ADMIN.id);
    await openRanking(page);
    await openArchive(page, DOOMED_ARCHIVE.year);
    await expect(visible(page.getByText("Coach CDF Vieux", { exact: true }))).toBeVisible();
    const remove = await modAction(page, /^Supprimer/);
    expect(remove).not.toBeNull();
    await remove!.click();
    const first = page.getByRole("dialog", { name: /1\/2/ });
    await expect(first).toBeVisible();
    await first.getByRole("button", { name: /^Continuer$/ }).click();
    const second = page.getByRole("dialog", { name: /2\/2/ });
    await expect(second).toBeVisible();
    await second.getByRole("button", { name: /Supprimer définitivement/i }).click();
    await expect.poll(() => readArchive(DOOMED_ARCHIVE.year)).toBeNull();
  });

  test("[modo] /classement/edit-archive?year= : modifier une archive ligne par ligne", async ({ page }, testInfo) => {
    await loginAs(page, MODO.id);
    await page.goto(`/classement/edit-archive?year=${ARCHIVE.year}`, { waitUntil: "networkidle" });
    const fields = editor(page);
    await expect(fields.year).toHaveValue(String(ARCHIVE.year));
    await expect(fields.name).toHaveValue(ARCHIVE.name);
    await expect(fields.coach).toHaveCount(2);
    await fields.name.fill("Inv CDF Archive 1995 modifiée");

    // Nouvelle ligne : nom, NAF, lien vers un membre, nombre de tournois, détail d'un tournoi, puis points
    await visible(page.getByRole("button", { name: /Ajouter un coach/ })).click();
    await expect(fields.coach).toHaveCount(3);
    let row = await rowIndex(page, "");
    await fields.coach.nth(row).fill("Coach CDF Nouveau");
    row = await rowIndex(page, "Coach CDF Nouveau");
    await fields.naf.nth(row).fill("990088");
    await fields.member.nth(row).fill("Membre CDF");
    await visible(page.getByText(LINKED.name, { exact: true })).click();
    await expect(visible(page.getByText(LINKED.name, { exact: true }))).toBeVisible();
    await fields.count.nth(row).fill("3");
    await leaveField(page);
    const toggle = fields.details.nth(row);
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
    await visible(page.getByRole("textbox", { name: "Tournoi 1 : nom" })).fill("Inv CDF Tournoi saisi");
    await visible(page.getByRole("spinbutton", { name: "Tournoi 1 : rang" })).fill("2");
    await visible(page.getByRole("spinbutton", { name: "Tournoi 1 : points" })).fill("42.5");
    await fields.points.nth(row).fill("42.5");
    await leaveField(page);
    await page.screenshot({ path: testInfo.outputPath("edit-archive.png"), fullPage: false });

    // Suppression d'une ligne
    await fields.remove.nth(await rowIndex(page, REMOVED_COACH)).click();
    await expect(fields.coach).toHaveCount(2);

    await fields.save.click();
    await expect.poll(async () => (await readArchive(ARCHIVE.year))?.name).toBe("Inv CDF Archive 1995 modifiée");
    const saved = await readArchive(ARCHIVE.year);
    expect(saved?.name).toBe("Inv CDF Archive 1995 modifiée");
    expect(saved?.data.map((entry) => entry.name).sort()).toEqual(["Coach CDF Archive", "Coach CDF Nouveau"]);
    const added = saved!.data.find((entry) => entry.name === "Coach CDF Nouveau")!;
    expect(added).toMatchObject({ nafNumber: "990088", totalPoints: 42.5, count: 3 });
    expect((added.bestResults as Array<Record<string, unknown>>)[0]).toMatchObject({ name: "Inv CDF Tournoi saisi", rank: 2, points: 42.5 });
  });

  test("[modo] /classement/edit-archive : créer une archive", async ({ page }) => {
    await loginAs(page, MODO.id);
    await page.goto("/classement/edit-archive", { waitUntil: "networkidle" });
    const fields = editor(page);
    await fields.year.fill(String(CREATED_YEAR));
    await fields.name.fill(`Inv CDF Archive ${CREATED_YEAR}`);
    await expect(fields.coach).toHaveCount(0);
    await visible(page.getByRole("button", { name: /Ajouter un coach/ })).click();
    await fields.coach.first().fill("Coach CDF Créé");
    await fields.points.first().fill("12");
    await leaveField(page);
    await fields.save.click();
    // Enregistrement vérifié dans la base (avant la refonte, la page ne revenait pas toujours au classement)
    await expect.poll(() => readArchive(CREATED_YEAR)).not.toBeNull();
    const saved = await readArchive(CREATED_YEAR);
    expect(saved?.name).toBe(`Inv CDF Archive ${CREATED_YEAR}`);
    expect(saved?.data).toHaveLength(1);
    expect(saved?.data[0]).toMatchObject({ name: "Coach CDF Créé", totalPoints: 12 });
  });
});
