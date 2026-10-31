import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * En-têtes de sécurité envoyés avec chaque réponse du hub (carte 118) :
 * - CSP (Content-Security-Policy) : le navigateur ne charge que des ressources du hub lui-même ; le hub ne peut pas
 *   être affiché dans un cadre d'un autre site (protection contre le clic piégé). Next.js a besoin des scripts en ligne,
 *   et le mode développement de `eval`.
 * - HSTS (Strict-Transport-Security) : le navigateur n'utilise plus que https pour le hub pendant un an.
 * - nosniff, Referrer-Policy, Permissions-Policy : protections courantes du navigateur.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Paquet du monorepo consommé en sources TypeScript (pas d'étape de build), comme sur le site
  transpilePackages: ["@bbfrance/ui"],
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
