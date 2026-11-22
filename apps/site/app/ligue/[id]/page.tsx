/**
 * Fiche d'une ligue `/ligue/[id]` (refonte, carte 094, ADR 0006).
 * - En tête, une carte qui domine : blason, nom, acronyme, zone et lieu, nombre de membres et de tournois, puis les
 *   actions (« Modifier » et le menu « ⋯ » de `LigueActions`).
 * - Ensuite : la présentation (« À propos de la ligue », texte BBCode), les cinq prochains tournois avec « Voir tout »
 *   (`/tournois?ligueId=`), le chef de ligue et les commissaires, et la liste des membres (membres connectés seulement,
 *   comme avant la refonte).
 * Sur ordinateur, le chef et les commissaires occupent une colonne à droite ; sur téléphone, tout est sur une colonne.
 * Revue 221 : la section des membres dit comment rejoindre la ligue (on l'ajoute dans son profil), le chef ne peut pas
 * signaler sa propre ligue, et la modération voit si le chef ou un commissaire est banni.
 */
import { getReferenceLabel } from "@/lib/referenceData";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Badge, Card, cn } from "@bbfrance/ui";
import SiteLayout from "@/common/components/SiteLayout/SiteLayout";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/authGuard";
import { isModerator } from "@/lib/roles";
import { parseBBCode } from "@/lib/bbcode";
import { DateBlock } from "@/app/tournois/component/TournamentListItems";
import { upcomingTournamentWhere } from "@/lib/tournamentDates";
import { platformLabel } from "@/lib/tournamentForm";
import LigueBlason from "@/app/ligues/component/LigueBlason";
import LigueActions from "./component/LigueActions";
// Styles des blocs BBCode (accordéons, spoilers, galeries) de la présentation, comme dans les sujets du forum ; avant
// la carte 094, la page en gardait une copie dans son propre fichier id.css

