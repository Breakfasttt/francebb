/**
 * Données et helpers partagés des tests smoke : identifiants fixes du jeu de données e2e
 * et connexion via le provider Credentials "dev-login".
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Page } from "@playwright/test";

/**
 * Base Postgres locale réservée aux tests (serveur « site-e2e » de scripts/local-postgres.mjs),
 * recréée vide à chaque lancement par scripts/e2e-db.mjs : ne peut jamais viser la base de développement ni la prod.
 * Son adresse (port choisi au démarrage) est lue dans .local-postgres.json, à la racine du dépôt.
 */
export const E2E_DATABASE_URL: string = JSON.parse(
  readFileSync(resolve(process.cwd(), "../../.local-postgres.json"), "utf-8")
)["site-e2e"];

export const E2E = {
  coachId: "e2e_coach",
  coachEmail: "coach@e2e.test",
  bannedId: "e2e_banned",
  categoryName: "E2E Catégorie",
  forumName: "E2E Forum",
  topicId: "e2e_topic",
  topicTitle: "E2E Topic de test",
  postContent: "Premier message du topic e2e",
  modoId: "e2e_modo",
  secretCategoryName: "E2E Catégorie Modo",
  secretForumId: "e2e_secret_forum",
  secretForumName: "E2E Forum Secret",
  secretTopicId: "e2e_secret_topic",
  secretTopicTitle: "E2E Topic Secret",
  // Carte 050 : membre à bannir depuis /spy, articles (dont un masqué par la modération) du coach
  targetId: "e2e_target",
  articleId: "e2e_article",
  moderatedArticleId: "e2e_article_moderated",
};

export async function loginAs(page: Page, userId: string) {
  const csrfRes = await page.request.get("/api/auth/csrf");
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  await page.request.post("/api/auth/callback/dev-login", {
    form: { csrfToken, userId, callbackUrl: "/" },
  });
}
