/**
 * Accès au forum par rôle. `allowedRoles` (catégorie, forum) contient un nom de rôle et signifie
 * « ce rôle et les rôles supérieurs » (ou "ALL" = public). Une restriction de catégorie ou de forum parent
 * s'applique aussi aux forums en dessous.
 * getForumAccess() : rôles accessibles au visiteur courant (mémoïsé par requête) ;
 * forumAccessWhere / topicAccessWhere : filtres Prisma ; canAccessForum : contrôle sur un forum déjà chargé.
 * topicAccessWhere écarte aussi les sujets supprimés (carte 165) : tout ce qui passe par ce filtre (listes, non-lus,
 * recherche, profil, sujets suivis, actions sur un message) ignore un sujet supprimé, pour tout le monde. Seule la page
 * du sujet le lit sans ce filtre, pour le montrer aux modérateurs avec « Restaurer ».
 */
import { cache } from "react";
import type { Prisma } from "@/prisma/generated-client";
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { ROLE_POWER, getRolePower } from "@/lib/roles";

export const PUBLIC_ROLE = "ALL";

/** Puissance de chaque rôle : rôles configurés en BDD (RoleConfig, puissance éditable) + rôles de base en repli. */
export async function loadRolePowers(): Promise<Map<string, number>> {
  const configs = await prisma.roleConfig.findMany({ select: { name: true, power: true } });
  const powers = new Map<string, number>(Object.entries(ROLE_POWER));
  for (const config of configs) powers.set(config.name, config.power);
  return powers;
}

/**
 * Rôles accessibles à un membre de rôle `role` (son rôle, les rôles moins puissants et le public), triés.
 * Sert au visiteur courant (getForumAccess) et, pour les notifications (carte 167), à un autre membre que le visiteur.
 */
export function accessibleRolesFor(role: string, powers: Map<string, number>): string[] {
  const userPower = powers.get(role) ?? getRolePower(role);
  return [PUBLIC_ROLE, ...[...powers].filter(([, power]) => power <= userPower).map(([name]) => name)].sort();
}

export const getForumAccess = cache(async (): Promise<{ roles: string[]; key: string }> => {
  const session = await getActiveSession();
  const role = session?.user?.role;
  if (!role) return { roles: [PUBLIC_ROLE], key: PUBLIC_ROLE };

  const roles = accessibleRolesFor(role, await loadRolePowers());
  return { roles, key: roles.join(",") };
});

export function forumAccessWhere(roles: string[]): Prisma.ForumWhereInput {
  const allowed = { in: roles };
  const categoryAllowed: Prisma.ForumWhereInput = { OR: [{ categoryId: null }, { category: { allowedRoles: allowed } }] };
  return {
    allowedRoles: allowed,
    AND: [
      categoryAllowed,
      { OR: [{ parentForumId: null }, { parentForum: { allowedRoles: allowed, ...categoryAllowed } }] },
    ],
  };
}

export function topicAccessWhere(roles: string[]): Prisma.TopicWhereInput {
  return { isDeleted: false, forum: forumAccessWhere(roles) };
}

type RestrictedNode = { allowedRoles: string } | null | undefined;
type ForumNode = { allowedRoles: string; category?: RestrictedNode; parentForum?: (ForumNode & { allowedRoles: string }) | null };

/** Champs d'un forum à lire pour pouvoir appeler canAccessForum (forum, catégorie, forum parent et sa catégorie). */
export const FORUM_ACCESS_SELECT = {
  allowedRoles: true,
  category: { select: { allowedRoles: true } },
  parentForum: { select: { allowedRoles: true, category: { select: { allowedRoles: true } } } },
} as const;

export function canAccessForum(forum: ForumNode, roles: string[]): boolean {
  const nodes: RestrictedNode[] = [forum, forum.category, forum.parentForum, forum.parentForum?.category];
  return nodes.every((node) => !node || roles.includes(node.allowedRoles));
}