/** Titre d'une carte de la fiche. */
const sectionTitle = "font-bb-heading text-[0.95rem] text-bb-text";

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
      creator: { select: { id: true, name: true, image: true, isBanned: true } },
      commissaires: { select: { id: true, name: true, image: true, isBanned: true } },
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
    ? await getReferenceLabel("COACH_REGION", ligue.geographicalZone)
    : null;

  const isCreator = session?.user?.id === ligue.creatorId;
  const isCommissaire = ligue.commissaires.some(c => c.id === session?.user?.id);
  const isMod = isModerator(session?.user?.role);
  const canEdit = isCreator || isCommissaire || isMod;
  const canManage = isCreator || isMod;

  const members = ligue._count?.members || 0;
  const tournaments = ligue._count?.tournaments || 0;
  const place = [zone ?? ligue.geographicalZone, ligue.ville || ligue.region].filter(Boolean).join(" · ") || "France";

  // Chef et commissaires : une ligne par personne, ses rôles réunis (le chef peut aussi être commissaire)
  const leaders: { id: string; name: string | null; image: string | null; isBanned: boolean; roles: string[] }[] = [];
  for (const [user, role] of [[ligue.creator, "Chef de ligue"], ...ligue.commissaires.map((user) => [user, "Commissaire"] as const)] as const) {
    const existing = leaders.find((leader) => leader.id === user.id);
    if (existing) existing.roles.push(role);
    else leaders.push({ id: user.id, name: user.name, image: user.image ?? null, isBanned: user.isBanned, roles: [role] });
  }
  const isMember = !!session && ligue.members.some((member) => member.id === session.user.id);

  return (
    <SiteLayout
      contextFrom="lg"
      contextLabel="Chef et commissaires"
      header={
        <header className="flex flex-col gap-3 pt-3 pb-5 lg:pt-4">
          {/* Fil d'Ariane (une ligne) : retour à la liste, à toutes les tailles */}
          <nav aria-label="Fil d'Ariane" className="text-sm">
            <Link href="/ligues" className="inline-flex min-h-11 items-center font-semibold text-bb-accent-text no-underline hover:underline lg:min-h-0">
              Ligues
            </Link>
            <span aria-hidden="true" className="px-1.5 text-bb-text-muted">›</span>
            <span className="text-bb-text-muted">{ligue.name}</span>
          </nav>
          <div className="flex flex-wrap items-end gap-4">
            <LigueBlason image={ligue.image} alt={`Blason ${ligue.name}`} size={72} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h1 className="font-bb-display text-[1.75rem] break-words text-bb-text lg:text-[2.25rem]">{ligue.name}</h1>
              <p className="flex flex-wrap items-center gap-x-2 text-[0.95rem] text-bb-text-muted tabular-nums">
                <span className="font-semibold text-bb-text">{ligue.acronym}</span>
                <span aria-hidden="true">·</span>
                <span>{place}</span>
                <span aria-hidden="true">·</span>
                <span>{members} membre{members > 1 ? "s" : ""}</span>
                <span aria-hidden="true">·</span>
                <span>{tournaments} tournoi{tournaments > 1 ? "s" : ""}</span>
              </p>
              {ligue.address && <p className="text-sm break-words text-bb-text-muted">{ligue.address}</p>}
            </div>
            {/* Le chef ne signale pas sa propre ligue */}
            <LigueActions ligueId={ligue.id} ligueName={ligue.name} canEdit={canEdit} canManage={canManage} canReport={!!session && !isCreator} />
          </div>
        </header>
      }
      context={
        <section aria-labelledby="ligue-leaders-title" className="flex flex-col">
          <h2 id="ligue-leaders-title" className={sectionTitle}>Chef et commissaires</h2>
          <ul className="mt-2 flex flex-col border-t border-bb-border">
            {leaders.map((leader) => (
              <li key={leader.id} className="flex items-center gap-3 border-b border-bb-border py-2.5">
                <Avatar name={leader.name} src={leader.image} size={36} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex flex-wrap items-center gap-2 font-semibold break-words text-bb-text">
                    {leader.name}
                    {/* Seule la modération voit le bannissement (même règle que la gestion des inscriptions) */}
                    {isMod && leader.isBanned && <Badge variant="danger">Banni</Badge>}
                  </span>
                  <span className="text-sm text-bb-text-muted">{leader.roles.join(" et ")}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      }
    >
      <section aria-labelledby="ligue-about-title" className="flex max-w-[75ch] flex-col gap-2">
        <h2 id="ligue-about-title" className={sectionTitle}>À propos</h2>
        {ligue.description ? (
          // Présentation saisie par la ligue (BBCode converti en HTML)
          <div
            className="text-bb-lead break-words text-bb-text [&_a]:text-bb-accent-text [&_a]:underline [&_b]:font-bold [&_img]:h-auto [&_img]:max-w-full [&_strong]:font-bold"
            dangerouslySetInnerHTML={{ __html: parseBBCode(ligue.description) }}
          />
        ) : (
          <p className="text-bb-text-muted">Pas encore de présentation.</p>
        )}
      </section>

      <section aria-labelledby="ligue-tournaments-title" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 id="ligue-tournaments-title" className={sectionTitle}>Prochains tournois</h2>
          <Link href={`/tournois?ligueId=${ligue.id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-bb-text-muted no-underline hover:text-bb-accent-text">
            Tous ses tournois
          </Link>
        </div>
        {ligue.tournaments.length > 0 ? (
          <Card className="overflow-hidden">
            <ul className="flex flex-col">
              {ligue.tournaments.map((tournament) => (
                <li key={tournament.id} className="border-b border-bb-border last:border-b-0">
                  <Link
                    href={tournament.topic?.id ? `/forum/topic/${tournament.topic.id}` : "/tournois"}
                    className="flex min-h-14 items-center gap-3 px-4 py-2 text-bb-text no-underline hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus"
                  >
                    <DateBlock date={tournament.date} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold break-words">{tournament.name}</span>
                      {(tournament.ville || tournament.location) && (
                        <span className="block text-sm text-bb-text-muted">{tournament.ville || tournament.location}</span>
                      )}
                    </span>
                    {tournament.platform && <Badge variant="neutral">{platformLabel(tournament.platform)}</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <p className="text-bb-text-muted">Pas de tournoi annoncé pour le moment.</p>
        )}
      </section>

      {session && (
        <section aria-labelledby="ligue-members-title" className="flex flex-col gap-2">
          <h2 id="ligue-members-title" className={sectionTitle}>Membres ({ligue.members.length})</h2>
          {/* On rejoint une ligue depuis son profil (« Mes ligues ») : la fiche le dit (revue 221) */}
          <p className="m-0 text-sm text-bb-text-muted">
            {isMember ? (
              <>Tu es membre de cette ligue. Tu peux la retirer dans </>
            ) : (
              <>Pour rejoindre cette ligue, ajoute-la dans </>
            )}
            <Link href="/profile?tab=edit" className="font-semibold text-bb-accent-text hover:underline max-lg:inline-flex max-lg:min-h-11 max-lg:items-center">
              ton profil
            </Link>
            .
          </p>
          {ligue.members.length > 0 ? (
            <ul className={cn("grid gap-1 sm:grid-cols-2 lg:grid-cols-3 min-[1440px]:grid-cols-4")}>
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
            <p className="text-bb-text-muted">Pas encore de membre rattaché à cette ligue.</p>
          )}
        </section>
      )}
      {!session && (
        <p className="m-0 text-sm text-bb-text-muted">
          <Link
            href={`/auth/login?callbackUrl=${encodeURIComponent(`/ligue/${ligue.id}`)}`}
            className="font-semibold text-bb-accent-text hover:underline max-lg:inline-flex max-lg:min-h-11 max-lg:items-center"
          >
            Connecte-toi
          </Link>{" "}
          pour voir les membres et rejoindre cette ligue depuis ton profil.
        </p>
      )}
    </SiteLayout>
  );
}
