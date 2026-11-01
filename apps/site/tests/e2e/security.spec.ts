/**
 * Tests des failles corrigées par la carte 050 (sécurité de la modération et de la connexion),
 * par la carte 051 (BBQuizz : bonnes réponses et score gardés par le serveur),
 * par la carte 141 (ressources : accès des visiteurs, liens dangereux, clé ImgBB gardée par le serveur)
 * et par la carte 143 (BBQuizz : contrôles des propositions et des modifications par le serveur).
 *
 * Pour vérifier qu'une action serveur refuse des données que le formulaire n'enverrait jamais, les tests des cartes
 * 141 et 143 remplissent le formulaire normalement, puis modifient la requête au moment où elle part vers le serveur
 * (`page.route`) : c'est ce que pourrait faire un visiteur malveillant, puisqu'une action serveur est appelable
 * directement avec n'importe quelles données.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test, expect, type Page, type Request } from "@playwright/test";
import { PrismaClient } from "../../prisma/generated-client";
import { PrismaPg } from "@prisma/adapter-pg";
import { E2E, E2E_DATABASE_URL, loginAs, withTestDb } from "./fixtures";
import { questions as staticQuestions } from "../../app/bbquizz/data/questions";
import { startOfQuizDay, startOfQuizWeek } from "../../app/bbquizz/utils";

test("le journal de modération n'est pas une action serveur publique", () => {
  // Une fonction exportée d'un fichier « use server » devient appelable depuis le navigateur par n'importe qui
  const helper = readFileSync("lib/moderationLog.ts", "utf-8");
  expect(helper).not.toMatch(/["']use server["']/);
  const actions = readFileSync("app/moderation/actions.ts", "utf-8");
  expect(actions).not.toMatch(/export async function logModerationAction/);
});

test("les actions du forum vérifient l'accès au sujet et le verrouillage (carte 103)", () => {
  // Une action serveur est appelable directement par n'importe qui : chaque action sur un sujet ou un message
  // existant doit filtrer par rôle (topicAccessWhere / forumAccessWhere) avant d'agir.
  const actions = readFileSync("app/forum/actions.ts", "utf-8");
  const body = (name: string) => {
    const start = actions.indexOf(`export async function ${name}(`);
    expect(start, `action ${name} introuvable`).toBeGreaterThan(-1);
    const next = actions.indexOf("\nexport async function ", start + 1);
    return actions.slice(start, next === -1 ? undefined : next);
  };
  for (const name of ["updatePost", "deletePost", "togglePostReaction"]) {
    expect(body(name), name).toMatch(/findAccessiblePost\(/);
    expect(body(name), name).toMatch(/isLockedFor\(/);
  }
  expect(body("markTopicAsRead")).toMatch(/topicAccessWhere\(roles\)/);
  expect(body("markAllTopicsAsRead")).toMatch(/isArchived: false, \.\.\.topicAccessWhere\(roles\)/);
  expect(body("moveTopic")).toMatch(/forumAccessWhere\(roles\)/);
  expect(actions).toMatch(/async function findAccessiblePost[\s\S]*?topic: topicAccessWhere\(roles\)/);

  // La liste des forums de destination proposée aux modérateurs est filtrée par rôle
  const topicPage = readFileSync("app/forum/topic/[id]/page.tsx", "utf-8");
  expect(topicPage).toMatch(/where: forumAccessWhere\(roles\)/);
});

test("après connexion, aucune redirection vers un site extérieur", async ({ page }) => {
  await loginAs(page, E2E.coachId);
  for (const target of ["https://example.com", "//example.com", "/\example.com"]) {
    await page.goto(`/auth/login?callbackUrl=${encodeURIComponent(target)}`);
    expect(new URL(page.url()).hostname).toBe("localhost");
  }
});

test("l'API des articles ne dévoile ni la fiche de l'auteur ni les articles masqués", async ({ page, request }) => {
  // Articles créés pour ce test seulement : l'accueil affiche un article au hasard, ce qui changerait ses captures
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: E2E_DATABASE_URL }) });
  await prisma.article.createMany({
    data: [
      { id: E2E.articleId, title: "Article visible E2E", content: "Contenu public", authorId: E2E.coachId },
      { id: E2E.moderatedArticleId, title: "Article masqué E2E", content: "Contenu masqué", authorId: E2E.coachId, isModerated: true, moderationReason: "Test e2e" },
    ],
    skipDuplicates: true,
  });
  try {
  const anonymous = await (await request.get(`/api/articles?authorId=${E2E.coachId}`)).json();
  const anonymousIds = anonymous.articles.map((article: { id: string }) => article.id);
  expect(anonymousIds).toContain(E2E.articleId);
  expect(anonymousIds).not.toContain(E2E.moderatedArticleId);
  for (const article of anonymous.articles) {
    expect(Object.keys(article.author).sort()).toEqual(["avatarFrame", "id", "image", "name", "role"]);
  }

  // L'auteur voit ses propres articles masqués
  await loginAs(page, E2E.coachId);
  const own = await (await page.request.get(`/api/articles?authorId=${E2E.coachId}`)).json();
  expect(own.articles.map((article: { id: string }) => article.id)).toContain(E2E.moderatedArticleId);

  // Taille de page bornée
  const big = await (await request.get(`/api/articles?authorId=${E2E.coachId}&limit=100000`)).json();
  expect(big.totalPages).toBeGreaterThanOrEqual(1);
  } finally {
    await prisma.article.deleteMany({ where: { id: { in: [E2E.articleId, E2E.moderatedArticleId] } } });
    await prisma.$disconnect();
  }
});

test("un modérateur bannit un membre depuis sa fiche, et c'est tracé au journal", async ({ page }) => {
  await loginAs(page, E2E.modoId);
  await page.goto(`/spy/${E2E.targetId}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Bannir" }).first().click();
  await page.getByRole("button", { name: "Spam / Publicité" }).click();
  await page.getByRole("button", { name: "Confirmer le bannissement" }).click();
  await expect(page.getByText("Utilisateur banni")).toBeVisible();

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: E2E_DATABASE_URL }) });
  try {
    const target = await prisma.user.findUnique({ where: { id: E2E.targetId }, select: { isBanned: true } });
    expect(target?.isBanned).toBe(true);
    const log = await prisma.moderationLog.findFirst({ where: { action: "USER_BANNED", targetId: E2E.targetId, moderatorId: E2E.modoId } });
    expect(log).not.toBeNull();
  } finally {
    await prisma.$disconnect();
  }
});

test("un modérateur ne peut pas débannir un membre de rang égal, mais débannit un coach, et c'est tracé au journal", async ({ page }) => {
  // Un modérateur banni (même rang que « Modo E2E ») et le coach cible banni, préparés directement en base
  await withTestDb(async (prisma) => {
    await prisma.user.upsert({
      where: { id: E2E.bannedModoId },
      update: { isBanned: true, banReason: "Test e2e" },
      create: { id: E2E.bannedModoId, name: E2E.bannedModoName, email: "banned-modo@e2e.test", role: "MODERATOR", hasFinishedOnboarding: true, isBanned: true, banReason: "Test e2e" },
    });
    await prisma.user.update({ where: { id: E2E.targetId }, data: { isBanned: true, banReason: "Test e2e" } });
  });

  // La liste des bannis est paginée par 10 et sans ordre fixe ; globalSetup y ajoute un banni par thème :
  // on repart de la première page et on avance jusqu'à trouver la ligne du membre voulu.
  // Depuis la carte 099, la liste est une liste de fiches (« Coachs bannis ») et non plus un tableau : chaque banni est
  // un élément de cette liste, repéré par son rôle et son nom accessible comme le reste du test.
  const bannedRow = async (name: string) => {
    await page.goto("/moderation?tab=reports_user_banned", { waitUntil: "networkidle" });
    // La liste est chargée par le navigateur après l'affichage : on attend sa première ligne de données
    const bannedList = page.getByRole("list", { name: "Coachs bannis" });
    const firstDataRow = bannedList.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Débannir" }) }).first();
    for (let tries = 0; tries < 5; tries++) {
      await expect(firstDataRow).toBeVisible();
      const row = bannedList.getByRole("listitem").filter({ hasText: name });
      if (await row.count()) return row;
      const shownFirst = await firstDataRow.textContent();
      await page.getByRole("navigation", { name: "Pagination" }).getByRole("button", { name: "Page suivante" }).click();
      await expect(firstDataRow).not.toHaveText(shownFirst ?? "");
    }
    throw new Error(`Banni introuvable dans la liste : ${name}`);
  };

  try {
    await loginAs(page, E2E.modoId);

    // Refus : le serveur bloque le débannissement d'un membre de rang égal
    await (await bannedRow(E2E.bannedModoName)).getByRole("button", { name: "Débannir" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Débannir" }).click();
    await expect(page.getByText("Vous ne pouvez pas débannir ce membre (hiérarchie insuffisante)")).toBeVisible();

    // Autorisé : le coach, de rang inférieur, est débanni
    await (await bannedRow("Cible E2E")).getByRole("button", { name: "Débannir" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Débannir" }).click();
    await expect(page.getByText("Utilisateur débanni")).toBeVisible();

    await withTestDb(async (prisma) => {
      const bannedModo = await prisma.user.findUnique({ where: { id: E2E.bannedModoId }, select: { isBanned: true } });
      expect(bannedModo?.isBanned).toBe(true);
      const refusedLog = await prisma.moderationLog.findFirst({ where: { action: "USER_UNBANNED", targetId: E2E.bannedModoId } });
      expect(refusedLog).toBeNull();

      const target = await prisma.user.findUnique({ where: { id: E2E.targetId }, select: { isBanned: true } });
      expect(target?.isBanned).toBe(false);
      const log = await prisma.moderationLog.findFirst({ where: { action: "USER_UNBANNED", targetId: E2E.targetId, moderatorId: E2E.modoId } });
      expect(log).not.toBeNull();
    });
  } finally {
    await withTestDb((prisma) => prisma.user.delete({ where: { id: E2E.bannedModoId } }));
  }
});

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

// --- Cartes 141 et 143 : outils communs ---

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

/** Liste les fichiers de code du site dans `dir` (hors dépendances et dossiers cachés). */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "node_modules" || name.startsWith(".") ? [] : sourceFiles(path);
    return /\.(ts|tsx|js|jsx|mjs)$/.test(name) ? [path] : [];
  });
}

