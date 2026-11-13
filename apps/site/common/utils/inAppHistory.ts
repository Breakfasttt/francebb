/**
 * Pages du site parcourues depuis l'ouverture de l'onglet (carte 196).
 *
 * Le bouton retour d'une page (`BackButton` avec `preferHistory`) revient à la page précédente seulement si elle
 * fait partie du site. Si la page a été ouverte directement (lien partagé, favori, nouvel onglet), revenir en
 * arrière ferait quitter le site : le bouton suit alors son lien habituel (l'accueil, par exemple).
 *
 * Le navigateur ne dit pas si un changement d'adresse est un retour ou une nouvelle page. On garde donc la pile
 * des adresses visitées : une adresse égale à l'avant-dernière est un retour (la pile perd une page), toute autre
 * adresse est une nouvelle page (la pile en gagne une). Les règles sont pures, pour être vérifiées sans navigateur
 * (`tests/unit/inAppHistory.test.mjs`).
 */

/** Pile des adresses après le passage à `pathname`. */
export function nextHistoryStack(stack: readonly string[], pathname: string): string[] {
  if (stack.length === 0) return [pathname];
  // Même adresse (seuls les paramètres après le « ? » ont changé) : rien ne change
  if (stack[stack.length - 1] === pathname) return [...stack];
  // Retour à la page précédente
  if (stack.length >= 2 && stack[stack.length - 2] === pathname) return stack.slice(0, -1);
  return [...stack, pathname];
}

/** Vrai si la page précédente fait partie du site. */
export function canGoBackInApp(stack: readonly string[]): boolean {
  return stack.length >= 2;
}

// Pile de l'onglet en cours : elle vit tant que le site n'est pas rechargé, ce qui correspond à l'historique que
// `router.back()` peut parcourir sans quitter le site.
let currentStack: string[] = [];

/** Note le passage à une nouvelle adresse ; appelé par `InAppHistoryTracker` à chaque changement de page. */
export function recordPathname(pathname: string): void {
  currentStack = nextHistoryStack(currentStack, pathname);
}

/** Vrai si le bouton retour peut revenir en arrière sans quitter le site. */
export function hasInAppHistory(): boolean {
  return canGoBackInApp(currentStack);
}
