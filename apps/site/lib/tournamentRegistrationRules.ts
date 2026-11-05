/**
 * Règles des inscriptions et des équipes d'un tournoi (carte 186), sans accès à la base : elles sont vérifiées par
 * `tests/unit/tournamentRegistrationRules.test.mjs`. Ce fichier n'importe rien, pour pouvoir être testé directement
 * par Node. Les actions du forum (`joinTournament`, `toggleMercenary`, `createTeam`, `updateTeam`) les appliquent après
 * avoir lu le tournoi dans la base.
 *
 * Avant cette carte, le serveur ne contrôlait rien : un coach pouvait être dans deux équipes du même tournoi, une
 * équipe pouvait dépasser la taille prévue, un capitaine pouvait créer plusieurs équipes ou ajouter n'importe quel
 * membre sans son accord, et une inscription à un tournoi passé ou annulé était acceptée.
 */

/** Longueur maximale du nom d'une équipe. */
export const TEAM_NAME_MAX_LENGTH = 80;

/** État du tournoi utile pour savoir si les inscriptions sont ouvertes. */
export interface RegistrationState {
  isCancelled: boolean;
  isFinished: boolean;
  registrationsLocked: boolean;
  /** Vrai quand le dernier jour du tournoi est passé (`isTournamentOver` de lib/tournamentDates.ts). */
  isOver: boolean;
}

/** Raison du refus d'une nouvelle inscription (coach, équipe ou mercenaire), ou `null` si elle est acceptée. */
export function registrationRefusal(state: RegistrationState): string | null {
  if (state.isCancelled) return "Ce tournoi est annulé : il n'accepte plus d'inscription.";
  if (state.isFinished) return "Ce tournoi est terminé : il n'accepte plus d'inscription.";
  if (state.isOver) return "Ce tournoi est passé : il n'accepte plus d'inscription.";
  if (state.registrationsLocked) return "Les inscriptions sont fermées pour ce tournoi.";
  return null;
}

/** Membres demandés pour une équipe, sans doublon et sans le capitaine (il fait partie de l'équipe d'office). */
export function cleanTeamMemberIds(captainId: string, memberIds: unknown): string[] {
  if (!Array.isArray(memberIds)) return [];
  const ids = memberIds.filter((id): id is string => typeof id === "string" && id.length > 0 && id !== captainId);
  return [...new Set(ids)];
}

/** Ce qu'il faut savoir pour contrôler la composition d'une équipe. */
export interface TeamComposition {
  /** Le tournoi se joue par équipes. */
  isTeamTournament: boolean;
  /** Nombre de coachs par équipe, capitaine compris. */
  coachsPerTeam: number;
  /** Nom de l'équipe demandé. */
  name: string;
  /** Membres demandés, sans le capitaine (voir `cleanTeamMemberIds`). */
  memberIds: string[];
  /** Membres déjà dans cette équipe (modification d'une équipe) : ils peuvent rester sans être mercenaires. */
  currentMemberIds: string[];
  /** Coachs inscrits comme mercenaires dans ce tournoi : les seuls qu'un capitaine peut ajouter. */
  mercenaryIds: string[];
  /** Capitaine de l'équipe. */
  captainId: string;
  /** Capitaines et membres des autres équipes du même tournoi. */
  otherTeamCoachIds: string[];
}

/** Raison du refus de la composition d'une équipe, ou `null` si elle est acceptée. */
export function teamCompositionError(team: TeamComposition): string | null {
  if (!team.isTeamTournament) return "Ce tournoi se joue en individuel : il n'accepte pas d'équipe.";
  const name = team.name.trim();
  if (!name) return "Le nom de l'équipe est obligatoire.";
  if (name.length > TEAM_NAME_MAX_LENGTH) return `Le nom de l'équipe ne doit pas dépasser ${TEAM_NAME_MAX_LENGTH} caractères.`;

  // Taille : le capitaine compte pour un coach. Une équipe peut s'inscrire incomplète et se compléter ensuite.
  const size = team.memberIds.length + 1;
  if (size > team.coachsPerTeam) {
    return `Une équipe compte au plus ${team.coachsPerTeam} coachs, capitaine compris (${size} demandés).`;
  }

  const others = new Set(team.otherTeamCoachIds);
  if (others.has(team.captainId)) return "Vous faites déjà partie d'une autre équipe de ce tournoi.";
  if (team.memberIds.some((id) => others.has(id))) return "Un des coachs choisis fait déjà partie d'une autre équipe de ce tournoi.";

  // Un capitaine n'ajoute que des volontaires : les coachs inscrits comme mercenaires (ou déjà dans son équipe)
  const allowed = new Set([...team.mercenaryIds, ...team.currentMemberIds]);
  if (team.memberIds.some((id) => !allowed.has(id))) {
    return "Vous ne pouvez ajouter que des coachs inscrits comme mercenaires dans ce tournoi.";
  }
  return null;
}

/** Inscriptions supprimées par un changement de format (individuel ou par équipes). */
export interface FormatChangeLosses {
  registrations: number;
  teams: number;
  mercenaries: number;
}

/** Nombre total d'inscriptions (coachs, équipes et mercenaires) qu'un changement de format supprimerait. */
export function formatChangeLossCount(losses: FormatChangeLosses): number {
  return losses.registrations + losses.teams + losses.mercenaries;
}

/**
 * Texte qui annonce ce qu'un changement de format supprimerait, par exemple « 3 inscriptions individuelles,
 * 2 équipes et 1 mercenaire ». Utilisé par la confirmation du formulaire et par le refus du serveur, pour qu'ils
 * disent la même chose.
 */
export function formatChangeLossText(losses: FormatChangeLosses): string {
  const plural = (count: number, singular: string, pluralForm: string) => `${count} ${count > 1 ? pluralForm : singular}`;
  const parts = [
    losses.registrations > 0 && plural(losses.registrations, "inscription individuelle", "inscriptions individuelles"),
    losses.teams > 0 && plural(losses.teams, "équipe", "équipes"),
    losses.mercenaries > 0 && plural(losses.mercenaries, "mercenaire", "mercenaires"),
  ].filter((part): part is string => Boolean(part));
  if (parts.length === 0) return "aucune inscription";
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} et ${parts[parts.length - 1]}`;
}
