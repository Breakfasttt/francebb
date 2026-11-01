"use server";

/**
 * Envoi d'une image vers le service d'hébergement d'images ImgBB, par le serveur (carte 141).
 *
 * Avant cette carte, chaque formulaire envoyait l'image directement depuis le navigateur, avec la clé ImgBB écrite
 * dans le code envoyé au navigateur : n'importe qui pouvait la lire et envoyer des images sur le compte du site.
 * Désormais, le navigateur passe le fichier à cette action serveur, qui seule connaît la clé (variable
 * d'environnement `IMGBB_API_KEY`, sans le préfixe `NEXT_PUBLIC_` qui la rendrait publique).
 *
 * L'action n'accepte que les membres connectés et non bannis, et ne transmet qu'une vraie image : le format est
 * reconnu à partir des premiers octets du fichier (sa « signature »), pas seulement à partir du type annoncé par le
 * navigateur, et sa taille est bornée par `IMAGE_UPLOAD_MAX_BYTES`.
 * Elle sert à tous les envois d'images du site : avatars (inscription et profil), blasons de ligue, images des
 * messages et des articles (éditeur BBCode) et illustrations des ressources. Côté navigateur, on l'appelle par
 * `uploadImageFile` (`common/utils/imageUpload.ts`), qui vérifie déjà la taille pour répondre plus vite.
 *
 * Pour les tests de parcours (Playwright), la variable `E2E_FAKE_IMAGE_UPLOAD=1` fait renvoyer une adresse factice
 * sans appeler ImgBB. Elle n'a d'effet qu'en développement (`next dev`), jamais sur le site en ligne.
 */
import { getActiveSession } from "@/lib/authGuard";
import type { ActionResult } from "@/lib/actionResult";
import { IMAGE_UPLOAD_MAX_BYTES, IMAGE_UPLOAD_MAX_LABEL } from "@/common/utils/imageUploadLimits";

const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

/** Résultat d'un envoi : en cas de succès, `url` est l'adresse publique de l'image hébergée. */
export type ImageUploadResult = ActionResult & { url?: string };

/** Reconnaît les formats acceptés (PNG, JPEG, GIF, WebP) d'après les premiers octets du fichier. */
function detectImageFormat(bytes: Uint8Array): string | null {
  const startsWith = (signature: number[], offset = 0) =>
    signature.every((value, index) => bytes[offset + index] === value);
  if (startsWith([0x89, 0x50, 0x4e, 0x47])) return "png";
  if (startsWith([0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith([0x47, 0x49, 0x46, 0x38])) return "gif"; // « GIF8 »
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return "webp"; // « RIFF » … « WEBP »
  return null;
}

/** Réponse attendue d'ImgBB ; seuls les champs lus ici sont décrits. */
type ImgbbResponse = { success?: boolean; data?: { url?: unknown }; error?: { message?: string } };

/**
 * Envoie l'image reçue (champ `image` du formulaire) à ImgBB et renvoie son adresse.
 * Ne lève jamais d'erreur : un refus ou un échec revient dans `error`, à afficher dans une notification.
 */
export async function uploadImage(formData: FormData): Promise<ImageUploadResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Vous devez être connecté pour envoyer une image." };

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Aucune image reçue." };
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return { success: false, error: `L'image est trop lourde : ${IMAGE_UPLOAD_MAX_LABEL} au maximum.` };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = detectImageFormat(bytes);
  if (!format) {
    return { success: false, error: "Ce fichier n'est pas une image acceptée (PNG, JPEG, GIF ou WebP)." };
  }

  // Tests de parcours : adresse factice, sans appel au service extérieur (jamais en production)
  if (process.env.NODE_ENV === "development" && process.env.E2E_FAKE_IMAGE_UPLOAD === "1") {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || `image.${format}`;
    return { success: true, url: `https://i.ibb.co/e2e/${safeName}` };
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    console.error("Envoi d'image impossible : la variable IMGBB_API_KEY n'est pas renseignée.");
    return { success: false, error: "L'envoi d'images n'est pas configuré sur le site. Prévenez un administrateur." };
  }

  const body = new FormData();
  body.append("image", new Blob([bytes], { type: `image/${format}` }), `image.${format}`);

  try {
    const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(30_000),
    });
    const data = (await response.json()) as ImgbbResponse;
    const url = data.data?.url;
    if (data.success && typeof url === "string" && url.startsWith("https://")) {
      return { success: true, url };
    }
    console.error("Envoi d'image refusé par ImgBB :", data.error?.message);
    return { success: false, error: "Le service d'hébergement d'images a refusé l'envoi. Réessayez plus tard." };
  } catch (error) {
    console.error("Envoi d'image vers ImgBB impossible :", error);
    return { success: false, error: "Le service d'hébergement d'images ne répond pas. Réessayez plus tard." };
  }
}
