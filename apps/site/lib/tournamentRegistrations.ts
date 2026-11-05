/**
 * Places et liste d'attente d'un tournoi, côté serveur (carte 186). Fichier volontairement PAS « use server » : ces
 * fonctions ne sont appelées que par les actions du forum, après leurs propres contrôles, à l'intérieur d'une
 * transaction de la base (un ensemble d'écritures enregistrées toutes ensemble ou pas du tout).
 *
 * - `lockTournamentRegistrations` pose un verrou propre au tournoi : deux inscriptions envoyées au même moment passent
 *   l'une après l'autre, et la seconde voit la place prise par la première.
 * - `nextRegistrationStatus` choisit « pré-inscrit » ou « liste d'attente » avec le même calcul de places que
 *   l'affichage (`freePlaces` de lib/tournamentPlaces.ts). Avant cette carte, l'inscription comptait toutes les
 *   inscriptions, liste d'attente comprise, et ignorait le nombre importé de l'ancien site.
 * - `promoteFromWaitingList` fait monter les plus anciens de la liste d'attente quand des places se libèrent, et
 *   renvoie les membres à prévenir (`notifyTournamentMembers` de lib/notifications.ts).
 */
import type { Prisma } from "@/prisma/generated-client";
import { TAKEN_PLACES_COUNT, freePlaces } from "@/lib/tournamentPlaces";
import { isTournamentOver } from "@/lib/tournamentDates";

type Tx = Prisma.TransactionClient;

/** Verrou de la base propre aux inscriptions d'un tournoi, rendu à la fin de la transaction. */
export async function lockTournamentRegistrations(tx: Tx, tournamentId: string): Promise<void> {
  const lockKey = `tournament-registrations:${tournamentId}`;
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))::text AS locked`;
}

/** Lit ce qu'il faut pour compter les places du tournoi. */
function readPlaces(tx: Tx, tournamentId: string) {
  return tx.tournament.findUnique({
    where: { id: tournamentId },
    select: {
      maxParticipants: true,
      currentParticipants: true,
      isTeam: true,
      isCancelled: true,
      isFinished: true,
      date: true,
      endDate: true,
      _count: TAKEN_PLACES_COUNT,
    },
  });
}

/** Statut d'une nouvelle inscription (coach ou équipe) : pré-inscrit s'il reste une place, sinon liste d'attente. */
export async function nextRegistrationStatus(tx: Tx, tournamentId: string): Promise<"PRE_REGISTERED" | "WAITING_LIST"> {
  const tournament = await readPlaces(tx, tournamentId);
  if (!tournament) return "WAITING_LIST";
  return freePlaces(tournament) > 0 ? "PRE_REGISTERED" : "WAITING_LIST";
}

/**
 * Fait monter de la liste d'attente vers les pré-inscrits autant de coachs (ou d'équipes) qu'il y a de places libres,
 * du plus ancien au plus récent. Rien ne bouge pour un tournoi annulé, terminé ou passé. Renvoie les membres à
 * prévenir : le coach, ou le capitaine et les membres de l'équipe.
 */
export async function promoteFromWaitingList(tx: Tx, tournamentId: string): Promise<string[]> {
  const tournament = await readPlaces(tx, tournamentId);
  if (!tournament || tournament.isCancelled || tournament.isFinished || isTournamentOver(tournament)) return [];
  const places = freePlaces(tournament);
  if (places <= 0) return [];
  const take = Number.isFinite(places) ? places : undefined;

  if (tournament.isTeam) {
    const teams = await tx.tournamentTeam.findMany({
      where: { tournamentId, status: "WAITING_LIST" },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take,
      select: { id: true, captainId: true, members: { select: { userId: true } } },
    });
    if (teams.length === 0) return [];
    await tx.tournamentTeam.updateMany({ where: { id: { in: teams.map((team) => team.id) } }, data: { status: "PRE_REGISTERED" } });
    return [...new Set(teams.flatMap((team) => [team.captainId, ...team.members.map((member) => member.userId)]))];
  }

  const registrations = await tx.tournamentRegistration.findMany({
    where: { tournamentId, status: "WAITING_LIST" },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take,
    select: { id: true, userId: true },
  });
  if (registrations.length === 0) return [];
  await tx.tournamentRegistration.updateMany({
    where: { id: { in: registrations.map((registration) => registration.id) } },
    data: { status: "PRE_REGISTERED" },
  });
  return registrations.map((registration) => registration.userId);
}
