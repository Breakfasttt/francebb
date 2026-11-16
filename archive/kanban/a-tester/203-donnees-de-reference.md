---
id: 203
title: "Données de référence : un seul accès, ou suppression du fichier inutilisé"
epic: E12
app: site
depends_on: [201]
verify: "lib/referenceData.ts est soit supprimé, soit le seul fichier qui lit la table referenceData ; les pages de création et de modification de tournoi chargent leurs listes par un seul appel ; getReferenceDataAction n'accepte plus n'importe quel groupe ; corepack pnpm check et pnpm --filter @bbfrance/site test:parcours passent"
---

# 203 — Données de référence : un seul accès, ou suppression du fichier inutilisé

## Pourquoi

Les données de référence sont les listes fixes du site (éditions du jeu, plateformes, formats de tournoi…), rangées dans la table `referenceData`.

- `lib/referenceData.ts` existe pour les lire, mais personne ne l'appelle (`getReferenceData` et `getAllReferenceData` n'ont aucun appelant) : on peut le supprimer sans rien casser.
- À la place, 28 appels `referenceData.findMany` sont écrits en ligne dans 9 fichiers.
- `app/forum/new-tournament/page.tsx:43-49` et `app/forum/edit-tournament/[id]/page.tsx:64-70` répètent le même bloc de 7 requêtes.
- `getReferenceDataAction` (`app/profile/actions.ts:198`) est une action publique qui accepte n'importe quel nom de groupe.

## Action

- Choisir avec le user : supprimer `lib/referenceData.ts`, ou en faire le seul accès à la table (par exemple une fonction « listes du formulaire de tournoi » qui fait les 7 requêtes en un appel).
- Dans le second cas, remplacer les 28 appels en ligne (lister les 9 fichiers d'abord) ; rattacher les listes du tournoi au fichier créé par la carte 201.
- Limiter `getReferenceDataAction` aux groupes réellement utilisés par le profil.
- Mettre à jour les fiches concernées (`tournois`, `profil-membres`, `ligues-carte`).

## Résultat

Choix fait en autonomie, à la demande du user : `lib/referenceData.ts` devient le seul accès en lecture à la table, plutôt que d'être supprimé. Il offre `getReferenceData(groupe)`, `getReferenceLists(groupes)` (plusieurs groupes en une seule requête), `getTournamentFormLists` (les sept listes du formulaire de tournoi), `getLigueFormLists` (les trois listes du formulaire de ligue), `getReferenceLabel` et `listAllReferenceData` (onglet d'administration). Les groupes sont typés (`ReferenceGroup`).

Toutes les lectures écrites en ligne sont remplacées : création et modification d'un tournoi (le bloc de 7 requêtes devient une seule requête), création et modification d'une ligue, liste des ligues, page d'une ligue, annuaire des membres, page des tournois, liste de l'administration. Il ne reste aucune lecture de la table hors de ce fichier ; les écritures (ajout, modification, suppression) restent dans `app/administration/actions.ts`, réservées aux administrateurs.

L'action publique `getReferenceDataAction` (`app/profile/actions.ts`) n'accepte plus que `COACH_REGION`, le seul groupe que le profil et l'inscription demandent ; un autre nom de groupe reçoit une liste vide. Elle ne renvoie que la clé et le libellé.

Fiches `tournois`, `profil-membres` et `ligues-carte` à jour. `corepack pnpm check` passe. Le test de parcours n'a pas pu être lancé (serveur de développement PID 17136 resté ouvert).

À essayer à la main : ouvrir la création et la modification d'un tournoi et d'une ligue (les listes déroulantes sont remplies) ; filtrer `/tournois` par région ; choisir sa région dans son profil.
