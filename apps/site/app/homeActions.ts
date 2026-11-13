"use server";

/**
 * Action de l'accueil (carte 205) : la liste des derniers messages du forum la rappelle à intervalle régulier pour se
 * mettre à jour sans recharger la page. Elle ne prend aucun paramètre : les rôles du lecteur viennent de sa session
 * (`getForumAccess`), jamais du navigateur, pour qu'on ne puisse pas demander les messages d'un forum réservé.
 */
import { getForumAccess } from "@/lib/forumAccess";
import { getLatestPosts, type LatestPost } from "@/lib/homeLatestPosts";

export async function fetchLatestPosts(): Promise<LatestPost[]> {
  const { roles } = await getForumAccess();
  return getLatestPosts(roles);
}
