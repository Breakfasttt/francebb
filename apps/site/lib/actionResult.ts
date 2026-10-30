/**
 * Forme de retour commune des actions serveur qui modifient des données.
 *
 * Une action serveur ne lève pas d'erreur (`throw`) : en production, Next.js remplace le message d'une erreur
 * levée par un texte générique, et le membre ne saurait pas ce qui s'est passé. L'action renvoie donc
 * `{ success: false, error: "message lisible" }` en cas de refus ou d'échec, et `{ success: true }` sinon.
 * Le composant qui l'appelle affiche `error` avec une notification (`toast.error`).
 */
export type ActionResult = { success: boolean; error?: string };
