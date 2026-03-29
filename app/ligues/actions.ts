"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isModerator } from "@/lib/roles";

/**
 * Crée une nouvelle ligue.
 */
export async function createLigue(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté pour créer une ligue.");
  }

  const name = formData.get("name") as string;
  const acronym = formData.get("acronym") as string;
  const geographicalZone = formData.get("geographicalZone") as string;
  const description = formData.get("description") as string;
  const region = formData.get("region") as string;
  const departement = formData.get("departement") as string;
  const ville = formData.get("ville") as string;
  const address = formData.get("address") as string;
  const gmapsUrl = formData.get("gmapsUrl") as string;

  if (!name || !acronym) {
    throw new Error("Le nom et l'acronyme sont obligatoires.");
  }

  const commissaireIds = (formData.get("commissaireIds") as string || "").split(',').filter(id => id.length > 0);

  const ligue = await prisma.ligue.create({
    data: {
      name,
      acronym,
      geographicalZone,
      description,
      region,
      departement,
      ville,
      address,
      gmapsUrl,
      creatorId: session.user.id,
      commissaires: {
        connect: commissaireIds.map(id => ({ id }))
      }
    }
  });

  revalidatePath("/ligues");
  redirect(`/ligue/${ligue.id}`);
}

/**
 * Met à jour une ligue existante.
 */
export async function updateLigue(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");

  const ligue = await prisma.ligue.findUnique({
    where: { id },
    include: { commissaires: { select: { id: true } } }
  });

  if (!ligue) throw new Error("Ligue introuvable");

  const isCreator = ligue.creatorId === session.user.id;
  const isCommissaire = ligue.commissaires.some(c => c.id === session.user.id);
  const isMod = isModerator(session.user.role);

  if (!isCreator && !isCommissaire && !isMod) {
    throw new Error("Vous n'avez pas l'autorisation de modifier cette ligue.");
  }

  const name = formData.get("name") as string;
  const acronym = formData.get("acronym") as string;
  const geographicalZone = formData.get("geographicalZone") as string;
  const description = formData.get("description") as string;
  const region = formData.get("region") as string;
  const departement = formData.get("departement") as string;
  const ville = formData.get("ville") as string;
  const address = formData.get("address") as string;
  const gmapsUrl = formData.get("gmapsUrl") as string;

  const data: any = {
    name,
    acronym,
    geographicalZone,
    description,
    region,
    departement,
    ville,
    address,
    gmapsUrl,
  };

  // Seul le créateur peut modifier les commissaires
  if (isCreator || isMod) {
    const commissaireIds = (formData.get("commissaireIds") as string || "").split(',').filter(id => id.length > 0);
    data.commissaires = {
      set: commissaireIds.map(id => ({ id }))
    };
  }

  await prisma.ligue.update({
    where: { id },
    data
  });

  revalidatePath("/ligues");
  revalidatePath(`/ligue/${id}`);
  return { success: true };
}

/**
 * Supprime une ligue.
 */
export async function deleteLigue(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");

  const ligue = await prisma.ligue.findUnique({
    where: { id }
  });

  if (!ligue) throw new Error("Ligue introuvable");

  if (ligue.creatorId !== session.user.id && !isModerator(session.user.role)) {
    throw new Error("Seul le créateur peut supprimer la ligue.");
  }

  await prisma.ligue.delete({
    where: { id }
  });

  revalidatePath("/ligues");
  redirect("/ligues");
}

/**
 * Transfère la propriété d'une ligue.
 */
export async function transferLigueOwnership(id: string, newOwnerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");

  const ligue = await prisma.ligue.findUnique({
    where: { id }
  });

  if (!ligue) throw new Error("Ligue introuvable");

  if (ligue.creatorId !== session.user.id && !isModerator(session.user.role)) {
    throw new Error("Seul le créateur peut transférer la propriété.");
  }

  await prisma.ligue.update({
    where: { id },
    data: { creatorId: newOwnerId }
  });

  revalidatePath(`/ligue/${id}`);
  return { success: true };
}

/**
 * Recherche des ligues pour l'autocomplétion.
 */
export async function searchLiguesAction(query: string) {
  if (query.length < 2) return [];

  return await prisma.ligue.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { name: { contains: query.toLowerCase() } },
        { name: { contains: query.charAt(0).toUpperCase() + query.slice(1) } },
        { acronym: { contains: query } },
        { acronym: { contains: query.toUpperCase() } }
      ]
    },
    take: 10,
    select: {
      id: true,
      name: true,
      acronym: true,
      region: true,
      geographicalZone: true
    }
  });
}
