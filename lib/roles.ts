export type UserRole = 
  | "ADMIN"
  | "RC_NAF"
  | "CONSEIL_ORGA"
  | "MODERATOR"
  | "MODERATOR_BROCANTE"
  | "MODERATOR_VESTIAIRES"
  | "MODERATOR_TRADUCTEUR"
  | "ORGA"
  | "COACH";

export const ROLE_POWER: Record<UserRole, number> = {
  ADMIN: 100,
  RC_NAF: 90,
  CONSEIL_ORGA: 80,
  MODERATOR: 70,
  MODERATOR_BROCANTE: 60,
  MODERATOR_VESTIAIRES: 50,
  MODERATOR_TRADUCTEUR: 40,
  ORGA: 30,
  COACH: 10,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  RC_NAF: "RC NAF",
  CONSEIL_ORGA: "Conseil des Orgas",
  MODERATOR: "Modérateur",
  MODERATOR_BROCANTE: "Modérateur Brocante",
  MODERATOR_VESTIAIRES: "Modérateur Les Vestiaires",
  MODERATOR_TRADUCTEUR: "Modérateur Traducteur",
  ORGA: "Orga",
  COACH: "Coach",
};

/**
 * Seuls les rôles >= MODERATOR (Power 70) peuvent modifier les rôles.
 * On ne peut pas modifier un utilisateur de rang supérieur ou égal au sien.
 * On ne peut pas donner un rôle supérieur au sien.
 */
export function canManageRoles(userRole: UserRole): boolean {
  return ROLE_POWER[userRole] >= ROLE_POWER.MODERATOR;
}

export function canEditTargetRole(userRole: UserRole, targetCurrentRole: UserRole): boolean {
  if (!canManageRoles(userRole)) return false;
  
  // On ne peut pas toucher à quelqu'un de plus puissant ou égal à soi
  return ROLE_POWER[userRole] > ROLE_POWER[targetCurrentRole];
}

export function getAllowedRolesToAssign(userRole: UserRole): UserRole[] {
  if (!canManageRoles(userRole)) return [];
  
  // On peut attribuer n'importe quel rôle strictement inférieur au sien
  return (Object.keys(ROLE_POWER) as UserRole[]).filter(
    role => ROLE_POWER[role] < ROLE_POWER[userRole]
  );
}

export function isModerator(role: string | null | undefined): boolean {
  if (!role) return false;
  return ROLE_POWER[role as UserRole] >= ROLE_POWER.MODERATOR;
}
