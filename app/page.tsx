import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Trophy, MessageSquare, MapPin, Calendar } from "lucide-react";

export default async function Home() {
  const nextTournaments = await prisma.tournament.findMany({
    where: {
      date: { gte: new Date() }
    },
    orderBy: {
      date: 'asc'
    },
    take: 3
  });

  return (
    <main className="container">
      <section className="hero">
        <h1>France Blood Bowl</h1>
        <p>L'arène centrale des coachs français. Tournois, rencontres et partage.</p>
        
        <div className="action-buttons">
          <Link href="/tournaments" className="action-card">
            <Trophy size={32} style={{ marginBottom: '0.8rem', color: 'var(--accent)' }} />
            <div>Tournois</div>
          </Link>
          <Link href="/forum" className="action-card">
            <MessageSquare size={32} style={{ marginBottom: '0.8rem', color: 'var(--accent)' }} />
            <div>Forum</div>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="section-title">Prochains Événements</h2>
        <div className="grid">
          {nextTournaments.length > 0 ? (
            nextTournaments.map((t: any) => (
              <div key={t.id} className="premium-card hover-effect" style={{ padding: '1.2rem' }}>
                <div className="tournament-badge">À VENIR</div>
                <h3 style={{ marginTop: '0.8rem', fontSize: '1.2rem' }}>{t.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  <MapPin size={14} /> {t.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  <Calendar size={14} /> {new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </div>
                <p style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.description}</p>
              </div>
            ))
          ) : (
            <p style={{ color: '#888' }}>Aucun tournoi prévu pour le moment. Revenez bientôt !</p>
          )}
        </div>
      </section>
    </main>
  );
}
