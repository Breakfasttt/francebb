/**
 * Envoi d'une image choisie par un membre, côté navigateur (carte 141) : vérifie tout de suite le type et la taille
 * du fichier, puis le transmet à l'action serveur `uploadImage` (`app/imageUploadActions.ts`), qui l'héberge chez
 * ImgBB avec la clé secrète du site. Utilisé par tous les boutons « Envoyer une image » (avatar, blason, éditeur
 * BBCode, ressource).
 */
import { uploadImage, type ImageUploadResult } from "@/app/imageUploadActions";
import { IMAGE_UPLOAD_MAX_BYTES, IMAGE_UPLOAD_MAX_LABEL } from "./imageUploadLimits";

/** Envoie le fichier et renvoie `{ success, url }` ou `{ success: false, error }` ; ne lève jamais d'erreur. */
export async function uploadImageFile(file: File): Promise<ImageUploadResult> {
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Veuillez choisir un fichier image." };
  }
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return { success: false, error: `L'image est trop lourde : ${IMAGE_UPLOAD_MAX_LABEL} au maximum.` };
  }
  const formData = new FormData();
  formData.append("image", file);
  try {
    return await uploadImage(formData);
  } catch {
    return { success: false, error: "Erreur réseau lors de l'envoi de l'image." };
  }
}
