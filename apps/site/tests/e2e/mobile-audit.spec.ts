/**
 * Audit mobile (carte 049) : ouvre chaque page en taille téléphone et relève les problèmes mesurables.
 * - contenu coupé ou débordant à droite (le site masque le défilement horizontal, `overflow-x: hidden`,
 *   donc un élément trop large n'est pas défilable mais coupé : on compte les éléments qui dépassent du bord) ;
 * - boutons et liens trop petits pour le pouce (moins de 44 pixels de haut ou de large) ;
 * - textes trop petits (moins de 12 pixels) ;
 * - champs de saisie sous 16 pixels (l'iPhone zoome alors automatiquement en entrant dedans).
 * Lancé seulement avec MOBILE_AUDIT=1 (relevé, pas un test bloquant) : écrit logs/mobile-audit.json (détail)
 * et logs/mobile-audit-summary.txt (résumé, une ligne par page et par taille d'écran, aussi affiché à l'écran).
 * MOBILE_AUDIT_PAGES=/profile,/tournois limite le relevé à ces pages : chemin sans la partie « ?… », ou début
 * de chemin terminé par « * » (par exemple /forum/topic/*).
 */
import { test, type Browser, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { E2E, loginAs, withTestDb } from "./fixtures";

const PHONES = [
  { name: "téléphone récent (390 × 844)", width: 390, height: 844 },
  { name: "petit téléphone (360 × 640)", width: 360, height: 640 },
];

/**
 * Qui visite la page (carte 058) : `connected: false` ouvre la page en visiteur, sans session (avant, tout était
 * mesuré connecté en modérateur, si bien que `/auth/login` renvoyait vers l'accueil et n'était jamais mesurée).
 * `as` désigne un membre particulier : un nouveau membre qui n'a pas fini son inscription (`/auth/onboarding`)
 * ou un membre banni (`/banned`), ou un administrateur (`/administration`, carte 061 : un modérateur en est renvoyé
 * vers l'accueil). Sinon, la page est ouverte en modérateur.
 */
type Visitor = "visiteur" | "moderateur" | "nouveau" | "banni" | "admin";

/** Membre de test créé par l'audit seulement : inscription non terminée, donc renvoyé vers /auth/onboarding. */
const NEWCOMER_ID = "e2e_audit_newcomer";

/**
 * Sujet créé par l'audit seulement (carte 061) : son message contient un schéma BBScheme, pour mesurer le lecteur
 * BBSchemePlayer tel qu'il s'affiche dans le forum. Le schéma est vide (terrain sans joueurs), ce qui suffit pour
 * mesurer les commandes du lecteur.
 */
const BBSCHEME_TOPIC_ID = "e2e_audit_bbscheme_topic";
const BBSCHEME_BOARD_ID = "e2e_audit_board";

/** Administrateur créé par l'audit seulement (carte 061), pour mesurer /administration. */
const ADMIN_ID = "e2e_audit_admin";

/**
 * `openFilters` (carte 061) : la page est mesurée une seconde fois, panneau de filtres ouvert par son bouton
 * flottant (MobileFilterWrapper). Sans cela, les cases à cocher des filtres ne sont jamais mesurées.
 */
const PAGES: { path: string; connected: boolean; as?: Visitor; openFilters?: boolean }[] = [
  { path: "/", connected: false },
  { path: "/forum", connected: false },
  { path: `/forum/topic/${E2E.topicId}`, connected: true },
  { path: `/forum/topic/${E2E.topicId}/reply`, connected: true },
  { path: `/forum/topic/${BBSCHEME_TOPIC_ID}`, connected: true },
  { path: "/forum/search", connected: true },
  // Carte 064 : les trois formulaires de création
  { path: "/forum/new-forum", connected: true },
  { path: `/forum/new-topic?forumId=${E2E.forumId}`, connected: true },
  { path: "/ligues/create", connected: true },
  { path: "/tournois", connected: false },
  { path: "/tournois", connected: false, openFilters: true },
  { path: "/classement", connected: false },
  { path: "/statistiques", connected: false },
  { path: "/articles", connected: false },
  { path: "/ressources", connected: false },
  { path: "/media", connected: false },
  { path: "/ligues", connected: false },
  { path: "/carte", connected: false },
  { path: "/membres", connected: true },
  { path: "/messagerie", connected: true },
  { path: "/profile", connected: true },
  { path: "/bbscheme", connected: false },
  { path: "/bbquizz", connected: true },
  { path: "/jouer", connected: false },
  { path: "/mentions-legales", connected: false },
  { path: "/auth/login", connected: false },
  { path: "/auth/onboarding", connected: true, as: "nouveau" },
  { path: "/banned", connected: true, as: "banni" },
  { path: "/moderation", connected: true },
  { path: "/administration", connected: true, as: "admin" },
];

/**
 * Filtre facultatif MOBILE_AUDIT_PAGES : liste de chemins séparés par des virgules. La barre « / » du début peut
 * être omise (« profile,tournois ») : sous Git Bash, Windows transforme un premier « /profile » en chemin de fichier.
 */
const PAGE_FILTER = (process.env.MOBILE_AUDIT_PAGES ?? "")
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean)
  .map((path) => (path.startsWith("/") ? path : `/${path}`));

