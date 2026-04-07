/**
 * Onglet de gestion des signalements.
 * Permet de visualiser les signalements groupés par cible et de les marquer comme traités.
 */
"use client";

import { useEffect, useState, useTransition } from "react";
import { getPendingReportsByType, resolveReportsAction } from "../actions";
import { 
  Loader2, MessageSquare, AlertTriangle, Users, BookOpen, Trophy, 
  ExternalLink, Check, ShieldAlert, ChevronDown, ChevronUp, Clock, 
  Hash, ChevronLeft, ChevronRight 
} from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import Pagination from "@/common/components/Pagination/Pagination";

interface ReportsTabProps {
  type: "POST" | "TOPIC" | "USER" | "ARTICLE" | "LIGUE" | "MESSAGE";
  title: string;
  onActionSuccess?: () => void;
}

export default function ReportsTab({ type, title, onActionSuccess }: ReportsTabProps) {
  const [reportGroups, setReportGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeDetailIndex, setActiveDetailIndex] = useState(0);
  const [reportComment, setReportComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // État pour ConfirmModal
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    targetId: string;
  }>({
    isOpen: false,
    targetId: "",
  });

  const fetchReports = async () => {
    setLoading(true);
    const res = await getPendingReportsByType(type, page);
    setReportGroups(res.groups);
    setTotal(res.total);
    setLoading(false);
  };

  useEffect(() => {
    setPage(1); // Reset page on type change
  }, [type]);

  useEffect(() => {
    fetchReports();
  }, [type, page]);

  // Reset active detail index when expanding or closing
  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setActiveDetailIndex(0);
    }
  };

  const handleActionClick = (targetId: string) => {
    setReportComment(""); // Reset comment
    setConfirmState({ isOpen: true, targetId });
  };

  const onConfirmAction = async () => {
    const { targetId } = confirmState;
    
    // On utilise RESOLVE par défaut pour l'action "Traité"
    // On passe le commentaire optionnel
    const res = await resolveReportsAction(targetId, type, "RESOLVE", reportComment);
    if (res.success) {
      toast.success("Signalement marqué comme traité");
      fetchReports();
      onActionSuccess?.();
      setConfirmState(prev => ({ ...prev, isOpen: false }));
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
      case "POST": return null; 
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

  if (loading && page === 1) {
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
        <span className="action-badge info" style={{ marginLeft: 'auto' }}>{total} En attente</span>
      </div>

      {reportGroups.length === 0 ? (
        <PremiumCard>
          <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>Aucun signalement en attente pour cette catégorie.</p>
        </PremiumCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reportGroups.map((group) => (
            <PremiumCard key={group.targetId} className="report-card-premium">
              <div className="report-main-content">
                <div className="report-info-section">
                  <div className="target-badge">
                    <Hash size={12} />
                    <span>ID: {group.targetId.substring(0, 8)}...</span>
                  </div>
                  
                  <div className="report-reason-display">
                    <span className="reason-label">Raison:</span>
                    <span className="reason-text">{group.firstReason}</span>
                  </div>

                  <div className="report-meta">
                    <span className="report-count-badge">
                      <ShieldAlert size={14} />
                      {group.count} Signalement{group.count > 1 ? "s" : ""}
                    </span>
                    <span className="report-date-meta">
                       <Clock size={12} />
                       {format(new Date(group.createdAt), "dd MMM HH:mm", { locale: fr })}
                    </span>
                  </div>
                </div>

                <div className="report-actions-section">
                  <div className="action-buttons-group">
                    {getTargetUrl(group.targetId) && (
                      <Link href={getTargetUrl(group.targetId)!} target="_blank" className="widget-button secondary-btn btn-sm" title="Voir l'élément">
                        <ExternalLink size={14} />
                        <span>Voir</span>
                      </Link>
                    )}
                    <button 
                      className={`widget-button secondary-btn btn-sm ${expandedId === group.targetId ? 'active' : ''}`} 
                      onClick={() => toggleExpand(group.targetId)}
                      title="Afficher les détails"
                    >
                      {expandedId === group.targetId ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      <span>Détails</span>
                    </button>
                    <button 
                      className="widget-button success btn-sm treated-btn" 
                      onClick={() => handleActionClick(group.targetId)} 
                      disabled={isPending}
                    >
                      <Check size={14} />
                      <span>Traité</span>
                    </button>
                  </div>
                </div>
              </div>

              {expandedId === group.targetId && (
                <div className="report-details-expanded">
                  <div className="details-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <h4>Historique des signalements</h4>
                      <span className="detail-index-badge">{activeDetailIndex + 1} / {group.reports.length}</span>
                    </div>
                    <div className="header-line"></div>
                    {group.reports.length > 1 && (
                      <div className="detail-navigation">
                        <button 
                          className="nav-arrow" 
                          onClick={() => setActiveDetailIndex(prev => Math.max(0, prev - 1))}
                          disabled={activeDetailIndex === 0}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button 
                          className="nav-arrow" 
                          onClick={() => setActiveDetailIndex(prev => Math.min(group.reports.length - 1, prev + 1))}
                          disabled={activeDetailIndex === group.reports.length - 1}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="detail-item animate-fade-in">
                    {(() => {
                      const report = group.reports[activeDetailIndex];
                      return (
                        <>
                          <div className="detail-item-header">
                            <div className="reporter-info">
                              <div className="avatar-placeholder">
                                {report.reporter.image ? <img src={report.reporter.image} alt="" /> : <Users size={12} />}
                              </div>
                              <span className="reporter-name">{report.reporter.name}</span>
                            </div>
                            <span className="detail-date">
                              {format(new Date(report.createdAt), "dd/MM HH:mm", { locale: fr })}
                            </span>
                          </div>
                          <div className="detail-reason">
                            <span className="tag">Raison:</span> {report.reason}
                          </div>
                          {report.details && (
                            <div className="detail-comment">
                              <MessageSquare size={12} className="quote-icon" />
                              <p>{report.details}</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </PremiumCard>
          ))}
        </div>
      )}

      <Pagination 
        currentPage={page}
        totalPages={Math.ceil(total / 10)}
        onPageChange={(p: number) => { setPage(p); window.scrollTo(0, 0); }}
        className="moderation-pagination"
      />

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={onConfirmAction}
        title="Marquer comme traité"
        message="Voulez-vous marquer tous les signalements de cet élément comme traités ? Il n'apparaîtra plus dans cette liste."
        confirmLabel="Confirmer"
        isDanger={false}
      >
        <div className="report-comment-input">
          <label htmlFor="moderation-comment">Détails de l'action (optionnel)</label>
          <textarea 
            id="moderation-comment"
            placeholder="Ex: Contenu supprimé après avertissement..."
            maxLength={200}
            value={reportComment}
            onChange={(e) => setReportComment(e.target.value)}
          />
          <span className="char-count">{reportComment.length}/200</span>
        </div>
      </ConfirmModal>

      <style jsx>{`
        .report-card-premium {
          padding: 0 !important;
          overflow: hidden;
          transition: transform 0.2s ease, border-color 0.2s ease;
          border: 1px solid var(--glass-border) !important;
        }

        .report-card-premium:hover {
          border-color: var(--primary-transparent) !important;
        }

        .report-main-content {
          display: flex;
          padding: 1.5rem;
          gap: 2rem;
          align-items: center;
        }

        .report-info-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .target-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: var(--glass-bg);
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          width: fit-content;
          border: 1px solid var(--glass-border);
        }

        .report-reason-display {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .reason-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          font-weight: 700;
        }

        .reason-text {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text);
        }

        .report-meta {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .report-count-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
        }

        .report-date-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .report-actions-section {
          display: flex;
          align-items: center;
        }

        .action-buttons-group {
          display: flex;
          gap: 0.6rem;
        }

        .treated-btn {
          background: linear-gradient(135deg, var(--success), #059669) !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          font-weight: 700 !important;
          min-width: 100px;
        }

        .treated-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
        }

        .report-details-expanded {
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid var(--glass-border);
          padding: 1.5rem;
        }

        .details-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .details-header h4 {
          margin: 0;
          font-size: 0.9rem;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .detail-index-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          background: var(--glass-bg);
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
        }

        .header-line {
          height: 1px;
          background: var(--glass-border);
          flex: 1;
        }

        .detail-navigation {
          display: flex;
          gap: 0.5rem;
        }

        .nav-arrow {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text);
          padding: 0.3rem;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .nav-arrow:hover:not(:disabled) {
          background: var(--primary-transparent);
          border-color: var(--primary);
          color: var(--primary);
        }

        .nav-arrow:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .detail-item {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1.2rem;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .report-comment-input {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .report-comment-input label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
        }

        .report-comment-input textarea {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 0.8rem;
          color: var(--text);
          font-size: 0.85rem;
          min-height: 80px;
          resize: none;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .report-comment-input textarea:focus {
          border-color: var(--primary);
        }

        .char-count {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: right;
        }

        .detail-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
        }

        .reporter-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .avatar-placeholder {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--primary-transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .avatar-placeholder img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .reporter-name {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .detail-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .detail-reason {
          font-size: 0.9rem;
          margin-bottom: 0.8rem;
        }

        .detail-reason .tag {
          font-weight: 700;
          color: var(--text-muted);
          margin-right: 0.5rem;
        }

        .detail-comment {
          display: flex;
          gap: 0.8rem;
          background: rgba(255, 255, 255, 0.03);
          padding: 1rem;
          border-radius: 8px;
          font-style: italic;
          color: var(--text-secondary);
          font-size: 0.9rem;
          position: relative;
        }

        .quote-icon {
          color: var(--primary);
          opacity: 0.4;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .detail-comment p {
          margin: 0;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .report-main-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          
          .report-actions-section {
            width: 100%;
          }
          
          .action-buttons-group {
            width: 100%;
            justify-content: space-between;
          }
          
          .treated-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
