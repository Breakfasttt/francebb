/**
 * Messages des erreurs de connexion, en français. Better Auth renvoie un code (`error.code`) et un message anglais :
 * le coach ne lit jamais ce message anglais, seulement la traduction du code, ou un message clair par défaut qui dit
 * quoi faire. Utilisé par le formulaire de connexion, la connexion automatique et les comptes de test.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_TOKEN: "Ce lien de connexion a expiré ou a déjà servi : demande-en un nouveau.",
  EXPIRED_TOKEN: "Ce lien de connexion a expiré : demande-en un nouveau.",
  INVALID_EMAIL: "Cette adresse email n'est pas valide. Vérifie-la et réessaie.",
  INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect.",
  USER_NOT_FOUND: "Aucun compte ne correspond à cette adresse.",
  BANNED_USER: "Ce compte FranceBB a été suspendu.",
  BANNED: "Ce compte FranceBB a été suspendu.",
  TOO_MANY_REQUESTS: "Trop d'essais en peu de temps : attends une minute avant de réessayer.",
  EMAIL_NOT_VERIFIED: "Cette adresse email n'est pas encore vérifiée.",
  PROVIDER_NOT_FOUND: "Ce moyen de connexion n'est pas disponible pour le moment. Essaie avec ton adresse email.",
  FAILED_TO_SEND_MAGIC_LINK: "Le lien de connexion n'a pas pu être envoyé. Réessaie dans quelques minutes.",
};

/** Message français d'une erreur de Better Auth (`{ code, status, message }`), ou `fallback`. */
export function authErrorMessage(error: { code?: string; status?: number } | null | undefined, fallback: string): string {
  if (!error) return fallback;
  if (error.code && AUTH_ERROR_MESSAGES[error.code]) return AUTH_ERROR_MESSAGES[error.code];
  if (error.status === 429) return AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS;
  return fallback;
}

/** Message d'un code d'erreur lu dans l'adresse (un texte venu de l'adresse n'est jamais affiché tel quel). */
export function authErrorCodeMessage(code: string): string {
  return AUTH_ERROR_MESSAGES[code] ?? "La connexion n'a pas abouti. Réessaie, ou choisis un autre moyen de connexion.";
}
