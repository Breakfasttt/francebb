/**
 * Données de référence (table `referenceData`) : les listes fixes du site (régions, départements, éditions du jeu,
 * plateformes, formats et types de tournoi, régions des coachs), modifiables par les administrateurs.
 *
 * Depuis la carte 203, ce fichier est le seul à lire la table. Avant, 28 lectures étaient écrites en ligne dans 9
 * fichiers, et les pages de création et de modification d'un tournoi répétaient le même bloc de 7 requêtes ; ce
 * fichier existait déjà, mais personne ne l'appelait. Les écritures restent dans l'onglet d'administration
 * (`app/administration/actions.ts`).
 *
 * Fichier volontairement PAS « use server » : ses fonctions ne sont appelables que par le code serveur.
 */
import type { ReferenceData } from "@/prisma/generated-client";
import { prisma } from "@/lib/prisma";

/** Groupes de données de référence utilisés par le site. */
export type ReferenceGroup =
  | "REGION_FRANCE"
  | "DEPARTEMENT_FRANCE"
  | "COACH_REGION"
  | "GAME_EDITION"
  | "PLATFORM"
  | "TOURNAMENT_FORMAT"
  | "TOURNAMENT_TYPE";

/** Éléments actifs d'un groupe, dans l'ordre d'affichage. */
export async function getReferenceData(group: ReferenceGroup): Promise<ReferenceData[]> {
  return prisma.referenceData.findMany({ where: { group, isActive: true }, orderBy: { order: "asc" } });
}

/** Éléments actifs de plusieurs groupes, lus en une seule requête, rangés par groupe. */
export async function getReferenceLists<G extends ReferenceGroup>(groups: readonly G[]): Promise<Record<G, ReferenceData[]>> {
  const rows = await prisma.referenceData.findMany({
    where: { group: { in: [...groups] }, isActive: true },
    orderBy: { order: "asc" },
  });
  const lists = Object.fromEntries(groups.map((group) => [group, [] as ReferenceData[]])) as Record<G, ReferenceData[]>;
  for (const row of rows) lists[row.group as G].push(row);
  return lists;
}

/** Les sept listes du formulaire de tournoi (création et modification), en une seule requête. */
export function getTournamentFormLists() {
  return getReferenceLists([
    "REGION_FRANCE",
    "GAME_EDITION",
    "DEPARTEMENT_FRANCE",
    "TOURNAMENT_FORMAT",
    "TOURNAMENT_TYPE",
    "PLATFORM",
    "COACH_REGION",
  ] as const);
}

/** Les trois listes du formulaire de ligue (création et modification). */
export function getLigueFormLists() {
  return getReferenceLists(["COACH_REGION", "REGION_FRANCE", "DEPARTEMENT_FRANCE"] as const);
}

/** Libellé d'un élément d'un groupe (actif ou non), ou `null`. */
export async function getReferenceLabel(group: ReferenceGroup, key: string): Promise<string | null> {
  const row = await prisma.referenceData.findFirst({ where: { group, key }, select: { label: true } });
  return row?.label ?? null;
}

/** Toutes les données de référence, actives ou non, pour l'onglet d'administration. */
export async function listAllReferenceData(): Promise<ReferenceData[]> {
  return prisma.referenceData.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] });
}
