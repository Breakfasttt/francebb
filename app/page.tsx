import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import SiteLogo from "@/common/components/SiteLogo/SiteLogo";
import { Trophy, MessageSquare, MapPin, Calendar, Users, Shield, Info, BookOpen, HelpCircle, Plus } from "lucide-react";
import { auth } from "@/auth";
import "./page.css";

export default async function Home() {
  const session = await auth();
  const isAuth = !!session?.user;

  const nextTournaments = await prisma.tournament.findMany({
    where: {
      date: { gte: new Date() }
    },
    orderBy: {
      date: 'asc'
    },
    take: 3
  });

  const discordInvite = await prisma.siteSetting.findUnique({
    where: { key: 'discord_invite' }
  });

  // Trouver le premier forum de type "tournoi" pour le bouton "Créer"
  const tournamentForum = await prisma.forum.findFirst({
    where: { isTournamentForum: true },
    select: { id: true }
  });

  return (
    <main className="container" style={{ padding: '0.5rem 1rem' }}>
      <section className="hero" style={{ padding: '0.5rem 0.5rem 0 0.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SiteLogo scale={1.1} />
        </div>
        
        {/* LIGNE 1 */}
        <div className="action-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          margin: '0 auto 1.5rem auto',
          maxWidth: '850px'
        }}>
          <Link href="/jouer" className="action-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.2rem 1rem' }}>
            <Info size={30} style={{ marginBottom: '0.5rem', color: 'var(--accent)' }} />
            <div style={{ fontSize: '1rem', lineHeight: 1.1 }}>Jouer à<br/>Blood Bowl !</div>
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href={isAuth ? "/league" : "/auth/login?callback=/league"} className="action-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.2rem 1rem' }}>
              <Shield size={30} style={{ marginBottom: '0.5rem', color: 'var(--accent)' }} />
              <div style={{ fontSize: '1rem' }}>Ligues</div>
            </Link>
            {/* On ne garde que si on a un module ligue ou autre, sinon on cache */}
            <Link href={isAuth ? "/forum" : "/auth/login?callback=/forum"} className="action-card-mini" style={{ padding: '0.5rem' }}>
              <Plus size={16} /> <span style={{ fontSize: '0.8rem' }}>Rejoindre</span>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href={isAuth ? "/tournaments" : "/auth/login?callback=/tournaments"} className="action-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.2rem 1rem' }}>
              <Trophy size={30} style={{ marginBottom: '0.5rem', color: 'var(--accent)' }} />
              <div style={{ fontSize: '1rem' }}>Tournois</div>
            </Link>
            {tournamentForum && (
              <Link href={isAuth ? `/forum/new-tournament?forumId=${tournamentForum.id}` : `/auth/login?callback=/forum/new-tournament?forumId=${tournamentForum.id}`} className="action-card-mini" style={{ padding: '0.5rem' }}>
                <Plus size={16} /> <span style={{ fontSize: '0.8rem' }}>Créer</span>
              </Link>
            )}
          </div>
        </div>

        {/* LIGNE 2 */}
        <div className="action-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          margin: '0 auto 1.5rem auto',
          maxWidth: '850px'
        }}>
          <Link href={isAuth ? "/forum" : "/auth/login?callback=/forum"} className="action-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.2rem 1rem' }}>
            <MessageSquare size={30} style={{ marginBottom: '0.5rem', color: 'var(--accent)' }} />
            <div style={{ fontSize: '1rem' }}>Forum</div>
          </Link>

          <Link href={isAuth ? "/membres" : "/auth/login?callback=/membres"} className="action-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.2rem 1rem' }}>
            <Users size={30} style={{ marginBottom: '0.5rem', color: 'var(--accent)' }} />
            <div style={{ fontSize: '1rem' }}>Membres</div>
          </Link>

          <Link href="/ressources" className="action-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.2rem 1rem' }}>
            <BookOpen size={30} style={{ marginBottom: '0.5rem', color: 'var(--accent)' }} />
            <div style={{ fontSize: '1rem' }}>Ressources</div>
          </Link>

          <a 
            href={discordInvite?.value || "#"} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="action-card discord-cta" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '1.2rem 1rem',
              background: '#5865F2',
              color: '#FFFFFF',
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div className="discord-glow" />
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" style={{ marginBottom: '0.5rem', color: '#FFFFFF' }}>
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.006 14.006 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
            </svg>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.1, fontWeight: 700, color: '#FFFFFF' }}>Communauté<br/>Discord</div>
          </a>
        </div>
      </section>

      <section style={{ marginTop: '0.5rem', paddingBottom: '2rem' }}>
        <h2 className="section-title" style={{ marginBottom: '0.8rem', fontSize: '1.2rem' }}>Prochains Événements</h2>
        <div className="grid">
          {nextTournaments.length > 0 ? (
            nextTournaments.map((t: any) => (
              <PremiumCard key={t.id} hoverEffect style={{ padding: '1rem' }}>
                <div className="tournament-badge" style={{ display: 'inline-block', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>À VENIR</div>
                <h3 style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>{t.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', margin: '0.4rem 0', fontSize: '0.85rem' }}>
                  <MapPin size={14} /> {t.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', margin: '0.4rem 0', fontSize: '0.85rem' }}>
                  <Calendar size={14} /> {new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </div>
                <p style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0, color: 'var(--text-secondary)' }}>{t.description}</p>
              </PremiumCard>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Aucun tournoi prévu pour le moment. Revenez bientôt !</p>
          )}
        </div>
      </section>
    </main>
  );
}
