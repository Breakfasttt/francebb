"use client";

/**
 * Onglet « Journal d'audit » de la modération (refonte, carte 099) : l'historique des actions de modération, 20 par
 * page, du plus récent au plus ancien. Chaque ligne donne le modérateur (lien vers son profil), l'action, ses détails,
 * l'élément visé (avec un lien quand il existe) et la date. Les administrateurs peuvent purger les lignes de plus de
 * 3 mois. Carte 221 : filtre par type d'action (Membres, Forum, Contenus, Administration, côté serveur), nom de
 * l'élément visé quand il existe encore, rôles affichés par leur libellé.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Link as LinkIcon } from "lucide-react";
import { Badge, Button, Card, CardHeader, CardTitle, ConfirmDialog, PageNav, Skeleton, toast } from "@bbfrance/ui";
import MemberAvatarImage from "@/common/components/MemberAvatarImage/MemberAvatarImage";
import { LOG_GROUPS, type LogGroup } from "@/lib/moderationLogFormat";
import { cleanupModerationLogs, getModerationLogs } from "../actions";

interface LogsTabProps {
  userRole?: string;
}

const PAGE_SIZE = 20;

const ACTION_LABELS: Record<string, string> = {
  // Forum
  FORUM_CREATED: "Forum créé",
  FORUM_UPDATED: "Forum modifié",
  FORUM_LOCKED: "Forum verrouillé",
  FORUM_UNLOCKED: "Forum déverrouillé",
  FORUM_DELETED: "Forum supprimé",
  // Sujets
  TOPIC_DELETED: "Sujet supprimé",
  TOPIC_RESTORED: "Sujet restauré",
  TOPIC_PINNED: "Sujet épinglé",
  TOPIC_UNPINNED: "Sujet désépinglé",
  TOPIC_MOVED: "Sujet déplacé",
  TOPIC_ARCHIVED: "Sujet archivé",
  TOPIC_UNARCHIVED: "Sujet désarchivé",
  TOPIC_LOCKED: "Sujet verrouillé",
  TOPIC_UNLOCKED: "Sujet déverrouillé",
  TOPIC_SPLIT: "Sujet scindé",
  TOPIC_MERGED: "Sujets fusionnés",
  // Messages
  POST_MODERATED: "Message masqué",
  POST_UNMODERATED: "Message démasqué",
  POST_DELETED: "Message supprimé",
  POST_RESTORED: "Message restauré",
  // Membres
  USER_ROLE_CHANGED: "Rôle modifié",
  USER_BANNED: "Utilisateur banni",
  USER_UNBANNED: "Utilisateur débanni",
  USER_DELETED: "Utilisateur supprimé",
  // Articles
  ARTICLE_MODERATED: "Article modéré",
  ARTICLE_UNMODERATED: "Article restauré",
  ARTICLE_DELETED: "Article supprimé",
  // Ligues
  LIGUE_CREATED: "Ligue créée",
  LIGUE_DELETED: "Ligue supprimée",
  LIGUE_TRANSFERRED: "Ligue transférée",
  // Ressources
  RESOURCE_APPROVED: "Ressource approuvée",
  RESOURCE_REJECTED: "Ressource rejetée",
  RESOURCE_UPDATED: "Ressource mise à jour",
  RESOURCE_DELETED: "Ressource supprimée",
  // Signalements
  REPORT_IGNORED: "Signalement ignoré",
  REPORT_RESOLVED: "Signalement traité",
  // Tournois du Championnat de France (carte 162)
  TOURNAMENT_CDF_VALIDATED: "Résultats CDF validés",
  TOURNAMENT_CDF_UNVALIDATED: "Validation CDF retirée",
  // Carte 221
  POST_EDITED_BY_MOD: "Message modifié par la modération",
  TOPIC_RENAMED: "Sujet renommé",
  LIGUE_UPDATED: "Ligue modifiée",
  CATEGORY_CREATED: "Catégorie créée",
  CATEGORY_UPDATED: "Catégorie modifiée",
  CATEGORY_DELETED: "Catégorie supprimée",
  CATEGORIES_REORDERED: "Catégories réordonnées",
  FORUMS_REORDERED: "Forums réordonnés",
  ROLE_CREATED: "Rôle créé",
  ROLE_DELETED: "Rôle supprimé",
  ROLES_REORDERED: "Rôles réordonnés",
  REFERENCE_DATA_CREATED: "Donnée de référence ajoutée",
  REFERENCE_DATA_UPDATED: "Donnée de référence modifiée",
  REFERENCE_DATA_DELETED: "Donnée de référence supprimée",
  SITE_SETTING_UPDATED: "Réglage du site modifié",
  MASS_MAIL_SENT: "Annonce envoyée par e-mail",
  LOGS_PURGED: "Journal purgé",
};

/** Nom lisible du type d'élément visé. */
const TARGET_LABELS: Record<string, string> = {
  TOPIC: "Sujet",
  FORUM: "Forum",
  USER: "Membre",
  ARTICLE: "Article",
  LIGUE: "Ligue",
  POST: "Message",
  RESOURCE: "Ressource",
  TOURNAMENT: "Tournoi",
  CATEGORY: "Catégorie",
  ROLE: "Rôle",
  REFERENCE_DATA: "Donnée de référence",
  SETTING: "Réglage",
  SYSTEM: "Site",
};

