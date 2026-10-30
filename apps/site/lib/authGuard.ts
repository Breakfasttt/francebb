/**
 * Garde d'authentification côté serveur.
 * getActiveSession() renvoie la session Auth.js, ou null si l'utilisateur n'est pas connecté OU est banni.
 * À utiliser dans toutes les server actions et server components à la place de auth() : le ban n'était vérifié que côté client.
 * getSession() renvoie la session brute (bannis compris) : uniquement pour le layout, qui redirige les bannis.
 * Mémoïsé par requête (React cache) : un seul appel à auth() par rendu suffit.
 * Le bannissement est relu en base par le callback jwt d'auth.ts à chaque lecture de la session (carte 069) :
 * un membre banni perd l'accès dès sa demande suivante.
 */
import { cache } from "react";
import { auth } from "@/auth";

export const getSession = cache(() => auth());

export const getActiveSession = cache(async () => {
  const session = await getSession();
  if (!session?.user?.id || session.user.isBanned) return null;
  return session;
});
