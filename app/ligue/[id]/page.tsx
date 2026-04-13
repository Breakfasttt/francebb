import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Shield, MapPin, Globe, Users, Trophy, Settings, Trash2, ArrowLeftRight, AlertTriangle, Calendar } from "lucide-react";
import UserAvatar from "@/common/components/UserAvatar/UserAvatar";
import { isModerator } from "@/lib/roles";
import Link from "next/link";
import { parseBBCode } from "@/lib/bbcode";
import AdminButton from "@/common/components/Button/AdminButton";
import DangerButton from "@/common/components/Button/DangerButton";
import "./id.css";
import "./id-mobile.css";


export default async function LigueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const ligue = await prisma.ligue.findUnique({
    where: { id },
    include: {
      creator: true,
      commissaires: true,
      _count: {
        select: { tournaments: true, members: true }
      },
      tournaments: {
        where: { isFinished: false, isCancelled: false },
        orderBy: { date: "asc" },
        take: 5,
        include: { topic: { select: { id: true } } }
      }
    }
  });

  if (!ligue) notFound();

  const isCreator = session?.user?.id === ligue.creatorId;
  const isCommissaire = ligue.commissaires.some(c => c.id === session?.user?.id);
  const isMod = isModerator(session?.user?.role);
  const canEdit = isCreator || isCommissaire || isMod;
  const canManage = isCreator || isMod;

  return (
    <main className="container ligue-detail-page">
      <PageHeader 
        title={`${ligue.name} (${ligue.acronym})`} 
        backHref="/ligues" 
      />

      <div className="ligue-grid">
        <div className="ligue-main">
          <PremiumCard className="ligue-hero">
            <div className="hero-content">
              <div className="hero-badge">
                <Shield size={64} />
              </div>
              <div className="hero-text">
                <h1>{ligue.name}</h1>
                <div className="hero-meta">
                  <div className="meta-item"><MapPin size={18} /> {ligue.geographicalZone} - {ligue.ville || ligue.region || "France"}</div>
                  {ligue.address && <div className="meta-item"><Globe size={18} /> {ligue.address}</div>}
                </div>
              </div>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-value">{ligue._count?.members || 0}</span>
                <span className="stat-label">Membres</span>
              </div>
              <div className="hero-stat">
                <span className="stat-value">{ligue._count?.tournaments || 0}</span>
                <span className="stat-label">Tournois</span>
              </div>
            </div>
          </PremiumCard>

          <div className="ligue-content-sections">
            <PremiumCard className="ligue-description">
              <h3>À propos de la ligue</h3>
              <div className="bbcode-content" dangerouslySetInnerHTML={{ __html: parseBBCode(ligue.description || "") }}>
              </div>
            </PremiumCard>

            <PremiumCard className="ligue-tournaments">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Prochains Tournois</h3>
                <Link href={`/tournaments?ligueId=${ligue.id}`} className="view-all-link">Voir tout</Link>
              </div>
              
              {ligue.tournaments.length > 0 ? (
                <div className="mini-tournaments-list">
                  {ligue.tournaments.map(t => (
                    <Link key={t.id} href={t.topic?.id ? `/forum/topic/${t.topic.id}` : `/tournaments/${t.id}`} className="mini-t-item">
                      <div className="mini-t-date">
                        <Calendar size={18} />
                        <span>{new Date(t.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="mini-t-name">{t.name}</div>
                      <div className="mini-t-platform">{t.platform}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="no-data">Aucun tournoi prévu pour le moment.</p>
              )}
            </PremiumCard>
          </div>
        </div>

        <aside className="ligue-sidebar">
          {canEdit && (
            <PremiumCard className="admin-actions-card">
              <h3>Gestion Ligue</h3>
              <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <AdminButton 
                  href={`/ligue/edit/${ligue.id}`} 
                  fullWidth 
                  icon={<Settings size={18} />}
                >
                  Modifier les infos
                </AdminButton>

                {canManage && (
                  <>
                    <AdminButton 
                      fullWidth 
                      icon={<ArrowLeftRight size={18} />}
                    >
                      Transférer propriété
                    </AdminButton>
                    <DangerButton 
                      fullWidth 
                      icon={<Trash2 size={18} />}
                    >
                      Supprimer la ligue
                    </DangerButton>
                  </>
                )}
              </div>
            </PremiumCard>
          )}

          <PremiumCard className="commissaires-card">
            <h3>Commissaires</h3>
            <div className="user-list">
              <div className="user-item owner">
                <UserAvatar image={ligue.creator.image} name={ligue.creator.name || ""} size={32} />
                <div className="user-info">
                  <span className="user-name">{ligue.creator.name}</span>
                  <span className="user-role-badge">Chef de Ligue</span>
                </div>
              </div>
              {ligue.commissaires.map(c => (
                <div key={c.id} className="user-item">
                  <UserAvatar image={c.image} name={c.name || ""} size={32} />
                  <div className="user-info">
                    <span className="user-name">{c.name}</span>
                    <span className="user-role-badge commissaire">Commissaire</span>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <ReportLigueButton ligueId={ligue.id} ligueName={ligue.name} />
          </div>
        </aside>
      </div>
    </main>
  );
}

import ReportLigueButton from "./component/ReportLigueButton";
