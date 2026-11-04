---
id: 179
title: "Sortir l'éditeur BBScheme et ses schémas du site"
epic: E07
app: bbscheme
depends_on: []
adr: 0008
verify: "apps/bbscheme démarre seule avec sa base et répond à GET /api/boards/:id ; la table BBSchemeState n'existe plus dans la base du site ; un message du forum contenant [bbscheme] affiche le schéma quand l'application tourne, et « Schéma indisponible » quand elle est arrêtée ; menu, accueil et éditeur de messages n'ont plus d'accès à l'éditeur"
---

# 179 — Sortir l'éditeur BBScheme et ses schémas du site

## Pourquoi

Décision ADR-0008 : l'éditeur de schémas tactiques quitte le site pour une application à part, avec sa propre base. Le forum garde l'affichage des schémas déjà publiés.

## Action

1. **Application `apps/bbscheme`** (port 4100), calquée sur `apps/hub` : `package.json`, `next.config.ts`, base Postgres propre (`BBSCHEME_DATABASE_URL`, base locale `bbscheme` dans `scripts/local-postgres.mjs`), schéma Prisma avec le seul modèle `BBSchemeState` (le créateur devient un simple identifiant, sans lien avec la table des membres du site).
2. **Adresse de lecture** `GET /api/boards/[id]` : renvoie le schéma (données et disposition) par identifiant ou empreinte, sans donnée personnelle, avec un cache court.
3. **Éditeur déplacé, en attente** : le code de `apps/site/app/bbscheme/` et ce qui ne sert qu'à lui est déplacé (`git mv`) dans `apps/bbscheme/editeur-en-attente/`, hors des pages servies, avec un README qui explique comment le rebrancher (hub, carte 071).
4. **Site** : le widget lit les schémas par `BBSCHEME_URL` ; outil d'insertion et bouton « Ouvrir dans l'éditeur » masqués ; menu, tuile de l'accueil, mode plein écran, ressource système et bibliothèques de l'éditeur retirés ; table `BBSchemeState` retirée de la base du site par une migration, après transfert des schémas.
5. **Données** : script de reprise des schémas du backup de l'ancienne production vers la base de l'application ; la partie BBScheme du script de la carte 178 est retirée.
6. **Tests et documents** : tests du widget gardés et adaptés, tests de l'éditeur déplacés ; vérifications automatiques (`pnpm check`, CI) étendues à la nouvelle application ; fiches, `ARCHITECTURE.md`, `README.md`, `DEPLOY.md` (ordre de mise en ligne), glossaire.

## Résultat

**Application `apps/bbscheme`** (paquet `@bbfrance/bbscheme`, port 4100), calquée sur le hub : `package.json` (scripts `dev`, `build`, `start`, `typecheck`, `db:start`, `db:generate`, `vercel-build`), `next.config.ts` avec les en-têtes de sécurité du hub, base Postgres propre (`BBSCHEME_DATABASE_URL`, base locale `bbscheme` ajoutée à `scripts/local-postgres.mjs`), schéma Prisma avec le seul modèle `BBSchemeState` (le créateur est un simple identifiant, sans lien vers une table de membres), client généré hors de git, migration initiale `20261105090000_init` créée par `prisma migrate diff --from-empty`. La page d'accueil dit « BBScheme revient bientôt ». `CLAUDE.md` et `README.md` expliquent son rôle, son état et comment la lancer.

