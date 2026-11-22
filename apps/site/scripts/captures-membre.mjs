/**
 * Outil de la boucle d'interface (commande /boucle-ui, carte 220) : captures des pages réservées aux membres, connecté avec la
 * connexion de développement (comme les tests e2e), en 390 et 1440 pixels de large.
 * Usage : node scripts/captures-membre.mjs [id du membre | visiteur] (serveur `pnpm dev` lancé, profil exemple)
 * Variables : THEME=<identifiant> pour un visiteur (cookie du thème : saison3, naf, nehekhara, elfes-noirs…),
 * PAGES="forum,tournois" pour choisir les pages. Un membre connecté garde le thème enregistré dans son profil.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = "http://localhost:3000";
const USER = process.argv[2] || "exemple-admin";
const OUT = path.resolve(import.meta.dirname, "../../../docs/design/captures");
const THEME = process.env.THEME || "";
const PAGES = process.env.PAGES
  ? process.env.PAGES.split(",").map((page) => page.trim())
  : ["", "profile", "messagerie", "membres", "notifications", "forum/unread", "administration", "moderation"];
const PREFIX = USER === "visiteur" ? `theme-${THEME || "saison3"}` : "membre";

const browser = await chromium.launch();
for (const [width, height] of [[390, 844], [1440, 900]]) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  if (THEME) await context.addCookies([{ name: "bbfrance_theme", value: THEME, url: BASE }]);
  if (USER !== "visiteur") {
    const csrf = await (await page.request.get(`${BASE}/api/auth/csrf`)).json();
    await page.request.post(`${BASE}/api/auth/callback/dev-login`, { form: { csrfToken: csrf.csrfToken, userId: USER, callbackUrl: "/" } });
  }
  for (const target of PAGES) {
    const name = `${PREFIX}-${target.replace(/\//g, "-") || "accueil"}`;
    mkdirSync(path.join(OUT, name), { recursive: true });
    try {
      await page.goto(`${BASE}/${target}`, { waitUntil: "networkidle", timeout: 600_000 });
      await page.screenshot({ path: path.join(OUT, name, `${width}x${height}.png`) });
      console.log("ok", name, width);
    } catch (error) {
      console.log("échec", name, width, String(error).slice(0, 120));
    }
  }
  await context.close();
}
await browser.close();
