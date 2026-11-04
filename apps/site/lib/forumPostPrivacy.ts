/**
 * Ce que la page d'un sujet du forum a le droit d'envoyer au navigateur (carte 164).
 *
 * Tout ce qu'un composant client reçoit se retrouve dans le code de la page, lisible par n'importe quel visiteur.
 * Deux règles en découlent :
 *
 * 1. Le texte d'un message supprimé par son auteur, ou masqué par la modération, n'est jamais envoyé, sauf pour un
 *    message masqué à son auteur et aux modérateurs (le modérateur en a besoin pour décider de le rétablir).
 *    `hidePostContent` remplace alors le texte par une chaîne vide. Un tel message ne peut pas non plus être cité
 *    (`canQuotePost`) : la citation recopierait le texte caché dans un nouveau message visible de tous.
 * 2. On ne charge d'un membre que ce qui est affiché (`select` de Prisma, la bibliothèque qui lit la base) : jamais la
 *    fiche complète, qui contient le motif de bannissement, les préférences de notification, l'identifiant sur
 *    l'ancien forum…
 *
 * Ce fichier n'a pas la mention « use server » : ses constantes et fonctions s'utilisent seulement côté serveur, par
 * les pages et par les actions du forum. Il n'importe aucun autre fichier du site, pour que les tests unitaires
 * (tests/unit/forumPostPrivacy.test.mjs) puissent le lire directement.
 */
import type { PaymentStatus, Prisma } from "@/prisma/generated-client";

/**
 * Champs d'un membre affiché dans une liste (inscrits et équipes d'un tournoi, classement, rappel des derniers
 * messages) : identifiant (lien vers le profil), pseudo et avatar.
 */
export const PUBLIC_MEMBER_SELECT = {
  id: true,
  name: true,
  image: true,
} as const satisfies Prisma.UserSelect;

/**
 * Champs de l'auteur d'un message, lus par PostItem (en-tête, signature, message d'un membre banni) et par sa fiche
 * PostAuthorSheet (numéro NAF, équipe, région, ligues). `isBanned` sert à masquer les messages d'un membre banni et à
 * afficher le badge « Banni » ; le motif du bannissement, lui, n'est pas envoyé.
 */
export const POST_AUTHOR_SELECT = {
  ...PUBLIC_MEMBER_SELECT,
  avatarFrame: true,
  role: true,
  isBanned: true,
  signature: true,
  nafNumber: true,
  equipe: true,
  region: true,
  ligueCustom: true,
  ligues: { select: { id: true, name: true, acronym: true } },
  _count: { select: { posts: true } },
} as const satisfies Prisma.UserSelect;

/**
 * Inscriptions d'un tournoi envoyées au module d'inscription (carte 174). Ce module s'exécute dans le navigateur : tout
 * ce qu'il reçoit est lisible dans le code de la page. On n'y charge donc que ce qui est affiché à tous : le membre,
 * son statut (pré-inscrit, validé, liste d'attente), qui range l'inscription dans la bonne liste. L'état de paiement
 * (`paymentStatus`) ne regarde que l'organisateur, ses commissaires et la modération : la page l'ajoute à part, pour
 * eux seuls, avec `withPaymentStatus`.
 */
export const TOURNAMENT_REGISTRATION_PUBLIC_SELECT = {
  id: true,
  userId: true,
  status: true,
  user: { select: PUBLIC_MEMBER_SELECT },
} as const satisfies Prisma.TournamentRegistrationSelect;

/** Équipes d'un tournoi par équipes : même règle que les inscriptions, sans l'état de paiement. */
export const TOURNAMENT_TEAM_PUBLIC_SELECT = {
  id: true,
  name: true,
  captainId: true,
  status: true,
  captain: { select: PUBLIC_MEMBER_SELECT },
  members: { select: { id: true, userId: true, user: { select: PUBLIC_MEMBER_SELECT } } },
} as const satisfies Prisma.TournamentTeamSelect;

/** Mercenaires d'un tournoi par équipes (coachs sans équipe qui se proposent) : le membre seulement. */
export const TOURNAMENT_MERCENARY_PUBLIC_SELECT = {
  id: true,
  userId: true,
  user: { select: PUBLIC_MEMBER_SELECT },
} as const satisfies Prisma.TournamentMercenarySelect;

/** État de paiement facultatif : présent seulement quand le lecteur gère le tournoi. */
type WithPayment = { paymentStatus?: PaymentStatus };

export type PublicTournamentRegistration = Prisma.TournamentRegistrationGetPayload<{
  select: typeof TOURNAMENT_REGISTRATION_PUBLIC_SELECT;
}> & WithPayment;
export type PublicTournamentTeam = Prisma.TournamentTeamGetPayload<{ select: typeof TOURNAMENT_TEAM_PUBLIC_SELECT }> & WithPayment;
export type PublicTournamentMercenary = Prisma.TournamentMercenaryGetPayload<{ select: typeof TOURNAMENT_MERCENARY_PUBLIC_SELECT }>;

/**
 * Ajoute à chaque inscription (ou équipe) son état de paiement, lu à part dans la base. La page ne l'appelle que pour
 * l'organisateur, un commissaire ou un modérateur ; pour les autres lecteurs, le champ reste absent.
 */
export function withPaymentStatus<T extends { id: string }>(
  items: T[],
  payments: { id: string; paymentStatus: PaymentStatus }[]
): (T & WithPayment)[] {
  const byId = new Map(payments.map((p) => [p.id, p.paymentStatus]));
  return items.map((item) => ({ ...item, paymentStatus: byId.get(item.id) }));
}

/** Le modérateur d'un message masqué : seul son pseudo est affiché (« modéré par … »). */
export const POST_MODERATOR_SELECT = {
  id: true,
  name: true,
} as const satisfies Prisma.UserSelect;

/**
 * Le lecteur de la page : identifiant du membre connecté (absent pour un visiteur) et `isModerator`, calculé par
 * l'appelant avec `isModerator(role)` de lib/roles.ts.
 */
export type PostViewer = { id?: string | null; isModerator: boolean };

type PostVisibility = { authorId: string; isDeleted: boolean; isModerated: boolean };

/**
 * Vrai si le lecteur peut recevoir le texte du message. Un message supprimé n'est lu par personne ; un message masqué
 * reste lisible par son auteur et par les modérateurs.
 */
export function canReadPostContent(post: PostVisibility, viewer: PostViewer): boolean {
  if (post.isDeleted) return false;
  if (!post.isModerated) return true;
  return viewer.isModerator || (!!viewer.id && viewer.id === post.authorId);
}

/** Copie du message dont le texte est vidé quand le lecteur n'a pas le droit de le lire (voir `canReadPostContent`). */
export function hidePostContent<T extends PostVisibility & { content: string }>(post: T, viewer: PostViewer): T {
  return canReadPostContent(post, viewer) ? post : { ...post, content: "" };
}

/** Vrai si le message peut être cité : ni supprimé, ni masqué, quel que soit le lecteur. */
export function canQuotePost(post: Pick<PostVisibility, "isDeleted" | "isModerated">): boolean {
  return !post.isDeleted && !post.isModerated;
}
