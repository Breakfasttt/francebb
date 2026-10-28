"use server";

import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Taille maximale d'un plateau partagé : un plateau de 50 images en fait bien moins. Sans limite, n'importe quel
// visiteur pouvait remplir la base avec des textes géants (carte 050).
const MAX_BOARD_STATE_BYTES = 500 * 1024;

/** Vrai si `data` ressemble à un plateau BBScheme (JSON avec une liste d'images). */
function isBoardState(data: string) {
  try {
    const parsed: unknown = JSON.parse(data);
    return typeof parsed === "object" && parsed !== null && Array.isArray((parsed as { frames?: unknown }).frames);
  } catch {
    return false;
  }
}

/**
 * Sauvegarde l'état d'un plateau BBScheme.
 * Si un état identique (même hash) existe déjà, renvoie l'ID existant.
 */
export async function saveBoardState(data: string) {
  if (typeof data !== "string" || Buffer.byteLength(data, "utf-8") > MAX_BOARD_STATE_BYTES) {
    return { success: false, error: "Plateau trop volumineux pour être partagé" };
  }
  if (!isBoardState(data)) {
    return { success: false, error: "Plateau invalide" };
  }

  try {
    const session = await getActiveSession();
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
