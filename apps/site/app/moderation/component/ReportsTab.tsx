"use client";

/**
 * Onglet d'une liste de signalements de la modération (refonte, carte 099) : messages, sujets, coachs, articles ou
 * ligues signalés. Les signalements sont regroupés par contenu visé (une fiche par contenu, avec le nombre de
 * signalements). « Détails » montre chaque signalement l'un après l'autre (auteur, date, raison, précision) ;
 * « Marquer comme traité » ferme tous les signalements du contenu, avec un commentaire facultatif écrit au journal.
 * Le menu « ⋯ » (« Plus d'actions sur ce signalement ») propose « Ignorer le signalement » : les signalements sont
 * fermés comme ignorés (statut IGNORED, ligne « Signalement ignoré » au journal), par exemple pour un signalement
 * abusif ; la même fenêtre de confirmation demande un commentaire facultatif (carte 144).
 * Les actions `getPendingReportsByType` et `resolveReportsAction` sont inchangées.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertTriangle, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, ExternalLink, Hash,
  EyeOff, MessageSquare, ShieldAlert, Trophy, Users,
} from "lucide-react";
import { ActionMenu, Badge, Button, Card, ConfirmDialog, EmptyState, Label, PageNav, Skeleton, Textarea, toast } from "@bbfrance/ui";
import MemberAvatarImage from "@/common/components/MemberAvatarImage/MemberAvatarImage";
import { getPendingReportsByType, resolveReportsAction } from "../actions";

interface ReportsTabProps {
  type: "POST" | "TOPIC" | "USER" | "ARTICLE" | "LIGUE" | "MESSAGE";
  title: string;
  onActionSuccess?: () => void;
}

const PAGE_SIZE = 10;

const ICONS = {
  POST: MessageSquare,
  TOPIC: AlertTriangle,
  USER: Users,
  ARTICLE: BookOpen,
  LIGUE: Trophy,
  MESSAGE: MessageSquare,
} as const;

export default function ReportsTab({ type, title, onActionSuccess }: ReportsTabProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- groupes renvoyés par getPendingReportsByType
  const [reportGroups, setReportGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeDetailIndex, setActiveDetailIndex] = useState(0);
  const [reportComment, setReportComment] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [resolving, setResolving] = useState(false);
  // Contenu dont on confirme le traitement (fenêtre de confirmation ouverte)
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);
  // Action confirmée : « Marquer comme traité » (RESOLVE) ou « Ignorer » (IGNORE)
  const [confirmAction, setConfirmAction] = useState<"RESOLVE" | "IGNORE">("RESOLVE");

  const fetchReports = async () => {
    setLoading(true);
    const res = await getPendingReportsByType(type, page);
    setReportGroups(res.groups);
    setTotal(res.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rechargé à chaque changement de type ou de page
  }, [type, page]);

  // Le détail repart du premier signalement à chaque ouverture
  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setActiveDetailIndex(0);
    }
  };

  const openConfirm = (targetId: string, action: "RESOLVE" | "IGNORE" = "RESOLVE") => {
    setReportComment("");
    setConfirmAction(action);
    setConfirmTargetId(targetId);
  };

  const onConfirmAction = async () => {
    if (!confirmTargetId) return;
    setResolving(true);
    // « Traité » (RESOLVE) ou « Ignorer » (IGNORE) ferme les signalements du contenu, avec le commentaire facultatif
    const res = await resolveReportsAction(confirmTargetId, type, confirmAction, reportComment);
    setResolving(false);
    if (res.success) {
      toast.success(confirmAction === "IGNORE" ? "Signalement ignoré" : "Signalement marqué comme traité");
      fetchReports();
      onActionSuccess?.();
      setConfirmTargetId(null);
      setReportComment("");
    } else {
      toast.error("Erreur serveur");
    }
  };

  const getTargetUrl = (targetId: string) => {
    switch (type) {
      case "TOPIC": return `/forum/topic/${targetId}`;
      case "USER": return `/spy/${targetId}`;
      case "ARTICLE": return `/articles/${targetId}`;
      case "LIGUE": return `/ligue/${targetId}`;
      default: return null;
    }
  };

  const Icon = ICONS[type];
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Icon size={20} className="text-bb-text-muted" aria-hidden="true" />
        <h2 className="m-0 flex-1 border-0 p-0 text-lg font-bold text-bb-text normal-case not-italic">{title}</h2>
        <Badge variant="neutral">{total} en attente</Badge>
      </div>

      {loading && reportGroups.length === 0 ? (
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : reportGroups.length === 0 ? (
        <Card>
          <EmptyState icon={<ShieldAlert size={32} />} title="Aucun signalement en attente pour cette catégorie." />
        </Card>
      ) : (
        <div className={`flex flex-col gap-3 ${loading ? "opacity-60" : ""}`}>
          {reportGroups.map((group) => {
            const targetUrl = getTargetUrl(group.targetId);
            const expanded = expandedId === group.targetId;
            const report = expanded ? group.reports[activeDetailIndex] : null;
            const detailsId = `report-details-${group.targetId}`;
            return (
              <Card key={group.targetId} className="overflow-hidden">
                <article aria-label={`Signalement : ${group.firstReason}`}>
                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-bb-text-muted">Raison</span>
                      <p className="m-0 text-base font-bold break-words text-bb-text">{group.firstReason}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-bb-text-muted">
                      <Badge variant="danger">
                        <ShieldAlert size={12} aria-hidden="true" />
                        {group.count} signalement{group.count > 1 ? "s" : ""}
                      </Badge>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} aria-hidden="true" />
                        {format(new Date(group.createdAt), "dd MMM HH:mm", { locale: fr })}
                      </span>
                      <span className="inline-flex items-center gap-1" title={group.targetId}>
                        <Hash size={14} aria-hidden="true" />
                        Contenu {group.targetId.substring(0, 8)}…
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {targetUrl && (
                        <Button asChild variant="secondary" size="tap">
                          <Link href={targetUrl} target="_blank">
                            <ExternalLink size={16} aria-hidden="true" />
                            Voir
                          </Link>
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        size="tap"
                        aria-expanded={expanded}
                        aria-controls={detailsId}
                        onClick={() => toggleExpand(group.targetId)}
                      >
                        {expanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                        Détails
                      </Button>
                      <ActionMenu
                        label="Plus d'actions sur ce signalement"
                        title="Actions sur le signalement"
                        items={[
                          {
                            label: "Ignorer le signalement",
                            icon: <EyeOff size={18} aria-hidden="true" />,
                            onSelect: () => openConfirm(group.targetId, "IGNORE"),
                          },
                        ]}
                      />
                      <Button type="button" variant="primary" size="tap" className="w-full lg:ml-auto lg:w-auto" onClick={() => openConfirm(group.targetId)}>
                        <Check size={16} aria-hidden="true" />
                        Marquer comme traité
                      </Button>
                    </div>
                  </div>

                  {report && (
                    <div id={detailsId} className="flex flex-col gap-3 border-t border-bb-border bg-bb-surface-2 p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="m-0 flex-1 border-0 p-0 text-sm font-bold text-bb-text normal-case not-italic">
                          Signalement {activeDetailIndex + 1} sur {group.reports.length}
                        </h3>
                        {group.reports.length > 1 && (
                          <>
                            <Button
                              type="button"
                              variant="quiet"
                              size="tap-icon"
                              aria-label="Signalement précédent"
                              disabled={activeDetailIndex === 0}
                              onClick={() => setActiveDetailIndex((prev) => Math.max(0, prev - 1))}
                            >
                              <ChevronLeft size={18} aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="quiet"
                              size="tap-icon"
                              aria-label="Signalement suivant"
                              disabled={activeDetailIndex === group.reports.length - 1}
                              onClick={() => setActiveDetailIndex((prev) => Math.min(group.reports.length - 1, prev + 1))}
                            >
                              <ChevronRight size={18} aria-hidden="true" />
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2 font-semibold text-bb-text">
                          <MemberAvatarImage image={report.reporter.image} className="size-7 shrink-0 rounded-full object-cover" />
                          <span className="truncate">{report.reporter.name}</span>
                        </span>
                        <span className="text-sm text-bb-text-muted">{format(new Date(report.createdAt), "dd/MM HH:mm", { locale: fr })}</span>
                      </div>
                      <p className="m-0 text-[0.95rem] text-bb-text">
                        <span className="font-semibold text-bb-text-muted">Raison : </span>
                        {report.reason}
                      </p>
                      {report.details && (
                        <blockquote className="m-0 rounded-bb-md border-l-[3px] border-bb-border bg-bb-surface px-3 py-2 text-[0.95rem] break-words text-bb-text italic">
                          {report.details}
                        </blockquote>
                      )}
                    </div>
                  )}
                </article>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <PageNav page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />
        </div>
      )}

      <ConfirmDialog
        open={confirmTargetId !== null}
        onOpenChange={(open) => { if (!open) setConfirmTargetId(null); }}
        title={confirmAction === "IGNORE" ? "Ignorer le signalement" : "Marquer comme traité"}
        message={
          confirmAction === "IGNORE"
            ? "Tous les signalements de cet élément seront classés comme ignorés, sans action sur le contenu. Il n'apparaîtra plus dans cette liste."
            : "Tous les signalements de cet élément seront marqués comme traités. Il n'apparaîtra plus dans cette liste."
        }
        confirmLabel={confirmAction === "IGNORE" ? "Ignorer" : "Confirmer"}
        pending={resolving}
        onConfirm={onConfirmAction}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="moderation-comment">Détails de l&apos;action (optionnel)</Label>
          <Textarea
            id="moderation-comment"
            placeholder={confirmAction === "IGNORE" ? "Ex. : signalement sans fondement…" : "Ex. : contenu supprimé après avertissement…"}
            maxLength={200}
            value={reportComment}
            onChange={(e) => setReportComment(e.target.value)}
            className="font-bb-sans"
          />
          <span className="self-end text-sm text-bb-text-muted">{reportComment.length}/200</span>
        </div>
      </ConfirmDialog>
    </div>
  );
}
