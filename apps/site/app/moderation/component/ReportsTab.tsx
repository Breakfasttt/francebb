"use client";

/**
 * Onglet d'une liste de signalements de la modération (refonte, carte 099) : messages, sujets, coachs, articles ou
 * ligues signalés. Les signalements sont regroupés par contenu visé : une fiche par contenu, sur téléphone comme sur
 * ordinateur, avec le nombre de signalements.
 *
 * Depuis la carte 168, la fiche montre le contenu lui-même : son titre, son auteur et un extrait de 200 caractères en
 * texte brut, plus la raison, le premier membre qui l'a signalé et la date. Ses boutons :
 * - « Voir dans le sujet » (un message), « Voir le profil » (un coach) ou « Voir » : ouvre le contenu dans le même
 *   onglet ; pour un message, à la bonne page du sujet, directement sur le message ;
 * - « Masquer » (un message pas encore masqué) : ouvre la fenêtre « Modérer le message » ; une fois le message masqué,
 *   ses signalements se ferment d'eux-mêmes (`moderatePost`, app/forum/actions.ts) ;
 * - « Ignorer » : ferme les signalements sans agir sur le contenu (statut IGNORED, ligne « Signalement ignoré » au
 *   journal), avec un commentaire facultatif (carte 144) ;
 * - « Marquer comme traité » : ferme les signalements après une action faite ailleurs, avec un commentaire facultatif.
 *   Pour un message, il est rangé dans le menu « ⋯ », puisque « Masquer » le remplace le plus souvent ;
 * - « Détails » : chaque signalement l'un après l'autre (auteur, date, raison, précision).
 * Un contenu supprimé depuis le signalement s'affiche « Contenu déjà supprimé », avec le bouton « Fermer le
 * signalement ». La suppression d'un message ou d'un sujet ferme d'ailleurs ses signalements d'elle-même : ce cas ne
 * concerne que les contenus supprimés autrement (avant la carte 168, ou un message dont le sujet a été supprimé).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertTriangle, ArrowRight, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, EyeOff,
  MessageSquare, ShieldAlert, Trash2, Trophy, Users, X,
} from "lucide-react";
import { ActionMenu, Badge, Button, Card, ConfirmDialog, EmptyState, Label, PageNav, Skeleton, Textarea, toast } from "@bbfrance/ui";
import MemberAvatarImage from "@/common/components/MemberAvatarImage/MemberAvatarImage";
import ModerationModal from "@/app/forum/component/ModerationModal";
import { moderatePost } from "@/app/forum/actions";
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

/** Nom du type de contenu, affiché en étiquette sur la fiche. */
const TYPE_LABELS = {
  POST: "Message",
  TOPIC: "Sujet",
  USER: "Coach",
  ARTICLE: "Article",
  LIGUE: "Ligue",
  MESSAGE: "Message privé",
} as const;

/** Mots qui présentent l'auteur du contenu, selon son type. */
const AUTHOR_WORDS = {
  POST: "Message de",
  TOPIC: "Sujet ouvert par",
  USER: "",
  ARTICLE: "Article de",
  LIGUE: "Ligue créée par",
  MESSAGE: "Message de",
} as const;

/** Un groupe de signalements (même contenu visé), tel que le renvoie `getPendingReportsByType`. */
type ReportGroup = Awaited<ReturnType<typeof getPendingReportsByType>>["groups"][number];

