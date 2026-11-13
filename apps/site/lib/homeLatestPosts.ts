/**
 * Les derniers messages du forum montrés sur l'accueil (carte 205).
 *
 * Chaque lecteur ne voit que les messages des forums qui lui sont ouverts : la requête passe par `topicAccessWhere`
 * (`lib/forumAccess.ts`), avec les rôles du lecteur. Sont exclus les messages supprimés, masqués par la modération
 * ou écrits par un membre banni, et les sujets supprimés.
 *
 * Le résultat est gardé en cache (`unstable_cache`, ADR-0005), une entrée par ensemble de rôles : un visiteur et un
 * modérateur n'ont pas la même liste. L'étiquette `HOME_LATEST_POSTS_TAG` est vidée par `refreshTopic`
 * (`lib/pageRefresh.ts`) dès qu'un message est publié ou supprimé ; les autres changements (modération d'un message)
 * apparaissent au plus tard après `HOME_LATEST_POSTS_TTL_S` secondes.
 *
 * Ce fichier n'a pas `"use server"` : la fonction reçoit les rôles en paramètre, elle ne doit donc jamais pouvoir être
 * appelée depuis le navigateur. Le navigateur passe par l'action `fetchLatestPosts` (`app/homeActions.ts`), qui lit
 * les rôles dans la session.
 */
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { topicAccessWhere } from "@/lib/forumAccess";
import { stripBBCode } from "@/lib/bbcode";

/** Étiquette du cache des derniers messages de l'accueil. */
export const HOME_LATEST_POSTS_TAG = "home-latest-posts";

/** Durée maximale de ce cache, en secondes. */
const HOME_LATEST_POSTS_TTL_S = 30;

/** Nombre de messages montrés. */
const LATEST_POSTS_COUNT = 3;

/** Longueur maximale du début de message affiché, en caractères. */
const EXCERPT_LENGTH = 140;

/** Un message tel qu'il est envoyé au navigateur : rien d'autre que ce qui est affiché. */
export interface LatestPost {
  id: string;
  topicTitle: string;
  authorName: string;
  authorImage: string | null;
  excerpt: string;
  /** Date de publication, au format ISO (une date ne passe pas telle quelle du serveur au navigateur). */
  createdAt: string;
}

/**
 * Début lisible d'un message : sans les citations (le texte cité n'est pas celui de l'auteur), sans balises BBCode,
 * espaces regroupés, coupé à `EXCERPT_LENGTH` caractères avec « … ».
 */
export function postExcerpt(content: string): string {
  let text = content;
  // Retire les citations de l'intérieur vers l'extérieur, pour venir à bout des citations imbriquées
  const innerQuote = /\[quote[^\]]*\](?:(?!\[quote)[\s\S])*?\[\/quote\]/gi;
  while (innerQuote.test(text)) text = text.replace(innerQuote, " ");
  text = stripBBCode(text).replace(/\s+/g, " ").trim();
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH - 1).trimEnd()}…` : text;
}

/** Les derniers messages visibles pour un lecteur qui a ces rôles (du plus récent au plus ancien). */
export const getLatestPosts = unstable_cache(
  async (roles: string[]): Promise<LatestPost[]> => {
    const posts = await prisma.post.findMany({
      where: {
        isDeleted: false,
        isModerated: false,
        author: { isBanned: false },
        topic: topicAccessWhere(roles),
      },
      orderBy: { createdAt: "desc" },
      take: LATEST_POSTS_COUNT,
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { name: true, image: true } },
        topic: { select: { title: true } },
      },
    });
    return posts.map((post) => ({
      id: post.id,
      topicTitle: post.topic.title,
      authorName: post.author.name || "Anonyme",
      authorImage: post.author.image,
      excerpt: postExcerpt(post.content),
      createdAt: post.createdAt.toISOString(),
    }));
  },
  ["home-latest-posts-v1"],
  { revalidate: HOME_LATEST_POSTS_TTL_S, tags: [HOME_LATEST_POSTS_TAG] }
);