// --- Carte 141 : ressources et envoi d'images ---

const SEC_RESOURCE_TITLE = "Sécurité E2E ressource";

test.describe("Carte 141 : ressources et envoi d'images", () => {
  const cleanUp = () =>
    withTestDb((prisma) => prisma.resource.deleteMany({ where: { title: { startsWith: SEC_RESOURCE_TITLE } } }));
  test.beforeAll(cleanUp);
  test.afterAll(cleanUp);

  test("un visiteur est envoyé vers la connexion et ne voit pas « Soumettre une ressource »", async ({ page }) => {
    await hideCookieBanner(page);
    await page.goto("/ressources/submit");
    await expect(page).toHaveURL(/\/auth\/login\?callbackUrl=%2Fressources%2Fsubmit$/);

    await page.goto("/ressources", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Ressources" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Soumettre/ })).toHaveCount(0);

    // Un membre connecté voit le bouton
    await loginAs(page, E2E.coachId);
    await page.goto("/ressources", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: /Soumettre/ }).filter({ visible: true }).first()).toBeVisible();
  });

  test("la clé ImgBB n'est lue que par le serveur", async ({ page }) => {
    // Dans le code : plus de clé publique, et un seul fichier parle à ImgBB, une action serveur
    const files = [...sourceFiles("app"), ...sourceFiles("common"), ...sourceFiles("lib")];
    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      expect(content, file).not.toContain("NEXT_PUBLIC_IMGBB");
      if (content.includes("api.imgbb.com")) expect(file.replace(/\\/g, "/")).toBe("app/imageUploadActions.ts");
    }
    expect(readFileSync("app/imageUploadActions.ts", "utf-8")).toMatch(/^["']use server["'];/);

    // Dans le code reçu par le navigateur : ni l'adresse d'envoi d'ImgBB, ni le nom de la clé
    const scripts: Promise<string>[] = [];
    page.on("response", (response) => {
      if (response.request().resourceType() === "script") scripts.push(response.text().catch(() => ""));
    });
    await hideCookieBanner(page);
    await loginAs(page, E2E.coachId);
    await page.goto("/ressources/submit", { waitUntil: "networkidle" });
    page.removeAllListeners("response");
    const bodies = await Promise.all(scripts);
    expect(bodies.length).toBeGreaterThan(0);
    for (const body of bodies) {
      expect(body).not.toContain("api.imgbb.com");
      expect(body).not.toContain("IMGBB_API_KEY");
    }
  });

  test("l'envoi d'image passe par le serveur, qui refuse un fichier qui n'est pas une image", async ({ page }) => {
    const imgbbCalls: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("imgbb.com")) imgbbCalls.push(request.url());
    });
    await hideCookieBanner(page);
    await loginAs(page, E2E.coachId);
    await page.goto("/ressources/submit", { waitUntil: "networkidle" });
    const uploadButton = () =>
      page.getByRole("button", { name: /Envoyer une image|Changer l'image/ }).filter({ visible: true }).first();
    const imageField = page.getByRole("textbox", { name: /image/i });

    // Un texte déguisé en image : le type annoncé est « image/png », mais le contenu n'en est pas une
    let chooser = page.waitForEvent("filechooser");
    await uploadButton().click();
    await (await chooser).setFiles({ name: "faux.png", mimeType: "image/png", buffer: Buffer.from("ceci n'est pas une image") });
    await expect(page.getByText(/n'est pas une image acceptée/)).toBeVisible();
    await expect(imageField).toHaveValue("");

    // Une vraie image PNG (signature des fichiers PNG) : en test, le serveur renvoie une adresse factice
    chooser = page.waitForEvent("filechooser");
    await uploadButton().click();
    await (await chooser).setFiles({
      name: "vraie.png",
      mimeType: "image/png",
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    });
    await expect(imageField).toHaveValue("https://i.ibb.co/e2e/vraie.png");

    // Le navigateur n'a jamais appelé ImgBB lui-même
    expect(imgbbCalls).toEqual([]);
  });

  test("le serveur refuse un lien de ressource qui n'est pas une adresse web (javascript:)", async ({ page }) => {
    const title = `${SEC_RESOURCE_TITLE} lien`;
    const safeLink = "https://example.com/securite-e2e-lien";
    await hideCookieBanner(page);
    await loginAs(page, E2E.coachId);
    await page.goto("/ressources/submit", { waitUntil: "networkidle" });
    await page.getByRole("textbox", { name: /^Titre/ }).fill(title);
    await page.getByRole("textbox", { name: /description/i }).fill("Ressource du test de sécurité.");
    await page.getByRole("textbox", { name: /^(Lien|Adresse)/ }).fill(safeLink);
    await leaveField(page);

    // Le formulaire envoie un lien correct, remplacé en route par un lien qui exécuterait du code au clic
    await rewriteServerActions(page, (body) => body.replace(safeLink, "javascript:alert(document.cookie)"));
    await page.getByRole("button", { name: /Soumettre/ }).filter({ visible: true }).first().click();
    await expect(page.getByText(/Le lien doit être une adresse web complète/)).toBeVisible();
    await expect(page).toHaveURL(/\/ressources\/submit$/);

    const saved = await withTestDb((prisma) => prisma.resource.count({ where: { title } }));
    expect(saved).toBe(0);
  });
});

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
