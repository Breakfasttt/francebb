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
    imgbb: {
      // API Key pour l'alternative ImgBB
      apiKey: process.env.NEXT_PUBLIC_IMGBB_API_KEY || "", 
    }
  }
};
