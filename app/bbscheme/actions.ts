"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Sauvegarde l'état d'un plateau BBScheme.
 * Si un état identique (même hash) existe déjà, renvoie l'ID existant.
 */
export async function saveBoardState(data: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    // Calcul du hash (MD5 est suffisant ici pour du dédoublonnement de plateau)
    const hash = crypto.createHash("md5").update(data).digest("hex");
    
    // Vérification de l'existence
    const existing = await prisma.bBSchemeState.findUnique({
      where: { hash }
    });
    
    if (existing) {
      return { success: true, id: existing.id };
    }
    
    // Création du nouvel état
    const newState = await prisma.bBSchemeState.create({
      data: {
        hash,
        data,
        creatorId: userId || null
      }
    });
    
    return { success: true, id: newState.id };
  } catch (error) {
    console.error("Error saving BBScheme state:", error);
    return { success: false, error: "Erreur lors de la sauvegarde" };
  }
}

/**
 * Récupère l'état d'un plateau BBScheme par son ID.
 */
export async function getBoardState(id: string) {
  try {
    const state = await prisma.bBSchemeState.findUnique({
      where: { id }
    });
    
    if (!state) {
      return { success: false, error: "Plateau introuvable" };
    }
    
    return { success: true, data: state.data };
  } catch (error) {
    console.error("Error fetching BBScheme state:", error);
    return { success: false, error: "Erreur lors de la récupération" };
  }
}
