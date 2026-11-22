/**
 * Système de gestion des rôles et des permissions (RBAC).
 * Définit la hiérarchie des pouvoirs (ROLE_POWER) et les fonctions 
 * utilitaires de vérification d'accès.
 */
export type UserRole = 
  | "SUPERADMIN"
  | "ADMIN"
  | "MODERATOR"
  | "RTC"
  | "CHEF_LIGUE"
  | "COACH";

export const ROLE_POWER: Record<string, number> = {
  SUPERADMIN: 100,
  ADMIN: 90,
  MODERATOR: 70,
  RTC: 50,
  CHEF_LIGUE: 40,
  COACH: 10,
};

export const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Administrateur",
  MODERATOR: "Modérateur",
  RTC: "RTC",
  CHEF_LIGUE: "Chef de ligue",
  COACH: "Coach",
};

/**
 * Puissance d'un rôle pour les droits (modération, administration, gestion des rôles).
 * Seuls les rôles de base comptent ici : un rôle personnalisé (créé dans l'administration, table RoleConfig)
 * a les droits d'un coach. Sa vraie puissance, lue en base, ne sert qu'à l'accès au forum (lib/forumAccess.ts).
 * Les deux calculs restent cohérents parce qu'un rôle personnalisé est toujours sous Modérateur
 * (imposé par createCustomRole et reorderRoles dans app/administration/actions.ts) : il n'aurait de toute
 * façon aucun droit de modération.
 */
export function getRolePower(role: string): number {
  return ROLE_POWER[role] ?? ROLE_POWER.COACH;
}

/**
 * Libellé lisible d'un rôle (« Modérateur » plutôt que MODERATOR). `labels` contient les libellés lus dans la table
 * RoleConfig (lib/roleLabels.ts), qui couvrent aussi les rôles personnalisés créés dans l'administration ; sans
 * eux, seuls les rôles de base ont un libellé.
 */
export function getRoleLabel(role: string, labels?: Record<string, string>): string {
  return labels?.[role] ?? ROLE_LABELS[role] ?? role;
}

/**
 * Seuls les rôles >= MODERATOR (Power 70) peuvent modifier les rôles.
 * On ne peut pas modifier un utilisateur de rang supérieur ou égal au sien.
 * On ne peut pas donner un rôle supérieur au sien.
 */
export function canManageRoles(userRole: UserRole | string): boolean {
  return getRolePower(userRole) >= ROLE_POWER.MODERATOR;
}

export function canEditTargetRole(userRole: UserRole | string, targetCurrentRole: UserRole | string): boolean {
  if (!canManageRoles(userRole)) return false;
  
  // On ne peut pas toucher à quelqu'un de plus puissant ou égal à soi
  return getRolePower(userRole) > getRolePower(targetCurrentRole);
}

export function getAllowedRolesToAssign(userRole: UserRole | string): UserRole[] {
  if (!canManageRoles(userRole)) return [];
  
  // On peut attribuer n'importe quel rôle strictement inférieur au sien
  return (Object.keys(ROLE_POWER) as UserRole[]).filter(
    role => ROLE_POWER[role] < getRolePower(userRole)
  );
}

/**
 * Raison du refus d'un changement de rôle, ou null s'il est permis (carte 221). Règle unique des deux écrans qui
 * changent un rôle (liste des membres et onglet Coachs de l'administration) :
 * - il faut être modérateur ou plus ;
 * - le nouveau rôle doit exister (`newRoleExists`, lu dans la table RoleConfig) ;
 * - on ne change pas son propre rôle (un Super Admin qui se rétrograde par erreur perdrait l'accès) ;
 * - sauf pour un Super Admin : la cible et le nouveau rôle doivent être strictement sous son propre rang.
 */
export function roleChangeRefusal(input: {
  actorId: string;
  actorRole: string;
  targetId: string;
  targetRole: string;
  newRole: string;
  newRoleExists: boolean;
}): string | null {
  if (!canManageRoles(input.actorRole)) return "Tu n'as pas le droit de changer les rôles.";
  if (!input.newRoleExists) return "Ce rôle n'existe pas.";
  if (input.actorId === input.targetId) return "Tu ne peux pas changer ton propre rôle.";
  if (input.actorRole === "SUPERADMIN") return null;
  const actorPower = getRolePower(input.actorRole);
  if (getRolePower(input.targetRole) >= actorPower) return "Impossible de modifier un membre de rang supérieur ou égal au tien.";
  if (getRolePower(input.newRole) >= actorPower) return "Tu ne peux pas donner un rôle supérieur ou égal au tien.";
  return null;
}

/**
 * Comptes techniques du site (carte 221) : « Système » (auteur des ressources officielles) et « Coach Inconnu »
 * (compte fantôme des comptes supprimés, lib/accountDeletion.ts). Personne ne les bannit ni ne les supprime.
 */
export const SYSTEM_ACCOUNT_IDS = ["system", "ghost_coach"];

/**
 * Suppression d'un compte par l'équipe (carte 221) : admin ou plus, sur un membre de rang strictement inférieur
 * (le Super Admin peut supprimer tout autre compte). Un modérateur bannit, il ne supprime pas. Jamais son propre
 * compte ni un compte technique (`targetId`).
 */
export function canDeleteMember(actorRole: string, targetRole: string, isSelf = false, targetId?: string): boolean {
  if (isSelf || !isAdmin(actorRole) || (targetId && SYSTEM_ACCOUNT_IDS.includes(targetId))) return false;
  return actorRole === "SUPERADMIN" || getRolePower(actorRole) > getRolePower(targetRole);
}

/**
 * Bannir ou débannir (carte 221) : modérateur ou plus, sur un membre de rang strictement inférieur (le Super Admin
 * sur tout autre compte). Jamais soi-même (un Super Admin pouvait se bannir et perdre l'accès) ni un compte technique.
 */
export function canBanMember(actorRole: string, targetRole: string, isSelf = false, targetId?: string): boolean {
  if (isSelf || !isModerator(actorRole) || (targetId && SYSTEM_ACCOUNT_IDS.includes(targetId))) return false;
  return actorRole === "SUPERADMIN" || getRolePower(actorRole) > getRolePower(targetRole);
}

export function isModerator(role: string | null | undefined): boolean {
  if (!role) return false;
  return getRolePower(role) >= ROLE_POWER.MODERATOR;
}

export function isAdmin(role: string | null | undefined): boolean {
  if (!role) return false;
  return getRolePower(role) >= ROLE_POWER.ADMIN;
}
