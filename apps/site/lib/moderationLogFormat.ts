/**
 * Affichage du journal de modération (carte 221), sans base : groupes d'actions du filtre (Membres, Forum, Contenus,
 * Administration) et mise en forme des détails d'un changement de rôle (« COACH → MODERATOR » devient
 * « Coach → Modérateur »). Les détails sont enregistrés en texte libre : rien n'est réécrit en base, la mise en forme
 * se fait à la lecture. Fichier pur, testé par tests/unit/moderationLogFormat.test.mjs.
 */
import { getRoleLabel } from "./roles";

export const LOG_GROUPS = {
  members: "Membres",
  forum: "Forum",
  contents: "Contenus",
  admin: "Administration",
} as const;

export type LogGroup = keyof typeof LOG_GROUPS;

export function isLogGroup(value: unknown): value is LogGroup {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(LOG_GROUPS, value);
}

/** Actions de chaque groupe, pour filtrer le journal côté serveur. */
export const LOG_GROUP_ACTIONS: Record<LogGroup, string[]> = {
  members: ["USER_ROLE_CHANGED", "USER_WARNED", "USER_BANNED", "USER_TEMP_BANNED", "USER_UNBANNED", "USER_DELETED"],
  forum: [
    "FORUM_CREATED", "FORUM_UPDATED", "FORUM_LOCKED", "FORUM_UNLOCKED", "FORUM_DELETED",
    "TOPIC_DELETED", "TOPIC_RESTORED", "TOPIC_PINNED", "TOPIC_UNPINNED", "TOPIC_MOVED", "TOPIC_ARCHIVED",
    "TOPIC_UNARCHIVED", "TOPIC_LOCKED", "TOPIC_UNLOCKED", "TOPIC_SPLIT", "TOPIC_MERGED", "TOPIC_RENAMED",
    "POST_MODERATED", "POST_UNMODERATED", "POST_DELETED", "POST_RESTORED", "POST_EDITED_BY_MOD",
    "CATEGORY_CREATED", "CATEGORY_UPDATED", "CATEGORY_DELETED", "CATEGORIES_REORDERED", "FORUMS_REORDERED",
  ],
  contents: [
    "ARTICLE_MODERATED", "ARTICLE_UNMODERATED", "ARTICLE_DELETED",
    "LIGUE_CREATED", "LIGUE_DELETED", "LIGUE_TRANSFERRED", "LIGUE_UPDATED",
    "RESOURCE_APPROVED", "RESOURCE_REJECTED", "RESOURCE_UPDATED", "RESOURCE_DELETED",
    "REPORT_IGNORED", "REPORT_RESOLVED",
    "TOURNAMENT_CDF_VALIDATED", "TOURNAMENT_CDF_UNVALIDATED",
    "ARCHIVE_RANKING", "DELETE_ARCHIVE", "CREATE_ARCHIVE_MANUAL", "UPDATE_ARCHIVE",
  ],
  admin: [
    "ROLE_CREATED", "ROLE_DELETED", "ROLES_REORDERED",
    "REFERENCE_DATA_CREATED", "REFERENCE_DATA_UPDATED", "REFERENCE_DATA_DELETED",
    "SITE_SETTING_UPDATED", "MEDIA_CHANNELS_UPDATED", "MASS_MAIL_SENT", "LOGS_PURGED",
  ],
};

/** « X → Y » ou « X -> Y » où X et Y sont des codes de rôle (lettres capitales et soulignés). */
const ROLE_CHANGE = /\b([A-Z][A-Z0-9_]*)\s*(?:→|->)\s*([A-Z][A-Z0-9_]*)\b/;

/**
 * Remplace, dans les détails d'un changement de rôle, les deux codes par leurs libellés. Un texte qui ne suit pas
 * ce format reste tel quel ; un code inconnu aussi (rôle personnalisé supprimé depuis).
 */
export function formatRoleChangeDetails(details: string, labels?: Record<string, string>): string {
  return details.replace(ROLE_CHANGE, (_m, from: string, to: string) => `${getRoleLabel(from, labels)} → ${getRoleLabel(to, labels)}`);
}
