/**
 * Fiche d'une ligue `/ligue/[id]` (refonte, carte 094, ADR 0006).
 * - En tête, une carte qui domine : blason, nom, acronyme, zone et lieu, nombre de membres et de tournois, puis les
 *   actions (« Modifier » et le menu « ⋯ » de `LigueActions`).
 * - Ensuite : la présentation (« À propos de la ligue », texte BBCode), les cinq prochains tournois avec « Voir tout »
 *   (`/tournois?ligueId=`), le chef de ligue et les commissaires, et la liste des membres (membres connectés seulement,
 *   comme avant la refonte).
 * Sur ordinateur, le chef et les commissaires occupent une colonne à droite ; sur téléphone, tout est sur une colonne.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Globe, MapPin, Trophy, Users } from "lucide-react";
import { Avatar, Badge, Button, Card, cn } from "@bbfrance/ui";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";
import { parseBBCode } from "@/lib/bbcode";
import { DateBlock } from "@/app/tournois/component/TournamentListItems";
import { upcomingTournamentWhere } from "@/lib/tournamentDates";
import LigueBlason from "@/app/ligues/component/LigueBlason";
import LigueActions from "./component/LigueActions";
// Styles des blocs BBCode (accordéons, spoilers, galeries) de la présentation, comme dans les sujets du forum ; avant
// la carte 094, la page en gardait une copie dans son propre fichier id.css

/** Titre d'une carte de la fiche. */
const sectionTitle = "m-0 flex items-center gap-2 border-0 p-0 text-lg font-bold text-bb-text normal-case not-italic";

