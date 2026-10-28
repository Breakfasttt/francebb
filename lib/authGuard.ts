/**
 * Garde d'authentification côté serveur.
 * getActiveSession() renvoie la session Auth.js, ou null si l'utilisateur n'est pas connecté OU est banni.
 * À utiliser dans toutes les server actions à la place de auth() : le ban n'était vérifié que côté client.
 * Pas de requête BDD supplémentaire : isBanned est rafraîchi par le callback jwt (auth.ts).
 */
import { auth } from "@/auth";

export async function getActiveSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.isBanned) return null;
  return session;
}
