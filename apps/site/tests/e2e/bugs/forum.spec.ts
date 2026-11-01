/**
 * Corrections de bugs du forum relevés pendant la refonte : cartes 109, 110, 111, 112, 113 et 134.
 *
 * - 109 : une adresse de sujet avec un numéro de page trop grand (`?page=99`) affiche les messages de la dernière page.
 * - 110 : une citation faite avec le bouton « Citer » (balise en trois parties) est remplacée par un encart quand le
 *   message cité est modéré, puis supprimé.
 * - 111 : sur un sujet verrouillé, un membre ne voit pas « Citer » (il ne peut pas répondre) ; un modérateur, qui peut
 *   répondre, cite bien le message dans la réponse rapide.
 * - 112 : « @ » s'écrit dans l'éditeur ; il n'ouvre la recherche d'un membre qu'en début de mot, et Échap la ferme en
 *   gardant le « @ ».
 * - 113 : en taille téléphone, saisir un texte puis appuyer aussitôt sur le bouton d'envoi enregistre bien du premier
 *   coup (sans quitter le champ avant). Ce groupe force la taille téléphone, car la configuration ne rejoue en projet
 *   « telephone » que les tests d'inventaire et le test smoke.
 * - 134 : dans les résultats d'un tournoi, le nom d'un coach mène à sa fiche `/spy/<id>`.
 *
 * Toutes les données sont créées par le test (identifiants commençant par « e2e_bugf_ ») et supprimées à la fin.
 */