**Adresse de lecture** `GET /api/boards/[id]` : cherche par identifiant, puis par empreinte ; renvoie `{ "data": … }` (même forme que l'ancienne action `getBoardState`), jamais `creatorId`, avec `Cache-Control: public, max-age=60` ; 404 si le schéma est inconnu, 500 si la base ne répond pas.

**Éditeur en attente** : `page.tsx`, `actions.ts`, `component/`, le hook `usePinchZoom` (qui ne servait qu'à lui), `types/gifshot.d.ts` et ses tests déplacés par `git mv` dans `apps/bbscheme/editeur-en-attente/`, exclu des pages servies et de la vérification des types ; son `README.md` décrit la relance (carte 071). Le hook `useIsMobile` reste dans le site, où il est la règle documentée du seuil téléphone. `html2canvas` et `gifshot` sont passés du site à l'application.

**Site** : le lecteur lit un schéma par l'action serveur `getBoardState` de `app/bbschemeBoardActions.ts`, qui appelle `fetchBoardData` (`lib/bbschemeBoard.ts`) : identifiant vérifié, appel depuis le serveur de `BBSCHEME_URL/api/boards/<id>` avec un délai de 3 secondes, `null` pour toute panne. Le lecteur (`packages/bbscheme-player`) affiche alors « Schéma indisponible » (16 pixels) ; son bouton « Ouvrir dans l'éditeur » n'apparaît que si l'on donne la nouvelle propriété `editorUrl`, ce que le site ne fait pas. Retirés : l'outil « Schéma BBScheme » de l'éditeur de messages (la balise reste affichée), l'entrée de menu, la tuile de l'accueil, le mode plein écran de `/bbscheme`, la ressource système « bbscheme » (aucune ressource de ce nom n'existe, ni en base de développement ni dans la sauvegarde), la route de `scripts/baseline.mjs`. `/bbscheme` donne la page introuvable.

**Base du site** : migration `20261105100000_bbscheme_hors_du_site` (suppression de la contrainte et de la table `BBSchemeState`, rien d'autre), appliquée en local ; `CLIENT_VERSION` passé à `v26`. La suppression de compte ne vide plus le créateur des schémas : point à traiter à la relance, par l'événement de suppression du hub (noté dans les fiches). L'export des données d'un membre ne contenait pas les schémas.

**Données** : la base de développement du site ne contenait aucun schéma (transfert vérifié par un script ponctuel, supprimé). Le script `apps/bbscheme/scripts/import-beta-backup.ts` reprend les schémas de la sauvegarde : 13 lus et 13 créés au premier passage, 13 inchangés au second, 13 schémas en base. La partie BBScheme du script de la carte 178 est retirée.

**Tests** : un faux serveur BBScheme (`tests/e2e/fakeBbschemeServer.mjs`, lancé par `playwright.config.ts`, port 3199) sert le schéma de test ; le message de test contient aussi un schéma inconnu, qui doit afficher « Schéma indisponible ». Nouveaux tests : `tests/unit/bbschemeBoard.test.mjs` (5 tests), et dans `smoke.spec.ts` « Schéma indisponible » et la page introuvable de `/bbscheme`. Lancés : `pnpm check` (tout correct, avec la nouvelle application), parcours de fin de carte (vert), puis un par un `smoke.spec.ts` (52 réussis ; « créer une ligue sans nom » a échoué par lenteur du serveur et passe seul), `articles-membres.spec.ts` (11), `forum-editeur.spec.ts` (partie modifiée, 2), `forum-sujet.spec.ts` (lecteur, 2), `coquille.spec.ts` (7), `divers.spec.ts` (4), `accueil.spec.ts` (14 réussis ; le test de `/statistiques` cherche encore le texte « quota restant », retiré du site par la carte 171 : échec antérieur à cette carte). `mobile-audit.spec.ts` n'a pas été relancé (seules deux adresses de l'éditeur y ont été retirées).

**Vérifications automatiques** : `apps/bbscheme` ajoutée à `scripts/check.mjs` et à la CI (génération du client, contrôle des migrations ; types et build passent par turbo). Le hub n'étant pas dans le cliquet ESLint, l'application non plus. Plafond ESLint du site abaissé de 225 à 203 erreurs (le code de l'éditeur est parti).

**Documents** : fiches BBScheme (« application à part, en attente ») et forum, `ARCHITECTURE.md`, `README.md`, `DEPLOY.md` (étape 5 ter : application et base en ligne avant la migration du site, `BBSCHEME_URL`), glossaire, skills `reuse-first` et `mobile-ux`, `CLAUDE.md` du lecteur, cartes 071 (devient « relancer l'éditeur et le brancher sur le hub ») et 178.

Reste à faire : la mise en ligne de l'application et de sa base, puis la reprise des schémas en production (étape 5 ter de `DEPLOY.md`) ; le test sur un vrai téléphone du message « Schéma indisponible ».
