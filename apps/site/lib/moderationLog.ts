/**
 * Journal de modération (table ModerationLog) : trace de chaque action de modération.
 * Ce fichier n'est volontairement PAS marqué « use server » : ses fonctions ne sont appelables que par le code serveur.
 * (Exportée depuis un fichier « use server », logModerationAction devenait une action publique et n'importe quel
 * membre connecté pouvait écrire de fausses entrées dans le journal — carte 050.)
 */
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";

/**
 * Types d'actions de modération pour le journal (Audit Log).
 */
export type ModerationAction = 
  | "FORUM_CREATED" | "FORUM_LOCKED" | "FORUM_UNLOCKED" | "FORUM_DELETED"
  | "TOPIC_DELETED" | "TOPIC_PINNED" | "TOPIC_UNPINNED" | "TOPIC_MOVED" | "TOPIC_ARCHIVED" | "TOPIC_UNARCHIVED" | "TOPIC_LOCKED" | "TOPIC_UNLOCKED"
  | "POST_MODERATED" | "POST_UNMODERATED"
  | "USER_ROLE_CHANGED" | "USER_BANNED" | "USER_UNBANNED"
  | "ARTICLE_MODERATED" | "ARTICLE_UNMODERATED" | "ARTICLE_DELETED"
  | "LIGUE_CREATED" | "LIGUE_DELETED"
  | "RESOURCE_APPROVED" | "RESOURCE_REJECTED" | "RESOURCE_UPDATED" | "RESOURCE_DELETED"
  | "REPORT_IGNORED" | "REPORT_RESOLVED"
  | "ARCHIVE_RANKING" | "DELETE_ARCHIVE" | "CREATE_ARCHIVE_MANUAL" | "UPDATE_ARCHIVE";

/**
 * Enregistre une action de modération dans le journal, au nom du membre connecté.
 * Fonction interne au serveur, appelée par les actions serveur après une action réussie.
 */
export async function logModerationAction(
  action: ModerationAction, 
  targetId?: string, 
  targetType?: string, 
  details?: string
) {
  const session = await getActiveSession();
  const userId = session?.user?.id;
  
  // Note: On loggue même si l'utilisateur n'est pas "officiellement" modo (ex: suppression topic par auteur)
  if (!userId) return;

  try {
    await prisma.moderationLog.create({
      data: {
        action,
        moderatorId: userId,
        targetId,
        targetType,
        details
      }
    });
  } catch (error) {
    console.error("[LOG_MODERATION] Error:", error);
  }
}
