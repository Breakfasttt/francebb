/**
 * Inventaire de la refonte, section 14 (BBQuizz) de docs/refonte/inventaire.md (carte 098) : l'écran d'accueil du jeu
 * `/bbquizz` (« Jouer », « Proposer une question », et pour la modération « Éditer » et « Valider »), une partie
 * (20 questions, chronomètre, score, 4 réponses, jokers 50/50, appel à la communauté et passer, « Suivant »), la fin
 * d'une partie (points gagnés, explication, écran de fin avec « Rejouer »), le classement (jour, semaine, tout temps),
 * la proposition d'une question `/bbquizz/proposer`, la validation des propositions `/bbquizz/valider` et l'édition des
 * questions `/bbquizz/editer` (recherche, modification, suppression).
 * Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet telephone). Les éléments sont cherchés
 * par leur rôle, leur nom accessible ou leur texte, jamais par une classe CSS : le test doit passer sans modification
 * avant et après la refonte de ces écrans.
 *
 * Quelques adaptations de la façon de trouver un élément, pas de ce qui est attendu :
 * - une action peut être un bouton, un lien ou une entrée du menu « Gestion du quizz » (`action`) ;
 * - un onglet du classement peut être un onglet ou, avant la refonte, un bouton (`tab`) ;
 * - la suppression d'une question peut passer par la fenêtre `confirm()` du navigateur (avant la refonte) ou par une
 *   fenêtre de confirmation du site (après).
 *
 * Données préparées par le test (et supprimées à la fin), toutes nommées « … Quizz Inv » ou « Inv Quizz … » :
 * - trois membres : un coach, un ancien joueur (meilleur score de tous les temps, partie vieille de 30 jours) et un
 *   modérateur ;
 * - des parties terminées pour le classement ; des propositions et des questions créées test par test.
 * Tant que la base ne contient aucune question, le jeu pioche dans les 300 questions de départ (partie de 20
 * questions). Pour vérifier la fin d'une partie, le test enregistre une seule question en base : la partie n'a alors
 * qu'une question, dont on connaît la bonne réponse et l'explication. Elle est supprimée aussitôt après, car le test
 * de sécurité (security.spec.ts) compte sur une base sans question.
 * Des captures sont enregistrées dans test-results/ pour la relecture humaine (pas de comparaison au pixel).
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { loginAs, withTestDb } from "../fixtures";

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

const MEMBER = { id: "e2e_quiz_membre", name: "Coach Quizz Inv" };
const VETERAN = { id: "e2e_quiz_ancien", name: "Ancien Quizz Inv" };
const MODO = { id: "e2e_quiz_modo", name: "Modo Quizz Inv", role: "MODERATOR" };
const USERS = [MEMBER, VETERAN, MODO];
const USER_IDS = USERS.map((user) => user.id);

/** Toutes les questions et propositions créées par ce test commencent par ce préfixe. */
const PREFIX = "Inv Quizz";

/** Supprime tout ce que ce test a créé (y compris un reste d'un lancement interrompu). */
async function cleanUp() {
  await db(async (prisma) => {
    await prisma.quizQuestion.deleteMany({ where: { question: { startsWith: PREFIX } } });
    await prisma.quizQuestionSuggestion.deleteMany({ where: { OR: [{ authorId: { in: USER_IDS } }, { question: { startsWith: PREFIX } }] } });
    await prisma.quizGame.deleteMany({ where: { userId: { in: USER_IDS } } });
    await prisma.quizAttempt.deleteMany({ where: { userId: { in: USER_IDS } } });
    await prisma.user.deleteMany({ where: { id: { in: USER_IDS } } });
  });
}

/** Retire les questions de ce test : le jeu repioche alors dans les questions de départ. */
async function removeQuestions() {
  await db((prisma) => prisma.quizQuestion.deleteMany({ where: { question: { startsWith: PREFIX } } }));
}

