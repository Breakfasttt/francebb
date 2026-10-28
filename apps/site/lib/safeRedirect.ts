/**
 * Adresse de retour sûre après connexion : seule une adresse interne au site est acceptée.
 * Empêche la « redirection ouverte » (un lien piégé /auth/login?callbackUrl=https://site-pirate.com
 * qui renverrait le membre vers un site extérieur après sa connexion).
 */
export function safeCallbackUrl(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback;
  // Chemin interne uniquement : commence par « / », mais pas « // » ni « /\ » (que le navigateur lit comme un autre site)
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
