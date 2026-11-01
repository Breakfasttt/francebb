/**
 * Taille maximale d'une image envoyée par un membre (carte 141), partagée par le navigateur (contrôle immédiat dans
 * `imageUpload.ts`) et par l'action serveur `uploadImage` (`app/imageUploadActions.ts`), qui vérifie de nouveau.
 * L'hébergeur Vercel refuse toute requête de plus de 4,5 mégaoctets : on reste en dessous, et la limite des actions
 * serveur (`serverActions.bodySizeLimit` dans `next.config.ts`) est réglée en conséquence.
 */
export const IMAGE_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

/** La même limite, écrite pour les messages affichés aux membres. */
export const IMAGE_UPLOAD_MAX_LABEL = "4 Mo";
