import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Paquets du monorepo consommés en sources TypeScript (pas d'étape de build)
  transpilePackages: ["@bbfrance/ui", "@bbfrance/bbscheme-player"],
  allowedDevOrigins: (process.env.ALLOWED_DEV_ORIGINS || 'localhost:3000').split(','),
  // Images (carte 019) : pas de section « images », les réglages par défaut suffisent.
  // next/image n'optimise que les images du dossier public/ (converties en WebP, au format
  // affiché). Aucun site extérieur n'est autorisé (pas de « remotePatterns ») : les avatars
  // et les images des membres peuvent venir de n'importe quelle adresse, et tout autoriser
  // ferait de l'optimiseur du site un relais ouvert à tout Internet. Ces images extérieures
  // restent donc des balises <img> ordinaires.
  
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
