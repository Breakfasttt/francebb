/**
 * Classement final d'un tournoi, visible par tous (refonte, carte 089, ADR 0006) : une ligne par coach, du premier au
 * dernier (rang, coach avec lien vers son profil s'il est membre du site, numéro NAF, roster, victoires, nuls et
 * défaites, sorties, points). Sans résultat publié, la page est introuvable (404), comme avant la refonte.
 * Pour un tournoi du Championnat de France, un bandeau dit si les résultats sont validés par la modération ou en attente,
 * avec le bouton de validation pour les modérateurs et les administrateurs (carte 162).
 * Gabarit commun (revue 221) : `SiteLayout` et `PageHeader`, retour au sujet dans le panneau gauche ; la page est
 * atteinte par le lien « Ouvrir les résultats dans une page à part » du bloc des résultats du sujet.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card } from "@bbfrance/ui";
import { prisma } from "@/lib/prisma";
import SiteLayout from "@/common/components/SiteLayout/SiteLayout";
import PageHeader from "@/common/components/PageHeader/PageHeader";
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
    <SiteLayout
      header={<PageHeader title="Classement final" subtitle={tournament.topic?.title || tournament.name} backHref={topicHref} backTitle="Retour au sujet" />}
      aside={
        <Button asChild variant="secondary" size="tap" className="w-full">
          <Link href={topicHref}>Retour au sujet du tournoi</Link>
        </Button>
      }
      asideLabel="Tournoi"
      asideOnMobile="bottom"
    >
      <Card className="flex flex-col gap-3 p-3 lg:p-4">
        {tournament.isCDF && (
          <CdfValidationPanel tournamentId={tournament.id} validatedAt={tournament.cdfValidatedAt} canValidate={isModerator(session?.user?.role)} />
        )}
        <ResultsRanking results={tournament.results} />
      </Card>
    </SiteLayout>
  );
}