test.beforeAll(async () => {
  await cleanUp();
  const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  await db(async (prisma) => {
    for (const [index, user] of USERS.entries()) {
      await prisma.user.create({ data: { ...user, email: `bbquizz-${index}@e2e.test`, hasFinishedOnboarding: true } });
    }
    // Classement : le coach a joué aujourd'hui (4321 points), l'ancien joueur il y a 30 jours (9999 points)
    await prisma.quizAttempt.create({ data: { userId: MEMBER.id, score: 4321, correct: 18, total: 20, duration: 300 } });
    await prisma.quizAttempt.create({ data: { userId: VETERAN.id, score: 9999, correct: 20, total: 20, duration: 200, createdAt: monthAgo } });
    await prisma.user.update({ where: { id: MEMBER.id }, data: { quizBestScore: 4321, quizTotalScore: 4321, quizAttemptsCount: 1 } });
    await prisma.user.update({ where: { id: VETERAN.id }, data: { quizBestScore: 9999, quizTotalScore: 9999, quizAttemptsCount: 1 } });
  });
});

test.afterAll(cleanUp);

// Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis.
// Une partie attend les 5 secondes de lecture de chaque question : temps permis triplé (test.slow).
// La pastille des outils de développement de Next.js (`nextjs-portal`) est masquée : elle n'existe pas sur le site en
// ligne, et sur téléphone elle intercepterait les appuis sur les boutons placés en bas à gauche.
test.beforeEach(async ({ page }) => {
  test.slow();
  await removeQuestions();
  await page.addInitScript(() => {
    localStorage.setItem("bbfrance_cookie_consent", "accepted");
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = "nextjs-portal { display: none !important; }";
      document.head.appendChild(style);
    });
  });
});

test.afterEach(async () => {
  await removeQuestions();
  await db((prisma) => prisma.quizGame.deleteMany({ where: { userId: { in: USER_IDS } } }));
});

const visible = (locator: Locator) => locator.filter({ visible: true }).first();

/** Onglet du classement (un onglet ou, avant la refonte, un bouton). */
const tab = (page: Page, name: RegExp) => visible(page.getByRole("tab", { name }).or(page.getByRole("button", { name })));

const actionIn = (scope: Page | Locator, name: RegExp) =>
  scope.getByRole("button", { name }).or(scope.getByRole("link", { name })).or(scope.getByRole("menuitem", { name })).filter({ visible: true });

/**
 * Cherche une action de l'écran d'accueil du jeu : un bouton ou un lien de la page, sinon une entrée du menu
 * « Gestion du quizz ». Renvoie `null` si l'action n'existe pas ; le menu ouvert pour rien est refermé.
 */
