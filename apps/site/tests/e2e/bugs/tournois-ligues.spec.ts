/**
 * Corrections des défauts trouvés pendant la refonte, lot « tournois, ligues et carte » (cartes 129, 130, 131, 136,
 * 137 et 138). Chaque test vérifie le comportement corrigé décrit par sa carte :
 * - 129 : le filtre de région de `/tournois` trouve un tournoi en « Île-de-France » (nom accentué), et une ancienne
 *   adresse écrite sans accents (« ?region=Ile-de-France ») est renvoyée vers le nom accentué ;
 * - 130 : le filtre « Places restantes min. » compte les places encore libres (maximum moins inscriptions) ;
 * - 131 : modifier un tournoi rattaché à une ligue du site, sans toucher à la ligue, garde le rattachement ;
 * - 136 : un coach qui a quitté un groupe de la messagerie n'est plus affiché ni compté parmi les participants ;
 * - 137 : modifier une ligue garde son lien Google Maps, et son département est enregistré par son numéro (« 35 ») ;
 * - 138 : les repères de `/carte` sont servis par le site lui-même, et les résultats de la recherche de membre
 *   (`UserSearch`) sont des boutons qu'on choisit au clavier.
 *
 * Les éléments sont cherchés par leur rôle et leur nom accessible. Toutes les données créées portent un identifiant
 * qui commence par « e2e_bugtl_ » ou un nom qui commence par « Bug TL », et sont supprimées avant et après les tests.
 */
