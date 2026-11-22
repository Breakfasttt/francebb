/**
 * Règles d'un signalement envoyé par un membre (carte 221), sans base de données : testables seules
 * (tests/unit/reportRules.test.mjs). La vérification que le membre voit bien ce qu'il signale est dans
 * lib/moderationReports.ts (`canSeeReportTarget`).
 */

/** Ce qu'on peut signaler, et l'écran qui propose « Signaler ». */
/** CONVERSATION (carte 223) : une conversation privée, signalée par un de ses participants, sans son contenu. */
export const REPORT_TARGET_TYPES = ["POST", "TOPIC", "USER", "ARTICLE", "LIGUE", "CONVERSATION"] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_REASON_MAX = 100;
export const REPORT_DETAILS_MAX = 2000;

export function isReportTargetType(value: unknown): value is ReportTargetType {
  return typeof value === "string" && (REPORT_TARGET_TYPES as readonly string[]).includes(value);
}

/** Raison du refus d'un signalement, ou null s'il est valable. */
export function reportInputRefusal(input: {
  reporterId: string;
  targetType: unknown;
  targetId: unknown;
  reason: unknown;
  details?: unknown;
}): string | null {
  if (!isReportTargetType(input.targetType)) return "Ce contenu ne peut pas être signalé.";
  if (typeof input.targetId !== "string" || input.targetId.length === 0 || input.targetId.length > 100) return "Contenu introuvable.";
  if (typeof input.reason !== "string" || input.reason.trim().length === 0) return "Choisis la raison du signalement.";
  if (input.reason.length > REPORT_REASON_MAX) return "Raison trop longue.";
  if (input.details != null && (typeof input.details !== "string" || input.details.length > REPORT_DETAILS_MAX)) {
    return `Précisions trop longues (${REPORT_DETAILS_MAX} caractères au plus).`;
  }
  if (input.targetType === "USER" && input.targetId === input.reporterId) return "Tu ne peux pas te signaler toi-même.";
  return null;
}
