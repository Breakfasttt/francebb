"use server";

/**
 * Action serveur qui donne un schéma BBScheme au lecteur des messages (composant BBCodeContent, carte 179).
 * Le lecteur s'exécute dans le navigateur : il appelle cette action, qui lit le schéma auprès de l'application BBScheme
 * depuis le serveur du site (lib/bbschemeBoard.ts). La forme de la réponse est celle qu'attend le lecteur
 * (`BoardStateResult` du paquet @bbfrance/bbscheme-player), identique à celle de l'ancienne action de l'éditeur.
 */
import type { BoardStateResult } from "@bbfrance/bbscheme-player";
import { fetchBoardData } from "@/lib/bbschemeBoard";

export async function getBoardState(id: string): Promise<BoardStateResult> {
  const data = await fetchBoardData(id);
  return data === null ? { success: false, error: "Schéma indisponible" } : { success: true, data };
}