import { test, expect, devices, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";

const AUTHOR = { id: "e2e_bugf_auteur", name: "Auteur Bugs Forum" };
const READER = { id: "e2e_bugf_lecteur", name: "Lecteur Bugs Forum" };
const COACH = { id: "e2e_bugf_coach", name: "Coach Résultats Bugs" };

const PAGED_TOPIC = "e2e_bugf_pages";
const PAGED_POSTS = 25; // 20 messages par page : 2 pages
const QUOTE_TOPIC = "e2e_bugf_citation";
const QUOTED_POST = "e2e_bugf_cite";
const QUOTED_TEXT = "Texte du message cité par la carte 110";
const LOCKED_TOPIC = "e2e_bugf_verrou";
const LOCKED_POST = "e2e_bugf_verrou_p1";
const EDITOR_TOPIC = "e2e_bugf_editeur";
const TOURNAMENT = { id: "e2e_bugf_tournoi", topic: "e2e_bugf_tournoi_topic" };

const pagedPostId = (n: number) => `e2e_bugf_p${String(n).padStart(2, "0")}`;
const QUICK_REPLY_PLACEHOLDER = "Écrivez votre réponse ici...";
const REPLY_PLACEHOLDER = "Tapez votre réponse ici...";

/** Supprime tout ce que ce fichier a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await withTestDb(async (prisma) => {
    const topicWhere = { id: { startsWith: "e2e_bugf_" } };
    const users = [AUTHOR.id, READER.id, COACH.id];
    await prisma.topicView.deleteMany({ where: { OR: [{ userId: { in: users } }, { topic: topicWhere }] } });
    await prisma.topicFollow.deleteMany({ where: { OR: [{ userId: { in: users } }, { topic: topicWhere }] } });
    await prisma.mention.deleteMany({ where: { OR: [{ post: { topic: topicWhere } }, { mentionedUserId: { in: users } }] } });
    await prisma.postReaction.deleteMany({ where: { OR: [{ post: { topic: topicWhere } }, { userId: { in: users } }] } });
    await prisma.post.deleteMany({ where: { OR: [{ topic: topicWhere }, { authorId: { in: users } }] } });
    await prisma.topic.deleteMany({ where: topicWhere });
    await prisma.tournamentResult.deleteMany({ where: { tournamentId: TOURNAMENT.id } });
    await prisma.tournament.deleteMany({ where: { id: TOURNAMENT.id } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
  });
}

test.beforeAll(async () => {
  await cleanUp();
  await withTestDb(async (prisma) => {
    for (const user of [AUTHOR, READER, COACH]) {
      await prisma.user.create({ data: { id: user.id, name: user.name, email: `${user.id}@e2e.test`, hasFinishedOnboarding: true } });
    }

    // Dates dans le passé, une minute entre deux messages : l'ordre d'affichage est celui des numéros
    const base = Date.now() - 2 * 24 * 60 * 60_000;
    const at = (minutes: number) => new Date(base + minutes * 60_000);
    const topic = (id: string, title: string, extra: Record<string, unknown> = {}) =>
      prisma.topic.create({ data: { id, title, forumId: E2E.forumId, authorId: AUTHOR.id, createdAt: at(0), updatedAt: at(0), ...extra } });
    const post = (id: string, topicId: string, minute: number, content: string) =>
      prisma.post.create({ data: { id, topicId, content, authorId: AUTHOR.id, createdAt: at(minute), updatedAt: at(minute) } });

    await topic(PAGED_TOPIC, "Bugs forum : sujet de deux pages");
    for (let n = 1; n <= PAGED_POSTS; n++) {
      await post(pagedPostId(n), PAGED_TOPIC, n, `Message paginé numéro ${n}`);
    }

    await topic(QUOTE_TOPIC, "Bugs forum : citation");
    await post(QUOTED_POST, QUOTE_TOPIC, 1, QUOTED_TEXT);

    await topic(LOCKED_TOPIC, "Bugs forum : sujet verrouillé", { isLocked: true });
    await post(LOCKED_POST, LOCKED_TOPIC, 1, "Message du sujet verrouillé");

    await topic(EDITOR_TOPIC, "Bugs forum : éditeur");
    await post("e2e_bugf_editeur_p1", EDITOR_TOPIC, 1, "Message du sujet de l'éditeur");

    await prisma.tournament.create({
      data: { id: TOURNAMENT.id, name: "Tournoi des bugs du forum", date: at(0), location: "Rennes", organizerId: AUTHOR.id, isFinished: true },
    });
    await topic(TOURNAMENT.topic, "Bugs forum : tournoi terminé", { tournamentId: TOURNAMENT.id });
    await post("e2e_bugf_tournoi_p1", TOURNAMENT.topic, 1, "Présentation du tournoi des bugs");
    await prisma.tournamentResult.create({
      data: { tournamentId: TOURNAMENT.id, coachName: COACH.name, userId: COACH.id, rank: 1, wins: 3, points: 9 },
    });
  });
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
});

/** Bouton visible de ce nom (dans la page ou dans un panneau ouvert). */
const visibleButton = (page: Page, name: string | RegExp) =>
  page.getByRole("button", { name, exact: typeof name === "string" }).filter({ visible: true }).first();

test.describe("Carte 109 : numéro de page trop grand", () => {
  test("[tous] ?page=99 affiche les messages de la dernière page", async ({ page }) => {
    await page.goto(`/forum/topic/${PAGED_TOPIC}?page=99`, { waitUntil: "networkidle" });
    // Page 2 : messages 21 à 25 ; aucun message de la page 1
    await expect(page.getByText("Message paginé numéro 25", { exact: true })).toBeVisible();
    await expect(page.getByText("Message paginé numéro 21", { exact: true })).toBeVisible();
    await expect(page.locator(`#post-${pagedPostId(21)}`)).toHaveCount(1);
    await expect(page.getByText("Message paginé numéro 20", { exact: true })).toHaveCount(0);

    // Un numéro illisible ramène à la première page
    await page.goto(`/forum/topic/${PAGED_TOPIC}?page=abc`, { waitUntil: "networkidle" });
    await expect(page.getByText("Message paginé numéro 1", { exact: true })).toBeVisible();
  });
});

test.describe("Carte 110 : citation d'un message modéré ou supprimé", () => {
  test("[membre] la citation faite par « Citer » est remplacée par un encart", async ({ page }) => {
    // Le lecteur cite le message avec le bouton « Citer » et envoie la réponse rapide
    await loginAs(page, READER.id);
    await page.goto(`/forum/topic/${QUOTE_TOPIC}?page=1`, { waitUntil: "networkidle" });
    await page.locator(`#post-${QUOTED_POST}`).getByRole("button", { name: "Citer" }).click();
    const editor = page.getByPlaceholder(QUICK_REPLY_PLACEHOLDER);
    await expect(editor).toHaveValue(new RegExp(`^\\[quote=${AUTHOR.id}\\|${QUOTED_POST}\\|`));
    await editor.press("End");
    await editor.pressSequentially(" Réponse avec citation");
    await visibleButton(page, "Envoyer ma réponse").click();

    let replyId = "";
    await expect
      .poll(async () => {
        const reply = await withTestDb((prisma) => prisma.post.findFirst({ where: { topicId: QUOTE_TOPIC, authorId: READER.id }, select: { id: true } }));
        replyId = reply?.id ?? "";
        return replyId;
      }, { timeout: 30_000 })
      .not.toBe("");

    // Avant modération : le texte est visible deux fois (message d'origine et citation)
    await loginAs(page, E2E.coachId);
    await page.goto(`/forum/topic/${QUOTE_TOPIC}?page=1`, { waitUntil: "networkidle" });
    await expect(page.getByText(QUOTED_TEXT)).toHaveCount(2);

    // Message cité modéré : la citation ne montre plus son texte
    await withTestDb((prisma) => prisma.post.update({ where: { id: QUOTED_POST }, data: { isModerated: true, moderationReason: "Test de la carte 110" } }));
    await page.reload({ waitUntil: "networkidle" });
    const replyCard = page.locator(`#post-${replyId}`);
    await expect(replyCard.getByText("Le contenu de ce message a été masqué par la modération.")).toBeVisible();
    await expect(page.getByText(QUOTED_TEXT)).toHaveCount(0);

    // Message cité supprimé par son auteur : même chose, avec l'encart de suppression
    await withTestDb((prisma) => prisma.post.update({ where: { id: QUOTED_POST }, data: { isModerated: false, moderationReason: null, isDeleted: true } }));
    await page.reload({ waitUntil: "networkidle" });
    await expect(replyCard.getByText("Ce message a été supprimé par son auteur")).toBeVisible();
    await expect(replyCard.getByText(QUOTED_TEXT)).toHaveCount(0);
  });
});

test.describe("Carte 111 : « Citer » sur un sujet verrouillé", () => {
  test("[membre] pas de « Citer » ni de zone de réponse ; [modo] « Citer » remplit la réponse rapide", async ({ page }) => {
    await loginAs(page, READER.id);
    await page.goto(`/forum/topic/${LOCKED_TOPIC}?page=1`, { waitUntil: "networkidle" });
    await expect(page.getByText(/Vous ne pouvez plus répondre à ce sujet/)).toBeVisible();
    await expect(page.locator(`#post-${LOCKED_POST}`).getByRole("button", { name: "Citer" })).toHaveCount(0);
    await expect(page.locator("#quick-reply-area")).toHaveCount(0);

    await loginAs(page, E2E.modoId);
    await page.goto(`/forum/topic/${LOCKED_TOPIC}?page=1`, { waitUntil: "networkidle" });
    await page.locator(`#post-${LOCKED_POST}`).getByRole("button", { name: "Citer" }).click();
    await expect(page.getByPlaceholder(QUICK_REPLY_PLACEHOLDER)).toHaveValue(new RegExp(`^\\[quote=${AUTHOR.id}\\|${LOCKED_POST}\\|`));
  });
});

test.describe("Carte 112 : « @ » dans l'éditeur", () => {
  test("[membre] « @ » au milieu d'un mot s'écrit ; en début de mot, il ouvre aussi la mention", async ({ page }) => {
    await loginAs(page, READER.id);
    await page.goto(`/forum/topic/${EDITOR_TOPIC}/reply`, { waitUntil: "networkidle" });
    const textarea = page.getByRole("textbox", { name: REPLY_PLACEHOLDER });
    await expect(textarea).toBeVisible();
    const search = page.getByRole("textbox", { name: "Rechercher un membre", exact: true }).filter({ visible: true });

    // Adresse électronique : écrite telle quelle, sans ouvrir la recherche
    await textarea.click();
    await textarea.pressSequentially("jean@exemple.fr");
    await expect(textarea).toHaveValue("jean@exemple.fr");
    await expect(search).toHaveCount(0);

    // « @ » en début de mot : la recherche s'ouvre, le « @ » est écrit ; Échap la ferme et le garde
    await textarea.fill("Bonjour ");
    await textarea.press("End");
    await textarea.press("@");
    await expect(search.first()).toBeVisible();
    await expect(textarea).toHaveValue("Bonjour @");
    await page.keyboard.press("Escape");
    await expect(search).toHaveCount(0);
    await expect(textarea).toHaveValue("Bonjour @");
  });
});

test.describe("Carte 113 : appui juste après une saisie, sur téléphone", () => {
  // Taille téléphone forcée (le type de navigateur ne peut pas être choisi dans un groupe : il est retiré)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...pixel7 } = devices["Pixel 7"];
  test.use(pixel7);

  test("[membre] profil : saisir puis appuyer aussitôt sur « Sauvegarder le profil »", async ({ page }) => {
    await loginAs(page, READER.id);
    await page.goto("/profile?tab=edit", { waitUntil: "networkidle" });
    const team = page.getByRole("textbox", { name: "Équipe Blood Bowl principale" });
    await team.fill("Équipe de la carte 113");
    await expect(page.locator("html")).toHaveAttribute("data-typing", "true");
    // Pas de sortie du champ avant l'appui : c'est exactement le geste qui échouait
    await visibleButton(page, "Sauvegarder le profil").click();
    // L'appui a bien déclenché l'enregistrement : la réponse s'affiche. En mode hub, le passeport (absent pendant les
    // tests) refuse l'enregistrement ; sinon le profil est enregistré (même règle que inventaire/profil.spec.ts)
    await expect(page.getByText(/Profil mis à jour|passeport/).first()).toBeVisible({ timeout: 30_000 });
    // La barre basse finit par revenir
    await expect(page.locator("html")).not.toHaveAttribute("data-typing", "true");
  });

  test("[membre] sujet : saisir puis appuyer aussitôt sur « Envoyer ma réponse »", async ({ page }) => {
    await loginAs(page, READER.id);
    await page.goto(`/forum/topic/${EDITOR_TOPIC}?page=1`, { waitUntil: "networkidle" });
    await page.getByPlaceholder(QUICK_REPLY_PLACEHOLDER).fill("Réponse envoyée du premier coup");
    await visibleButton(page, "Envoyer ma réponse").click();
    await expect(page.getByText("Réponse envoyée du premier coup", { exact: true })).toBeVisible({ timeout: 20_000 });
  });
});

test.describe("Carte 134 : lien vers un coach dans les résultats d'un tournoi", () => {
  test("[tous] le nom du coach mène à /spy/<id>", async ({ page }) => {
    await page.goto(`/forum/topic/${TOURNAMENT.topic}?page=1`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Résultats du tournoi/ }).click();
    await expect(page.getByRole("link", { name: COACH.name })).toHaveAttribute("href", `/spy/${COACH.id}`);
  });
});
