/**
 * Tests de sécurité du quiz BBQuizz, sortis de apps/site/tests/e2e/security.spec.ts par la carte 180 et copiés tels
 * quels (seuls cet en-tête et les chemins d'import ont changé) :
 * - carte 051 : la bonne réponse et le calcul du score restent sur le serveur ;
 * - carte 143 : contrôles des propositions et des modifications de questions par le serveur, classements « Du jour » et
 *   « Semaine ».
 *
 * Pour vérifier qu'une action serveur refuse des données que le formulaire n'enverrait jamais, les tests de la carte
 * 143 remplissent le formulaire normalement, puis modifient la requête au moment où elle part vers le serveur
 * (`page.route`) : c'est ce que pourrait faire un visiteur malveillant, puisqu'une action serveur est appelable
 * directement avec n'importe quelles données.
 *
 * En attente, comme le reste du quiz : ce fichier n'est pas lancé. Il suppose encore les outils de test du site
 * (`fixtures` : connexion d'un membre de test, base de test) et l'adresse `/bbquizz` du site ; voir le README.md du
 * dossier parent pour le rebrancher.
 */
import { readFileSync } from "node:fs";
import { test, expect, type Page, type Request } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../fixtures";
import { questions as staticQuestions } from "../data/questions";
import { startOfQuizDay, startOfQuizWeek } from "../utils";

