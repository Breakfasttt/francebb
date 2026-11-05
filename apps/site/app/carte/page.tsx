/**
 * Page `/carte` (refonte, carte 094, ADR 0006) : les 100 prochains tournois et toutes les ligues placés sur une carte.
 * Sur téléphone, le titre n'est lu que par les lecteurs d'écran et la carte occupe l'écran ; sur ordinateur, le titre
 * est affiché au-dessus de la carte. Les données lues sont les mêmes qu'avant la refonte.
 */
import { prisma } from "@/lib/prisma";
import { TOURNAMENT_TOPIC_NOT_DELETED } from "@/lib/forumDeletion";
import { upcomingTournamentWhere } from "@/lib/tournamentDates";
import ForumListHeader from "@/app/forum/component/ForumListHeader";
import CarteClient from "./component/CarteClient";

export const dynamic = "force-dynamic";

export default async function CartePage() {
  const [nextTournaments, ligues] = await Promise.all([
    prisma.tournament.findMany({
      where: {
        // À venir ou en cours jusqu'à la fin de leur dernier jour, heure de Paris (carte 187, lib/tournamentDates.ts)
        AND: [upcomingTournamentWhere()],
        isFinished: false,
        isCancelled: false,
        // Pas de tournoi dont le sujet du forum est supprimé (carte 165)
        ...TOURNAMENT_TOPIC_NOT_DELETED
      },
      // Les 100 plus proches dans le temps (carte 187) : avant, 100 tournois pris sans ordre
      orderBy: [{ date: "asc" }, { id: "asc" }],
      take: 100,
      select: {
        id: true,
        name: true,
        location: true,
        lat: true,
        lng: true,
        date: true,
        topic: { select: { id: true } }
      }
    }),
    prisma.ligue.findMany({
      select: { id: true, name: true, ville: true, lat: true, lng: true }
    })
  ]);

  return (
    // En bas, sur téléphone : la marge prévue pour la barre du bas est déjà comprise dans la hauteur de la carte
    <div className="mx-auto w-full max-w-[1400px] px-3 font-bb-sans text-base text-bb-text max-lg:-mb-6 lg:px-6 lg:pb-12">
      <div className="max-lg:sr-only">
        <ForumListHeader
          title="La carte du Blood Bowl"
          subtitle="Les tournois à venir et les ligues de France"
          backHref="/"
          backTitle="Retour à l'accueil"
        />
      </div>

      <CarteClient initialTournaments={nextTournaments} initialLigues={ligues} />
    </div>
  );
}
