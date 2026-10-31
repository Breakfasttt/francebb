/**
 * Droits (portées) expliqués en français, pour l'écran de consentement et la liste des applications liées
 * (cartes 120 et 127) : le coach ne doit jamais lire un nom technique de portée.
 */
export const SCOPE_LABELS: Record<string, string> = {
  openid: "savoir qui tu es",
  profile: "voir ton pseudo et ton avatar",
  email: "voir ton adresse email",
  offline_access: "rester connectée sans te redemander",
  "bbfrance:profile": "voir ton profil de coach (NAF, région…)",
  "bbfrance:profile:write": "modifier ton profil de coach",
};

export const describeScopes = (scopes: string[]) => scopes.map((scope) => SCOPE_LABELS[scope] ?? scope);
