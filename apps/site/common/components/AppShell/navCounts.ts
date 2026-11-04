/**
 * Compteurs de la barre de navigation : messages privés non lus, notifications non lues (cloche, carte 167), et file
 * de modération pour les modérateurs.
 * Fonction serveur (requêtes en base). La mise en page générale (app/layout.tsx) l'appelle sans attendre
 * sa réponse et transmet la promesse à la barre de navigation (carte 017) : la page part tout de suite,
 * et les pastilles s'affichent dès que les compteurs arrivent.
 */
import { prisma } from "@/lib/prisma";
import { countUnreadMessages } from "@/lib/unreadMessages";
import { countUnreadNotifications } from "@/lib/notifications";
import { getForumAccess } from "@/lib/forumAccess";

export interface NavCounts {
  unreadCount: number;
  /** Notifications non lues et visibles (sujet accessible et non supprimé) : pastille de la cloche. */
  notificationCount: number;
  pendingModCount: number;
}

export const NO_NAV_COUNTS: NavCounts = { unreadCount: 0, notificationCount: 0, pendingModCount: 0 };

export async function getNavCounts(userId: string, isMod: boolean): Promise<NavCounts> {
  try {
    const { roles } = await getForumAccess();
    const [unreadCount, notificationCount, reports, resources] = await Promise.all([
      // Non-lus d'après la date de lecture propre à ce membre dans chaque conversation (carte 170)
      countUnreadMessages(userId),
      countUnreadNotifications(userId, roles),
      isMod ? prisma.moderationReport.count({ where: { status: "PENDING" } }) : 0,
      isMod ? prisma.resource.count({ where: { status: "PENDING" } }) : 0,
    ]);
    return { unreadCount, notificationCount, pendingModCount: reports + resources };
  } catch (error) {
    // Un compteur indisponible ne doit pas casser la page : la barre s'affiche sans pastille
    console.error("Navbar counters fetching error:", error);
    return NO_NAV_COUNTS;
  }
}
