"use client";

import { useEffect, useState } from "react";
import { getModerationLogs } from "../actions";
import { Loader2, User as UserIcon, Clock, Link as LinkIcon, Info } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { cleanupModerationLogs } from "../actions";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";

interface LogsTabProps {
  userRole?: string;
}

export default function LogsTab({ userRole }: LogsTabProps) {
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
  }, [page]);

  const handleCleanupClick = () => {
    setIsConfirmOpen(true);
  };

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

  const getActionBadge = (action: string) => {
    if (action.includes("DELETE") || action.includes("BAN")) return "danger";
    if (action.includes("LOCK") || action.includes("ARCHIVE") || action.includes("MODERATED")) return "warning";
    if (action.includes("UNLOCKED") || action.includes("UNBANNED") || action.includes("RESOLVED")) return "success";
    return "info";
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ");
  };

  const getTargetUrl = (log: any) => {
    if (!log.targetId) return null;
    switch (log.targetType) {
      case "TOPIC": return `/forum/topic/${log.targetId}`;
      case "FORUM": return `/forum/${log.targetId}`;
      case "USER": return `/spy/${log.targetId}`;
      case "ARTICLE": return `/articles/${log.targetId}`;
      case "LIGUE": return `/ligue/${log.targetId}`;
      case "POST": {
        // We might not have the topicId here easily, but let's try to link if details has it
        try {
          const details = JSON.parse(log.details || "{}");
          if (details.topicId) return `/forum/topic/${details.topicId}#post-${log.targetId}`;
        } catch (e) {}
        return null;
      }
      default: return null;
    }
  };

  if (loading && page === 1) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader2 className="animate-spin" size={24} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="logs-tab">
      <PremiumCard style={{ padding: '2rem' }}>
        <div className="tab-header" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
          <FileText size={20} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Journal d'audit</h3>
          
          {(userRole === "ADMIN" || userRole === "SUPERADMIN") && (
            <button 
              className="widget-button secondary-btn btn-sm" 
              style={{ marginLeft: 'auto', width: 'auto', fontSize: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
              onClick={handleCleanupClick}
              disabled={isCleaning}
            >
              {isCleaning ? <Loader2 size={14} className="animate-spin" /> : "Purger > 3 mois"}
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>Aucun log enregistré pour le moment.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="moderation-table">
              <thead>
                <tr>
                  <th>Modérateur</th>
                  <th>Action</th>
                  <th>Cible</th>
                  <th>Détails</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="moderation-row">
                    <td className="moderation-cell">
                      <div className="report-author">
                        <UserIcon size={14} />
                        <span>{log.moderator.name}</span>
                      </div>
                    </td>
                    <td className="moderation-cell">
                      <span className={`action-badge ${getActionBadge(log.action)}`}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="moderation-cell">
                      {log.targetId ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{log.targetType}</span>
                            {getTargetUrl(log) && (
                                <Link href={getTargetUrl(log)!} style={{ color: 'var(--primary)', opacity: 0.8 }} title="Voir l'élément">
                                    <LinkIcon size={12} />
                                </Link>
                            )}
                        </div>
                      ) : "-"}
                    </td>
                    <td className="moderation-cell">
                      <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>{log.details || "-"}</span>
                    </td>
                    <td className="moderation-cell">
                      <div style={{ fontSize: '0.8rem', opacity: 0.6, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} />
                        {format(new Date(log.createdAt), "dd/MM HH:mm", { locale: fr })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 20 && (
          <div className="pagination" style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
            <button 
              className="widget-button secondary-btn btn-sm" 
              disabled={page === 1} 
              onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
              style={{ width: 'auto' }}
            >
              Précédent
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Page {page}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>sur {Math.ceil(total / 20)} ({total} entrées)</span>
            </div>
            <button 
              className="widget-button secondary-btn btn-sm" 
              disabled={page >= Math.ceil(total / 20)} 
              onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
              style={{ width: 'auto' }}
            >
              Suivant
            </button>
          </div>
        )}
      </PremiumCard>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmCleanup}
        title="Purger le journal d'audit"
        message="Voulez-vous supprimer définitivement tous les logs de modération de plus de 3 mois ? Cette action est irréversible."
        confirmLabel="Purger les logs"
        isDanger={true}
      />
    </div>
  );
}

// Missing import fix
import { FileText } from "lucide-react";
