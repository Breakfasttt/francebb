import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Réglages Next.js de l'application BBScheme (carte 179). En attendant la relance de l'éditeur, l'application ne sert
 * qu'une page d'attente et l'adresse de lecture des schémas (`/api/boards/<identifiant>`), appelée par le serveur du
 * site. En-têtes de sécurité calqués sur ceux du hub (apps/hub/next.config.ts) : ressources de l'application seulement,
 * pas d'affichage dans un cadre d'un autre site, https obligatoire, protections courantes du navigateur.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
