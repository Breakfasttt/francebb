/**
 * Onglet du journal d'audit (Logs).
 * Affiche l'historique des actions de modération effectuées sur la plateforme.
 */
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
import Pagination from "@/common/components/Pagination/Pagination";

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
    if (action.includes("DELETE") || action.includes("BAN")) return "status-danger";
    if (action.includes("LOCK") || action.includes("ARCHIVE") || action.includes("MODERATED")) return "status-warning";
    if (action.includes("UNLOCKED") || action.includes("UNBANNED") || action.includes("RESOLVED")) return "status-success";
    return "status-info";
  };

  const formatAction = (action: string) => {
    const translations: Record<string, string> = {
      // Forum
      "FORUM_CREATED": "Forum créé",
      "FORUM_LOCKED": "Forum verrouillé",
      "FORUM_UNLOCKED": "Forum déverrouillé",
      "FORUM_DELETED": "Forum supprimé",
      // Topics
      "TOPIC_DELETED": "Sujet supprimé",
      "TOPIC_PINNED": "Sujet épinglé",
      "TOPIC_UNPINNED": "Sujet désépinglé",
      "TOPIC_MOVED": "Sujet déplacé",
      "TOPIC_ARCHIVED": "Sujet archivé",
      "TOPIC_UNARCHIVED": "Sujet désarchivé",
      "TOPIC_LOCKED": "Sujet verrouillé",
      "TOPIC_UNLOCKED": "Sujet déverrouillé",
      // Posts
      "POST_MODERATED": "Message modéré",
      "POST_UNMODERATED": "Message restauré",
      // User
      "USER_ROLE_CHANGED": "Rôle modifié",
      "USER_BANNED": "Utilisateur banni",
      "USER_UNBANNED": "Utilisateur débanni",
      // Articles
      "ARTICLE_MODERATED": "Article modéré",
      "ARTICLE_UNMODERATED": "Article restauré",
      "ARTICLE_DELETED": "Article supprimé",
      // Ligues
      "LIGUE_CREATED": "Ligue créée",
      "LIGUE_DELETED": "Ligue supprimée",
      // Resources
      "RESOURCE_APPROVED": "Ressource approuvée",
      "RESOURCE_REJECTED": "Ressource rejetée",
      "RESOURCE_UPDATED": "Ressource mise à jour",
      "RESOURCE_DELETED": "Ressource supprimée",
      // Reports
      "REPORT_IGNORED": "Signalement ignoré",
      "REPORT_RESOLVED": "Signalement traité"
    };
    return translations[action] || action.replace(/_/g, " ");
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
                  <th>Action effectuée</th>
                  <th>Cible</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="moderation-row">
                    <td className="moderation-cell">
                      <Link href={`/spy/${log.moderator.id}`} className="report-author hover-link" title="Espionner le modérateur">
                        <div className="avatar-mini">
                          {log.moderator.image ? (
                            <img src={log.moderator.image} alt="" />
                          ) : (
                            <UserIcon size={12} />
                          )}
                        </div>
                        <span style={{ fontWeight: 600 }}>{log.moderator.name}</span>
                      </Link>
                    </td>
                    <td className="moderation-cell">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span className={`action-badge ${getActionBadge(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                        {log.details && (
                          <span style={{ fontSize: '0.8rem', opacity: 0.6, fontStyle: 'italic', maxWidth: '300px' }}>
                            {log.details}
                          </span>
                        )}
                      </div>
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

        <Pagination 
          currentPage={page} 
          totalPages={Math.ceil(total / 20)} 
          onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }}
          className="moderation-pagination"
        />
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
