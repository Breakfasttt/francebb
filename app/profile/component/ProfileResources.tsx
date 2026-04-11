"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getUserResources, deleteResourceAction } from "@/app/ressources/actions";
import { Loader2, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, Layout, Edit, Trash2 } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import Pagination from "@/common/components/Pagination/Pagination";
import EmptyState from "@/common/components/EmptyState/EmptyState";
import ConfirmModal from "@/common/components/ConfirmModal/ConfirmModal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "react-hot-toast";

interface ProfileResourcesProps {
  userId: string;
}

export default function ProfileResources({ userId }: ProfileResourcesProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchResources = async () => {
    setLoading(true);
    const data = await getUserResources(userId, page, 5); 
    setResources(data.resources);
    setTotalPages(data.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, [userId, page]);

  const handleDelete = async () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await deleteResourceAction(deletingId);
      if (res.success) {
        toast.success("Ressource supprimée.");
        setDeletingId(null);
        fetchResources();
      } else {
        toast.error(res.error || "Erreur");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="status-badge approved">
            <CheckCircle size={12} /> Validé
          </span>
        );
      case "REJECTED":
        return (
          <span className="status-badge rejected">
            <XCircle size={12} /> Refusé
          </span>
        );
      default:
        return (
          <span className="status-badge pending">
            <AlertCircle size={12} /> En attente
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="profile-resources fade-in">
      <div className="section-header-pm">
        <Layout size={20} className="header-icon" />
        <h3 className="activity-box-title">Mes ressources soumises</h3>
        {resources.length > 0 && <span className="resources-count">{resources.length}</span>}
      </div>
      
      <div className="resources-content-wrapper" style={{ marginTop: '2rem' }}>
        {resources.length === 0 ? (
          <EmptyState 
            icon={<Layout size={48} />}
            title="Aucune ressource soumise"
            description="Vous n'avez pas encore partagé de ressources avec la communauté."
            action={
              <Link href="/ressources" className="resource-preview-link">
                Voir toutes les ressources <ExternalLink size={14} />
              </Link>
            }
          />
        ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {resources.map((res) => (
            <PremiumCard key={res.id} className="resource-submission-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{res.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  {getStatusBadge(res.status)}
                  <Link href={`/ressources/edit/${res.id}`} className="action-icon-btn" title="Éditer">
                    <Edit size={16} />
                  </Link>
                  <button onClick={() => setDeletingId(res.id)} className="action-icon-btn danger" title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {res.description}
              </p>

              <div className="submission-footer">
                <div className="submission-date">
                  <Clock size={12} />
                  <span>Soumis le {format(new Date(res.createdAt), "dd/MM/yyyy", { locale: fr })}</span>
                </div>
                <a href={res.link} target="_blank" className="resource-preview-link">
                  Voir <ExternalLink size={12} />
                </a>
              </div>
            </PremiumCard>
          ))}
          
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Pagination 
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Supprimer la ressource"
        message="Voulez-vous vraiment supprimer cette ressource ? Cette action est irréversible."
        isDanger
      />

      <style jsx>{`
        .profile-resources {
          padding: 0.5rem;
        }
        .resources-count {
          background: var(--glass-border);
          padding: 0.1rem 0.6rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        }
        :global(.resource-submission-card) {
          padding: 1.5rem !important;
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.7rem;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .status-badge.approved {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .status-badge.rejected {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .status-badge.pending {
          background: rgba(234, 179, 8, 0.1);
          color: #eab308;
          border: 1px solid rgba(234, 179, 8, 0.2);
        }
        .submission-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--glass-border);
        }
        .submission-date {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .resource-preview-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }
        .resources-content-wrapper {
          width: 100%;
        }
        .action-icon-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          padding: 0.4rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          text-decoration: none;
        }
        .action-icon-btn:hover {
          color: var(--primary);
          border-color: var(--primary-transparent);
        }
        .action-icon-btn.danger:hover {
          color: var(--danger);
          border-color: rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
}
