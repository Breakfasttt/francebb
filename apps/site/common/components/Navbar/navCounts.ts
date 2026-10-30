/**
 * Compteurs de la barre de navigation : messages privés non lus, et file de modération pour les modérateurs.
 * Fonction serveur (requêtes en base). La mise en page générale (app/layout.tsx) l'appelle sans attendre
 * sa réponse et transmet la promesse à la barre de navigation (carte 017) : la page part tout de suite,
 * et les pastilles s'affichent dès que les compteurs arrivent.
 */
import { prisma } from "@/lib/prisma";

export interface NavCounts {
  unreadCount: number;
  pendingModCount: number;
}

export const NO_NAV_COUNTS: NavCounts = { unreadCount: 0, pendingModCount: 0 };

export async function getNavCounts(userId: string, isMod: boolean): Promise<NavCounts> {
  try {
    const [unreadCount, reports, resources] = await Promise.all([
      prisma.privateMessage.count({
        where: {
          conversation: { participants: { some: { userId, deletedAt: null } } },
          authorId: { not: userId },
          readAt: null,
        },
      }),
      isMod ? prisma.moderationReport.count({ where: { status: "PENDING" } }) : 0,
      isMod ? prisma.resource.count({ where: { status: "PENDING" } }) : 0,
    ]);
    return { unreadCount, pendingModCount: reports + resources };
  } catch (error) {
    // Un compteur indisponible ne doit pas casser la page : la barre s'affiche sans pastille
    console.error("Navbar counters fetching error:", error);
    return NO_NAV_COUNTS;
  }
}
