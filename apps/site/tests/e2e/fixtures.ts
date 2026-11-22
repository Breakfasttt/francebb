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
  // Carte 064 : identifiant fixe, pour ouvrir directement la page de création d'un sujet dans ce forum
  forumId: "e2e_forum",
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
  // Cartes 061 et 024 : sujet dont le message contient un schéma BBScheme (plateau vide), créé par globalSetup.
  // Depuis la carte 179, le schéma n'est plus dans la base du site : il est servi par le faux serveur BBScheme des
  // tests (fakeBbschemeServer.mjs, lancé par playwright.config.ts).
  bbschemeTopicId: "e2e_audit_bbscheme_topic",
  bbschemeBoardId: "e2e_audit_board",
  // Carte 179 : second schéma du même message, inconnu du faux serveur BBScheme, pour vérifier « Schéma indisponible »
  bbschemeMissingBoardId: "e2e_missing_board",
};

/** Port du faux serveur BBScheme des tests (carte 179), qui joue le rôle de l'application apps/bbscheme. */
export const E2E_BBSCHEME_PORT = 3199;

/**
 * Les thèmes du site (carte 218). Le jeu de données de test contient un modérateur et un membre banni par thème de
 * cette liste (`themedModoId`, `themedBannedId`). La lisibilité de chaque thème est vérifiée par le test de contraste.
 */
export const E2E_THEMES = ["vestiaire", "saison3", "naf", "nehekhara", "elfes-noirs"];

/**
 * Les 4 thèmes dont les pages clés sont capturées et comparées au pixel (cartes 212 et 218) : Sombre (identifiant
 * vestiaire, thème par défaut), Saison 3 (clair, parchemin), NAF (bleu marine et jaune) et Néhékhara. Le thème Violet
 * (elfes-noirs), ajouté sans capture de référence, est vérifié par le test de contraste.
 */
export const E2E_CAPTURE_THEMES = ["vestiaire", "saison3", "naf", "nehekhara"];

/**
 * Carte 051 : pour un membre connecté, c'est le thème de son profil qui s'affiche. Le jeu de données contient donc
 * un modérateur par thème (même nom « Modo E2E », pour que les captures soient identiques d'un thème à l'autre).
 */
export function themedModoId(theme: string): string {
  return `e2e_modo_${theme}`;
}

/**
 * Carte 067 : de même, un membre banni par thème pour les captures de la page des bannis. Le test n'a ainsi plus
 * besoin de changer le thème du banni dans la base pendant que le site tourne. La petite base locale n'accepte
 * qu'une connexion à la fois : le test attendait que le site lâche la sienne, parfois plus de 60 secondes.
 */
export function themedBannedId(theme: string): string {
  return `e2e_banned_${theme}`;
}

/**
 * Connecte la page comme le membre `userId` (fournisseur « dev-login », qui n'existe qu'en développement).
 * La petite base locale (« prisma dev ») rate parfois une requête juste après la fermeture de la page du test
 * précédent (erreur « bind message supplies 3 parameters… » dans le journal du site) : le fournisseur refuse alors la
 * connexion et renvoie vers /auth/login?error=CredentialsSignin, et le test suivant se retrouvait visiteur. La
 * connexion est donc vérifiée et retentée chaque seconde, 5 fois au plus.
 */
export async function loginAs(page: Page, userId: string) {
  for (let attempt = 1; ; attempt++) {
    const csrfRes = await page.request.get("/api/auth/csrf");
    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
    const res = await page.request.post("/api/auth/callback/dev-login", {
      form: { csrfToken, userId, callbackUrl: "/" },
    });
    if (!res.url().includes("error=")) return;
    if (attempt >= 5) throw new Error(`Connexion de test refusée pour ${userId} : ${res.url()}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
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

/** Ce que renvoient les actions serveur du site : `{ success, error }`, ou `{ error }` pour quelques anciennes. */
export type ActionReply = { success?: boolean; error?: string; [key: string]: unknown };

/**
 * Carte 221 : appelle une action serveur directement, avec la session de la page, comme pourrait le faire un visiteur
 * malveillant (une action serveur est appelable avec n'importe quels arguments, même si l'écran ne les propose pas).
 *
 * Next.js identifie une action par un numéro que l'on trouve dans le JavaScript envoyé au navigateur
 * (`createServerReference("<numéro>", …, "<nom>")`). On ouvre donc `pagePath`, une page dont un composant importe
 * l'action, on y relève le numéro de `actionName`, puis on envoie les arguments à la page avec l'en-tête
 * `Next-Action`. Renvoie ce que l'action a renvoyé (la ligne de résultat du flux RSC), ou `undefined`.
 */
export async function callServerAction(page: Page, pagePath: string, actionName: string, args: unknown[]): Promise<ActionReply | undefined> {
  const html = await (await page.request.get(pagePath)).text();
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((match) => match[1].replace(/&amp;/g, "&"));
  let actionId: string | undefined;
  for (const src of scripts) {
    const code = await (await page.request.get(src)).text();
    const pattern = new RegExp(String.raw`createServerReference"\]\)\("([0-9a-f]+)",[^)]*"${actionName}"\)`);
    actionId = code.match(pattern)?.[1];
    if (actionId) break;
  }
  if (!actionId) throw new Error(`Action ${actionName} introuvable dans le JavaScript de ${pagePath}`);

  // Next.js refuse une action dont l'origine n'est pas le site lui-même : on envoie celle du serveur des tests.
  const origin = new URL((await page.request.get("/api/auth/csrf")).url()).origin;
  const res = await page.request.post(pagePath, {
    headers: {
      "Next-Action": actionId,
      "Content-Type": "text/plain;charset=UTF-8",
      Accept: "text/x-component",
      Origin: origin,
    },
    data: JSON.stringify(args),
  });
  // Flux RSC : la ligne 0 donne le numéro de la ligne du résultat (« "a":"$@1" »). Quand l'action rafraîchit la page,
  // le flux contient aussi l'arbre de la page, avant ou après : on lit donc chaque ligne par son numéro.
  const lines = (await res.text()).split("\n");
  const resultRef = lines.find((line) => line.startsWith("0:{"))?.match(/"a":"\$@([0-9a-f]+)"/)?.[1];
  if (!resultRef) return undefined;
  const resultLine = lines.filter((line) => line.startsWith(`${resultRef}:{`) || line.startsWith(`${resultRef}:[`)).pop();
  return resultLine ? JSON.parse(resultLine.slice(resultRef.length + 1)) : undefined;
}