async function action(page: Page, name: RegExp): Promise<Locator | null> {
  const direct = actionIn(page, name);
  if ((await direct.count()) > 0) return direct.first();
  const opener = page.getByRole("button", { name: /^Gestion du quizz/ }).filter({ visible: true });
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

const PLAY = /^(Commencer le quizz|Jouer)/;
const SUGGEST = /^Proposer/;
const EDIT = /^Éditer/;
const VALIDATE = /^Valid/;
const NEXT = /^(Continuer|Suivant)/;
const REPLAY = /^(Rejouer|Recommencer)/;

/** Ouvre l'écran d'accueil du jeu et attend le bouton pour jouer. */
async function openQuiz(page: Page) {
  await page.goto("/bbquizz", { waitUntil: "networkidle" });
  await expect(visible(page.getByRole("button", { name: PLAY }))).toBeVisible();
}

/** Les 4 boutons de réponse de la question affichée. */
const answers = (page: Page) => page.getByRole("group", { name: "Réponses" }).getByRole("button");

/** Nombre de réponses que l'on peut encore choisir. */
const enabledAnswers = (page: Page) => answers(page).evaluateAll((buttons) => buttons.filter((button) => !(button as HTMLButtonElement).disabled).length);

/** Attend la fin des 5 secondes de lecture : les réponses deviennent cliquables. */
async function waitForAnswering(page: Page) {
  await expect(answers(page).first()).toBeEnabled({ timeout: 10_000 });
}

/** Passe à la question suivante (le jeu y passe aussi seul après 5 secondes : le bouton peut avoir disparu). */
async function goNext(page: Page) {
  const next = visible(page.getByRole("button", { name: NEXT }));
  await expect(next).toBeVisible();
  await next.click({ timeout: 3000 }).catch(() => {});
}

/**
 * Supprime une question depuis `/bbquizz/editer` : accepte la fenêtre `confirm()` du navigateur (avant la refonte) ou
 * confirme dans la fenêtre du site (après).
 */
async function deleteQuestion(page: Page, question: string) {
  page.once("dialog", (dialog) => void dialog.accept());
  await visible(page.getByRole("button", { name: `Supprimer la question « ${question} »` })).click();
  const confirm = page.getByRole("dialog").getByRole("button", { name: /^Supprimer/ });
  if (await confirm.isVisible({ timeout: 2000 }).catch(() => false)) await confirm.click();
}

test.describe("Inventaire 14 : BBQuizz", () => {
  test("[visiteur] /bbquizz envoie vers la connexion", async ({ page }) => {
    await page.goto("/bbquizz");
    await expect(page).toHaveURL(/\/auth\/login\?callbackUrl=%2Fbbquizz|\/auth\/login\?callbackUrl=\/bbquizz/);
  });

  test("[membre] /bbquizz : Jouer, Proposer une question, classement Jour, Semaine, Tout temps", async ({ page }, testInfo) => {
    await loginAs(page, MEMBER.id);
    await openQuiz(page);
    expect(await action(page, SUGGEST), "action « Proposer une question »").not.toBeNull();
    expect(await action(page, EDIT), "action « Éditer » inattendue").toBeNull();
    expect(await action(page, VALIDATE), "action « Valider » inattendue").toBeNull();
    await page.screenshot({ path: testInfo.outputPath("bbquizz-accueil.png"), fullPage: false });

    // Classement du jour : le coach (aujourd'hui), pas l'ancien joueur (il y a 30 jours)
    const coach = () => visible(page.getByText(MEMBER.name, { exact: true }));
    const veteran = page.getByText(VETERAN.name, { exact: true }).filter({ visible: true });
    await tab(page, /Du jour|Jour/).click();
    await expect(coach()).toBeVisible();
    await expect(visible(page.getByText(/4321/))).toBeVisible();
    await expect(veteran).toHaveCount(0);

    // Semaine : toujours le coach seul
    await tab(page, /Semaine/).click();
    await expect(coach()).toBeVisible();
    await expect(veteran).toHaveCount(0);

    // Tout temps (Panthéon) : l'ancien joueur, meilleur score, est là aussi
    await tab(page, /Panthéon|Tout temps/).click();
    await expect(veteran.first()).toBeVisible();
    await expect(visible(page.getByText(/9999/))).toBeVisible();
    await expect(coach()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("bbquizz-classement.png"), fullPage: true });

    // « Proposer une question » mène au formulaire
    await (await action(page, SUGGEST))!.click();
    await expect(page).toHaveURL(/\/bbquizz\/proposer$/);
  });

  test("[membre] partie : 20 questions, chronomètre, score, 4 réponses, jokers, Suivant", async ({ page }, testInfo) => {
    await loginAs(page, MEMBER.id);
    await openQuiz(page);
    await visible(page.getByRole("button", { name: PLAY })).click();

    // Question 1 sur 20, chronomètre de lecture, score, catégorie et 4 réponses pas encore cliquables
    await expect(visible(page.getByText(/Question 1 \/ 20/))).toBeVisible();
    await expect(visible(page.getByText(/^\d+\s?s$/))).toBeVisible();
    await expect(visible(page.getByText(/Score/))).toBeVisible();
    await expect(answers(page)).toHaveCount(4);
    await page.screenshot({ path: testInfo.outputPath("bbquizz-lecture.png"), fullPage: false });

    // Après la lecture : joker 50/50 (deux mauvaises réponses retirées), puis appel à la communauté (pourcentages)
    await waitForAnswering(page);
    expect(await enabledAnswers(page)).toBe(4);
    await visible(page.getByRole("button", { name: "Joker 50/50" })).click();
    await expect.poll(() => enabledAnswers(page)).toBe(2);
    await expect(visible(page.getByRole("button", { name: "Joker 50/50" }))).toBeDisabled();
    await visible(page.getByRole("button", { name: "Joker appel à la communauté" })).click();
    await expect(visible(page.getByRole("group", { name: "Réponses" }).getByText(/\d+\s?%/))).toBeVisible();
    await expect(visible(page.getByRole("button", { name: "Joker appel à la communauté" }))).toBeDisabled();
    await page.screenshot({ path: testInfo.outputPath("bbquizz-jokers.png"), fullPage: false });

    // Réponse : le serveur renvoie les points gagnés ou perdus, puis « Suivant » mène à la question 2
    const choice = answers(page).filter({ visible: true });
    for (let index = 0; index < 4; index++) {
      if (await choice.nth(index).isEnabled()) {
        await choice.nth(index).click();
        break;
      }
    }
    await expect(visible(page.getByText(/[+-]\d+ points/))).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("bbquizz-reponse.png"), fullPage: false });
    await goNext(page);
    await expect(visible(page.getByText(/Question 2 \/ 20/))).toBeVisible();

    // Joker « passer » : la question 2 est sautée
    await visible(page.getByRole("button", { name: "Joker passer la question" })).click();
    await expect(visible(page.getByText(/Question 3 \/ 20/))).toBeVisible();
    await expect(visible(page.getByRole("button", { name: "Joker passer la question" }))).toBeDisabled();
  });

  test("[membre] fin de partie : points, explication, écran de fin et Rejouer", async ({ page }, testInfo) => {
    const question = `${PREFIX} : combien de tours dure une mi-temps ?`;
    await db((prisma) =>
      prisma.quizQuestion.create({
        data: { category: "Règles", question, options: JSON.stringify(["4", "6", "8", "16"]), correctIndex: 2, explanation: "Inv Quizz explication : huit tours par mi-temps." },
      })
    );
    await loginAs(page, MEMBER.id);
    await openQuiz(page);
    await visible(page.getByRole("button", { name: PLAY })).click();
    await expect(visible(page.getByText(question))).toBeVisible();
    await expect(visible(page.getByText(/Question 1 \/ 1/))).toBeVisible();

    await waitForAnswering(page);
    await answers(page).nth(2).click();
    await expect(visible(page.getByText(/\+\d+ points/))).toBeVisible();
    await expect(visible(page.getByText(/huit tours par mi-temps/))).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("bbquizz-explication.png"), fullPage: false });

    // Écran de fin : score, bonnes réponses, « Rejouer » qui ramène à l'accueil du jeu
    await goNext(page);
    await expect(visible(page.getByText(/Quizz terminé|Partie terminée/i))).toBeVisible();
    await expect(visible(page.getByText(/1 \/ 1/))).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("bbquizz-fin.png"), fullPage: false });
    await visible(page.getByRole("button", { name: REPLAY })).click();
    await expect(visible(page.getByRole("button", { name: PLAY }))).toBeVisible();

    // La partie est enregistrée dans le classement
    const attempts = await db((prisma) => prisma.quizAttempt.count({ where: { userId: MEMBER.id } }));
    expect(attempts).toBe(2);
    await db((prisma) => prisma.quizAttempt.deleteMany({ where: { userId: MEMBER.id, score: { not: 4321 } } }));
  });

  test("[membre] /bbquizz/proposer : catégorie, question, 4 réponses, bonne réponse, explication", async ({ page }, testInfo) => {
    await loginAs(page, MEMBER.id);
    await page.goto("/bbquizz/proposer", { waitUntil: "networkidle" });
    const question = `${PREFIX} : quelle compétence protège du blocage ?`;
    await visible(page.getByRole("combobox", { name: "Catégorie" })).selectOption("Compétences");
    await visible(page.getByRole("textbox", { name: /^Question/ })).fill(question);
    for (const [index, letter] of ["A", "B", "C", "D"].entries()) {
      await visible(page.getByRole("textbox", { name: `Réponse ${letter}`, exact: true })).fill(`Inv réponse ${index + 1}`);
    }
    await visible(page.getByRole("radio", { name: "Bonne réponse : C" })).check();
    await visible(page.getByRole("textbox", { name: /^Explication/ })).fill("Inv explication proposée");
    await page.screenshot({ path: testInfo.outputPath("bbquizz-proposer.png"), fullPage: true });
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await visible(page.getByRole("button", { name: /^Envoyer/ })).click();
    await expect(page).toHaveURL(/\/bbquizz$/);

    const suggestion = await db((prisma) => prisma.quizQuestionSuggestion.findFirst({ where: { authorId: MEMBER.id } }));
    expect(suggestion).toMatchObject({ question, category: "Compétences", correctIndex: 2, explanation: "Inv explication proposée", status: "PENDING" });
    expect(JSON.parse(suggestion!.options)).toEqual(["Inv réponse 1", "Inv réponse 2", "Inv réponse 3", "Inv réponse 4"]);
  });

  test("[membre] /bbquizz/valider et /bbquizz/editer sont réservés à la modération", async ({ page }) => {
    await loginAs(page, MEMBER.id);
    for (const path of ["/bbquizz/valider", "/bbquizz/editer"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/bbquizz$/);
    }
  });

  test("[modo] /bbquizz : Éditer et Valider", async ({ page }) => {
    await loginAs(page, MODO.id);
    await openQuiz(page);
    expect(await action(page, SUGGEST), "action « Proposer une question »").not.toBeNull();
    await (await action(page, VALIDATE))!.click();
    await expect(page).toHaveURL(/\/bbquizz\/valider$/);
    await openQuiz(page);
    await (await action(page, EDIT))!.click();
    await expect(page).toHaveURL(/\/bbquizz\/editer$/);
  });

  test("[modo] /bbquizz/valider : accepter ou refuser une proposition", async ({ page }, testInfo) => {
    const accepted = `${PREFIX} : proposition à accepter ?`;
    const refused = `${PREFIX} : proposition à refuser ?`;
    const ids = await db(async (prisma) => {
      const base = { category: "Règles", options: JSON.stringify(["Un", "Deux", "Trois", "Quatre"]), correctIndex: 1, explanation: "Inv explication", authorId: MEMBER.id };
      const first = await prisma.quizQuestionSuggestion.create({ data: { ...base, question: accepted } });
      const second = await prisma.quizQuestionSuggestion.create({ data: { ...base, question: refused } });
      return [first.id, second.id];
    });
    await loginAs(page, MODO.id);
    await page.goto("/bbquizz/valider", { waitUntil: "networkidle" });
    await expect(visible(page.getByText(accepted))).toBeVisible();
    await expect(visible(page.getByText(refused))).toBeVisible();
    await expect(visible(page.getByText(MEMBER.name))).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("bbquizz-valider.png"), fullPage: true });

    await visible(page.getByRole("button", { name: `Approuver la question « ${accepted} »` })).click();
    await expect(page.getByText(accepted).filter({ visible: true })).toHaveCount(0);
    await visible(page.getByRole("button", { name: `Rejeter la question « ${refused} »` })).click();
    await expect(page.getByText(refused).filter({ visible: true })).toHaveCount(0);

    const [first, second, published] = await db(async (prisma) => [
      await prisma.quizQuestionSuggestion.findUnique({ where: { id: ids[0] } }),
      await prisma.quizQuestionSuggestion.findUnique({ where: { id: ids[1] } }),
      await prisma.quizQuestion.findFirst({ where: { question: accepted } }),
    ] as const);
    expect(first?.status).toBe("APPROVED");
    expect(second?.status).toBe("REJECTED");
    expect(published?.correctIndex).toBe(1);
    expect(await db((prisma) => prisma.quizQuestion.count({ where: { question: refused } }))).toBe(0);
  });

  test("[modo] /bbquizz/editer : recherche, éditer, supprimer", async ({ page }, testInfo) => {
    const kept = `${PREFIX} : question à modifier ?`;
    const doomed = `${PREFIX} : question à supprimer ?`;
    const ids = await db(async (prisma) => {
      const base = { category: "Règles", options: JSON.stringify(["Un", "Deux", "Trois", "Quatre"]), correctIndex: 0, explanation: "Inv explication" };
      const first = await prisma.quizQuestion.create({ data: { ...base, question: kept } });
      const second = await prisma.quizQuestion.create({ data: { ...base, question: doomed } });
      return [first.id, second.id];
    });
    await loginAs(page, MODO.id);
    await page.goto("/bbquizz/editer", { waitUntil: "networkidle" });
    await expect(visible(page.getByText(kept))).toBeVisible();
    await expect(visible(page.getByText(doomed))).toBeVisible();

    // Recherche : seule la question qui contient le mot reste
    await visible(page.getByRole("textbox", { name: "Rechercher une question" })).fill("à modifier");
    await expect(page.getByText(doomed).filter({ visible: true })).toHaveCount(0);
    await expect(visible(page.getByText(kept))).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("bbquizz-editer.png"), fullPage: false });

    // Éditer : le formulaire s'ouvre rempli (adresse ?edit=), on change le texte et la bonne réponse
    await visible(page.getByRole("button", { name: `Éditer la question « ${kept} »` }).or(page.getByRole("link", { name: `Éditer la question « ${kept} »` }))).click();
    await expect(page).toHaveURL(new RegExp(`/bbquizz/editer\\?edit=${ids[0]}$`));
    const questionField = visible(page.getByRole("textbox", { name: /^Question/ }));
    await expect(questionField).toHaveValue(kept);
    await expect(visible(page.getByRole("textbox", { name: "Réponse B", exact: true }))).toHaveValue("Deux");
    await expect(visible(page.getByRole("radio", { name: "Bonne réponse : A" }))).toBeChecked();
    const edited = `${PREFIX} : question modifiée ?`;
    await questionField.fill(edited);
    await visible(page.getByRole("radio", { name: "Bonne réponse : D" })).check();
    await page.screenshot({ path: testInfo.outputPath("bbquizz-editer-formulaire.png"), fullPage: true });
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await visible(page.getByRole("button", { name: /^(Sauvegarder|Enregistrer)/ })).click();
    await expect(page).toHaveURL(/\/bbquizz\/editer$/);
    // La recherche peut être gardée après l'enregistrement : on la vide pour revoir toute la liste
    await visible(page.getByRole("textbox", { name: "Rechercher une question" })).fill("");
    await expect(visible(page.getByText(edited))).toBeVisible();
    const updated = await db((prisma) => prisma.quizQuestion.findUnique({ where: { id: ids[0] } }));
    expect(updated).toMatchObject({ question: edited, correctIndex: 3 });

    // Supprimer, après confirmation
    await deleteQuestion(page, doomed);
    await expect(page.getByText(doomed).filter({ visible: true })).toHaveCount(0);
    await expect.poll(() => db((prisma) => prisma.quizQuestion.count({ where: { id: ids[1] } }))).toBe(0);
  });
});
