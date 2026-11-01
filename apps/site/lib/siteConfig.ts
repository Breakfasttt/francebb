/**
 * Centralized configuration for the application.
 * This is where we define default settings and global parameters.
 * Aucune clé secrète ici : ce fichier peut être lu par des composants du navigateur. La clé du service d'images
 * ImgBB est lue côté serveur seulement, dans `app/imageUploadActions.ts` (carte 141).
 */
export const siteConfig = {
  name: "BBFrance",
  description: "Forum en ligne",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};