test("BBQuizz : ni la bonne réponse ni le calcul du score ne passent par le navigateur", async ({ page }) => {
  // L'ancienne action qui acceptait le score envoyé par le navigateur ne doit pas revenir
  const actions = readFileSync("app/bbquizz/actions.ts", "utf-8");
  expect(actions).not.toMatch(/export async function submitQuizAttempt/);

  // Tout ce que le serveur renvoie aux actions du jeu est gardé pour être inspecté
  const actionBodies: string[] = [];
  page.on("response", async (response) => {
    if (response.request().method() === "POST" && response.url().includes("/bbquizz")) {
      actionBodies.push(await response.text().catch(() => ""));
    }
  });

  await loginAs(page, E2E.coachId);
  await page.goto("/bbquizz", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Commencer le quizz !" }).click();
  // Repères par rôle et nom accessible (carte 098) : la question est le titre de la zone « Question en cours »
  const questionHeading = page.getByRole("region", { name: "Question en cours" }).getByRole("heading", { level: 2 });
  await expect(questionHeading).toBeVisible();

  // Avant de répondre : aucune trace de la bonne réponse ni de l'explication
  for (const body of actionBodies) {
    expect(body).not.toContain("correctIndex");
    expect(body).not.toContain("explanation");
  }

  // La base e2e n'a pas de questions : le jeu utilise celles de départ, où l'on retrouve la bonne réponse
  const questionText = await questionHeading.innerText();
  const correctIndex = staticQuestions.find((question) => question.question === questionText.trim())!.correctIndex;

  // Après les 5 secondes de lecture, on répond juste : le serveur compte 100 points plus le bonus de rapidité
  const answer = page.getByRole("group", { name: "Réponses" }).getByRole("button").nth(correctIndex);
  await expect(answer).toBeEnabled({ timeout: 10_000 });
  await answer.click();
  // Points gagnés (bonne réponse) : « +N points », jamais « -25 points »
  await expect(page.getByRole("status").filter({ hasText: /^\+\d+ points$/ })).toBeVisible();
  const shownScore = await page.getByRole("status", { name: "Score", exact: true }).innerText();
  page.removeAllListeners("response");
  await page.close();

  // La partie est tenue en base, avec le score calculé par le serveur
  const game = await withTestDb((prisma) => prisma.quizGame.findFirst({ where: { userId: E2E.coachId } }));
  try {
    expect(game?.currentIndex).toBe(1);
    expect(game?.correct).toBe(1);
    expect(game?.score).toBeGreaterThanOrEqual(100);
    expect(game?.score).toBeLessThanOrEqual(130);
    expect(shownScore).toBe(`${game?.score}`);
  } finally {
    await withTestDb((prisma) => prisma.quizGame.deleteMany({ where: { userId: E2E.coachId } }));
  }
});

// --- Outils communs (copie de ceux de security.spec.ts du site) ---

/** Bandeau des cookies masqué : il couvrirait le bas de l'écran et intercepterait les appuis. */
async function hideCookieBanner(page: Page) {
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
}

/** Vrai si la requête est l'appel d'une action serveur (Next.js l'annonce par l'en-tête « Next-Action »). */
function isServerAction(request: Request): boolean {
  return request.method() === "POST" && !!request.headers()["next-action"];
}

/**
 * Modifie, au moment où il part vers le serveur, chaque appel d'action serveur fait depuis la page : `rewrite` reçoit
 * le corps de la requête (texte) et renvoie le corps à envoyer à la place.
 */
async function rewriteServerActions(page: Page, rewrite: (body: string) => string) {
  await page.route("**/*", async (route) => {
    const request = route.request();
    if (!isServerAction(request)) return route.continue();
    const body = request.postDataBuffer()?.toString("utf-8") ?? "";
    await route.continue({ postData: Buffer.from(rewrite(body), "utf-8") });
  });
}

/** Quitte le champ en cours de saisie avant d'appuyer sur un bouton (la barre du bas peut se replacer). */
async function leaveField(page: Page) {
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
}

// --- Carte 143 : BBQuizz, contrôles côté serveur ---

const SEC_QUIZ_PREFIX = "Sécurité E2E quizz";

test.describe("Carte 143 : BBQuizz, contrôles côté serveur", () => {
  const cleanUp = () =>
    withTestDb(async (prisma) => {
      await prisma.quizQuestionSuggestion.deleteMany({ where: { question: { startsWith: SEC_QUIZ_PREFIX } } });
      await prisma.quizQuestion.deleteMany({ where: { question: { startsWith: SEC_QUIZ_PREFIX } } });
    });
  test.beforeAll(cleanUp);
  test.afterAll(cleanUp);

  test("une proposition incomplète ou incohérente est refusée par le serveur", async ({ page }) => {
    const question = `${SEC_QUIZ_PREFIX} : proposition à fausser ?`;
    await hideCookieBanner(page);
    await loginAs(page, E2E.coachId);
    await page.goto("/bbquizz/proposer", { waitUntil: "networkidle" });
    await page.getByRole("textbox", { name: /^Question/ }).fill(question);
    for (const letter of ["A", "B", "C", "D"]) {
      await page.getByRole("textbox", { name: `Réponse ${letter}`, exact: true }).fill(`Réponse ${letter}`);
    }
    await leaveField(page);

    // Chaque envoi est faussé en route d'une façon différente ; le serveur doit refuser chacun avec un message clair
    const cases: { change: (data: Record<string, unknown>) => void; message: RegExp }[] = [
      { change: (data) => { data.options = ["Un", "", "Trois", "Quatre"]; }, message: /Remplissez les quatre réponses/ },
      { change: (data) => { data.options = ["Un", "Deux"]; }, message: /Remplissez les quatre réponses/ },
      { change: (data) => { data.correctIndex = 7; }, message: /Indiquez laquelle des quatre réponses est la bonne/ },
      { change: (data) => { data.question = "Q".repeat(600); }, message: /La question ne doit pas dépasser 500 caractères/ },
      { change: (data) => { data.options = ["Un", "Deux", "Trois", "R".repeat(300)]; }, message: /Une réponse ne doit pas dépasser/ },
    ];
    let current = 0;
    await rewriteServerActions(page, (body) => {
      const args = JSON.parse(body) as unknown[];
      const data = args[0];
      if (typeof data === "object" && data !== null && "question" in data) cases[current].change(data as Record<string, unknown>);
      return JSON.stringify(args);
    });
    for (current = 0; current < cases.length; current++) {
      await page.getByRole("button", { name: /^Envoyer/ }).filter({ visible: true }).first().click();
      await expect(page.getByText(cases[current].message).first()).toBeVisible();
      await expect(page).toHaveURL(/\/bbquizz\/proposer$/);
    }

    const saved = await withTestDb((prisma) =>
      prisma.quizQuestionSuggestion.count({ where: { authorId: E2E.coachId, question: { startsWith: SEC_QUIZ_PREFIX } } })
    );
    expect(saved).toBe(0);
  });

  test("la modification d'une question n'enregistre que les champs prévus", async ({ page }) => {
    const original = `${SEC_QUIZ_PREFIX} : question à modifier ?`;
    const edited = `${SEC_QUIZ_PREFIX} : question modifiée ?`;
    const created = await withTestDb((prisma) =>
      prisma.quizQuestion.create({
        data: { category: "Règles", question: original, options: JSON.stringify(["Un", "Deux", "Trois", "Quatre"]), correctIndex: 0 },
      })
    );
    await hideCookieBanner(page);
    await loginAs(page, E2E.modoId);
    await page.goto(`/bbquizz/editer?edit=${created.id}`, { waitUntil: "networkidle" });
    const questionField = page.getByRole("textbox", { name: /^Question/ }).filter({ visible: true });
    await expect(questionField).toHaveValue(original);
    await questionField.fill(edited);
    await leaveField(page);

    // Des colonnes que le formulaire n'envoie jamais sont glissées dans la requête : elles doivent être ignorées
    await rewriteServerActions(page, (body) => {
      const args = JSON.parse(body) as unknown[];
      if (typeof args[1] === "object" && args[1] !== null) {
        Object.assign(args[1], { timesCorrect: 999, timesOption0: 999, imageUrl: "javascript:alert(1)" });
      }
      return JSON.stringify(args);
    });
    await page.getByRole("button", { name: /^(Sauvegarder|Enregistrer)/ }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/bbquizz\/editer$/);

    const saved = await withTestDb((prisma) => prisma.quizQuestion.findUnique({ where: { id: created.id } }));
    expect(saved?.question).toBe(edited);
    expect(saved?.timesCorrect).toBe(0);
    expect(saved?.timesOption0).toBe(0);
    expect(saved?.imageUrl).toBeNull();
  });

  test("une proposition approuvée deux fois ne crée pas de doublon, et une proposition inconnue est signalée", async ({ page }) => {
    const question = `${SEC_QUIZ_PREFIX} : proposition à approuver deux fois ?`;
    const suggestion = await withTestDb((prisma) =>
      prisma.quizQuestionSuggestion.create({
        data: { category: "Règles", question, options: JSON.stringify(["Un", "Deux", "Trois", "Quatre"]), correctIndex: 1, authorId: E2E.coachId },
      })
    );
    await hideCookieBanner(page);
    await loginAs(page, E2E.modoId);
    await page.goto("/bbquizz/valider", { waitUntil: "networkidle" });

    // Premier appui sur « Approuver » : la requête envoyée est gardée pour être rejouée telle quelle
    const sent = page.waitForRequest(isServerAction);
    await page.getByRole("button", { name: `Approuver la question « ${question} »` }).filter({ visible: true }).click();
    const approval = await sent;
    await expect(page.getByText(question).filter({ visible: true })).toHaveCount(0);

    // Mêmes en-têtes que le navigateur (dont « Origin », que Next.js vérifie), sauf ceux que l'envoi recalcule
    const headers = { ...(await approval.allHeaders()) };
    for (const name of ["content-length", "cookie", "host", "connection"]) delete headers[name];
    const replay = (body: string) => page.request.post(approval.url(), { headers, data: body });

    // Deuxième envoi de la même approbation (double clic, onglet resté ouvert) : refusé
    const again = await replay(approval.postData() ?? "");
    expect(await again.text()).toContain("déjà été traitée");

    // Proposition inconnue : message clair, pas d'erreur non gérée
    const unknown = await replay(JSON.stringify(["proposition-inconnue-e2e", true]));
    expect(await unknown.text()).toContain("Proposition introuvable");

    const [published, saved] = await withTestDb(async (prisma) => [
      await prisma.quizQuestion.count({ where: { question } }),
      await prisma.quizQuestionSuggestion.findUnique({ where: { id: suggestion.id } }),
    ] as const);
    expect(published).toBe(1);
    expect(saved?.status).toBe("APPROVED");
  });

  test("les classements « Du jour » et « Semaine » commencent à minuit, heure de Paris, et la semaine le lundi", () => {
    // Dimanche 1er novembre 2026 à 11 heures à Paris (heure d'hiver, UTC+1) : la semaine a commencé le lundi 26 octobre
    const sunday = new Date("2026-11-01T10:00:00Z");
    expect(startOfQuizDay(sunday).toISOString()).toBe("2026-10-31T23:00:00.000Z");
    expect(startOfQuizWeek(sunday).toISOString()).toBe("2026-10-25T23:00:00.000Z");

    // Lundi 2 novembre à 0 h 30 à Paris (dimanche 23 h 30 en UTC) : une nouvelle semaine a déjà commencé
    const mondayNight = new Date("2026-11-01T23:30:00Z");
    expect(startOfQuizWeek(mondayNight).toISOString()).toBe("2026-11-01T23:00:00.000Z");

    // Été (UTC+2) : mercredi 15 juillet 2026 à 23 h 59 à Paris, semaine commencée le lundi 13 juillet
    const summer = new Date("2026-07-15T21:59:00Z");
    expect(startOfQuizDay(summer).toISOString()).toBe("2026-07-14T22:00:00.000Z");
    expect(startOfQuizWeek(summer).toISOString()).toBe("2026-07-12T22:00:00.000Z");

    // Jour du passage à l'heure d'été (dimanche 29 mars 2026) : minuit était encore en heure d'hiver
    expect(startOfQuizDay(new Date("2026-03-29T12:00:00Z")).toISOString()).toBe("2026-03-28T23:00:00.000Z");
  });
});
