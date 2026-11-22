/**
 * Journal de modération (table ModerationLog) : trace de chaque action de modération.
 * Ce fichier n'est volontairement PAS marqué « use server » : ses fonctions ne sont appelables que par le code serveur.
 * (Exportée depuis un fichier « use server », logModerationAction devenait une action publique et n'importe quel
 * membre connecté pouvait écrire de fausses entrées dans le journal — carte 050.)
 */
import { prisma } from "@/lib/prisma";

/**
 * Types d'actions de modération pour le journal (Audit Log).
 */
export type ModerationAction = 
  | "FORUM_CREATED" | "FORUM_UPDATED" | "FORUM_LOCKED" | "FORUM_UNLOCKED" | "FORUM_DELETED"
  | "TOPIC_DELETED" | "TOPIC_RESTORED" | "TOPIC_PINNED" | "TOPIC_UNPINNED" | "TOPIC_MOVED" | "TOPIC_ARCHIVED" | "TOPIC_UNARCHIVED" | "TOPIC_LOCKED" | "TOPIC_UNLOCKED"
  | "TOPIC_SPLIT" | "TOPIC_MERGED"
  | "POST_MODERATED" | "POST_UNMODERATED" | "POST_DELETED" | "POST_RESTORED"
  | "USER_ROLE_CHANGED" | "USER_BANNED" | "USER_UNBANNED" | "USER_DELETED"
  | "ARTICLE_MODERATED" | "ARTICLE_UNMODERATED" | "ARTICLE_DELETED"
  | "LIGUE_CREATED" | "LIGUE_DELETED" | "LIGUE_TRANSFERRED"
  | "RESOURCE_APPROVED" | "RESOURCE_REJECTED" | "RESOURCE_UPDATED" | "RESOURCE_DELETED"
  | "REPORT_IGNORED" | "REPORT_RESOLVED"
  | "ARCHIVE_RANKING" | "DELETE_ARCHIVE" | "CREATE_ARCHIVE_MANUAL" | "UPDATE_ARCHIVE"
  | "TOURNAMENT_CDF_VALIDATED" | "TOURNAMENT_CDF_UNVALIDATED"
  // Carte 221 : actions d'administration et de modération qui n'étaient pas tracées
  | "POST_EDITED_BY_MOD" | "TOPIC_RENAMED" | "LIGUE_UPDATED"
  | "CATEGORY_CREATED" | "CATEGORY_UPDATED" | "CATEGORY_DELETED" | "CATEGORIES_REORDERED" | "FORUMS_REORDERED"
  | "ROLE_CREATED" | "ROLE_DELETED" | "ROLES_REORDERED"
  | "REFERENCE_DATA_CREATED" | "REFERENCE_DATA_UPDATED" | "REFERENCE_DATA_DELETED"
  | "SITE_SETTING_UPDATED" | "MEDIA_CHANNELS_UPDATED" | "MASS_MAIL_SENT" | "LOGS_PURGED";

/** Durée de conservation du journal, en mois (carte 221 : fixée par le serveur, jamais par l'appelant). */
export const LOG_RETENTION_MONTHS = 3;

/**
 * Enregistre une action de modération dans le journal, au nom du membre `moderatorId`.
 * Fonction interne au serveur, appelée par les actions serveur après une action réussie. Depuis la carte 198, elle
 * reçoit le membre en paramètre au lieu de relire la session : l'action serveur lit la session une fois et la
 * transmet, et la fonction peut être appelée dans un test avec un membre fictif.
 * On écrit au journal même si le membre n'est pas modérateur (par exemple un auteur qui supprime son sujet).
 */
export async function logModerationAction(
  moderatorId: string,
  action: ModerationAction,
  targetId?: string,
  targetType?: string,
  details?: string
) {
  try {
    await prisma.moderationLog.create({
      data: {
        action,
        moderatorId,
        targetId,
        targetType,
        details
      }
    });
  } catch (error) {
    console.error("[LOG_MODERATION] Error:", error);
  }
}
