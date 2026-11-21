/**
 * Outil de la boucle d'interface (commande /boucle-ui, carte 220) : captures des pages réservées aux membres, connecté avec la
 * connexion de développement (comme les tests e2e), en 390 et 1440 pixels de large.
 * Usage : node scripts/captures-membre.mjs [id du membre] (serveur `pnpm dev` lancé, profil exemple)
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = "http://localhost:3000";
const USER = process.argv[2] || "exemple-admin";
const OUT = path.resolve(import.meta.dirname, "../../../docs/design/captures");
const PAGES = ["", "profile", "messagerie", "membres", "notifications", "forum/unread", "administration", "moderation"];

const browser = await chromium.launch();
for (const [width, height] of [[390, 844], [1440, 900]]) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const csrf = await (await page.request.get(`${BASE}/api/auth/csrf`)).json();
  await page.request.post(`${BASE}/api/auth/callback/dev-login`, { form: { csrfToken: csrf.csrfToken, userId: USER, callbackUrl: "/" } });
  for (const target of PAGES) {
    const name = `membre-${target.replace(/\//g, "-") || "accueil"}`;
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
