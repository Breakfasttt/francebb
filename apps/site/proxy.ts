/**
 * Proxy (anciennement « middleware ») : passe avant chaque page et chaque action serveur.
 * Il utilise la configuration complète d'Auth.js (auth.ts) et non plus la seule configuration de base
 * (auth.config.ts) : Next.js 16 exécute le proxy dans Node.js, il peut donc lire la base. C'est lui qui
 * enregistre dans le cookie de session le profil relu en base par le callback jwt (cartes 017 et 069),
 * car un composant serveur ne peut pas réécrire le cookie.
 *
 * Il pose aussi la politique de sécurité du contenu (en-tête Content-Security-Policy, carte 159) : le navigateur
 * n'exécute que les scripts du site qui portent une clé tirée au hasard à chaque visite (le « nonce »). Un code glissé
 * dans un message (attribut onerror, onclick…) n'a pas cette clé et ne s'exécute donc pas. Next.js lit la clé dans
 * l'en-tête de la requête et l'ajoute lui-même à ses scripts ; cela suppose des pages calculées à chaque visite, ce
 * qui est déjà le cas (la page commune lit les cookies).
 */
import { NextResponse } from "next/server";
import { auth } from "./auth";

/** Politique de sécurité du contenu pour une visite. */
function contentSecurityPolicy(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    // En développement, React a besoin d'eval pour ses messages d'erreur détaillés.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Les styles écrits dans les balises (BBCode, carte Leaflet, composants) restent permis : ils ne peuvent pas exécuter de code.
    "style-src 'self' 'unsafe-inline'",
    // Images des membres : n'importe quelle adresse https (ImgBB, avatars, tuiles de la carte).
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    // Vidéos YouTube des messages, chaînes Twitch de la page Médias.
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.twitch.tv",
    // En développement, le rechargement à chaud passe par une connexion websocket.
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export const proxy = auth((request) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = contentSecurityPolicy(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
});

export default proxy;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
