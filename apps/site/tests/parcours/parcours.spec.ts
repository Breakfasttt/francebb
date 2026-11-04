/**
 * Parcours de fin de carte (niveau 2 des tests, carte 157) : `pnpm test:parcours` dans apps/site.
 *
 * Un seul test, donc une seule session : le serveur démarre une fois, le navigateur s'ouvre une fois, et les pages
 * principales du site sont visitées l'une après l'autre. On commence en visiteur, puis on se connecte une fois en
 * modérateur (il voit les pages réservées aux membres et la modération), puis une fois en administrateur.
 *
 * Sur chaque page, en taille téléphone (390 × 844) :
 * - la page répond sans erreur (pas de code 4xx ou 5xx, pas d'erreur JavaScript dans le navigateur) ;
 * - le contenu principal (`main`) est affiché ;
 * - rien ne dépasse à droite de l'écran ;
 * - les boutons et les liens font au moins 44 pixels de haut et de large (règle « mobile impeccable »), sauf les
 *   exceptions connues listées dans KNOWN_SMALL_TARGETS ;
 * - les champs de saisie ont un texte d'au moins 16 pixels (sinon l'iPhone zoome en entrant dedans).
 * Puis la même page en taille ordinateur (1280 × 800) : contenu principal affiché, rien ne dépasse à droite.
 *
 * Le test ne s'arrête pas au premier problème : il les relève tous, les écrit dans logs/parcours.txt, puis échoue
 * s'il y en a. Il vérifie l'affichage des pages, pas les actions (poster un message, s'inscrire à un tournoi) :
 * celles-ci sont couvertes par la suite complète (`pnpm test:e2e`, niveau 3, lancée à la demande).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";
import { E2E, loginAs, withTestDb } from "../e2e/fixtures";
import { measure } from "../e2e/mobileMeasure";

/** Administrateur et article créés par le parcours (le jeu de données de test n'en contient pas). */
const ADMIN_ID = "e2e_parcours_admin";
const ARTICLE_ID = "e2e_parcours_article";

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

/** Qui visite les pages : chaque groupe est visité dans l'ordre, avec une seule connexion par groupe. */
const GROUPS: { who: string; userId: string | null; paths: string[] }[] = [
  {
    who: "visiteur",
    userId: null,
    paths: ["/", "/auth/login", "/tournois", "/jouer", "/forum"],
  },
  {
    who: "modérateur",
    userId: E2E.modoId,
    paths: [
      "/",
      `/forum/${E2E.forumId}`,
      `/forum/topic/${E2E.topicId}`,
      `/forum/topic/${E2E.topicId}/reply`,
      `/forum/topic/${E2E.bbschemeTopicId}`,
      "/forum/search",
      "/forum/unread",
      "/ligues",
      "/articles",
      `/articles/${ARTICLE_ID}`,
      "/carte",
      "/classement",
      "/ressources",
      "/membres",
      "/messagerie",
      "/profile",
      `/spy/${E2E.targetId}`,
      "/bbscheme",
      "/bbquizz",
      "/moderation",
    ],
  },
  {
    who: "administrateur",
    userId: ADMIN_ID,
    paths: ["/administration", "/statistiques?admin"],
  },
];

/**
 * Écarts déjà connus et acceptés, par page. Ajouter une ligne ici seulement après accord du responsable, avec la
 * raison. `smallTargets` : nombre de cibles de moins de 44 pixels tolérées ; `cutImages` : des images coupées par
 * leur cadre sont normales sur cette page.
 */
const KNOWN_ISSUES: Record<string, { smallTargets?: number; cutImages?: boolean }> = {
  // La carte de France (bibliothèque Leaflet) : les tuiles de la carte, des images de 256 pixels, débordent de son
  // cadre, qui les coupe ; les liens « Leaflet » et « OpenStreetMap » de la mention des sources, exigée par la licence
  // d'OpenStreetMap, sont petits par conception
  "/carte": { smallTargets: 2, cutImages: true },
};

