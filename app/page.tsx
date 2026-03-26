import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SiteLogo from "@/common/components/SiteLogo/SiteLogo";
import { Trophy, MessageSquare, MapPin, Calendar, Users, Shield, Info, BookOpen, HelpCircle, Plus } from "lucide-react";
import { auth } from "@/auth";

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
        </div>
      </section>

      <section style={{ marginTop: '0.5rem', paddingBottom: '2rem' }}>
        <h2 className="section-title" style={{ marginBottom: '0.8rem', fontSize: '1.2rem' }}>Prochains Événements</h2>
        <div className="grid">
          {nextTournaments.length > 0 ? (
            nextTournaments.map((t: any) => (
              <div key={t.id} className="premium-card hover-effect" style={{ padding: '1rem' }}>
                <div className="tournament-badge" style={{ display: 'inline-block', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>À VENIR</div>
                <h3 style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>{t.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', margin: '0.4rem 0', fontSize: '0.85rem' }}>
                  <MapPin size={14} /> {t.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', margin: '0.4rem 0', fontSize: '0.85rem' }}>
                  <Calendar size={14} /> {new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </div>
                <p style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0, color: 'var(--text-secondary)' }}>{t.description}</p>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Aucun tournoi prévu pour le moment. Revenez bientôt !</p>
          )}
        </div>
      </section>
      
      <style>{`
        .action-card-mini {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: var(--accent);
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .action-card-mini:hover {
          background: var(--primary-transparent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--btn-shadow);
          border-color: var(--primary);
        }
        .action-card-mini span {
          font-size: 0.8rem;
          margin-left: 0.4rem;
          font-weight: 600;
        }
      `}</style>
    </main>
  );
}
