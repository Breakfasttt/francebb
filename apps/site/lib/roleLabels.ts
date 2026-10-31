/**
 * Libellés lisibles de tous les rôles, lus dans la table RoleConfig (rôles de base et rôles personnalisés créés dans
 * l'administration), sous la forme { MODERATOR: "Modérateur", … }. À passer à `getRoleLabel(role, labels)`
 * (lib/roles.ts) pour afficher un rôle sans son code brut (carte 092, comme le forum depuis la carte 108).
 * Interne au serveur : une page client passe par l'action `getRoleLabels` de app/profile/actions.ts.
 */
import { prisma } from "@/lib/prisma";

export async function getRoleLabelMap(): Promise<Record<string, string>> {
  const roles = await prisma.roleConfig.findMany({ select: { name: true, label: true } });
  return Object.fromEntries(roles.map((r) => [r.name, r.label]));
}
