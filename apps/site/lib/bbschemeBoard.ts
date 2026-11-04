/**
 * Lecture d'un schéma tactique BBScheme auprès de l'application BBScheme (carte 179, ADR-0008).
 *
 * Depuis la carte 179, les schémas ne sont plus dans la base du site : ils sont rangés dans la base de l'application
 * apps/bbscheme, qui les donne par l'adresse publique `GET /api/boards/<identifiant>`. L'adresse de cette application
 * est le réglage BBSCHEME_URL du site. Le site l'appelle depuis son serveur (jamais depuis le navigateur du visiteur),
 * si bien que les deux applications peuvent vivre sur des domaines différents sans réglage particulier.
 *
 * Toute panne (réglage absent, application arrêtée ou trop lente, schéma inconnu, réponse illisible) donne `null` :
 * le lecteur affiche alors « Schéma indisponible », sans casser la page.
 *
 * Ce fichier n'importe rien, pour pouvoir être testé directement par Node (tests/unit/bbschemeBoard.test.mjs).
 */

/**
 * Forme d'un identifiant de schéma : lettres, chiffres, tiret et soulignement, 64 caractères au plus (un identifiant
 * fait 25 caractères, une empreinte 32). C'est aussi la règle de la balise [bbscheme] (lib/bbcode.ts).
 */
const BOARD_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

/** Délai au-delà duquel on renonce à attendre l'application BBScheme, pour ne pas bloquer l'affichage d'un message. */
const BBSCHEME_TIMEOUT_MS = 3000;

/** Vrai si `id` a la forme d'un identifiant de schéma. */
export function isValidBoardId(id: unknown): id is string {
  return typeof id === "string" && BOARD_ID_PATTERN.test(id);
}

/**
 * Adresse de lecture du schéma `id` dans l'application BBScheme dont l'adresse est `baseUrl`, ou `null` si l'une des
 * deux est absente ou mal formée. La barre oblique finale éventuelle de `baseUrl` est retirée.
 */
export function boardApiUrl(baseUrl: string | undefined, id: unknown): string | null {
  if (!baseUrl || !isValidBoardId(id)) return null;
  return `${baseUrl.replace(/\/+$/, "")}/api/boards/${encodeURIComponent(id)}`;
}

/**
 * Contenu JSON du schéma `id` (texte), lu auprès de l'application BBScheme, ou `null` en cas de problème.
 * La réponse est gardée une minute par le cache de Next.js : un schéma ne change jamais une fois enregistré.
 */
export async function fetchBoardData(id: unknown, baseUrl = process.env.BBSCHEME_URL): Promise<string | null> {
  const url = boardApiUrl(baseUrl, id);
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(BBSCHEME_TIMEOUT_MS), next: { revalidate: 60 } });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    const data = (body as { data?: unknown } | null)?.data;
    return typeof data === "string" ? data : null;
  } catch {
    return null;
  }
}
