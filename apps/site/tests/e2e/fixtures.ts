/**
 * Données et helpers partagés des tests smoke : identifiants fixes du jeu de données e2e
 * et connexion via le provider Credentials "dev-login".
 */
import type { Page } from "@playwright/test";

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
};

export async function loginAs(page: Page, userId: string) {
  const csrfRes = await page.request.get("/api/auth/csrf");
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  await page.request.post("/api/auth/callback/dev-login", {
    form: { csrfToken, userId, callbackUrl: "/" },
  });
}
