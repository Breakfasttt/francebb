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
import LigueAdminActions from "./component/LigueAdminActions";
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
      creator: {
        include: {
          _count: { select: { posts: true } }
        }
      },
      commissaires: {
        include: {
          _count: { select: { posts: true } }
        }
      },
      _count: {
        select: { tournaments: true, members: true }
      },
      tournaments: {
        where: { isFinished: false, isCancelled: false },
        orderBy: { date: "asc" },
        take: 5,
        include: { topic: { select: { id: true } } }
      },
      members: {
        select: {
          id: true,
          name: true,
          image: true,
          avatarFrame: true,
          role: true,
          _count: { select: { posts: true } }
        },
        orderBy: { name: 'asc' }
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
    <div className="ligue-detail-page">
      <PageHeader 
        title={`${ligue.name} (${ligue.acronym})`} 
        subtitle={`Informations et classement de la ligue ${ligue.name}`}
        backHref="/ligues" 
      />

      <main className="container">

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
                <Link href={`/tournois?ligueId=${ligue.id}`} className="view-all-link">Voir tout</Link>
              </div>
              
              {ligue.tournaments.length > 0 ? (
                <div className="mini-tournaments-list">
                  {ligue.tournaments.map(t => (
                    <Link key={t.id} href={t.topic?.id ? `/forum/topic/${t.topic.id}` : `/tournois/${t.id}`} className="mini-t-item">
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
            
            {session && (
              <PremiumCard className="ligue-members">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  <Users size={20} className="text-primary" />
                  <h3>Liste des membres ({ligue.members.length})</h3>
                </div>

                {ligue.members.length > 0 ? (
                  <div className="members-grid">
                    {ligue.members.map(member => (
                      <Link key={member.id} href={member.id === session.user.id ? "/profile" : `/spy/${member.id}`} className="member-card">
                        <UserAvatar 
                          image={member.image} 
                          name={member.name || ""} 
                          size={32} 
                          postCount={member._count?.posts || 0}
                          selectedRank={member.avatarFrame as any}
                          isModerator={isModerator(member.role)}
                        />
                        <span className="member-name">{member.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">Aucun membre n&apos;est actuellement rattaché à cette ligue.</p>
                )}
              </PremiumCard>
            )}
          </div>
        </div>

        <aside className="ligue-sidebar">
          {canEdit && (
            <LigueAdminActions ligueId={ligue.id} canManage={canManage} />
          )}

          <PremiumCard className="commissaires-card">
            <h3>Commissaires</h3>
            <div className="user-list">
              <div className="user-item owner">
                <UserAvatar 
                  image={ligue.creator.image} 
                  name={ligue.creator.name || ""} 
                  size={32} 
                  postCount={ligue.creator._count?.posts || 0}
                  selectedRank={ligue.creator.avatarFrame as any}
                  isModerator={isModerator(ligue.creator.role)}
                />
                <div className="user-info">
                  <span className="user-name">{ligue.creator.name}</span>
                  <span className="user-role-badge">Chef de Ligue</span>
                </div>
              </div>
              {ligue.commissaires.map(c => (
                <div key={c.id} className="user-item">
                  <UserAvatar 
                    image={c.image} 
                    name={c.name || ""} 
                    size={32} 
                    postCount={c._count?.posts || 0}
                    selectedRank={c.avatarFrame as any}
                    isModerator={isModerator(c.role)}
                  />
                  <div className="user-info">
                    <span className="user-name">{c.name}</span>
                    <span className="user-role-badge commissaire">Commissaire</span>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>

          {session && (
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <ReportLigueButton ligueId={ligue.id} ligueName={ligue.name} />
            </div>
          )}
        </aside>
      </div>
    </main>
    </div>
  );
}

import ReportLigueButton from "./component/ReportLigueButton";