function isSelected(path: string): boolean {
  if (PAGE_FILTER.length === 0) return true;
  const pathname = path.split("?")[0];
  return PAGE_FILTER.some((wanted) => wanted.endsWith("*") ? path.startsWith(wanted.slice(0, -1)) : pathname === wanted);
}

const SELECTED_PAGES = PAGES.filter((target) => isSelected(target.path));

/** Une ligne de résumé : les quatre compteurs de la page, et l'adresse finale si la page a redirigé. */
function summaryLine(report: PageReport): string {
  const redirected = report.finalPath !== report.path.split("?")[0] ? ` → ${report.finalPath}` : "";
  const filters = report.filtersOpen ? " (filtres ouverts)" : "";
  return `${report.path}${filters}${redirected} [${report.phone.match(/\d+ × \d+/)?.[0] ?? report.phone}] `
    + `cibles<44: ${report.smallTargetCount}, textes<12: ${report.tinyTextCount}, `
    + `champs<16: ${report.zoomingInputs}, coupés: ${report.cutCount}`;
}

function visitorOf(target: { connected: boolean; as?: Visitor }): Visitor {
  return target.as ?? (target.connected ? "moderateur" : "visiteur");
}

/** Ouvre un navigateur séparé par visiteur, pour que chacun garde sa propre session (ou aucune). */
async function openPageAs(browser: Browser, visitor: Visitor): Promise<Page> {
  const context = await browser.newContext();
  const page = await context.newPage();
  // Bandeau cookies masqué : il apparaît après 1,5 s et fausserait les mesures
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
  const userIds: Record<Visitor, string | null> = {
    visiteur: null,
    moderateur: E2E.modoId,
    nouveau: NEWCOMER_ID,
    banni: E2E.bannedId,
    admin: ADMIN_ID,
  };
  const userId = userIds[visitor];
  if (userId) await loginAs(page, userId);
  return page;
}

type PageReport = {
  path: string;
  filtersOpen: boolean;
  finalPath: string;
  visitor: Visitor;
  phone: string;
  overflowPx: number;
  cutElements: string[];
  cutCount: number;
  smallTargets: string[];
  smallTargetCount: number;
  tinyTextCount: number;
  tinyTexts: string[];
  zoomingInputs: number;
  zoomingInputList: string[];
  status: number | undefined;
};

async function measure(page: Page) {
  return page.evaluate(() => {
    const viewport = window.innerWidth;
    const overflowPx = Math.max(0, document.documentElement.scrollWidth - viewport);
    // Widgets de développement (absents en production) et menu latéral fermé (hors de l'écran) : ignorés
    const ignored = (element: Element) => !!element.closest(".debug-auth-widget, .debug-theme-widget, [class*='debug']");
    const visible = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none"
        && rect.left < viewport && rect.right > 0 && !ignored(element)
        && !/^Dev (Auth|Theme)/.test((element.textContent ?? "").trim());
    };
    const describe = (element: Element) => {
      const text = (element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 30);
      const label = element.getAttribute("aria-label") ?? element.getAttribute("title") ?? "";
      const rect = element.getBoundingClientRect();
      return `${element.tagName.toLowerCase()} « ${text || label || "(icône)"} » ${Math.round(rect.width)}×${Math.round(rect.height)}`;
    };
    // Un élément placé dans un cadre qui défile lui-même de gauche à droite (overflow-x: auto, comme une barre
    // d'outils ou un tableau large) n'est pas coupé : on l'atteint en faisant défiler ce cadre (carte 057)
    const inOwnScrollFrame = (element: Element) => {
      for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const overflowX = getComputedStyle(parent).overflowX;
        if ((overflowX === "auto" || overflowX === "scroll") && parent.scrollWidth > parent.clientWidth) return true;
      }
      return false;
    };
    const cut = [...document.querySelectorAll("body *")].filter((element) => {
      if (!visible(element) || inOwnScrollFrame(element)) return false;
      const rect = element.getBoundingClientRect();
      return rect.right > viewport + 2 && rect.left >= 0;
    });
    const cutRoots = cut.filter((element) => !cut.includes(element.parentElement as Element));
    const targets = [...document.querySelectorAll("a[href], button, [role=button], input[type=checkbox], input[type=radio], select")].filter(visible);
    // Une case à cocher (ou un bouton radio) placée dans une étiquette <label> se coche en touchant toute
    // l'étiquette : la cible réelle est donc l'étiquette, mesurée à sa place (carte 061)
    const touchZone = (element: Element) =>
      element.matches("input[type=checkbox], input[type=radio]") ? element.closest("label") ?? element : element;
    const small = targets.filter((element) => {
      const rect = touchZone(element).getBoundingClientRect();
      return rect.height < 44 || rect.width < 44;
    });
    const texts = [...document.querySelectorAll("p, span, a, li, td, label, small")].filter(
      (element) => visible(element) && (element.textContent ?? "").trim().length > 0 && parseFloat(getComputedStyle(element).fontSize) < 12
    );
    const inputs = [...document.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=hidden]), textarea, select")].filter(
      (element) => visible(element) && parseFloat(getComputedStyle(element).fontSize) < 16
    );
    return {
      overflowPx,
      cutCount: cutRoots.length,
      cutElements: cutRoots.slice(0, 6).map((element) => `${describe(element)} (dépasse de ${Math.round(element.getBoundingClientRect().right - viewport)} px)`),
      smallTargetCount: small.length,
      smallTargets: small.slice(0, 8).map(describe),
      tinyTextCount: texts.length,
      // Détail des textes et des champs trop petits (carte 061), avec leur taille de police
      tinyTexts: texts.slice(0, 8).map((element) => `${describe(element)} en ${getComputedStyle(element).fontSize}`),
      zoomingInputs: inputs.length,
      zoomingInputList: inputs.slice(0, 8).map((element) => `${describe(element)} en ${getComputedStyle(element).fontSize}`),
    };
  });
}

