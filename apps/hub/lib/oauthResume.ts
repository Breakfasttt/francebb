/**
 * Outils de la page de connexion du hub pour le flux OIDC (carte 073, « hub invisible »).
 *
 * Quand une application (le site) envoie un membre au hub, le plugin OAuth Provider le redirige vers /sign-in
 * avec la demande d'autorisation recopiée dans l'adresse et signée par le hub (paramètres `sig`, `exp`, `ba_*`).
 * Le plugin recopie aussi les paramètres qu'il ne connaît pas : le site s'en sert pour indiquer, dans
 * `login_method`, le moyen de connexion déjà choisi par le membre sur son propre écran.
 */

/** Moyens de connexion que le site peut demander. Toute autre valeur est ignorée (page de connexion normale). */
export const LOGIN_METHODS = ["discord", "google", "email"] as const;
export type LoginMethod = (typeof LOGIN_METHODS)[number];

/** Forme minimale d'une adresse email : du texte, une arobase, un domaine avec un point, sans espace. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Paramètres ajoutés par le plugin pour signer la demande : à retirer avant de rejouer l'autorisation. */
const SIGNATURE_PARAMS = ["sig", "exp", "ba_iat", "ba_pl", "ba_param"];

/** Paramètres propres à l'écran de connexion : inutiles, voire gênants (prompt=login), pour reprendre le flux. */
const LOGIN_SCREEN_PARAMS = ["login_method", "login_hint", "prompt", "error", "error_description"];

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Lit le moyen de connexion demandé par l'application. Renvoie null (page normale) si la page n'a pas été
 * ouverte par le flux OIDC (pas de signature), si le moyen n'est pas dans la liste autorisée, si le hub vient
 * de signaler une erreur (lien expiré par exemple, pour ne pas relancer en boucle) ou si l'adresse email manque.
 */
export function readRequestedLogin(searchParams: SearchParams): { method: LoginMethod; email?: string } | null {
  if (!single(searchParams.sig) || single(searchParams.error)) return null;
  const method = LOGIN_METHODS.find((candidate) => candidate === single(searchParams.login_method));
  if (!method) return null;
  if (method !== "email") return { method };
  const email = single(searchParams.login_hint)?.trim();
  return email && email.length <= 254 && EMAIL_PATTERN.test(email) ? { method, email } : null;
}

/**
 * Adresse à ouvrir après le clic sur le lien magique : la demande d'autorisation d'origine, rejouée sur
 * /oauth2/authorize. Le membre y arrive connecté au hub, qui le renvoie donc aussitôt vers l'application
 * (sans écran de consentement pour une application BBFrance). Sans demande OIDC en cours, renvoie undefined.
 *
 * La partie après « ? » est encodée une fois de plus : Better Auth décode deux fois l'adresse de retour du
 * lien magique (une fois en lisant l'adresse du lien, une fois avec decodeURIComponent). Sans cet encodage,
 * une valeur contenant un caractère encodé (« + », « & »…) serait abîmée. Le test `pnpm test:sso` vérifie ce
 * parcours : s'il casse après une mise à jour de Better Auth, regarder d'abord ici.
 */
export function authorizeResumeURL(search: string): string | undefined {
  const params = new URLSearchParams(search);
  if (!params.has("sig")) return undefined;
  for (const name of [...SIGNATURE_PARAMS, ...LOGIN_SCREEN_PARAMS]) params.delete(name);
  return `/api/auth/oauth2/authorize?${encodeURIComponent(params.toString())}`;
}

/**
 * Même adresse que authorizeResumeURL, utilisée si le lien magique est refusé (expiré, déjà utilisé) : le hub
 * réaffiche alors sa page de connexion normale, avec l'erreur, au lieu de relancer un envoi automatique.
 */
export function magicLinkCallbacks(search: string): { callbackURL?: string; errorCallbackURL?: string } {
  const resumeURL = authorizeResumeURL(search);
  return resumeURL ? { callbackURL: resumeURL, errorCallbackURL: resumeURL } : {};
}
