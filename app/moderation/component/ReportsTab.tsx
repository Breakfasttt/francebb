"use client";

import { useEffect, useState, useTransition } from "react";
import { getPendingReportsByType, resolveReportsAction } from "../actions";
import { Loader2, MessageSquare, AlertTriangle, Users, BookOpen, Trophy, ExternalLink, Check, X, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";

interface ReportsTabProps {
  type: "POST" | "TOPIC" | "USER" | "ARTICLE" | "LIGUE" | "MESSAGE";
  title: string;
}

export default function ReportsTab({ type, title }: ReportsTabProps) {
  const [reportGroups, setReportGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // État pour ConfirmModal
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    targetId: string;
    action: "RESOLVE" | "IGNORE";
  }>({
    isOpen: false,
    targetId: "",
    action: "RESOLVE"
  });

  const fetchReports = async () => {
    setLoading(true);
    const groups = await getPendingReportsByType(type);
    setReportGroups(groups);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [type]);

  const handleActionClick = (targetId: string, action: "RESOLVE" | "IGNORE") => {
    setConfirmState({ isOpen: true, targetId, action });
  };

  const onConfirmAction = async () => {
    const { targetId, action } = confirmState;
    
    // On peut utiliser startTransition ici ou gérer le loading dans le bouton
    // Mais ConfirmModal s'attend à une promesse
    const res = await resolveReportsAction(targetId, type, action);
    if (res.success) {
      toast.success(action === "RESOLVE" ? "Signalement résolu" : "Signalement ignoré");
      fetchReports();
      setConfirmState(prev => ({ ...prev, isOpen: false }));
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
      case "POST": {
        // We'll need more info for post link, normally in details.
        // For now, return null or try to find in first report details
        return null; 
      }
      default: return null;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "POST": return <MessageSquare size={20} color="var(--accent)" />;
      case "TOPIC": return <AlertTriangle size={20} color="var(--danger)" />;
      case "USER": return <Users size={20} color="var(--primary)" />;
      case "ARTICLE": return <BookOpen size={20} color="var(--success)" />;
      case "LIGUE": return <Trophy size={20} color="var(--accent)" />;
      default: return <AlertTriangle size={20} />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="reports-tab">
      <div className="tab-header" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        {getIcon()}
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{title}</h3>
        <span className="action-badge info" style={{ marginLeft: 'auto' }}>{reportGroups.length} En attente</span>
      </div>

      {reportGroups.length === 0 ? (
        <PremiumCard>
          <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>Aucun signalement en attente pour cette catégorie.</p>
        </PremiumCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reportGroups.map((group) => (
            <PremiumCard key={group.targetId} className="report-card">
              <div className="report-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span className="report-target-info">
                      {type} Cible: {group.targetId.substring(0, 8)}...
                    </span>
                    <span className="action-badge danger">
                      {group.count} Signalement{group.count > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Raison principale: <span style={{ color: 'var(--text)' }}>{group.firstReason}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  {getTargetUrl(group.targetId) && (
                    <Link href={getTargetUrl(group.targetId)!} target="_blank" className="widget-button secondary-btn btn-sm" style={{ width: 'auto' }}>
                      <ExternalLink size={14} /> Voir
                    </Link>
                  )}
                  <button className="widget-button secondary-btn btn-sm" onClick={() => setExpandedId(expandedId === group.targetId ? null : group.targetId)} style={{ width: 'auto' }}>
                    {expandedId === group.targetId ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Détails
                  </button>
                  <button className="widget-button success btn-sm" onClick={() => handleActionClick(group.targetId, "RESOLVE")} disabled={isPending} style={{ width: 'auto' }}>
                    <Check size={14} /> Résoudre
                  </button>
                  <button className="widget-button secondary-btn danger btn-sm" onClick={() => handleActionClick(group.targetId, "IGNORE")} disabled={isPending} style={{ width: 'auto' }}>
                    <X size={14} /> Ignorer
                  </button>
                </div>
              </div>

              {expandedId === group.targetId && (
                <div className="report-details-list" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>Historique des signalements pour cet élément :</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {group.reports.map((report: any) => (
                      <div key={report.id} style={{ background: 'var(--glass-bg)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div className="report-author">
                            <Users size={12} />
                            <span>Signalé par <strong>{report.reporter.name}</strong></span>
                          </div>
                          <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                            {format(new Date(report.createdAt), "dd MMMM HH:mm", { locale: fr })}
                          </span>
                        </div>
                        <div style={{ fontWeight: 600 }}>Raison: {report.reason}</div>
                        {report.details && (
                          <div className="report-details" style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                            "{report.details}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </PremiumCard>
          ))}
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={onConfirmAction}
        title={confirmState.action === "RESOLVE" ? "Marquer comme résolu" : "Ignorer le signalement"}
        message={confirmState.action === "RESOLVE" 
          ? "L'élément sera marqué comme traité et n'apparaîtra plus dans cette liste." 
          : "Le signalement sera ignoré. Il ne sera plus visible dans la liste des signalements en attente."}
        confirmLabel={confirmState.action === "RESOLVE" ? "Résoudre" : "Ignorer"}
        isDanger={confirmState.action === "IGNORE"}
      />
    </div>
  );
}
