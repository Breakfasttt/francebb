/**
 * Mesure du temps de réponse du serveur (carte 070), lancée par `pnpm temps-reponse`.
 * L'ADR 0005 renonce au cache des pages : elles sont recalculées à chaque visite. Ce test dit si cela reste assez
 * rapide. Il mesure le « temps jusqu'au premier octet » (TTFB, en anglais « time to first byte ») : le délai entre
 * l'envoi de la requête et l'arrivée du premier octet de la réponse, donc le temps de calcul du serveur et de la base.
 * Le site est celui de la version de production, monté par playwright.lighthouse.config.ts (même base de test, même
 * connexion de membre que la mesure Lighthouse). Le test ne touche pas la base lui-même : il ne fait que visiter.
 * Chaque page est visitée une fois « à blanc » (le premier passage réveille le serveur et n'est pas compté), puis
 * RUNS fois, et la médiane (valeur du milieu) est gardée. Rapport : logs/temps-reponse-AAAA-MM-JJ.txt.
 * Un dépassement du seuil est signalé par un avertissement, sans faire échouer la commande.
 */
import { test, chromium } from "@playwright/test";
import { encode } from "@auth/core/jwt";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { E2E } from "../e2e/fixtures";

const RUNS = Number(process.env.TEMPS_REPONSE_RUNS ?? 5);
/** Seuil de l'ADR 0005, en millisecondes : au-dessus, la question du cache peut être rouverte. */
const THRESHOLD_MS = 1000;
const OUT_DIR = resolve(process.env.TEMPS_REPONSE_OUT ?? "logs");

/** `member` : identifiant du membre connecté pendant la mesure ; absent = visiteur sans compte. */
const PAGES: { name: string; path: string; member?: string }[] = [
  { name: "accueil", path: "/" },
  { name: "forum", path: "/forum" },
  { name: "sujet", path: `/forum/topic/${E2E.topicId}` },
  { name: "profil", path: "/profile", member: E2E.coachId },
  { name: "tournois", path: "/tournois" },
];

/** Fabrique le cookie de session d'un membre (même méthode que la mesure Lighthouse). */
async function sessionToken(userId: string): Promise<string> {
  const name = "authjs.session-token";
  return encode({
    token: { sub: userId, id: userId, hasFinishedOnboarding: true, isBanned: false },
    secret: process.env.LIGHTHOUSE_AUTH_SECRET as string,
    salt: name,
  });
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

test("Temps de réponse du serveur des pages principales", async ({ baseURL }) => {
  const browser = await chromium.launch({ channel: "chromium" });
  const lines: string[] = [];
  const slow: string[] = [];

  try {
    for (const page of PAGES) {
      const context = await browser.newContext();
      if (page.member) {
        await context.addCookies([
          { name: "authjs.session-token", value: await sessionToken(page.member), url: baseURL as string },
        ]);
      }
      const tab = await context.newPage();
      const url = `${baseURL}${page.path}`;
      const times: number[] = [];
      for (let run = 0; run <= RUNS; run++) {
        const response = await tab.goto(url, { waitUntil: "commit" });
        if (!response || !response.ok()) throw new Error(`${url} : réponse ${response?.status() ?? "absente"}`);
        await tab.waitForLoadState("load");
        const ttfb = await tab.evaluate(() => {
          const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
          return nav.responseStart - nav.requestStart;
        });
        if (run > 0) times.push(Math.round(ttfb)); // le passage 0 est à blanc
      }
      await context.close();

      const med = median(times);
      const flag = med > THRESHOLD_MS ? "AVERTISSEMENT, au-dessus du seuil" : "ok";
      lines.push(`${page.name.padEnd(9)} ${page.path.padEnd(28)} médiane ${String(med).padStart(5)} ms  (mesures : ${times.join(", ")})  ${flag}`);
      if (med > THRESHOLD_MS) slow.push(`${page.name} (${med} ms)`);
    }
  } finally {
    await browser.close();
  }

  const date = new Date().toISOString().slice(0, 10);
  const report = [
    `Temps de réponse du serveur (temps jusqu'au premier octet), site de production, ${RUNS} mesures par page, médiane gardée.`,
    `Seuil : ${THRESHOLD_MS} ms. Date : ${date}.`,
    "",
    ...lines,
    "",
    slow.length
      ? `AVERTISSEMENT : pages au-dessus de ${THRESHOLD_MS} ms : ${slow.join(", ")}. Voir l'ADR 0005 (réouverture possible de la question du cache).`
      : `Aucune page au-dessus de ${THRESHOLD_MS} ms.`,
    "",
  ].join("\n");
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(resolve(OUT_DIR, `temps-reponse-${date}.txt`), report);
  console.log(report);
});