import { test, expect, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

/**
 * Accès à la base de test, avec de nouveaux essais : la petite base locale coupe parfois une connexion pendant que le
 * site garde la sienne (même aide que dans les tests d'inventaire).
 */
async function db<T>(run: Parameters<typeof withTestDb<T>>[0]): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await withTestDb(run);
    } catch (error) {
      const cut = error instanceof Error && /Connection terminated|ECONNRESET|ConnectionClosed|bind message supplies/.test(error.message);
      if (!cut || attempt >= 10) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

/** Date située `days` jours après aujourd'hui (avant si le nombre est négatif). */
const inDays = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const ORGA = { id: "e2e_bugtl_orga", name: "Bug TL Organisateur" };
const MEMBER_A = { id: "e2e_bugtl_membre_a", name: "Bug TL Membre A" };
const MEMBER_B = { id: "e2e_bugtl_membre_b", name: "Bug TL Membre B" };
const HEIR = { id: "e2e_bugtl_heritier", name: "Bug TL Héritier" };
const FILLER_COUNT = 18;
const fillerId = (n: number) => `e2e_bugtl_inscrit_${String(n).padStart(2, "0")}`;

/** Tournoi en Île-de-France (carte 129), placé sur la carte (carte 138). */
const IDF = { id: "e2e_bugtl_idf", name: "Bug TL Tournoi francilien", lat: 48.85, lng: 2.35 };
/** Tournoi de 20 places dont 18 prises (carte 130). */
const FULL = { id: "e2e_bugtl_presque_complet", name: "Bug TL Presque complet" };
/** Tournoi de 20 places dont 2 prises (carte 130). */
const ROOMY = { id: "e2e_bugtl_places_libres", name: "Bug TL Places libres" };
/** Tournoi rattaché à une ligue du site, avec son sujet du forum (carte 131). */
const LINKED = { id: "e2e_bugtl_rattache", topic: "e2e_bugtl_topic_rattache", name: "Bug TL Tournoi de ligue" };
const LIGUE = { id: "e2e_bugtl_ligue", name: "Bug TL Ligue", acronym: "BTL" };
/** Ligue avec un lien Google Maps et un département enregistré à l'ancienne (carte 137). */
const OLD_LIGUE = {
  id: "e2e_bugtl_ligue_ancienne", name: "Bug TL Ligue ancienne", acronym: "BTLA",
  gmapsUrl: "https://maps.google.com/?q=Bug+TL", departement: "35 - Ille-et-Vilaine",
};
/** Groupe de la messagerie dont un membre est parti (carte 136). */
const GROUP = { id: "e2e_bugtl_groupe", name: "Bug TL Groupe" };

/** Données de référence nécessaires aux formulaires et aux filtres (créées seulement si elles manquent). */
const REFERENCE_DATA = [
  { group: "REGION_FRANCE", key: "Île-de-France", label: "Île-de-France" },
  { group: "REGION_FRANCE", key: "Bretagne", label: "Bretagne" },
  { group: "DEPARTEMENT_FRANCE", key: "75", label: "75 - Paris" },
  { group: "DEPARTEMENT_FRANCE", key: "35", label: "35 - Ille-et-Vilaine" },
  { group: "COACH_REGION", key: "R2-NO", label: "R2 - Nord-Ouest" },
];

const USER_IDS = [ORGA.id, MEMBER_A.id, MEMBER_B.id, HEIR.id, ...Array.from({ length: FILLER_COUNT }, (_, i) => fillerId(i + 1))];

/** Supprime tout ce que ce fichier a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await db(async (prisma) => {
    const tournaments = await prisma.tournament.findMany({
      where: { OR: [{ id: { startsWith: "e2e_bugtl_" } }, { name: { startsWith: "Bug TL" } }] },
      select: { id: true },
    });
    const tournamentIds = tournaments.map((tournament) => tournament.id);
    const topicWhere = { OR: [{ id: { startsWith: "e2e_bugtl_" } }, { tournamentId: { in: tournamentIds } }] };
    await prisma.topicView.deleteMany({ where: { topic: topicWhere } });
    await prisma.topicFollow.deleteMany({ where: { topic: topicWhere } });
    await prisma.post.deleteMany({ where: { topic: topicWhere } });
    await prisma.topic.deleteMany({ where: topicWhere });
    await prisma.tournamentRegistration.deleteMany({ where: { tournamentId: { in: tournamentIds } } });
    await prisma.tournament.deleteMany({ where: { id: { in: tournamentIds } } });
    await prisma.ligue.deleteMany({ where: { id: { startsWith: "e2e_bugtl_" } } });
    // Les messages et les participants sont supprimés avec leur conversation (suppression en cascade)
    await prisma.conversation.deleteMany({ where: { participants: { some: { userId: { in: USER_IDS } } } } });
    await prisma.privateMessage.deleteMany({ where: { authorId: { in: USER_IDS } } });
    await prisma.referenceData.deleteMany({ where: { id: { startsWith: "e2e_bugtl_" } } });
    await prisma.user.deleteMany({ where: { id: { in: USER_IDS } } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await db(async (prisma) => {
    const base = { hasFinishedOnboarding: true };
    await prisma.user.createMany({
      data: [
        { ...base, id: ORGA.id, name: ORGA.name, email: "bugtl-orga@e2e.test" },
        { ...base, id: MEMBER_A.id, name: MEMBER_A.name, email: "bugtl-a@e2e.test" },
        { ...base, id: MEMBER_B.id, name: MEMBER_B.name, email: "bugtl-b@e2e.test" },
        { ...base, id: HEIR.id, name: HEIR.name, email: "bugtl-heritier@e2e.test" },
        ...Array.from({ length: FILLER_COUNT }, (_, i) => ({ ...base, id: fillerId(i + 1), name: `Bug TL Inscrit ${i + 1}`, email: `bugtl-inscrit-${i + 1}@e2e.test` })),
      ],
    });

    for (const [index, item] of REFERENCE_DATA.entries()) {
      // Une donnée déjà présente (base de développement) est gardée telle quelle
      const exists = await prisma.referenceData.findUnique({ where: { group_key: { group: item.group, key: item.key } } });
      if (!exists) await prisma.referenceData.create({ data: { id: `e2e_bugtl_ref_${index}`, ...item, order: 100 + index } });
    }

    const tournament = { location: "Salle des fêtes", organizerId: ORGA.id };
    await prisma.tournament.create({
      data: { ...tournament, id: IDF.id, name: IDF.name, date: inDays(40), ville: "Paris", region: "Île-de-France", departement: "75", lat: IDF.lat, lng: IDF.lng },
    });
    await prisma.tournament.create({ data: { ...tournament, id: FULL.id, name: FULL.name, date: inDays(41), maxParticipants: 20 } });
    await prisma.tournament.create({ data: { ...tournament, id: ROOMY.id, name: ROOMY.name, date: inDays(42), maxParticipants: 20 } });
    await prisma.tournamentRegistration.createMany({
      data: [
        ...Array.from({ length: FILLER_COUNT }, (_, i) => ({ tournamentId: FULL.id, userId: fillerId(i + 1), status: "REGISTERED" as const })),
        { tournamentId: ROOMY.id, userId: fillerId(1), status: "REGISTERED" as const },
        { tournamentId: ROOMY.id, userId: fillerId(2), status: "PRE_REGISTERED" as const },
      ],
    });

    await prisma.ligue.create({ data: { id: LIGUE.id, name: LIGUE.name, acronym: LIGUE.acronym, creatorId: ORGA.id } });
    await prisma.tournament.create({ data: { ...tournament, id: LINKED.id, name: LINKED.name, date: inDays(43), ligueId: LIGUE.id, price: 10 } });
    await prisma.topic.create({
      data: {
        id: LINKED.topic, title: LINKED.name, forumId: E2E.forumId, authorId: ORGA.id, tournamentId: LINKED.id,
        posts: { create: { id: `${LINKED.topic}_p1`, content: `Présentation de ${LINKED.name}`, authorId: ORGA.id } },
      },
    });

    await prisma.ligue.create({
      data: {
        id: OLD_LIGUE.id, name: OLD_LIGUE.name, acronym: OLD_LIGUE.acronym, creatorId: ORGA.id, geographicalZone: "R2-NO",
        region: "Bretagne", departement: OLD_LIGUE.departement, ville: "Rennes", address: "1 place de la Mairie",
        lat: 48.11, lng: -1.68, gmapsUrl: OLD_LIGUE.gmapsUrl,
      },
    });

    // Groupe de trois membres ; le membre B l'a quitté (participation marquée supprimée)
    await prisma.conversation.create({
      data: {
        id: GROUP.id, name: GROUP.name, isGroup: true,
        participants: {
          create: [
            { userId: ORGA.id, isAdmin: true },
            { userId: MEMBER_A.id },
            { userId: MEMBER_B.id, deletedAt: new Date() },
          ],
        },
        messages: { create: { content: "Bug TL bienvenue dans le groupe", authorId: MEMBER_A.id } },
      },
    });
  });
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis.
test.beforeEach(async ({ page }) => {
  test.slow();
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
});

/** Les tournois affichés dans la liste dont le nom commence par « Bug TL ». */
const tournamentLink = (page: Page, name: string) => page.getByRole("link", { name: new RegExp(name) }).filter({ visible: true });

test("129 : le filtre de région trouve un tournoi en Île-de-France, ancienne adresse sans accents comprise", async ({ page }) => {
  const query = (region: string) => `/tournois?${new URLSearchParams({ query: "Bug TL", region }).toString()}`;

  await page.goto(query("Île-de-France"), { waitUntil: "networkidle" });
  await expect(tournamentLink(page, IDF.name).first()).toBeVisible();
  await expect(tournamentLink(page, FULL.name)).toHaveCount(0);

  // La liste des régions du filtre est celle du formulaire de tournoi : le nom accentué est proposé et choisi
  const regionSelect = page.getByRole("combobox", { name: /^Région/ }).filter({ visible: true });
  if ((await regionSelect.count()) > 0) {
    await expect(regionSelect.first()).toHaveValue("Île-de-France");
  }

  // Ancienne adresse : renvoyée vers le nom accentué, le tournoi est trouvé
  await page.goto(query("Ile-de-France"), { waitUntil: "networkidle" });
  await expect.poll(() => new URL(page.url()).searchParams.get("region")).toBe("Île-de-France");
  await expect(tournamentLink(page, IDF.name).first()).toBeVisible();
});

test("130 : « Places restantes min. » compte les places encore libres", async ({ page }) => {
  await page.goto(`/tournois?${new URLSearchParams({ query: "Bug TL", minPlaces: "5" }).toString()}`, { waitUntil: "networkidle" });
  // 20 places, 2 prises : 18 restantes
  await expect(tournamentLink(page, ROOMY.name).first()).toBeVisible();
  // 20 places, 18 prises : 2 restantes seulement
  await expect(tournamentLink(page, FULL.name)).toHaveCount(0);

  // Avec un seuil de 2, le tournoi presque complet réapparaît
  await page.goto(`/tournois?${new URLSearchParams({ query: "Bug TL", minPlaces: "2" }).toString()}`, { waitUntil: "networkidle" });
  await expect(tournamentLink(page, FULL.name).first()).toBeVisible();
});

test("131 : modifier un tournoi sans toucher à la ligue garde le rattachement", async ({ page }) => {
  await loginAs(page, ORGA.id);
  await page.goto(`/forum/edit-tournament/${LINKED.id}`, { waitUntil: "networkidle" });

  // La ligue rattachée est affichée déjà choisie, avec sa croix de retrait
  await expect(page.getByRole("button", { name: `Retirer ${LIGUE.acronym}` }).filter({ visible: true }).first()).toBeVisible();

  const price = page.getByRole("spinbutton", { name: /^Prix (d'|de l')?inscription/i }).first();
  await price.fill("12");
  await page.getByRole("button", { name: "Enregistrer les modifications" }).filter({ visible: true }).first().click();
  await page.waitForURL(new RegExp(`/forum/topic/${LINKED.topic}`), { timeout: 30_000 });

  await expect
    .poll(async () => db((prisma) => prisma.tournament.findUnique({ where: { id: LINKED.id }, select: { price: true, ligueId: true } })), { timeout: 30_000 })
    .toEqual({ price: 12, ligueId: LIGUE.id });
});

test("136 : un coach parti d'un groupe n'est plus affiché ni compté", async ({ page }) => {
  await loginAs(page, ORGA.id);
  await page.goto(`/messagerie?id=${GROUP.id}`, { waitUntil: "networkidle" });

  // En-tête du groupe : deux participants (l'organisateur et le membre A)
  await expect(page.getByText(/Groupe · 2 participants/).filter({ visible: true }).first()).toBeVisible();
  const participantsButton = page.getByRole("button", { name: "Participants (2)" }).filter({ visible: true }).first();
  await expect(participantsButton).toBeVisible();

  // Liste des participants : le membre A y est, le membre B (parti) n'y est plus
  await participantsButton.click();
  const panel = page.getByRole("dialog", { name: /Participants/ });
  await expect(panel).toBeVisible();
  await expect(panel.getByText(MEMBER_A.name).first()).toBeVisible();
  await expect(panel.getByText(MEMBER_B.name)).toHaveCount(0);
  await page.keyboard.press("Escape");

  // La liste des conversations ne le compte plus non plus (sur ordinateur, elle est à côté de la conversation)
  await page.goto("/messagerie", { waitUntil: "networkidle" });
  const groupLink = page.getByRole("link").filter({ hasText: GROUP.name }).filter({ visible: true }).first();
  await expect(groupLink).toBeVisible();
  await expect(groupLink).toContainText("2 participants");
  await expect(groupLink).not.toContainText(MEMBER_B.name);
});

test("137 : modifier une ligue garde son lien Google Maps et enregistre le numéro du département", async ({ page }) => {
  await loginAs(page, ORGA.id);
  await page.goto(`/ligue/edit/${OLD_LIGUE.id}`, { waitUntil: "networkidle" });

  // L'ancien libellé « 35 - Ille-et-Vilaine » est repris comme le département numéro 35
  const department = page.getByRole("combobox", { name: /^Département/ }).filter({ visible: true }).first();
  await expect(department).toHaveValue("35");

  const town = page.getByRole("textbox", { name: /^Ville/ }).filter({ visible: true }).first();
  await town.fill("Saint-Malo");
  await town.press("Tab");
  await page.getByRole("button", { name: /Enregistrer/ }).filter({ visible: true }).first().click();

  await expect
    .poll(async () => db((prisma) => prisma.ligue.findUnique({ where: { id: OLD_LIGUE.id }, select: { ville: true, gmapsUrl: true, departement: true } })), { timeout: 30_000 })
    .toEqual({ ville: "Saint-Malo", gmapsUrl: OLD_LIGUE.gmapsUrl, departement: "35" });
});

test("138 : les repères de /carte sont servis par le site", async ({ page }) => {
  const outsideIcons: string[] = [];
  page.on("request", (request) => {
    if (/raw\.githubusercontent\.com|cdnjs\.cloudflare\.com|unpkg\.com/.test(request.url())) outsideIcons.push(request.url());
  });

  await page.goto("/carte", { waitUntil: "networkidle" });
  const marker = page.getByAltText(IDF.name).first();
  await expect(marker).toBeAttached();
  await expect(marker).toHaveAttribute("src", /^\/images\/carte\/marker-red\.svg$/);
  expect(outsideIcons).toEqual([]);

  // Les images existent bien sur le site
  for (const path of ["/images/carte/marker-red.svg", "/images/carte/marker-gold.svg", "/images/carte/marker-shadow.svg"]) {
    const response = await page.request.get(path);
    expect(response.status(), path).toBe(200);
  }
});

test("138 : les résultats de la recherche de membre se choisissent au clavier", async ({ page }) => {
  await loginAs(page, ORGA.id);
  await page.goto(`/ligue/${OLD_LIGUE.id}`, { waitUntil: "networkidle" });

  // « Transférer la propriété » : entrée du menu des actions de la ligue (menu sur ordinateur, panneau sur téléphone)
  await page.getByRole("button", { name: "Actions de la ligue" }).filter({ visible: true }).first().click();
  await page
    .getByRole("menuitem", { name: /Transférer la propriété/ })
    .or(page.getByRole("dialog").getByRole("button", { name: /Transférer la propriété/ }))
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: /Transférer/ });
  await expect(dialog).toBeVisible();

  const search = dialog.getByRole("textbox", { name: /nouveau chef/i });
  await search.fill("Bug TL Hérit");
  const result = dialog.getByRole("group", { name: "Membres trouvés" }).getByRole("button", { name: HEIR.name });
  await expect(result).toBeVisible();

  // Tab mène du champ au premier résultat, Entrée le choisit
  await search.focus();
  await page.keyboard.press("Tab");
  await expect(result).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog.getByRole("button", { name: `Retirer ${HEIR.name}` })).toBeVisible();

  // On annule : la ligue garde son chef
  await dialog.getByRole("button", { name: "Annuler" }).click();
  expect(await db((prisma) => prisma.ligue.findUnique({ where: { id: OLD_LIGUE.id }, select: { creatorId: true } }))).toEqual({ creatorId: ORGA.id });
});
