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

export function getRolePower(role: string): number {
  return ROLE_POWER[role] ?? ROLE_POWER.COACH;
}

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
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

export function isModerator(role: string | null | undefined): boolean {
  if (!role) return false;
  return getRolePower(role) >= ROLE_POWER.MODERATOR;
}