export default function ReportsTab({ type, title, onActionSuccess }: ReportsTabProps) {
  const [reportGroups, setReportGroups] = useState<ReportGroup[]>([]);
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
  // Message à masquer (fenêtre « Modérer le message » ouverte)
  const [hideTarget, setHideTarget] = useState<{ postId: string; authorName: string } | null>(null);

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

  /** Après une action réussie : la liste et les compteurs des onglets sont relus. */
  const refreshAfterAction = () => {
    fetchReports();
    onActionSuccess?.();
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
      refreshAfterAction();
      setConfirmTargetId(null);
      setReportComment("");
    } else {
      toast.error("Erreur serveur");
    }
  };

  // « Masquer » : le message est masqué avec la raison donnée ; le serveur ferme alors ses signalements
  const onHideConfirm = async (reason: string) => {
    if (!hideTarget) return;
    const res = await moderatePost(hideTarget.postId, reason);
    if (!res.success) {
      toast.error(res.error || "Le message n'a pas pu être masqué.");
      return;
    }
    toast.success("Message masqué, signalement fermé");
    refreshAfterAction();
  };

  // Contenu déjà supprimé : le signalement est fermé directement, sans fenêtre de confirmation
  const closeGoneReports = async (targetId: string) => {
    setResolving(true);
    const res = await resolveReportsAction(targetId, type, "RESOLVE", "Contenu déjà supprimé : signalement fermé");
    setResolving(false);
    if (res.success) {
      toast.success("Signalement fermé");
      refreshAfterAction();
    } else {
      toast.error("Erreur serveur");
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
            const target = group.target;
            const expanded = expandedId === group.targetId;
            const report = expanded ? group.reports[activeDetailIndex] : null;
            const detailsId = `report-details-${group.targetId}`;
            const firstReport = group.reports[0];
            const others = group.count - 1;
            const canHide = type === "POST" && !target.hidden;
            const viewLabel = type === "POST" ? "Voir dans le sujet" : type === "USER" ? "Voir le profil" : "Voir";
            return (
              <Card key={group.targetId} className="overflow-hidden">
                <article aria-label={`Signalement : ${group.firstReason}`}>
                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutral">{TYPE_LABELS[type]}</Badge>
                      <Badge variant="danger">
                        <ShieldAlert size={12} aria-hidden="true" />
                        {group.count} signalement{group.count > 1 ? "s" : ""}
                      </Badge>
                      {target.hidden && !target.gone && <Badge variant="neutral">{type === "USER" ? "Banni" : "Déjà masqué"}</Badge>}
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-bb-text-muted">Raison</span>
                      <p className="m-0 text-base font-bold break-words text-bb-text">{group.firstReason}</p>
                      <p className="m-0 text-sm text-bb-text-muted">
                        <Clock size={14} aria-hidden="true" className="mr-1 inline align-[-2px]" />
                        Signalé par <span className="font-semibold text-bb-text">{firstReport?.reporter.name ?? "un membre"}</span>
                        {others > 0 && ` et ${others} autre${others > 1 ? "s" : ""}`}, le{" "}
                        {format(new Date(group.createdAt), "d MMM yyyy à HH:mm", { locale: fr })}
                      </p>
                    </div>

                    {target.gone ? (
                      <p className="m-0 flex items-center gap-2 rounded-bb-md border border-bb-border bg-bb-surface-2 px-3 py-2 text-[0.95rem] text-bb-text">
                        <Trash2 size={16} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
                        Contenu déjà supprimé : il ne reste qu&apos;à fermer le signalement.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1 rounded-bb-md border border-bb-border bg-bb-surface-2 px-3 py-2">
                        {target.title && (
                          <p className="m-0 font-semibold break-words text-bb-text">
                            {type === "POST" ? `Dans le sujet « ${target.title} »` : target.title}
                          </p>
                        )}
                        {target.authorName && AUTHOR_WORDS[type] && (
                          <p className="m-0 text-sm text-bb-text-muted">
                            {AUTHOR_WORDS[type]} <span className="font-semibold text-bb-text">{target.authorName}</span>
                          </p>
                        )}
                        {target.excerpt && (
                          <blockquote className="m-0 border-l-[3px] border-bb-border pl-3 text-[0.95rem] break-words text-bb-text">
                            {target.excerpt}
                          </blockquote>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {target.gone ? (
                        <Button type="button" variant="primary" size="tap" disabled={resolving} onClick={() => closeGoneReports(group.targetId)}>
                          <X size={16} aria-hidden="true" />
                          Fermer le signalement
                        </Button>
                      ) : (
                        <>
                          {target.url && (
                            <Button asChild variant="secondary" size="tap">
                              <Link href={target.url}>
                                <ArrowRight size={16} aria-hidden="true" />
                                {viewLabel}
                              </Link>
                            </Button>
                          )}
                          {canHide && (
                            <Button
                              type="button"
                              variant="danger"
                              size="tap"
                              onClick={() => setHideTarget({ postId: group.targetId, authorName: target.authorName ?? "un membre" })}
                            >
                              <EyeOff size={16} aria-hidden="true" />
                              Masquer
                            </Button>
                          )}
                          <Button type="button" variant="secondary" size="tap" onClick={() => openConfirm(group.targetId, "IGNORE")}>
                            <X size={16} aria-hidden="true" />
                            Ignorer
                          </Button>
                          {type !== "POST" && (
                            <Button type="button" variant="primary" size="tap" onClick={() => openConfirm(group.targetId)}>
                              <Check size={16} aria-hidden="true" />
                              Marquer comme traité
                            </Button>
                          )}
                        </>
                      )}
                      <Button
                        type="button"
                        variant="quiet"
                        size="tap"
                        aria-expanded={expanded}
                        aria-controls={detailsId}
                        onClick={() => toggleExpand(group.targetId)}
                      >
                        {expanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                        Détails
                      </Button>
                      {type === "POST" && !target.gone && (
                        <ActionMenu
                          label="Plus d'actions sur ce signalement"
                          title="Actions sur le signalement"
                          items={[
                            {
                              label: "Marquer comme traité",
                              icon: <Check size={18} aria-hidden="true" />,
                              onSelect: () => openConfirm(group.targetId),
                            },
                          ]}
                        />
                      )}
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

      <ModerationModal
        isOpen={hideTarget !== null}
        onClose={() => setHideTarget(null)}
        onConfirm={onHideConfirm}
        authorName={hideTarget?.authorName ?? ""}
      />
    </div>
  );
}
