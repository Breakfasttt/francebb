/**
 * Captures d'écran par rôle pour la revue d'interface (carte 221). Site local lancé par `pnpm dev exemple` (port 3000).
 *
 * Usage, depuis apps/site : node scripts/ux-capture.mjs <scenarios.json> [dossier de sortie, défaut ../../logs/ux-221]
 *
 * Le fichier de scénarios est une liste :
 *   [{ "name": "forum-accueil-visiteur", "account": null, "url": "/forum",
 *      "viewports": ["390x844", "1440x900"], "full": true,
 *      "steps": [{ "click": "Outils" }, { "fill": ["Titre", "Mon titre"] }, { "wait": 500 }, { "press": "Escape" }] }]
 * Étape `{ "scroll": 800 }` : fait défiler la page de 800 pixels vers le bas.
 * `account` : identifiant d'un compte (`exemple-modo`…), ou null pour un visiteur.
 * Chaque scénario produit <name>-<largeur>.png et <name>-<largeur>.txt (structure accessible de la page : titres,
 * boutons, liens, champs), plus les erreurs de la console. Les étapes cherchent un bouton, un lien, puis un texte.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const BASE = process.env.UX_BASE ?? "http://localhost:3000";
const [scenarioFile, outArg] = process.argv.slice(2);
if (!scenarioFile) {
  console.error("Usage : node scripts/ux-capture.mjs <scenarios.json> [dossier]");
  process.exit(1);
}
const outDir = resolve(outArg ?? "../../logs/ux-221");
mkdirSync(outDir, { recursive: true });
const scenarios = JSON.parse(readFileSync(scenarioFile, "utf-8"));

async function login(context, account) {
  const csrf = await (await context.request.get(`${BASE}/api/auth/csrf`)).json();
  const res = await context.request.post(`${BASE}/api/auth/callback/dev-login`, {
    form: { csrfToken: csrf.csrfToken, userId: account, callbackUrl: "/" },
  });
  if (res.url().includes("error=")) throw new Error(`Connexion refusée pour ${account}`);
}

async function target(page, label) {
  for (const locator of [
    page.getByRole("button", { name: label }),
    page.getByRole("link", { name: label }),
    page.getByRole("tab", { name: label }),
    page.getByRole("menuitem", { name: label }),
    page.getByText(label, { exact: false }),
  ]) {
    const visible = locator.filter({ visible: true });
    if (await visible.count()) return visible.first();
  }
  throw new Error(`Élément introuvable : ${label}`);
}

const browser = await chromium.launch();
for (const scenario of scenarios) {
  for (const viewport of scenario.viewports ?? ["390x844", "1440x900"]) {
    const [width, height] = viewport.split("x").map(Number);
    const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 600, hasTouch: width < 600 });
    const errors = [];
    const file = `${scenario.name}-${width}`;
    try {
      if (scenario.account) await login(context, scenario.account);
      const page = await context.newPage();
      page.on("console", (message) => message.type() === "error" && errors.push(message.text().slice(0, 300)));
      page.on("pageerror", (error) => errors.push(String(error).slice(0, 300)));
      await page.goto(`${BASE}${scenario.url}`, { waitUntil: "networkidle", timeout: 120000 });
      for (const step of scenario.steps ?? []) {
        if (step.click) await (await target(page, step.click)).click();
        if (step.fill) await page.getByLabel(step.fill[0]).filter({ visible: true }).first().fill(step.fill[1]);
        if (step.press) await page.keyboard.press(step.press);
        if (step.scroll) await page.mouse.wheel(0, step.scroll);
        if (step.goto) await page.goto(`${BASE}${step.goto}`, { waitUntil: "networkidle", timeout: 120000 });
        await page.waitForTimeout(step.wait ?? 400);
      }
      await page.screenshot({ path: `${outDir}/${file}.png`, fullPage: scenario.full ?? false });
      const aria = await page.locator("body").ariaSnapshot();
      writeFileSync(`${outDir}/${file}.txt`, `URL : ${page.url()}\nErreurs console : ${errors.length ? errors.join("\n") : "aucune"}\n\n${aria}`);
      console.log(`ok   ${file}`);
    } catch (error) {
      console.log(`ÉCHEC ${file} : ${String(error).split("\n")[0]}`);
    } finally {
      await context.close();
    }
  }
}
await browser.close();
