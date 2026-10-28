/**
 * Accès au forum par rôle. `allowedRoles` (catégorie, forum) contient un nom de rôle et signifie
 * « ce rôle et les rôles supérieurs » (ou "ALL" = public). Une restriction de catégorie ou de forum parent
 * s'applique aussi aux forums en dessous.
 * getForumAccess() : rôles accessibles au visiteur courant (mémoïsé par requête) ;
 * forumAccessWhere / topicAccessWhere : filtres Prisma ; canAccessForum : contrôle sur un forum déjà chargé.
 */
import { cache } from "react";
import type { Prisma } from "@/prisma/generated-client";
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { ROLE_POWER, getRolePower } from "@/lib/roles";

export const PUBLIC_ROLE = "ALL";

export const getForumAccess = cache(async (): Promise<{ roles: string[]; key: string }> => {
  const session = await getActiveSession();
  const role = session?.user?.role;
  if (!role) return { roles: [PUBLIC_ROLE], key: PUBLIC_ROLE };

  // Rôles configurés en BDD (RoleConfig, puissance éditable) + rôles de base en repli
  const configs = await prisma.roleConfig.findMany({ select: { name: true, power: true } });
  const powers = new Map<string, number>(Object.entries(ROLE_POWER));
  for (const config of configs) powers.set(config.name, config.power);

  const userPower = powers.get(role) ?? getRolePower(role);
  const roles = [PUBLIC_ROLE, ...[...powers].filter(([, power]) => power <= userPower).map(([name]) => name)].sort();
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
  return { forum: forumAccessWhere(roles) };
}

type RestrictedNode = { allowedRoles: string } | null | undefined;
type ForumNode = { allowedRoles: string; category?: RestrictedNode; parentForum?: (ForumNode & { allowedRoles: string }) | null };

export function canAccessForum(forum: ForumNode, roles: string[]): boolean {
  const nodes: RestrictedNode[] = [forum, forum.category, forum.parentForum, forum.parentForum?.category];
  return nodes.every((node) => !node || roles.includes(node.allowedRoles));
}
