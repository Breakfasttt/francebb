"use server";

/**
 * Envoi de l'avatar du coach vers le service d'hébergement d'images ImgBB, depuis le passeport (22/11/2026), comme le
 * bouton « Envoyer une image » du site. Le hub est indépendant (ADR-0007) : il a sa propre clé, `IMGBB_API_KEY`, lue
 * seulement par le serveur. Sans elle, le bouton n'est pas proposé (`avatarUploadEnabled`).
 *
 * Seul un coach connecté au passeport peut envoyer une image, et seulement une vraie image : le format est reconnu par
 * les premiers octets du fichier (pas par le type annoncé par le navigateur), la taille est bornée à 4 Mo. L'adresse
 * renvoyée n'est pas enregistrée ici : le formulaire du profil la place dans le champ, puis « Enregistrer » la
 * vérifie et l'enregistre comme toute modification du profil.
 */
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";
const MAX_BYTES = 4 * 1024 * 1024;

export type AvatarUploadResult = { url: string } | { error: string };

/** L'envoi d'images est-il configuré sur le hub ? (le formulaire ne propose le bouton que dans ce cas) */
export async function avatarUploadEnabled(): Promise<boolean> {
  return !!process.env.IMGBB_API_KEY;
}

/** Reconnaît PNG, JPEG, GIF et WebP d'après les premiers octets du fichier. */
function detectImageFormat(bytes: Uint8Array): string | null {
  const startsWith = (signature: number[], offset = 0) => signature.every((value, index) => bytes[offset + index] === value);
  if (startsWith([0x89, 0x50, 0x4e, 0x47])) return "png";
  if (startsWith([0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith([0x47, 0x49, 0x46, 0x38])) return "gif";
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return "webp";
  return null;
}

export async function uploadAvatar(formData: FormData): Promise<AvatarUploadResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Ta session a expiré : reconnecte-toi au passeport, puis réessaie." };

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { error: "Aucune image reçue." };
  if (file.size > MAX_BYTES) return { error: "L'image est trop lourde : 4 Mo au maximum." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = detectImageFormat(bytes);
  if (!format) return { error: "Ce fichier n'est pas une image acceptée (PNG, JPEG, GIF ou WebP)." };

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) return { error: "L'envoi d'images n'est pas configuré sur le passeport. Utilise une adresse ou le générateur." };

  const body = new FormData();
  body.append("image", new Blob([bytes], { type: `image/${format}` }), `avatar.${format}`);
  try {
    const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(apiKey)}`, { method: "POST", body, signal: AbortSignal.timeout(30_000) });
    const data = (await response.json()) as { success?: boolean; data?: { url?: unknown } };
    const url = data.data?.url;
    if (data.success && typeof url === "string" && url.startsWith("https://")) return { url };
    return { error: "Le service d'hébergement d'images a refusé l'envoi. Réessaie plus tard." };
  } catch {
    return { error: "Le service d'hébergement d'images ne répond pas. Réessaie plus tard." };
  }
}
