/**
 * Données et helpers partagés des tests smoke : identifiants fixes du jeu de données e2e
 * et connexion via le provider Credentials "dev-login".
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Page } from "@playwright/test";
import { PrismaClient } from "../../prisma/generated-client";
import { PrismaPg } from "@prisma/adapter-pg";

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
  // Carte 060 : modérateur banni, créé par son test, que le modérateur « Modo E2E » (même rang) ne doit pas pouvoir débannir
  bannedModoId: "e2e_banned_modo",
  bannedModoName: "Modérateur banni E2E",
};

/** Les 7 thèmes du site, dans l'ordre des captures de référence. */
export const E2E_THEMES = ["default", "light", "blood", "malpierre", "nehekhara", "saison3", "naf"];

/**
 * Carte 051 : pour un membre connecté, c'est le thème de son profil qui s'affiche. Le jeu de données contient donc
 * un modérateur par thème (même nom « Modo E2E », pour que les captures soient identiques d'un thème à l'autre).
 */
export function themedModoId(theme: string): string {
  return `e2e_modo_${theme}`;
}

export async function loginAs(page: Page, userId: string) {
  const csrfRes = await page.request.get("/api/auth/csrf");
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  await page.request.post("/api/auth/callback/dev-login", {
    form: { csrfToken, userId, callbackUrl: "/" },
  });
}

/**
 * Ouvre une connexion à la base de test, exécute `run`, puis referme la connexion.
 * La petite base locale (« prisma dev ») coupe parfois une nouvelle connexion quand le site garde déjà la sienne
 * ouverte (erreur « Server has closed the connection ») : on réessaie alors chaque seconde, 30 fois au plus.
 */
export async function withTestDb<T>(run: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: E2E_DATABASE_URL }) });
    try {
      return await run(prisma);
    } catch (error) {
      const refused = error instanceof Error && error.message.includes("Server has closed the connection");
      if (!refused || attempt >= 30) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      await prisma.$disconnect();
    }
  }
}
