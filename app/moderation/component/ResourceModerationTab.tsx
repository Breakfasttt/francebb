"use client";

import { useEffect, useState, useTransition } from "react";
import { getPendingResources, moderateResource } from "@/app/ressources/actions";
import { Loader2, Check, X, Edit, ExternalLink, Layout, User, Clock } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface ResourceModerationTabProps {
  onActionSuccess?: () => void;
}

export default function ResourceModerationTab({ onActionSuccess }: ResourceModerationTabProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchResources = async () => {
    setLoading(true);
    const data = await getPendingResources();
    setResources(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await moderateResource(id, "APPROVE");
      if (res.success) {
        toast.success("Ressource approuvée");
        fetchResources();
        onActionSuccess?.();
      } else {
        toast.error(res.error || "Une erreur est survenue");
      }
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      const res = await moderateResource(id, "REJECT");
      if (res.success) {
        toast.success("Ressource rejetée");
        fetchResources();
        onActionSuccess?.();
      } else {
        toast.error(res.error || "Une erreur est survenue");
      }
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="resource-moderation-tab">
      <div className="tab-header" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <Layout size={20} color="var(--primary)" />
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Soumissions de ressources</h3>
        <span className="action-badge info" style={{ marginLeft: 'auto' }}>{resources.length} En attente</span>
      </div>

      {resources.length === 0 ? (
        <PremiumCard>
          <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>Aucune soumission en attente.</p>
        </PremiumCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {resources.map((res) => (
            <PremiumCard key={res.id} className="moderation-item-card">
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {res.imageUrl && (
                  <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                    <img src={res.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{res.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={12} /> {formatDistanceToNow(new Date(res.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>{res.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)' }}>
                      <User size={12} /> {res.author.name}
                    </span>
                    <a href={res.link} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', textDecoration: 'none' }}>
                      <ExternalLink size={12} /> Lien externe
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/ressources/edit/${res.id}`} className="widget-button secondary-btn btn-sm" style={{ width: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Edit size={14} />
                  </Link>
                  <button onClick={() => handleApprove(res.id)} className="widget-button success btn-sm" style={{ width: 'auto' }} disabled={isPending}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => handleReject(res.id)} className="widget-button secondary-btn danger btn-sm" style={{ width: 'auto' }} disabled={isPending}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>
      )}

      <style jsx>{`
        :global(.moderation-item-card) {
          padding: 1.2rem !important;
        }
        .action-badge {
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .action-badge.info {
          background: var(--primary-transparent);
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
