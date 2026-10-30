/**
 * Proxy (anciennement « middleware ») : passe avant chaque page et chaque action serveur.
 * Il utilise la configuration complète d'Auth.js (auth.ts) et non plus la seule configuration de base
 * (auth.config.ts) : Next.js 16 exécute le proxy dans Node.js, il peut donc lire la base. C'est lui qui
 * enregistre dans le cookie de session le profil relu en base par le callback jwt (cartes 017 et 069),
 * car un composant serveur ne peut pas réécrire le cookie.
 */
import { auth } from "./auth";

export const proxy = auth;

export default proxy;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
