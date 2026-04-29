import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Users, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import "./page.css";

export default async function TeamDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const team = await prisma.teamRoster.findUnique({
    where: { id: params.id },
    include: {
      players: true,
      user: true
    }
  });

  if (!team) {
    notFound();
  }

  // Trier les joueurs par numéro
  const sortedPlayers = team.players.sort((a, b) => a.number - b.number);
  
  const isOwnerOrAdmin = session?.user?.id === team.userId || session?.user?.role === "ADMIN" || session?.user?.role === "COMMISSAIRE";

  return (
    <>
      <PageHeader 
        title={team.name} 
        subtitle={`Coach: ${team.user.pseudo || team.user.name} | TV: ${team.currentTV.toLocaleString()}`} 
        icon={<Users size={24} />} 
        backLink="/equipes" 
      />
      <div className="team-details-container page-content">
        
        {isOwnerOrAdmin && (
          <div className="flex justify-end mb-4">
            <Link href={`/equipes/${team.id}/evolution`}>
              <button className="classic-button cta-button">
                <ArrowUpCircle size={18} /> Dépenser SPP (Évolution)
              </button>
            </Link>
          </div>
        )}

        <div className="team-info-grid">
          <PremiumCard>
            <h3>Trésorerie</h3>
            <p className="text-xl font-bold">{team.treasury.toLocaleString()} po</p>
          </PremiumCard>
          <PremiumCard>
            <h3>Staff & Équipement</h3>
            <ul>
              <li>Relances: {team.rerolls}</li>
              <li>Apothicaire: {team.apothecary ? "Oui" : "Non"}</li>
              <li>Assistants: {team.assistants}</li>
              <li>Pom-pom girls: {team.cheerleaders}</li>
              <li>Fans Dédiés: {team.dedicatedFans}</li>
            </ul>
          </PremiumCard>
        </div>

        <PremiumCard className="mt-6">
          <h3>Effectif</h3>
          <div className="table-responsive">
            <table className="roster-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom</th>
                  <th>Position</th>
                  <th>MA</th><th>ST</th><th>AG</th><th>PA</th><th>AV</th>
                  <th>Compétences</th>
                  <th>XP</th>
                  <th>Valeur</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((player) => {
                  const skills = JSON.parse(player.skills || "[]");
                  const injuries = JSON.parse(player.injuries || "[]");
                  return (
                    <tr key={player.id} className={player.isDead ? "text-red-500 opacity-50 line-through" : player.isMNG ? "opacity-70" : ""}>
                      <td>{player.number}</td>
                      <td>{player.name} {player.isMNG && "(MNG)"} {player.isJourneyman && "(Journalier)"}</td>
                      <td>{player.position}</td>
                      <td>{player.ma}</td>
                      <td>{player.st}</td>
                      <td>{player.ag}</td>
                      <td>{player.pa || "-"}</td>
                      <td>{player.av}</td>
                      <td>
                        <div className="skills-list">
                          {skills.map((s: any, i: number) => <span key={i} className="skill-badge">{s}</span>)}
                          {injuries.map((s: any, i: number) => <span key={`inj-${i}`} className="skill-badge injury">{s}</span>)}
                        </div>
                      </td>
                      <td>{player.spp}</td>
                      <td>{player.currentValue.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PremiumCard>
      </div>
    </>
  );
}
