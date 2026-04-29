import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { ArrowUpCircle } from "lucide-react";
import EvolutionManager from "./component/EvolutionManager";
import { auth } from "@/auth";

export default async function TeamEvolutionPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) notFound();

  const team = await prisma.teamRoster.findUnique({
    where: { id: params.id },
    include: {
      players: true
    }
  });

  if (!team) notFound();

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "COMMISSAIRE";
  if (team.userId !== session.user.id && !isAdmin) {
    notFound();
  }

  // Seuls les joueurs avec des SPP > 0 peuvent évoluer (pour simplifier la vue)
  const playersWithSPP = team.players.filter(p => p.spp > 0).sort((a, b) => a.number - b.number);

  return (
    <>
      <PageHeader 
        title="Séquence Post-Match" 
        subtitle={`Dépense des SPP pour ${team.name}`} 
        icon={<ArrowUpCircle size={24} />} 
        backLink={`/equipes/${team.id}`} 
      />
      <div className="page-content">
        <EvolutionManager players={playersWithSPP} teamId={team.id} />
      </div>
    </>
  );
}
