/**
 * Inventaire de la refonte, section 9 (ligues et carte) de docs/refonte/inventaire.md (carte 094) : la liste `/ligues`
 * (grille, liste, recherche, zone, pagination, « Créer une ligue »), la création d'une ligue, la fiche d'une ligue
 * (blason, présentation, chef, commissaires, membres, prochains tournois, signalement, gestion) et sa modification,
 * puis la carte interactive `/carte`. Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet
 * telephone). Les éléments sont cherchés par leur rôle, leur nom accessible ou leur texte, jamais par une classe CSS :
 * le test doit passer sans modification avant et après la refonte de ces écrans.
 *
 * Sur téléphone, un réglage ou une action peut être rangé dans un panneau : panneau des filtres (« Ouvrir les filtres »
 * ou « Filtres »), menu des actions de la ligue (« ⋯ ») ou panneau « Plus » de la barre du bas. Les petites fonctions
 * `control` et `findAction` cherchent d'abord dans la page, puis dans ces panneaux. C'est une adaptation de la façon
 * de trouver l'élément, pas un changement de ce qui est attendu.
 *
 * Données préparées par le test (et supprimées à la fin), toutes nommées « Inv Lig … » :
 * - quatre membres : le chef de la ligue Alpha, un commissaire, un simple membre de la ligue et un futur chef ;
 * - la ligue « Inv Lig Alpha » (blason, présentation en BBCode, position sur la carte, commissaire, membre) avec six
 *   tournois à venir (la fiche n'en montre que cinq), dont un placé sur la carte ;
 * - la ligue « Inv Lig Beta » d'une autre zone, deux ligues pour le transfert et la suppression ;
 * - 22 ligues de remplissage pour la pagination (12 par page en grille, 20 en liste) ;
 * - quelques données de référence (zones, région, département) pour le formulaire.
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

const CHEF = { id: "e2e_lig_chef", name: "Chef Ligue Inv" };
const COMM = { id: "e2e_lig_comm", name: "Commissaire Ligue Inv" };
const MEMBER = { id: "e2e_lig_membre", name: "Membre Ligue Inv" };
const HEIR = { id: "e2e_lig_heritier", name: "Héritier Ligue Inv" };

const ALPHA = {
  id: "e2e_lig_alpha", name: "Inv Lig Alpha", acronym: "ILA", geographicalZone: "R2-NO", region: "Bretagne",
  departement: "35 - Ille-et-Vilaine", ville: "Rennes", address: "1 place de la Mairie", lat: 46.5, lng: 2.0,
  image: "/images/logo2.png", description: "[b]Présentation en gras de la ligue Alpha[/b]",
};
const BETA = { id: "e2e_lig_beta", name: "Inv Lig Beta", acronym: "ILB", geographicalZone: "R4-SE", ville: "Marseille", lat: 45.9, lng: 2.6 };
const TRANSFER = { id: "e2e_lig_transfert", name: "Inv Lig Transfert", acronym: "ILT" };
const DOOMED = { id: "e2e_lig_suppr", name: "Inv Lig Suppression", acronym: "ILS" };
const FILLERS = 22;
const fillerName = (n: number) => `Inv Lig Remplissage ${String(n).padStart(2, "0")}`;
const CREATED_NAME = "Inv Lig Créée par le membre";

const DAY = 24 * 60 * 60_000;
const inDays = (days: number) => {
  const date = new Date(Date.now() + days * DAY);
  date.setUTCHours(12, 0, 0, 0);
  return date;
};
const tournamentName = (n: number) => `Inv Lig Tournoi ${n}`;

const REFERENCE_DATA = [
  { group: "COACH_REGION", key: "R2-NO", label: "R2 - Nord-Ouest" },
  { group: "COACH_REGION", key: "R4-SE", label: "R4 - Sud-Est" },
  { group: "REGION_FRANCE", key: "Bretagne", label: "Bretagne" },
  { group: "DEPARTEMENT_FRANCE", key: "35", label: "35 - Ille-et-Vilaine" },
];

/** Supprime tout ce que ce test a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await db(async (prisma) => {
    await prisma.tournament.deleteMany({ where: { id: { startsWith: "e2e_lig_" } } });
    await prisma.moderationReport.deleteMany({ where: { targetType: "LIGUE", targetId: { startsWith: "e2e_lig_" } } });
    const ligues = await prisma.ligue.findMany({ where: { OR: [{ id: { startsWith: "e2e_lig_" } }, { name: { startsWith: "Inv Lig" } }] }, select: { id: true } });
    await prisma.moderationReport.deleteMany({ where: { targetType: "LIGUE", targetId: { in: ligues.map((ligue) => ligue.id) } } });
    await prisma.ligue.deleteMany({ where: { id: { in: ligues.map((ligue) => ligue.id) } } });
    await prisma.referenceData.deleteMany({ where: { id: { startsWith: "e2e_lig_" } } });
    // Journal de modération : création, transfert et suppression d'une ligue y sont notés
    await prisma.moderationLog.deleteMany({
      where: { OR: [{ moderatorId: { in: [CHEF.id, COMM.id, MEMBER.id, HEIR.id] } }, { targetId: { in: ligues.map((ligue) => ligue.id) } }] },
    });
    await prisma.user.deleteMany({ where: { id: { in: [CHEF.id, COMM.id, MEMBER.id, HEIR.id] } } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await db(async (prisma) => {
    for (const [index, user] of [CHEF, COMM, MEMBER, HEIR].entries()) {
      await prisma.user.create({ data: { ...user, email: `ligue-${index}@e2e.test`, hasFinishedOnboarding: true } });
    }
    for (const [index, item] of REFERENCE_DATA.entries()) {
      // Une donnée déjà présente (base de développement, autre test) est gardée telle quelle
      const exists = await prisma.referenceData.findUnique({ where: { group_key: { group: item.group, key: item.key } } });
      if (!exists) await prisma.referenceData.create({ data: { id: `e2e_lig_ref_${index}`, ...item, order: index } });
    }
    await prisma.ligue.create({
      data: {
        ...ALPHA, creatorId: CHEF.id,
        commissaires: { connect: { id: COMM.id } },
        members: { connect: [{ id: MEMBER.id }] },
      },
    });
    await prisma.ligue.create({ data: { ...BETA, creatorId: CHEF.id } });
    await prisma.ligue.create({ data: { ...TRANSFER, creatorId: CHEF.id } });
    await prisma.ligue.create({ data: { ...DOOMED, creatorId: CHEF.id } });
    for (let n = 1; n <= FILLERS; n++) {
      await prisma.ligue.create({
        data: { id: `e2e_lig_fill_${n}`, name: fillerName(n), acronym: `ILR${n}`, geographicalZone: "R2-NO", ville: "Dijon", creatorId: CHEF.id },
      });
    }
    // Six tournois à venir de la ligue Alpha (la fiche n'en montre que cinq) ; le premier est placé sur la carte
    for (let n = 1; n <= 6; n++) {
      await prisma.tournament.create({
        data: {
          id: `e2e_lig_trn_${n}`, name: tournamentName(n), date: inDays(10 * n), location: "Salle des fêtes", ville: "Rennes",
          platform: "Tabletop", organizerId: CHEF.id, ligueId: ALPHA.id,
          ...(n === 1 ? { lat: 46.2, lng: 1.4 } : {}),
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

/** Adresses des ligues affichées (un lien par ligue ; une ligne de liste peut avoir deux liens vers la même fiche). */
async function shownLigues(page: Page): Promise<string[]> {
  const links = page.getByRole("link", { name: /Inv Lig/ }).filter({ visible: true });
  const hrefs = await links.evaluateAll((elements) => elements.map((element) => element.getAttribute("href") ?? ""));
  return [...new Set(hrefs.filter((href) => href.startsWith("/ligue/")))];
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

/** Réglage de la liste (recherche, zone, affichage, création) : visible dans la page, sinon dans le panneau des filtres. */
async function control(page: Page, role: "combobox" | "button" | "link" | "textbox", name: string | RegExp): Promise<Locator> {
  const onPage = page.getByRole(role, { name }).filter({ visible: true });
  if ((await onPage.count()) > 0) return onPage.first();
  const panel = await filterPanel(page);
  const inPanel = panel.getByRole(role, { name }).filter({ visible: true }).first();
  await expect(inPanel).toBeVisible();
  return inPanel;
}

/** Bouton d'affichage (grille ou liste) : bouton ou lien selon la version. */
async function viewSwitch(page: Page, name: RegExp): Promise<Locator> {
  const onPage = page.getByRole("button", { name }).or(page.getByRole("link", { name })).filter({ visible: true });
  if ((await onPage.count()) > 0) return onPage.first();
  const panel = await filterPanel(page);
  return panel.getByRole("button", { name }).or(panel.getByRole("link", { name })).filter({ visible: true }).first();
}

/** Une action de la ligue sous forme de bouton, de lien ou d'entrée de menu. */
const actionIn = (scope: Page | Locator, name: RegExp) =>
  scope.getByRole("button", { name }).or(scope.getByRole("link", { name })).or(scope.getByRole("menuitem", { name })).filter({ visible: true });

/**
 * Cherche une action de la fiche d'une ligue : visible dans la page, sinon dans le menu des actions de la ligue
 * (« ⋯ »), sinon, sur téléphone, dans le panneau « Plus ». Renvoie `null` si l'action n'existe nulle part ; les
 * panneaux ouverts pour rien sont refermés.
 */
async function findAction(page: Page, name: RegExp): Promise<Locator | null> {
  if ((await actionIn(page, name).count()) > 0) return actionIn(page, name).first();
  const opener = page.getByRole("button", { name: /Actions de la ligue|Gérer la ligue|Plus d'actions/ }).filter({ visible: true });
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
 * saisie, réapparaît quand le champ perd le focus et décale la page : l'appui direct tombe alors à côté du bouton
 * (bug connu, carte 113). Le test attend donc que la page soit stable, comme le ferait un coach.
 */
async function leaveField(page: Page) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(page.locator("html")).not.toHaveAttribute("data-typing", "true");
  await page.waitForTimeout(300);
}

test.describe("Inventaire 9 : ligues et carte", () => {
  test("[tous] /ligues : grille, liste, recherche par nom ou acronyme, zone, pagination, « Créer une ligue »", async ({ page }, testInfo) => {
    await page.goto("/ligues", { waitUntil: "networkidle" });
    // Recherche : le champ écrit `query` dans l'adresse
    const search = await control(page, "textbox", /Rechercher|Nom ou acronyme/);
    await search.fill("Inv Lig Remplissage");
    await page.waitForURL(/query=Inv/);
    if (isPhone(page)) await page.keyboard.press("Escape");

    // Grille : 12 ligues par page (22 ligues de remplissage)
    await page.goto("/ligues?query=Inv+Lig+Remplissage", { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("ligues-grille.png"), fullPage: false });
    expect(await shownLigues(page)).toHaveLength(12);
    await expect(page.getByRole("navigation", { name: "Pagination" }).filter({ visible: true }).first()).toBeVisible();
    await page.goto("/ligues?query=Inv+Lig+Remplissage&page=2", { waitUntil: "networkidle" });
    expect(await shownLigues(page)).toHaveLength(10);

    // Liste : 20 ligues par page
    await page.goto("/ligues?query=Inv+Lig+Remplissage", { waitUntil: "networkidle" });
    await (await viewSwitch(page, /liste/i)).click();
    await page.waitForURL(/view=list/);
    await page.waitForLoadState("networkidle");
    if (isPhone(page)) await page.keyboard.press("Escape");
    expect(await shownLigues(page)).toHaveLength(20);
    await page.screenshot({ path: testInfo.outputPath("ligues-liste.png"), fullPage: false });
    await page.goto("/ligues?view=list&query=Inv+Lig+Remplissage&page=2", { waitUntil: "networkidle" });
    expect(await shownLigues(page)).toHaveLength(2);
    await (await viewSwitch(page, /grille/i)).click();
    await page.waitForURL(/view=grid/);
    if (isPhone(page)) await page.keyboard.press("Escape");

    // Recherche par acronyme
    await page.goto("/ligues?query=ILB", { waitUntil: "networkidle" });
    expect(await shownLigues(page)).toEqual([`/ligue/${BETA.id}`]);

    // Filtre par zone : écrit `region` dans l'adresse
    await page.goto("/ligues?query=Inv+Lig", { waitUntil: "networkidle" });
    await (await control(page, "combobox", /Zone/)).selectOption("R4-SE");
    await page.waitForURL(/region=R4-SE/);
    await page.waitForLoadState("networkidle");
    if (isPhone(page)) await page.keyboard.press("Escape");
    expect(await shownLigues(page)).toEqual([`/ligue/${BETA.id}`]);

    // Les filtres sont lus dans l'adresse (`?view&query&region`)
    await page.goto(`/ligues?view=list&query=${encodeURIComponent(ALPHA.name)}&region=R2-NO`, { waitUntil: "networkidle" });
    expect(await shownLigues(page)).toEqual([`/ligue/${ALPHA.id}`]);
    await page.goto(`/ligues?query=${encodeURIComponent(ALPHA.name)}&region=R4-SE`, { waitUntil: "networkidle" });
    expect(await shownLigues(page)).toEqual([]);

    // « Créer une ligue » : un visiteur est envoyé vers la connexion
    await page.goto("/ligues", { waitUntil: "networkidle" });
    const create = await control(page, "link", /Créer une ligue/i);
    await expect(create).toHaveAttribute("href", "/ligues/create");
    await create.click();
    await page.waitForURL(/\/auth\/login\?callbackUrl=(\/|%2F)ligues(\/|%2F)create/);
  });

  test("[membre] /ligues/create : tous les champs, choix sur la carte, commissaires, création", async ({ page }, testInfo) => {
    await loginAs(page, MEMBER.id);
    await page.goto("/ligues/create", { waitUntil: "networkidle" });
    const field = (role: "textbox" | "combobox", name: RegExp) => page.getByRole(role, { name }).filter({ visible: true }).first();

    await field("textbox", /^Nom/).fill(CREATED_NAME);
    await field("textbox", /^Acronyme/).fill("ILC");
    // Blason : le bouton ouvre le choix d'un fichier (l'envoi passe ensuite par le service extérieur ImgBB)
    const chooser = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: /blason/i }).filter({ visible: true }).first().click();
    await chooser;
    await field("combobox", /^Zone/).selectOption("R2-NO");
    await field("combobox", /^Région/).selectOption("Bretagne");
    await field("combobox", /^Département/).selectOption({ label: "35 - Ille-et-Vilaine" });
    await field("textbox", /^Ville/).fill("Vannes");
    await field("textbox", /^Adresse/).fill("2 rue du Port, Vannes");

    // Adresse avec choix sur la carte : la fenêtre propose la recherche d'une adresse ; un appui sur la carte place
    // le repère, puis « Valider ce lieu » enregistre la position
    await page.getByRole("button", { name: /Choisir sur la carte/ }).filter({ visible: true }).first().click();
    const mapDialog = page.getByRole("dialog", { name: /Localisation|lieu/i });
    await expect(mapDialog).toBeVisible();
    await expect(mapDialog.getByRole("textbox", { name: /adresse/i })).toBeVisible();
    await expect(mapDialog.getByRole("button", { name: /Valider ce lieu/ })).toBeDisabled();
    await mapDialog.getByRole("group", { name: "Carte du lieu" }).click();
    await mapDialog.getByRole("button", { name: /Valider ce lieu/ }).click();
    await expect(mapDialog).toBeHidden();
    await expect(page.getByText(/Localisation précise définie/).first()).toBeVisible();

    // Description en BBCode
    await field("textbox", /Description|Présentation/).fill("[b]Ligue créée par le test[/b]");

    // Commissaires : recherche d'un membre
    await field("textbox", /commissaire/i).fill("Commissaire Ligue");
    await page.getByText(COMM.name, { exact: true }).first().click();
    await leaveField(page);
    await page.screenshot({ path: testInfo.outputPath("ligue-creation.png"), fullPage: true });

    await page.getByRole("button", { name: /Créer la ligue/i }).filter({ visible: true }).first().click();
    await page.waitForURL(/\/ligue\/(?!edit)[^/?]+$/);
    const created = await db((prisma) => prisma.ligue.findFirst({ where: { name: CREATED_NAME }, include: { commissaires: { select: { id: true } } } }));
    expect(created).toMatchObject({
      acronym: "ILC", geographicalZone: "R2-NO", region: "Bretagne", departement: "35 - Ille-et-Vilaine", ville: "Vannes",
      description: "[b]Ligue créée par le test[/b]", creatorId: MEMBER.id,
    });
    expect(created?.lat).not.toBeNull();
    expect(created?.address).toBeTruthy();
    expect(created?.commissaires.map((user) => user.id)).toEqual([COMM.id]);
    await expect(page.getByRole("heading", { name: new RegExp(CREATED_NAME) }).first()).toBeVisible();

    // Un visiteur est envoyé vers la connexion
    await page.context().clearCookies();
    await page.goto("/ligues/create", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("[tous] /ligue/[id] : blason, « À propos », chef, commissaires, membres, 5 prochains tournois, « Voir tout »", async ({ page }, testInfo) => {
    await page.goto(`/ligue/${ALPHA.id}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: testInfo.outputPath("ligue-fiche-visiteur.png"), fullPage: true });
    await expect(page.getByRole("heading", { name: new RegExp(ALPHA.name) }).first()).toBeVisible();
    await expect(page.getByRole("img", { name: new RegExp(`Blason ${ALPHA.name}`) }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /À propos/ }).first()).toBeVisible();
    await expect(page.getByText("Présentation en gras de la ligue Alpha").first()).toBeVisible();
    // Le texte en gras est mis en forme (BBCode converti)
    expect(await page.getByText("Présentation en gras de la ligue Alpha").first().evaluate((element) => getComputedStyle(element).fontWeight)).toMatch(/^(700|bold|[6-9]00)$/);
    await expect(page.getByText(CHEF.name).first()).toBeVisible();
    await expect(page.getByText(/Chef de ligue/i).first()).toBeVisible();
    await expect(page.getByText(COMM.name).first()).toBeVisible();
    // Cinq prochains tournois et « Voir tout »
    const tournaments = page.getByRole("link", { name: /Inv Lig Tournoi/ }).filter({ visible: true });
    await expect(tournaments).toHaveCount(5);
    await expect(tournaments.filter({ hasText: tournamentName(6) })).toHaveCount(0);
    const all = page.getByRole("link", { name: /Voir tout/ }).filter({ visible: true }).first();
    await expect(all).toHaveAttribute("href", `/tournois?ligueId=${ALPHA.id}`);

    // Membres de la ligue (liste affichée aux membres connectés)
    await loginAs(page, CHEF.id);
    await page.goto(`/ligue/${ALPHA.id}`, { waitUntil: "networkidle" });
    const member = page.getByRole("link", { name: new RegExp(MEMBER.name) }).filter({ visible: true }).first();
    await expect(member).toHaveAttribute("href", `/spy/${MEMBER.id}`);
    await page.screenshot({ path: testInfo.outputPath("ligue-fiche-membre.png"), fullPage: true });
    await all.click();
    await page.waitForURL(new RegExp(`/tournois\\?ligueId=${ALPHA.id}`));
  });

  test("[membre] /ligue/[id] : signaler la ligue", async ({ page }) => {
    // Un visiteur ne peut pas signaler
    await page.goto(`/ligue/${ALPHA.id}`, { waitUntil: "networkidle" });
    expect(await findAction(page, /Signaler/)).toBeNull();

    await loginAs(page, MEMBER.id);
    await page.goto(`/ligue/${ALPHA.id}`, { waitUntil: "networkidle" });
    const report = await findAction(page, /Signaler/);
    expect(report).not.toBeNull();
    await report!.click();
    const dialog = page.getByRole("dialog", { name: /Signaler/ });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Spam / Publicité" }).click();
    await dialog.getByRole("button", { name: /Envoyer le signalement/ }).click();
    await expect(dialog).toBeHidden();
    await expect.poll(() => db((prisma) => prisma.moderationReport.count({ where: { targetId: ALPHA.id, targetType: "LIGUE", reporterId: MEMBER.id } }))).toBe(1);
  });

  test("[chef, commissaire, modo] « Modifier » ; [chef, modo] « Transférer la propriété » et « Supprimer la ligue »", async ({ page }) => {
    const expectations = [
      { who: CHEF.id, edit: true, manage: true },
      { who: COMM.id, edit: true, manage: false },
      { who: E2E.modoId, edit: true, manage: true },
      { who: MEMBER.id, edit: false, manage: false },
      { who: null, edit: false, manage: false },
    ];
    for (const expectation of expectations) {
      await page.context().clearCookies();
      if (expectation.who) await loginAs(page, expectation.who);
      await page.goto(`/ligue/${ALPHA.id}`, { waitUntil: "networkidle" });
      const edit = await findAction(page, /^Modifier/);
      if (expectation.edit) {
        expect(edit, `Modifier pour ${expectation.who}`).not.toBeNull();
        await expect(edit!).toHaveAttribute("href", `/ligue/edit/${ALPHA.id}`);
        await page.keyboard.press("Escape");
      } else {
        expect(edit, `Modifier pour ${expectation.who}`).toBeNull();
      }
      await page.goto(`/ligue/${ALPHA.id}`, { waitUntil: "networkidle" });
      const transfer = await findAction(page, /Transférer/);
      expect(transfer !== null, `Transférer pour ${expectation.who}`).toBe(expectation.manage);
      if (transfer) await page.keyboard.press("Escape");
      await page.goto(`/ligue/${ALPHA.id}`, { waitUntil: "networkidle" });
      const remove = await findAction(page, /Supprimer la ligue/);
      expect(remove !== null, `Supprimer pour ${expectation.who}`).toBe(expectation.manage);
      if (remove) await page.keyboard.press("Escape");
    }

    // Le chef transfère une ligue à un autre membre
    await page.context().clearCookies();
    await loginAs(page, CHEF.id);
    await page.goto(`/ligue/${TRANSFER.id}`, { waitUntil: "networkidle" });
    await (await findAction(page, /Transférer/))!.click();
    const transferDialog = page.getByRole("dialog", { name: /Transférer/ });
    await expect(transferDialog).toBeVisible();
    await transferDialog.getByRole("textbox", { name: /nouveau chef|Rechercher/i }).fill("Héritier Ligue");
    await transferDialog.getByText(HEIR.name, { exact: true }).first().click();
    await transferDialog.getByRole("button", { name: /^(Transférer|Confirmer)/ }).click();
    await expect.poll(() => db((prisma) => prisma.ligue.findUnique({ where: { id: TRANSFER.id }, select: { creatorId: true } }))).toEqual({ creatorId: HEIR.id });

    // Un modérateur supprime une ligue
    await page.context().clearCookies();
    await loginAs(page, E2E.modoId);
    await page.goto(`/ligue/${DOOMED.id}`, { waitUntil: "networkidle" });
    await (await findAction(page, /Supprimer la ligue/))!.click();
    const deleteDialog = page.getByRole("dialog", { name: /Supprimer/ });
    await expect(deleteDialog).toBeVisible();
    await deleteDialog.getByRole("button", { name: /^(Supprimer|Confirmer)/ }).click();
    await page.waitForURL(/\/ligues$/);
    await expect.poll(() => db((prisma) => prisma.ligue.count({ where: { id: DOOMED.id } }))).toBe(0);
  });

  test("[chef, commissaire, modo] /ligue/edit/[id] : même formulaire, enregistré", async ({ page }, testInfo) => {
    // Le chef : formulaire prérempli, commissaires modifiables
    await loginAs(page, CHEF.id);
    await page.goto(`/ligue/edit/${ALPHA.id}`, { waitUntil: "networkidle" });
    const field = (role: "textbox" | "combobox", name: RegExp) => page.getByRole(role, { name }).filter({ visible: true }).first();
    await expect(field("textbox", /^Nom/)).toHaveValue(ALPHA.name);
    await expect(field("textbox", /^Acronyme/)).toHaveValue(ALPHA.acronym);
    await expect(field("combobox", /^Zone/)).toHaveValue(ALPHA.geographicalZone);
    await expect(field("combobox", /^Région/)).toHaveValue(ALPHA.region);
    await expect(field("combobox", /^Département/)).toHaveValue(ALPHA.departement);
    await expect(field("textbox", /^Ville/)).toHaveValue(ALPHA.ville);
    await expect(field("textbox", /^Adresse/)).toHaveValue(ALPHA.address);
    await expect(field("textbox", /Description|Présentation/)).toHaveValue(ALPHA.description);
    await expect(page.getByRole("button", { name: /Choisir sur la carte/ }).filter({ visible: true })).toHaveCount(1);
    await expect(page.getByRole("button", { name: /blason/i }).filter({ visible: true }).first()).toBeVisible();
    await expect(field("textbox", /commissaire/i)).toBeVisible();
    await expect(page.getByText(COMM.name).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("ligue-modification.png"), fullPage: true });
    await field("textbox", /^Ville/).fill("Saint-Malo");
    await leaveField(page);
    await page.getByRole("button", { name: /Enregistrer/ }).filter({ visible: true }).first().click();
    await expect(page.getByText(/mise à jour/i).first()).toBeVisible();
    await expect.poll(() => db((prisma) => prisma.ligue.findUnique({ where: { id: ALPHA.id }, select: { ville: true } }))).toEqual({ ville: "Saint-Malo" });
    // Le commissaire est resté en place
    expect(await db((prisma) => prisma.ligue.findUnique({ where: { id: ALPHA.id }, select: { commissaires: { select: { id: true } } } }))).toEqual({ commissaires: [{ id: COMM.id }] });

    // Le commissaire : même formulaire, sans pouvoir changer les commissaires
    await page.context().clearCookies();
    await loginAs(page, COMM.id);
    await page.goto(`/ligue/edit/${ALPHA.id}`, { waitUntil: "networkidle" });
    await expect(field("textbox", /^Nom/)).toHaveValue(ALPHA.name);
    await expect(page.getByRole("textbox", { name: /commissaire/i }).filter({ visible: true })).toHaveCount(0);
    await expect(page.getByText(/Seul le chef de ligue/).first()).toBeVisible();
    await field("textbox", /^Ville/).fill("Rennes");
    await leaveField(page);
    await page.getByRole("button", { name: /Enregistrer/ }).filter({ visible: true }).first().click();
    await expect.poll(() => db((prisma) => prisma.ligue.findUnique({ where: { id: ALPHA.id }, select: { ville: true } }))).toEqual({ ville: "Rennes" });

    // Le modérateur ouvre aussi le formulaire
    await page.context().clearCookies();
    await loginAs(page, E2E.modoId);
    await page.goto(`/ligue/edit/${ALPHA.id}`, { waitUntil: "networkidle" });
    await expect(field("textbox", /^Nom/)).toHaveValue(ALPHA.name);

    // Un simple membre est renvoyé vers la fiche ; un visiteur vers la connexion
    await page.context().clearCookies();
    await loginAs(page, MEMBER.id);
    await page.goto(`/ligue/edit/${ALPHA.id}`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(new RegExp(`/ligue/${ALPHA.id}$`));
    await page.context().clearCookies();
    await page.goto(`/ligue/edit/${ALPHA.id}`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("[tous] /carte : carte, bascule Tournois et Ligues, plein écran, zoom, bulle avec « Détails »", async ({ page }, testInfo) => {
    await page.goto("/carte", { waitUntil: "networkidle" });
    // Zoom de la carte (boutons de la bibliothèque Leaflet)
    const zoomIn = page.getByRole("button", { name: /Zoom in|Zoomer/i }).filter({ visible: true }).first();
    await expect(zoomIn).toBeVisible();
    await expect(page.getByRole("button", { name: /Zoom out|Dézoomer/i }).filter({ visible: true }).first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("carte.png"), fullPage: false });

    // Tournois : le repère du tournoi de la ligue Alpha ouvre une bulle avec un lien « Détails »
    await page.getByRole("button", { name: /^Tournois/ }).filter({ visible: true }).first().click();
    const tournamentMarker = page.getByRole("button", { name: tournamentName(1) });
    await expect(tournamentMarker).toBeAttached();
    await tournamentMarker.dispatchEvent("click");
    const tournamentDetails = page.getByRole("link", { name: /Détails/ }).filter({ visible: true }).first();
    await expect(tournamentDetails).toBeVisible();
    await expect(tournamentDetails).toHaveAttribute("href", "/tournois");

    // Ligues
    await page.getByRole("button", { name: /^Ligues/ }).filter({ visible: true }).first().click();
    const ligueMarker = page.getByRole("button", { name: ALPHA.name });
    await expect(ligueMarker).toBeAttached();
    await expect(page.getByRole("button", { name: tournamentName(1) })).toHaveCount(0);
    await ligueMarker.dispatchEvent("click");
    const ligueDetails = page.getByRole("link", { name: /Détails/ }).filter({ visible: true }).first();
    await expect(ligueDetails).toBeVisible();
    await expect(ligueDetails).toHaveAttribute("href", `/ligue/${ALPHA.id}`);
    await page.screenshot({ path: testInfo.outputPath("carte-bulle.png"), fullPage: false });

    // Zoom
    await zoomIn.click();

    // Plein écran, puis retour
    await page.getByRole("button", { name: /^Plein écran/ }).filter({ visible: true }).first().click();
    const exit = page.getByRole("button", { name: /Quitter le plein écran/ }).filter({ visible: true }).first();
    await expect(exit).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("carte-plein-ecran.png"), fullPage: false });
    await exit.click();
    await expect(page.getByRole("button", { name: /^Plein écran/ }).filter({ visible: true }).first()).toBeVisible();
  });
});
