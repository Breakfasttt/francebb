/**
 * Tests des failles corrigées par la carte 050 (sécurité de la modération et de la connexion)
 * et par la carte 141 (ressources : accès des visiteurs, liens dangereux, clé ImgBB gardée par le serveur).
 * Les tests du quiz (cartes 051 et 143) sont partis avec lui dans apps/bbquizz (carte 180).
 *
 * Pour vérifier qu'une action serveur refuse des données que le formulaire n'enverrait jamais, les tests de la carte
 * 141 remplissent le formulaire normalement, puis modifient la requête au moment où elle part vers le serveur
 * (`page.route`) : c'est ce que pourrait faire un visiteur malveillant, puisqu'une action serveur est appelable
 * directement avec n'importe quelles données.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test, expect, type Page, type Request } from "@playwright/test";
import { PrismaClient } from "../../prisma/generated-client";
import { PrismaPg } from "@prisma/adapter-pg";
import { E2E, E2E_DATABASE_URL, loginAs, withTestDb } from "./fixtures";

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

// --- Carte 141 : outils communs ---

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
