import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Trophy, User as UserIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PremiumCard from '@/common/components/PremiumCard/PremiumCard';
import "@/app/forum/component/TournamentResultWidget.css"; // Réutiliser le CSS existant

export default async function TournamentResultsViewPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      topic: { select: { id: true, title: true } },
      results: { 
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { rank: 'asc' }
      }
    }
  });

  if (!tournament || !tournament.results || tournament.results.length === 0) {
    notFound();
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>Classement Final</h1>
          <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 600 }}>{tournament.topic?.title || tournament.name}</p>
        </div>
        <Link href={`/forum/topic/${tournament.topic?.id}`} className="edit-results-btn">
          <ArrowLeft size={16} /> Retour au sujet
        </Link>
      </div>

      <PremiumCard style={{ padding: '2rem' }}>
        <div className="results-table-container">
          <table className="results-table" style={{ fontSize: '1rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px 10px' }}>#</th>
                <th style={{ padding: '15px 10px' }}>Coach</th>
                <th style={{ padding: '15px 10px' }}>Roster</th>
                <th style={{ padding: '15px 10px' }} className="stats-cell">V/N/D</th>
                <th style={{ padding: '15px 10px' }} className="stats-cell">CAS</th>
                <th style={{ padding: '15px 10px' }} className="points-cell">Points</th>
              </tr>
            </thead>
            <tbody>
              {tournament.results.map((res: any) => (
                <tr key={res.id}>
                  <td className="rank-cell" style={{ fontSize: '1.2rem' }}>{res.rank || '-'}</td>
                  <td style={{ padding: '15px 10px' }}>
                    <div className="coach-cell">
                      {res.user ? (
                        <Link href={`/profile/${res.user.id}`} className="coach-link" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <img src={res.user.image || "/default-avatar.png"} alt="" className="coach-avatar" style={{ width: '32px', height: '32px' }} />
                          <span className="coach-name" style={{ fontSize: '1.1rem' }}>{res.coachName}</span>
                        </Link>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <div className="coach-avatar" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                            <UserIcon size={18} />
                          </div>
                          <span className="coach-name" style={{ fontSize: '1.1rem' }}>{res.coachName}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '15px 10px' }} className="roster-cell">{res.roster || '-'}</td>
                  <td style={{ padding: '15px 10px' }} className="stats-cell">{res.wins}/{res.draws}/{res.losses}</td>
                  <td style={{ padding: '15px 10px' }} className="stats-cell">{res.casualties}</td>
                  <td style={{ padding: '15px 10px', fontSize: '1.1rem' }} className="points-cell">{res.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>
    </div>
  );
}
