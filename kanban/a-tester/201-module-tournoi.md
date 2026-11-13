---
id: 201
title: "Tournois : droits, saisie et inscriptions regroupés dans un seul fichier"
epic: E12
app: site
depends_on: [198]
adr: 0004
verify: "la règle « organisateur, commissaire ou modérateur » et la règle du paiement n'existent plus qu'à un seul endroit de lib/ ; la création et la modification d'un tournoi lisent le formulaire avec la même fonction (mêmes valeurs par défaut pour gameEdition et platform) ; toggleMercenary s'exécute sous le verrou des inscriptions ; les actions de app/tournois/actions.ts renvoient toutes un ActionResult ; des tests couvrent l'inscription, la liste d'attente et le changement de format ; corepack pnpm check et pnpm --filter @bbfrance/site test:parcours passent ; formulaire et inscription vérifiés en 360 pixels de large"
---

# 201 — Tournois : droits, saisie et inscriptions regroupés dans un seul fichier

## Pourquoi

La logique des tournois est dispersée dans au moins sept fichiers, dont environ 670 lignes dans `app/forum/actions.ts` (`createTopic` 460-638, `updateTournament` 1482-1682, inscriptions et équipes 1685-2150).

- **La règle « organisateur, commissaire ou modérateur » est recopiée 12 fois** :
  - `app/forum/actions.ts` : 1493, 2065, 2128 ;
  - `app/tournois/actions.ts` : 33, 72, 116, 152, 357, 395 ;
  - `app/forum/edit-tournament/[id]/page.tsx:51` ;
  - `app/forum/tournament/[id]/results/page.tsx:44` (la variable s'y appelle `isSuperAdmin` mais contient `isModerator`) ;
  - `app/forum/topic/[id]/page.tsx:180`.
- **La règle du paiement** (organisateur ou commissaire, sans les modérateurs, carte 177) est recopiée 2 fois : `app/forum/actions.ts:2074` et `topic/[id]/page.tsx:184`.
- **Les quelque 40 champs du formulaire sont lus deux fois, et les copies ont divergé** (création lignes 540-581, modification 1553-1590, toutes deux typées `any`) :
  - `gameEdition` vaut `"BB2025"` par défaut à la création (563), mais n'a pas de valeur par défaut à la modification (1578) ;
  - même écart pour `platform` (564 contre 1579) ;
  - la conversion de l'adresse en coordonnées (géocodage par le service Nominatim, lignes 524-538) n'existe qu'à la création ;
  - le calcul des jours est recopié (510-511 et 1530-1531).
- **Trois façons de signaler une erreur** cohabitent dans `app/tournois/actions.ts` : `null`, `{ error }` et `{ success: true }`, contrairement à la règle `ActionResult` d'ARCHITECTURE.md.
- **L'ordre réel des inscriptions n'est pas testé.** Cet ordre est : verrou des inscriptions, puis statut, puis promotion depuis la liste d'attente, puis notifications. Il vit dans les actions serveur, sans test, et seules les petites fonctions sans import sont testées. Exemple : `toggleMercenary` (1804-1840) vérifie et écrit **hors du verrou**, alors que `createTeam` lit les mercenaires sous le verrou (1879).

## ADR-0004

ADR-0004 dit « Le code ne change pas de place ». Cette phrase concerne la création des fiches de fonctionnalité (`docs/features/`) : on documente sans réorganiser les dossiers. Sortir le tournoi d'`app/forum/actions.ts` vers `lib/` déplace du code. **Au démarrage de la carte, faire confirmer par le user que cela ne contredit pas l'ADR** ; sinon, passer par `/council`. ADR-0001 n'écarte que la sortie du tournoi dans une application séparée, ce qui n'est pas le cas ici.

## Action

- Créer dans `lib/` un fichier tournoi qui offre quelques fonctions : droits du membre sur un tournoi (gestion, paiement), lecture et validation du formulaire, création et modification, inscription, désinscription, équipes, mercenaires. Il reçoit le membre en paramètre et cache Prisma, le verrou, la liste d'attente et les notifications. Les fichiers `lib/tournament*Rules.ts` existants deviennent ses fonctions internes.
- Le géocodage devient une dépendance passée en paramètre, pour pouvoir la remplacer dans les tests ; l'appliquer aussi à la modification si le user le souhaite. Le même géocodage sert dans `app/ligues/actions.ts:12`.
- Faire appeler ce fichier par `app/forum/actions.ts`, `app/tournois/actions.ts` et les trois pages listées plus haut ; les actions ne gardent que la lecture de la session.
- Passer toutes les actions de tournoi au format `ActionResult` et adapter leurs appelants (les lister avant).
- Mettre `toggleMercenary` sous le verrou des inscriptions.
- Écrire les tests au niveau de ces fonctions : inscription, liste d'attente, passage d'un format solo à un format par équipes, droits de paiement.
- Mettre à jour la fiche `tournois` et vérifier en 360 pixels de large le formulaire de tournoi et l'inscription.

## Résultat

ADR-0004 : sa phrase « Le code ne change pas de place » porte sur la création des fiches de fonctionnalité (point 2 de l'ADR), pas sur l'emplacement du code. Sortir des règles de tournoi vers `lib/` ne la contredit donc pas. Décision prise en autonomie, à la demande du user, sans passer par `/council`.

Ce qui est fait :

- **Droits regroupés.** `lib/tournamentRights.ts` offre `canManageTournament` (organisateur, commissaire ou modérateur), `canManagePayments` (organisateur ou commissaire, carte 177) et `isTournamentStaff`. Les douze copies de la règle de gestion et les deux copies de la règle du paiement sont remplacées : `app/forum/actions.ts` (modification du tournoi, statut d'une inscription, journal), `app/tournois/actions.ts` (six actions), pages de modification, de résultats et du sujet. Testé par `tests/unit/tournamentRights.test.mjs`.
- **Une seule lecture du formulaire.** `lib/tournamentForm.ts` (`readTournamentForm`) lit et valide le formulaire pour la création (`createTopic`) et la modification (`updateTournament`), qui n'ajoutent que ce qui leur est propre (organisateur, statut CDF, commissaires). Conséquences : l'édition du jeu et la plateforme ont la même valeur par défaut des deux côtés (« BB2025 », « Tabletop »), et une modification sans coordonnées fait aussi chercher l'adresse. Le géocodage (`geocodeAddress`, `withCoordinates`) reçoit la fonction d'appel au réseau en paramètre ; il est testé avec un faux appel. Les champs de texte vides valent maintenant `null` au lieu d'une chaîne vide. Testé par `tests/unit/tournamentForm.test.mjs`. Les deux objets d'écriture sont typés (`Prisma.TournamentUncheckedCreateInput` et `…UpdateInput`) au lieu de `any`.
- **Verrou.** `toggleMercenary` vérifie et écrit sous le verrou des inscriptions, dans une transaction, comme `createTeam`.
- **ActionResult.** Les sept actions de `app/tournois/actions.ts` qui modifient des données (terminer, rouvrir, annuler, rétablir, enregistrer ou vider les résultats, valider pour la CDF) renvoient toutes `{ success, error }`, avec un message en français. Les outils du sujet affichent maintenant le refus, qui passait inaperçu, et le panneau de validation CDF est adapté. `parseNafReport` reste une lecture, qui renvoie `null` en cas d'échec.
- **Tests des inscriptions.** `tests/unit/tournamentRegistrations.test.mjs` (carte 198) vérifie la pré-inscription, la liste d'attente et la montée du plus ancien.

Ce qui n'est pas fait, et reste à découper dans une carte suivante : le déplacement complet de la création, de la modification, de l'inscription et des équipes dans un seul fichier de `lib/` (le code reste dans `app/forum/actions.ts`, qui appelle les nouveaux fichiers) ; le test du passage d'un format solo à un format par équipes (la règle `formatChangeLossCount` était déjà testée, l'action entière demande une base) ; le géocodage partagé avec `app/ligues/actions.ts`. Le test de parcours et la vérification à 360 pixels du formulaire et de l'inscription n'ont pas pu être lancés : le serveur de développement resté ouvert (PID 17136) bloque tout autre serveur.

Vérifications : `corepack pnpm check` passe (136 tests unitaires). Fiche `tournois` à jour.

À essayer à la main : modifier un tournoi sans toucher à l'édition du jeu (elle vaut « BB2025 ») ; terminer un tournoi en tant que simple coach inscrit, en appelant l'outil (refus affiché) ; devenir mercenaire puis se retirer.
