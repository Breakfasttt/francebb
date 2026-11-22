import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Paquets du monorepo consommés en sources TypeScript (pas d'étape de build)
  transpilePackages: ["@bbfrance/ui", "@bbfrance/bbscheme-player"],
  allowedDevOrigins: (process.env.ALLOWED_DEV_ORIGINS || 'localhost:3000').split(','),
  // Carte 141 : les images des membres passent par l'action serveur `uploadImage` (app/imageUploadActions.ts).
  // Une action serveur refuse par défaut un envoi de plus de 1 mégaoctet, trop peu pour une photo de téléphone.
  // On monte à 4,5 mégaoctets, la limite de Vercel ; l'image elle-même est bornée à 4 Mo
  // (common/utils/imageUploadLimits.ts).
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
  // Images (carte 019) : réglages par défaut, plus une seule adresse extérieure (voir plus bas).
  // next/image n'optimise que les images du dossier public/ (converties en WebP, au format
  // affiché). Aucun site extérieur n'est autorisé (pas de « remotePatterns ») : les avatars
  // et les images des membres peuvent venir de n'importe quelle adresse, et tout autoriser
  // ferait de l'optimiseur du site un relais ouvert à tout Internet. Ces images extérieures
  // restent donc des balises <img> ordinaires.
  // Seule exception : les images des vidéos YouTube de la page Médias (i.ytimg.com, dossier /vi/). Passées par
  // l'optimiseur, elles sont servies par le site : le navigateur du visiteur ne contacte pas Google (RGPD).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
