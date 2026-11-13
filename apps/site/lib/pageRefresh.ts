/**
 * Rafraîchissement des pages après un changement (carte 202) : une fonction par sujet modifié.
 *
 * Après une écriture, Next.js doit savoir quelles pages reconstruire : `revalidatePath` désigne une adresse, `updateTag`
 * vide un cache nommé (`unstable_cache`, gardé conformément à l'ADR-0005). Avant cette carte, chaque action écrivait
 * sa propre liste d'adresses, et les listes avaient divergé : terminer, annuler ou rétablir un tournoi ne vidait pas
 * le cache de l'accueil (`home-tournaments`), qui pouvait montrer un tournoi annulé pendant 60 secondes.
 *
 * Ici seulement on sait quelles pages affichent un sujet, un tournoi ou la structure du forum. Une nouvelle page qui
 * en affiche s'ajoute dans la fonction concernée, une seule fois. Ces fonctions ne s'appellent que depuis une action
 * serveur (`updateTag` n'est permis que là).
 */
import { revalidatePath, updateTag } from "next/cache";
import { HOME_LATEST_POSTS_TAG } from "@/lib/homeLatestPosts";

/** Cache de la liste des forums (`app/forum/page.tsx`). */
const FORUM_CATEGORIES_TAG = "forum-categories";
/** Cache des prochains tournois de l'accueil (`app/page.tsx`). */
const HOME_TOURNAMENTS_TAG = "home-tournaments";

/**
 * Un sujet a changé (message publié, modifié ou supprimé, sujet épinglé, déplacé, scindé…). `forumIds` : le forum du
 * sujet, et l'ancien forum s'il a été déplacé. Un sujet de tournoi rafraîchit aussi les pages des tournois.
 */
export function refreshTopic(topic: { id: string; forumIds: (string | null | undefined)[]; isTournament?: boolean }) {
  revalidatePath(`/forum/topic/${topic.id}`);
  for (const forumId of new Set(topic.forumIds.filter(Boolean))) revalidatePath(`/forum/${forumId}`);
  revalidatePath("/forum");
  revalidatePath("/forum/unread");
  updateTag(FORUM_CATEGORIES_TAG);
  // Derniers messages de l'accueil (carte 205)
  updateTag(HOME_LATEST_POSTS_TAG);
  if (topic.isTournament) refreshTournamentLists();
}

/** Listes qui montrent des tournois : page des tournois, carte, accueil et son cache. */
function refreshTournamentLists() {
  revalidatePath("/tournois");
  revalidatePath("/carte");
  revalidatePath("/");
  updateTag(HOME_TOURNAMENTS_TAG);
}

/**
 * Un tournoi a changé (modifié, terminé, annulé, rétabli, résultats enregistrés ou validés pour la CDF) : son sujet,
 * ses pages de résultats, les listes de tournois et l'accueil, et le classement quand ses résultats comptent.
 */
export function refreshTournament(tournament: { id: string; topicId?: string | null; affectsRanking?: boolean }) {
  if (tournament.topicId) revalidatePath(`/forum/topic/${tournament.topicId}`);
  revalidatePath(`/forum/tournament/${tournament.id}/results`);
  revalidatePath(`/forum/tournament/${tournament.id}/results/view`);
  refreshTournamentLists();
  if (tournament.affectsRanking) revalidatePath("/classement");
}

/**
 * La structure du forum a changé (forum ou catégorie créé, modifié, supprimé ou déplacé) : liste des forums et son
 * cache, page du forum parent, onglet « Structure » de l'administration.
 */
export function refreshForumStructure(parentForumId?: string | null) {
  revalidatePath("/forum");
  updateTag(FORUM_CATEGORIES_TAG);
  if (parentForumId) revalidatePath(`/forum/${parentForumId}`);
  revalidatePath("/administration");
}
