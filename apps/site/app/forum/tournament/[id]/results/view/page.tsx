/**
 * Classement final d'un tournoi, visible par tous (refonte, carte 089, ADR 0006) : une ligne par coach, du premier au
 * dernier (rang, coach avec lien vers son profil s'il est membre du site, numéro NAF, roster, victoires, nuls et
 * défaites, sorties, points). Sans résultat publié, la page est introuvable (404), comme avant la refonte.
 * Pour un tournoi de la Coupe de France, un bandeau dit si les résultats sont validés par la modération ou en attente,
 * avec le bouton de validation pour les modérateurs et les administrateurs (carte 162).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, Card } from "@bbfrance/ui";
import { prisma } from "@/lib/prisma";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import { ResultsRanking } from "@/app/forum/component/TournamentResultWidget";
import CdfValidationPanel from "@/app/forum/component/CdfValidationPanel";
import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";

export default async function TournamentResultsViewPage({ params }: { params: Promise<{ id: string }> }) {
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

  const topicHref = `/forum/topic/${tournament.topic?.id}`;
  // Tournoi CDF : état de la validation des résultats et bouton pour la modération (carte 162)
  const session = tournament.isCDF ? await getActiveSession() : null;

  return (
    <div className="mx-auto w-full max-w-[960px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      <ForumListHeader title="Classement final" subtitle={tournament.topic?.title || tournament.name} backHref={topicHref} backTitle="Retour au sujet">
        <Button asChild variant="secondary" size="tap" className="max-lg:w-full">
          <Link href={topicHref}>
            <ArrowLeft size={16} aria-hidden="true" /> Retour au sujet
          </Link>
        </Button>
      </ForumListHeader>

      <Card className="flex flex-col gap-3 p-3 lg:p-4">
        {tournament.isCDF && (
          <CdfValidationPanel tournamentId={tournament.id} validatedAt={tournament.cdfValidatedAt} canValidate={isModerator(session?.user?.role)} />
        )}
        <ResultsRanking results={tournament.results} />
      </Card>
    </div>
  );
}
