/**
 * Mesure de fluidité sur téléphone (carte 059) : passe les pages principales du site dans Lighthouse, l'outil de Google
 * qui note la vitesse d'une page sur 100, en mode mobile (téléphone de milieu de gamme et réseau 4G lent simulés).
 * Lancé par `pnpm lighthouse` (configuration playwright.lighthouse.config.ts, site en version de production).
 * Chaque page est mesurée plusieurs fois et la mesure médiane est gardée, car la note varie d'un passage à l'autre.
 * Résultats dans logs/lighthouse/ (ou le dossier donné par LIGHTHOUSE_OUT) : un rapport HTML par page, lisible dans
 * un navigateur, et summary.json qui résume les notes et les principales causes de lenteur.
 */
import { test, chromium } from "@playwright/test";
import { encode } from "@auth/core/jwt";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { E2E } from "../e2e/fixtures";

/** Port sur lequel Chromium accepte qu'un programme (ici Lighthouse) le pilote. */
const DEBUG_PORT = 9333;
const RUNS = Number(process.env.LIGHTHOUSE_RUNS ?? 3);
const OUT_DIR = resolve(process.env.LIGHTHOUSE_OUT ?? "logs/lighthouse");
/** Objectif fixé par la carte 059 : 90/100 sur téléphone. */
const TARGET = 90;

/** `member` : identifiant du membre connecté pendant la mesure ; absent = visiteur sans compte. */
const PAGES: { name: string; path: string; member?: string }[] = [
  { name: "accueil", path: "/" },
  { name: "forum", path: "/forum" },
  { name: "sujet", path: `/forum/topic/${E2E.topicId}` },
  { name: "tournois", path: "/tournois" },
  { name: "profil", path: "/profile", member: E2E.coachId },
];

/** Indicateurs principaux relevés pour chaque page (identifiants des audits Lighthouse). */
const METRICS = {
  fcp: "first-contentful-paint",
  lcp: "largest-contentful-paint",
  tbt: "total-blocking-time",
  cls: "cumulative-layout-shift",
  speedIndex: "speed-index",
} as const;

type Audit = { id: string; title: string; score: number | null; displayValue?: string; scoreDisplayMode: string };
type Lhr = {
  categories: { performance: { score: number | null; auditRefs: { id: string; group?: string }[] } };
  audits: Record<string, Audit & { numericValue?: number }>;
  runtimeError?: { message: string };
};

/**
 * Fabrique le cookie de session d'un membre, comme le ferait une vraie connexion : en production, la connexion de test
 * « dev-login » est désactivée. Le cookie est chiffré avec la clé propre à cette mesure (voir la configuration).
 */
async function sessionCookie(userId: string): Promise<string> {
  const name = "authjs.session-token";
  const value = await encode({
    token: { sub: userId, id: userId, hasFinishedOnboarding: true, isBanned: false },
    secret: process.env.LIGHTHOUSE_AUTH_SECRET as string,
    salt: name,
  });
  return `${name}=${value}`;
}

/** Causes de lenteur relevées par Lighthouse : audits de la catégorie performance qui ne sont pas réussis. */
function mainIssues(lhr: Lhr) {
  return lhr.categories.performance.auditRefs
    .filter((ref) => ref.group !== "metrics")
    .map((ref) => lhr.audits[ref.id])
    .filter((audit) => audit && audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode !== "informative")
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
    .map((audit) => ({ id: audit.id, title: audit.title, value: audit.displayValue ?? "" }));
}

test("Lighthouse mobile des pages principales", async ({ baseURL }) => {
  const { default: lighthouse } = await import("lighthouse");
  mkdirSync(OUT_DIR, { recursive: true });
  // Navigateur Chromium installé par Playwright, ouvert à Lighthouse par le port de pilotage
  const browser = await chromium.launch({ channel: "chromium", args: [`--remote-debugging-port=${DEBUG_PORT}`] });
  const summary: Record<string, unknown>[] = [];

  try {
    for (const page of PAGES) {
      const url = `${baseURL}${page.path}`;
      const headers = page.member ? { Cookie: await sessionCookie(page.member) } : undefined;
      const runs: { lhr: Lhr; html: string }[] = [];
      for (let run = 1; run <= RUNS; run++) {
        const result = await lighthouse(url, {
          port: DEBUG_PORT,
          output: "html",
          logLevel: "error",
          onlyCategories: ["performance"],
          extraHeaders: headers,
        });
        if (!result) throw new Error(`Lighthouse n'a rien renvoyé pour ${url}`);
        const lhr = result.lhr as unknown as Lhr;
        if (lhr.runtimeError) throw new Error(`${url} : ${lhr.runtimeError.message}`);
        runs.push({ lhr, html: result.report as string });
      }

      // Mesure médiane : celle dont la note est au milieu des passages
      runs.sort((a, b) => (a.lhr.categories.performance.score ?? 0) - (b.lhr.categories.performance.score ?? 0));
      const median = runs[Math.floor(runs.length / 2)];
      writeFileSync(resolve(OUT_DIR, `${page.name}.html`), median.html);

      const { lhr } = median;
      const metrics = Object.fromEntries(
        Object.entries(METRICS).map(([key, id]) => [key, lhr.audits[id]?.displayValue ?? "?"])
      );
      const entry = {
        page: page.name,
        path: page.path,
        visitor: page.member ? `membre ${page.member}` : "visiteur",
        score: Math.round((lhr.categories.performance.score ?? 0) * 100),
        allScores: runs.map((r) => Math.round((r.lhr.categories.performance.score ?? 0) * 100)),
        metrics,
        issues: mainIssues(lhr),
      };
      summary.push(entry);
      console.log(
        `${entry.score < TARGET ? "SOUS L'OBJECTIF" : "OK"} ${page.path} : ${entry.score}/100 ` +
          `(passages ${entry.allScores.join(", ")}) LCP ${metrics.lcp}, TBT ${metrics.tbt}, CLS ${metrics.cls}`
      );
      for (const issue of entry.issues) console.log(`   - ${issue.title} ${issue.value}`);
    }
  } finally {
    await browser.close();
    writeFileSync(resolve(OUT_DIR, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  }
});
