"use client";

/**
 * Onglet « Journal d'audit » de la modération (refonte, carte 099) : l'historique des actions de modération, 20 par
 * page, du plus récent au plus ancien. Chaque ligne donne le modérateur (lien vers son profil), l'action, ses détails,
 * l'élément visé (avec un lien quand il existe) et la date. Les administrateurs peuvent purger les lignes de plus de
 * 3 mois. Les actions `getModerationLogs` et `cleanupModerationLogs` sont inchangées.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, FileText, Link as LinkIcon, Trash2 } from "lucide-react";
import { Badge, Button, Card, CardHeader, CardTitle, ConfirmDialog, EmptyState, PageNav, Skeleton, toast } from "@bbfrance/ui";
import MemberAvatarImage from "@/common/components/MemberAvatarImage/MemberAvatarImage";
import { cleanupModerationLogs, getModerationLogs } from "../actions";

interface LogsTabProps {
  userRole?: string;
}

const PAGE_SIZE = 20;

const ACTION_LABELS: Record<string, string> = {
  // Forum
  FORUM_CREATED: "Forum créé",
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
  POST_MODERATED: "Message modéré",
  POST_UNMODERATED: "Modération du message annulée",
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
  // Tournois de la Coupe de France (carte 162)
  TOURNAMENT_CDF_VALIDATED: "Résultats CDF validés",
  TOURNAMENT_CDF_UNVALIDATED: "Validation CDF retirée",
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

  const fetchLogs = async () => {
    setLoading(true);
    const res = await getModerationLogs(page);
    setLogs(res.logs);
    setTotal(res.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rechargé à chaque changement de page
  }, [page]);

  const onConfirmCleanup = async () => {
    setIsConfirmOpen(false);
    setIsCleaning(true);
    const res = await cleanupModerationLogs(3);
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
        <FileText size={18} className="text-bb-text-muted" aria-hidden="true" />
        <CardTitle>Journal d&apos;audit</CardTitle>
        {canPurge && (
          <Button type="button" variant="secondary" size="tap" disabled={isCleaning} onClick={() => setIsConfirmOpen(true)} className="text-bb-danger-text">
            <Trash2 size={16} aria-hidden="true" />
            {isCleaning ? "Purge…" : "Purger > 3 mois"}
          </Button>
        )}
      </CardHeader>

      {loading && logs.length === 0 ? (
        <div className="flex flex-col gap-3 p-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon={<FileText size={32} />} title="Aucun log enregistré pour le moment." />
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
                      <span>Cible : {TARGET_LABELS[log.targetType] ?? log.targetType}</span>
                      {targetUrl && (
                        <Link href={targetUrl} className="inline-flex min-h-11 items-center gap-1 font-semibold text-bb-accent-text lg:min-h-0">
                          <LinkIcon size={14} aria-hidden="true" />
                          Voir l&apos;élément
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
        message="Voulez-vous supprimer définitivement tous les logs de modération de plus de 3 mois ? Cette action est irréversible."
        confirmLabel="Purger les logs"
        danger
        onConfirm={onConfirmCleanup}
      />
    </Card>
  );
}
