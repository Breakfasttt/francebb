/**
 * Corrections des défauts trouvés pendant la refonte, deuxième vague, lot « forum et tournois » (cartes 149 et 150).
 * Chaque test vérifie le comportement corrigé décrit par sa carte :
 * - 149 : l'écran de réponse d'un sujet verrouillé renvoie un membre ordinaire vers le sujet (un modérateur peut
 *   toujours répondre), et un visiteur qui ouvre l'écran de nouveau sujet est envoyé vers la page de connexion, qui
 *   le ramènera ensuite sur cet écran (paramètre `callbackUrl`) ;
 * - 150 : la liste `/tournois` affiche « x / y places » d'après les inscriptions réelles (liste d'attente exclue), et
 *   le choix du lieu sur une carte (`MapPicker`) affiche un repère servi par le site, sans rien demander à unpkg.com.
 *
 * Les éléments sont cherchés par leur rôle et leur nom accessible. Toutes les données créées portent un identifiant
 * qui commence par « e2e_bugv2_ » ou un nom qui commence par « Bug V2 », et sont supprimées avant et après les tests.
 */
import { test, expect, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

/**
 * Accès à la base de test, avec de nouveaux essais : la petite base locale coupe parfois une connexion pendant que le
 * site garde la sienne (même aide que dans les autres tests de ce dossier).
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

/** Date située `days` jours après aujourd'hui. */
const inDays = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

/** Membre ordinaire (rôle par défaut), auteur des données du fichier. */
const MEMBER = { id: "e2e_bugv2_membre", name: "Bug V2 Membre" };
const FILLER_COUNT = 4;
const fillerId = (n: number) => `e2e_bugv2_inscrit_${n}`;
const USER_IDS = [MEMBER.id, ...Array.from({ length: FILLER_COUNT }, (_, i) => fillerId(i + 1))];

/** Sujet verrouillé du forum de test (carte 149). */
const LOCKED_TOPIC = { id: "e2e_bugv2_verrou", title: "Bug V2 sujet verrouillé" };
/** Tournoi de 20 places : 3 inscrits et 1 en liste d'attente, rien dans le nombre importé de l'ancien site (carte 150). */
const RECENT = { id: "e2e_bugv2_recent", name: "Bug V2 Tournoi récent" };
/** Ancien tournoi de 10 places : aucune inscription sur le site, 7 places prises d'après l'ancien site (carte 150). */
const OLD = { id: "e2e_bugv2_ancien", name: "Bug V2 Tournoi ancien" };

/** Supprime tout ce que ce fichier a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await db(async (prisma) => {
    const topicWhere = { id: { startsWith: "e2e_bugv2_" } };
    await prisma.topicView.deleteMany({ where: { OR: [{ userId: { in: USER_IDS } }, { topic: topicWhere }] } });
    await prisma.topicFollow.deleteMany({ where: { OR: [{ userId: { in: USER_IDS } }, { topic: topicWhere }] } });
    await prisma.post.deleteMany({ where: { OR: [{ topic: topicWhere }, { authorId: { in: USER_IDS } }] } });
    await prisma.topic.deleteMany({ where: topicWhere });
    const tournamentWhere = { OR: [{ id: { startsWith: "e2e_bugv2_" } }, { name: { startsWith: "Bug V2" } }] };
    await prisma.tournamentRegistration.deleteMany({ where: { tournament: tournamentWhere } });
    await prisma.tournament.deleteMany({ where: tournamentWhere });
    await prisma.user.deleteMany({ where: { id: { in: USER_IDS } } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await db(async (prisma) => {
    const base = { hasFinishedOnboarding: true };
    await prisma.user.createMany({
      data: [
        { ...base, id: MEMBER.id, name: MEMBER.name, email: "bugv2-membre@e2e.test" },
        ...Array.from({ length: FILLER_COUNT }, (_, i) => ({ ...base, id: fillerId(i + 1), name: `Bug V2 Inscrit ${i + 1}`, email: `bugv2-inscrit-${i + 1}@e2e.test` })),
      ],
    });

    await prisma.topic.create({
      data: {
        id: LOCKED_TOPIC.id, title: LOCKED_TOPIC.title, forumId: E2E.forumId, authorId: MEMBER.id, isLocked: true,
        posts: { create: { id: `${LOCKED_TOPIC.id}_p1`, content: "Message du sujet verrouillé", authorId: MEMBER.id } },
      },
    });

    const tournament = { location: "Salle des fêtes", ville: "Rennes", organizerId: MEMBER.id };
    await prisma.tournament.create({ data: { ...tournament, id: RECENT.id, name: RECENT.name, date: inDays(50), maxParticipants: 20 } });
    await prisma.tournament.create({
      data: { ...tournament, id: OLD.id, name: OLD.name, date: inDays(51), maxParticipants: 10, currentParticipants: 7 },
    });
    await prisma.tournamentRegistration.createMany({
      data: [
        { tournamentId: RECENT.id, userId: fillerId(1), status: "REGISTERED" as const },
        { tournamentId: RECENT.id, userId: fillerId(2), status: "REGISTERED" as const },
        { tournamentId: RECENT.id, userId: fillerId(3), status: "PRE_REGISTERED" as const },
        { tournamentId: RECENT.id, userId: fillerId(4), status: "WAITING_LIST" as const },
      ],
    });
  });
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis.
test.beforeEach(async ({ page }) => {
  test.slow();
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
});

test("149 : l'écran de réponse d'un sujet verrouillé renvoie un membre ordinaire vers le sujet", async ({ page }) => {
  await loginAs(page, MEMBER.id);
  await page.goto(`/forum/topic/${LOCKED_TOPIC.id}/reply`, { waitUntil: "networkidle" });
  await expect.poll(() => new URL(page.url()).pathname).toBe(`/forum/topic/${LOCKED_TOPIC.id}`);
  // Pas d'éditeur de réponse : le membre n'a rien pu écrire
  await expect(page.getByRole("heading", { name: "Répondre au sujet" })).toHaveCount(0);
});

test("149 : un modérateur peut toujours ouvrir l'écran de réponse d'un sujet verrouillé", async ({ page }) => {
  await loginAs(page, E2E.modoId);
  await page.goto(`/forum/topic/${LOCKED_TOPIC.id}/reply`, { waitUntil: "networkidle" });
  await expect.poll(() => new URL(page.url()).pathname).toBe(`/forum/topic/${LOCKED_TOPIC.id}/reply`);
  await expect(page.getByRole("heading", { name: "Répondre au sujet" }).first()).toBeVisible();
});

test("149 : un visiteur qui ouvre l'écran de nouveau sujet est envoyé vers la connexion", async ({ page }) => {
  const wanted = `/forum/new-topic?forumId=${E2E.forumId}`;
  await page.goto(wanted, { waitUntil: "networkidle" });
  await expect.poll(() => new URL(page.url()).pathname).toBe("/auth/login");
  // L'adresse demandée est gardée : après la connexion, le visiteur revient sur l'écran de nouveau sujet
  expect(new URL(page.url()).searchParams.get("callbackUrl")).toBe(wanted);
});

/** Lien d'un tournoi de la liste, quel que soit l'affichage (grille ou liste, téléphone ou ordinateur). */
const tournamentLink = (page: Page, name: string) => page.getByRole("link", { name: new RegExp(name) }).filter({ visible: true }).first();

test("150 : la liste des tournois compte les places d'après les inscriptions réelles", async ({ page }) => {
  // Affichage en grille (par défaut) : « x / y places » sur la carte du tournoi
  await page.goto(`/tournois?${new URLSearchParams({ query: "Bug V2" }).toString()}`, { waitUntil: "networkidle" });
  // 3 inscriptions (inscrits et préinscrits), la liste d'attente ne prend pas de place
  await expect(tournamentLink(page, RECENT.name)).toContainText("3 / 20 places");
  // Ancien tournoi sans inscription sur le site : le nombre importé de l'ancien site reste affiché
  await expect(tournamentLink(page, OLD.name)).toContainText("7 / 10 places");

  // Affichage en liste : même compte
  await page.goto(`/tournois?${new URLSearchParams({ query: "Bug V2", view: "list" }).toString()}`, { waitUntil: "networkidle" });
  await expect(tournamentLink(page, RECENT.name)).toContainText("3/20");
});

test("150 : le repère du choix de lieu sur une carte est servi par le site", async ({ page }) => {
  const outsideIcons: string[] = [];
  page.on("request", (request) => {
    if (/unpkg\.com/.test(request.url())) outsideIcons.push(request.url());
  });

  // Le choix du lieu (MapPicker) est le même pour une ligue et pour un tournoi : on passe par la création d'une ligue
  await loginAs(page, MEMBER.id);
  await page.goto("/ligues/create", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Choisir sur la carte/ }).filter({ visible: true }).first().click();
  const mapDialog = page.getByRole("dialog", { name: /Localisation|lieu/i });
  await expect(mapDialog).toBeVisible();

  // Un appui sur la carte place le repère
  await mapDialog.getByRole("group", { name: "Carte du lieu" }).click();
  const marker = mapDialog.getByAltText("Marker").first();
  await expect(marker).toBeAttached();
  await expect(marker).toHaveAttribute("src", /^\/images\/carte\/marker-red\.svg$/);
  expect(outsideIcons).toEqual([]);

  // Rien n'est enregistré : on ferme la fenêtre sans valider
  await page.keyboard.press("Escape");
});
