/**
 * Centralized configuration for the application.
 * This is where we define external API keys, default settings, and global parameters.
 */
export const siteConfig = {
  name: "BBFrance",
  description: "Forum en ligne",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  
  // Configuration for external APIs and tools
  api: {
    imgur: {
      // Pour utiliser votre propre compte Imgur, remplacez cette valeur 
      // ou ajoutez NEXT_PUBLIC_IMGUR_CLIENT_ID dans votre fichier .env.local
      clientId: process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID || "c4d4ce51b914ce7",
    },
    imgbb: {
      // API Key pour l'alternative ImgBB
      apiKey: process.env.NEXT_PUBLIC_IMGBB_API_KEY || "703714b6bc63d41f05e3cb9833f20d2d", 
    }
  }
};