export default async function LigueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getActiveSession();

  const ligue = await prisma.ligue.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      commissaires: { select: { id: true, name: true, image: true } },
      _count: {
        select: { tournaments: true, members: true }
      },
      tournaments: {
        // Prochains tournois : à venir ou en cours jusqu'à la fin de leur dernier jour, heure de Paris (carte 187).
        // Avant, un tournoi passé dont personne n'avait saisi les résultats restait affiché « à venir » pour toujours.
        where: { isFinished: false, isCancelled: false, AND: [upcomingTournamentWhere()] },
        orderBy: { date: "asc" },
        take: 5,
        include: { topic: { select: { id: true } } }
      },
      members: {
        select: { id: true, name: true, image: true },
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!ligue) notFound();

  const zone = ligue.geographicalZone
    ? await prisma.referenceData.findFirst({ where: { group: "COACH_REGION", key: ligue.geographicalZone }, select: { label: true } })
    : null;

  const isCreator = session?.user?.id === ligue.creatorId;
  const isCommissaire = ligue.commissaires.some(c => c.id === session?.user?.id);
  const isMod = isModerator(session?.user?.role);
  const canEdit = isCreator || isCommissaire || isMod;
  const canManage = isCreator || isMod;

  const members = ligue._count?.members || 0;
  const tournaments = ligue._count?.tournaments || 0;
  const place = [zone?.label ?? ligue.geographicalZone, ligue.ville || ligue.region].filter(Boolean).join(" · ") || "France";

  const leaders = [
    { ...ligue.creator, role: "Chef de ligue", variant: "accent" as const },
    ...ligue.commissaires.map((user) => ({ ...user, role: "Commissaire", variant: "outline" as const })),
  ];

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      {/* Lien de retour vers la liste, à toutes les tailles d'écran (44 pixels de haut) */}
      <div className="pt-3 lg:pt-4">
        <Link href="/ligues" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-bb-accent-text no-underline hover:underline">
          <ChevronLeft size={16} aria-hidden="true" />
          Toutes les ligues
        </Link>
      </div>

      <Card className="mt-3 flex flex-col gap-4 p-4 lg:mt-1 lg:p-6">
        <div className="flex items-start gap-4">
          <LigueBlason image={ligue.image} alt={`Blason ${ligue.name}`} size={80} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h1 className="m-0 border-0 p-0 text-2xl leading-tight font-bold tracking-normal break-words text-bb-text normal-case not-italic lg:text-3xl">
              {ligue.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{ligue.acronym}</Badge>
            </div>
            <p className="m-0 flex items-start gap-1.5 text-[0.95rem] text-bb-text-muted">
              <MapPin size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span className="min-w-0 break-words">{place}</span>
            </p>
            {ligue.address && (
              <p className="m-0 flex items-start gap-1.5 text-[0.95rem] text-bb-text-muted">
                <Globe size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                <span className="min-w-0 break-words">{ligue.address}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bb-border pt-4">
          <p className="m-0 flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.95rem] text-bb-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Users size={18} aria-hidden="true" />
              <strong className="text-bb-text">{members}</strong> membre{members > 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Trophy size={18} aria-hidden="true" />
              <strong className="text-bb-text">{tournaments}</strong> tournoi{tournaments > 1 ? "s" : ""}
            </span>
          </p>
          <LigueActions ligueId={ligue.id} ligueName={ligue.name} canEdit={canEdit} canManage={canManage} canReport={!!session} />
        </div>
      </Card>

      <div className="mt-4 flex flex-col gap-4 lg:grid lg:grid-flow-row-dense lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">
        <Card className="flex flex-col gap-3 p-4 lg:col-start-1 lg:p-6">
          <h2 className={sectionTitle}>À propos de la ligue</h2>
          {ligue.description ? (
            // Présentation saisie par la ligue (BBCode converti en HTML)
            <div
              className="text-[1.05rem] leading-relaxed break-words text-bb-text [&_a]:text-bb-accent-text [&_a]:underline [&_b]:font-bold [&_img]:h-auto [&_img]:max-w-full [&_strong]:font-bold"
              dangerouslySetInnerHTML={{ __html: parseBBCode(ligue.description) }}
            />
          ) : (
            <p className="m-0 text-bb-text-muted">Cette ligue n&apos;a pas encore de présentation.</p>
          )}
        </Card>

        <Card className="flex flex-col gap-3 p-4 lg:col-start-1 lg:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className={sectionTitle}>Prochains tournois</h2>
            <Button asChild variant="quiet" size="tap" className="px-2 text-sm">
              <Link href={`/tournois?ligueId=${ligue.id}`} className="no-underline">Voir tout</Link>
            </Button>
          </div>
          {ligue.tournaments.length > 0 ? (
            <ul className="m-0 flex list-none flex-col p-0">
              {ligue.tournaments.map((tournament) => (
                <li key={tournament.id} className="border-b border-bb-border last:border-b-0">
                  <Link
                    href={tournament.topic?.id ? `/forum/topic/${tournament.topic.id}` : "/tournois"}
                    className="flex min-h-14 items-center gap-3 py-2 text-bb-text no-underline hover:text-bb-accent-text focus-visible:outline-2 focus-visible:outline-bb-focus"
                  >
                    <DateBlock date={tournament.date} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold break-words">{tournament.name}</span>
                      {(tournament.ville || tournament.location) && (
                        <span className="block text-sm text-bb-text-muted">{tournament.ville || tournament.location}</span>
                      )}
                    </span>
                    {tournament.platform && <Badge variant="neutral">{tournament.platform}</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-bb-text-muted">Aucun tournoi prévu pour le moment.</p>
          )}
        </Card>

        <Card className="flex flex-col gap-3 p-4 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:p-6">
          <h2 className={sectionTitle}>Chef et commissaires</h2>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {leaders.map((leader) => (
              <li key={`${leader.role}-${leader.id}`} className="flex items-center gap-3">
                <Avatar name={leader.name} src={leader.image} size={40} />
                <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                  <span className="font-semibold break-words text-bb-text">{leader.name}</span>
                  <Badge variant={leader.variant}>{leader.role}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {session && (
          <Card className="flex flex-col gap-3 p-4 lg:col-start-1 lg:p-6">
            <h2 className={sectionTitle}>Membres ({ligue.members.length})</h2>
            {ligue.members.length > 0 ? (
              <ul className={cn("m-0 grid list-none gap-1 p-0 sm:grid-cols-2 lg:grid-cols-3")}>
                {ligue.members.map((member) => (
                  <li key={member.id} className="min-w-0">
                    <Link
                      href={member.id === session.user.id ? "/profile" : `/spy/${member.id}`}
                      className="flex min-h-12 items-center gap-3 rounded-bb-md px-2 text-bb-text no-underline hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:outline-bb-focus"
                    >
                      <Avatar name={member.name} src={member.image} size={32} />
                      <span className="min-w-0 truncate font-semibold">{member.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-bb-text-muted">Aucun membre n&apos;est actuellement rattaché à cette ligue.</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
