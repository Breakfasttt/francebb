import { prisma } from "./prisma";

/**
 * Récupère les données de référence d'un groupe spécifique.
 * Utilisé pour les listes de sélection (Régions, Éditions, etc.)
 */
export async function getReferenceData(group: string) {
  return await prisma.referenceData.findMany({
    where: { group, isActive: true },
    orderBy: { order: 'asc' }
  });
}

/**
 * Récupère un dictionnaire de toutes les données de référence actives.
 */
export async function getAllReferenceData() {
  const all = await prisma.referenceData.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });
  
  return all.reduce((acc: any, curr) => {
    if (!acc[curr.group]) acc[curr.group] = [];
    acc[curr.group].push(curr);
    return acc;
  }, {});
}