const formatAction = (action: string) => ACTION_LABELS[action] || action.replace(/_/g, " ");

/** Couleur de l'étiquette : rouge pour une suppression ou un bannissement, vert pour un retour en arrière. */
const actionVariant = (action: string): "danger" | "outline" | "success" | "neutral" => {
  if (action.includes("DELETE") || (action.includes("BAN") && !action.includes("UNBANNED"))) return "danger";
  if (action.includes("UNLOCKED") || action.includes("UNBANNED") || action.includes("RESOLVED")) return "success";
  if (action.includes("LOCK") || action.includes("ARCHIVE") || action.includes("MODERATED")) return "outline";
  return "neutral";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ligne du journal renvoyée par getModerationLogs
const getTargetUrl = (log: any): string | null => {
  if (!log.targetId) return null;
  switch (log.targetType) {
    case "TOPIC": return `/forum/topic/${log.targetId}`;
    case "FORUM": return `/forum/${log.targetId}`;
    case "USER": return `/spy/${log.targetId}`;
    case "ARTICLE": return `/articles/${log.targetId}`;
    case "LIGUE": return `/ligue/${log.targetId}`;
    // Lien permanent du message (carte 169) : il mène à la bonne page de son sujet, même après un déplacement
    case "POST": return `/forum/post/${log.targetId}`;
    default: return null;
  }
};

export default function LogsTab({ userRole }: LogsTabProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- lignes renvoyées par getModerationLogs
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [group, setGroup] = useState<LogGroup | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await getModerationLogs(page, PAGE_SIZE, group ?? undefined);
    setLogs(res.logs);
    setTotal(res.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rechargé à chaque changement de page ou de filtre
  }, [page, group]);

  const chooseGroup = (next: LogGroup | null) => {
    setGroup(next);
    setPage(1);
  };

  const onConfirmCleanup = async () => {
    setIsConfirmOpen(false);
    setIsCleaning(true);
    const res = await cleanupModerationLogs();
    setIsCleaning(false);

    if (res.success) {
      toast.success(`Nettoyage terminé : ${res.count} logs supprimés.`);
      fetchLogs();
    } else {
      toast.error(res.error || "Erreur lors du nettoyage.");
    }
  };

  const canPurge = userRole === "ADMIN" || userRole === "SUPERADMIN";
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-wrap">
        <CardTitle>Journal d&apos;audit</CardTitle>
        {/* Action rare et destructrice : discrète, et seulement quand il y a quelque chose à purger */}
        {canPurge && logs.length > 0 && (
          <Button type="button" variant="quiet" size="tap" disabled={isCleaning} onClick={() => setIsConfirmOpen(true)} className="text-sm text-bb-danger-text">
            {isCleaning ? "Purge…" : "Purger les entrées de plus de 3 mois"}
          </Button>
        )}
      </CardHeader>

      <div role="group" aria-label="Filtrer par type d'action" className="flex gap-2 overflow-x-auto border-b border-bb-border px-4 py-2">
        {([[null, "Tout"], ...Object.entries(LOG_GROUPS)] as [LogGroup | null, string][]).map(([id, label]) => (
          <Button
            key={id ?? "all"}
            type="button"
            variant="secondary"
            size="tap"
            aria-pressed={group === id}
            onClick={() => chooseGroup(id)}
            className={`shrink-0 ${group === id ? "border-bb-accent-text bg-bb-accent-soft" : ""}`}
          >
            {label}
          </Button>
        ))}
      </div>

      {loading && logs.length === 0 ? (
        <div className="flex flex-col gap-3 p-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : logs.length === 0 ? (
        <p className="px-4 py-5 text-bb-text-muted">
          {group ? "Aucune action de ce type dans le journal." : "Aucune action de modération enregistrée."}
        </p>
      ) : (
        <ul aria-label="Actions de modération" className={`m-0 list-none p-0 ${loading ? "opacity-60" : ""}`}>
          {logs.map((log) => {
            const targetUrl = getTargetUrl(log);
            return (
              <li key={log.id} className="flex flex-col gap-2 border-b border-bb-border px-4 py-3 last:border-b-0 lg:grid lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_auto] lg:items-start lg:gap-4">
                <div className="flex items-center justify-between gap-3 lg:justify-start">
                  <Link href={`/spy/${log.moderator.id}`} className="flex min-h-11 min-w-0 items-center gap-2 font-semibold text-bb-text no-underline hover:underline">
                    <MemberAvatarImage image={log.moderator.image} className="size-7 shrink-0 rounded-full object-cover" />
                    <span className="truncate">{log.moderator.name}</span>
                  </Link>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm text-bb-text-muted lg:hidden">
                    <Clock size={14} aria-hidden="true" />
                    {format(new Date(log.createdAt), "dd/MM HH:mm", { locale: fr })}
                  </span>
                </div>

                <div className="flex min-w-0 flex-col items-start gap-1.5 lg:pt-2.5">
                  <Badge variant={actionVariant(log.action)}>{formatAction(log.action)}</Badge>
                  {log.details && <p className="m-0 text-sm break-words text-bb-text-muted [overflow-wrap:anywhere]">{log.details}</p>}
                  {log.targetId && (
                    <p className="m-0 flex flex-wrap items-center gap-x-2 text-sm text-bb-text-muted">
                      <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                        {TARGET_LABELS[log.targetType] ?? log.targetType}
                        {log.targetName && (
                          log.targetType === "POST"
                            ? <> dans « <span className="font-semibold text-bb-text">{log.targetName}</span> »</>
                            : <> : <span className="font-semibold text-bb-text">{log.targetName}</span></>
                        )}
                      </span>
                      {targetUrl && (
                        <Link href={targetUrl} className="inline-flex min-h-11 items-center gap-1 font-semibold text-bb-accent-text lg:min-h-0">
                          <LinkIcon size={14} aria-hidden="true" />
                          Voir
                        </Link>
                      )}
                    </p>
                  )}
                </div>

                <span className="hidden shrink-0 items-center gap-1 pt-2.5 text-sm text-bb-text-muted lg:inline-flex">
                  <Clock size={14} aria-hidden="true" />
                  {format(new Date(log.createdAt), "dd/MM HH:mm", { locale: fr })}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center border-t border-bb-border p-3">
          <PageNav page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />
        </div>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Purger le journal d'audit"
        message="Tu veux supprimer définitivement tous les logs de modération de plus de 3 mois ? Cette action est irréversible."
        confirmLabel="Purger les logs"
        danger
        onConfirm={onConfirmCleanup}
      />
    </Card>
  );
}