test.describe("audit mobile", () => {
  test.skip(process.env.MOBILE_AUDIT !== "1", "relevé lancé à la demande : MOBILE_AUDIT=1");
  test.setTimeout(10 * 60_000);

  test("relevé de toutes les pages", async ({ browser }) => {
    const reports: PageReport[] = [];
    // Nouveau membre (inscription non terminée), recréé à chaque relevé
    await withTestDb((prisma) => prisma.user.upsert({
      where: { id: NEWCOMER_ID },
      update: { hasFinishedOnboarding: false },
      create: { id: NEWCOMER_ID, name: "Nouveau E2E", email: "newcomer@e2e.test", hasFinishedOnboarding: false },
    }));
    // Administrateur (carte 061) : le rôle ADMIN est une ligne de RoleConfig, absente du jeu de données des tests
    await withTestDb(async (prisma) => {
      await prisma.roleConfig.upsert({
        where: { name: "ADMIN" },
        update: {},
        create: { name: "ADMIN", label: "Administrateur", power: 90, isBaseRole: true },
      });
      await prisma.user.upsert({
        where: { id: ADMIN_ID },
        update: { role: "ADMIN" },
        create: { id: ADMIN_ID, name: "Admin E2E", email: "admin@e2e.test", role: "ADMIN", hasFinishedOnboarding: true },
      });
    });
    // Sujet dont le message affiche le lecteur BBScheme (carte 061)
    await withTestDb(async (prisma) => {
      await prisma.bBSchemeState.upsert({
        where: { id: BBSCHEME_BOARD_ID },
        update: {},
        create: { id: BBSCHEME_BOARD_ID, hash: BBSCHEME_BOARD_ID, data: "{}" },
      });
      await prisma.topic.upsert({
        where: { id: BBSCHEME_TOPIC_ID },
        update: {},
        create: {
          id: BBSCHEME_TOPIC_ID,
          title: "Schéma BBScheme de l'audit",
          forumId: E2E.forumId,
          authorId: E2E.coachId,
          posts: { create: { content: `Voici le schéma : [bbscheme]${BBSCHEME_BOARD_ID}[/bbscheme]`, authorId: E2E.coachId } },
        },
      });
    });
    // Un navigateur par visiteur ; le modérateur voit toutes les pages réservées (modération et administration en lecture)
    const pages = new Map<Visitor, Page>();
    for (const visitor of new Set(SELECTED_PAGES.map(visitorOf))) pages.set(visitor, await openPageAs(browser, visitor));
    for (const phone of PHONES) {
      for (const target of SELECTED_PAGES) {
        const page = pages.get(visitorOf(target))!;
        await page.setViewportSize({ width: phone.width, height: phone.height });
        const response = await page.goto(target.path, { waitUntil: "networkidle" }).catch(() => null);
        if (target.openFilters) {
          await page.locator(".mobile-filter-fab").click();
          await page.waitForTimeout(600); // fin de l'animation du panneau qui monte du bas
        }
        const metrics = await measure(page);
        // Adresse finale : une redirection (page réservée, membre déjà connecté…) se voit dans le relevé
        const finalPath = new URL(page.url()).pathname;
        reports.push({ path: target.path, filtersOpen: !!target.openFilters, finalPath, visitor: visitorOf(target), phone: phone.name, status: response?.status(), ...metrics });
      }
    }
    mkdirSync("logs", { recursive: true });
    writeFileSync("logs/mobile-audit.json", JSON.stringify(reports, null, 2));
    const summary = reports.map(summaryLine).join("\n");
    writeFileSync("logs/mobile-audit-summary.txt", summary + "\n");
    console.log(`\nRésumé de l'audit mobile :\n${summary}`);
  });
});