test.beforeAll(async () => {
  // Le rôle ADMIN est une ligne de RoleConfig, absente du jeu de données des tests (comme dans mobile-audit.spec.ts)
  await withTestDb(async (prisma) => {
    await prisma.roleConfig.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", label: "Administrateur", power: 90, isBaseRole: true },
    });
    await prisma.user.upsert({
      where: { id: ADMIN_ID },
      update: { role: "ADMIN" },
      create: { id: ADMIN_ID, name: "Admin Parcours", email: "admin-parcours@e2e.test", role: "ADMIN", hasFinishedOnboarding: true },
    });
    await prisma.article.upsert({
      where: { id: ARTICLE_ID },
      update: {},
      create: { id: ARTICLE_ID, title: "Article du parcours", content: "[b]Texte[/b] de l'article du parcours.", authorId: E2E.coachId },
    });
  });
});

/** Visite une page en téléphone puis en ordinateur ; renvoie la liste de ses problèmes (vide si tout va bien). */
async function checkPage(page: Page, path: string, jsErrors: string[]): Promise<string[]> {
  const problems: string[] = [];
  jsErrors.length = 0;

  await page.setViewportSize(PHONE);
  const response = await page.goto(path, { waitUntil: "networkidle" });
  const status = response?.status() ?? 0;
  if (status >= 400) problems.push(`répond ${status}`);
  if (!(await page.getByRole("main").first().isVisible())) problems.push("contenu principal absent");

  const phone = await measure(page);
  const known = KNOWN_ISSUES[path] ?? {};
  const onlyImagesCut = phone.cutElements.every((element) => element.startsWith("img "));
  if (phone.overflowPx > 0 || (phone.cutCount > 0 && !(known.cutImages && onlyImagesCut))) {
    problems.push(`téléphone : déborde de ${phone.overflowPx} px à droite, ${phone.cutCount} élément(s) coupé(s) ${phone.cutElements.join(" ; ")}`);
  }
  if (phone.smallTargetCount > (known.smallTargets ?? 0)) {
    problems.push(`téléphone : ${phone.smallTargetCount} bouton(s) ou lien(s) de moins de 44 px : ${phone.smallTargets.join(" ; ")}`);
  }
  if (phone.zoomingInputs > 0) {
    problems.push(`téléphone : ${phone.zoomingInputs} champ(s) de saisie sous 16 px : ${phone.zoomingInputList.join(" ; ")}`);
  }

  // Même page en taille ordinateur : la mise en page s'adapte sans recharger la page
  await page.setViewportSize(DESKTOP);
  await page.waitForTimeout(150);
  if (!(await page.getByRole("main").first().isVisible())) problems.push("ordinateur : contenu principal absent");
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (desktopOverflow > 0) problems.push(`ordinateur : déborde de ${desktopOverflow} px à droite`);

  if (jsErrors.length > 0) problems.push(`erreur JavaScript : ${jsErrors.slice(0, 3).join(" ; ")}`);
  return problems;
}

test("parcours de toutes les pages principales", async ({ page }) => {
  // Bandeau des cookies masqué : il apparaît après 1,5 seconde et fausserait les mesures
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
  const jsErrors: string[] = [];
  page.on("pageerror", (error) => jsErrors.push(error.message.split("\n")[0]));

  const lines: string[] = [];
  let problemCount = 0;
  for (const group of GROUPS) {
    if (group.userId) await loginAs(page, group.userId);
    for (const path of group.paths) {
      const start = Date.now();
      const problems = await test.step(`${group.who} ${path}`, () => checkPage(page, path, jsErrors));
      const seconds = ((Date.now() - start) / 1000).toFixed(1);
      lines.push(`${problems.length === 0 ? "OK    " : "ÉCHEC "} [${group.who}] ${path} (${seconds} s)`);
      for (const problem of problems) lines.push(`       - ${problem}`);
      problemCount += problems.length;
    }
  }

  mkdirSync("logs", { recursive: true });
  writeFileSync("logs/parcours.txt", lines.join("\n") + "\n");
  console.log(`\nParcours de fin de carte :\n${lines.join("\n")}\n`);
  expect(problemCount, "problèmes relevés (détail dans logs/parcours.txt)").toBe(0);
});
