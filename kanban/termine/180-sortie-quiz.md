---
id: 180
title: "Sortir le quiz et ses données du site"
epic: E07
app: bbquizz
depends_on: [179]
adr: 0008
verify: "apps/bbquizz contient le code du quiz et sa propre base, remplie par le script de reprise ; les tables et colonnes du quiz n'existent plus dans la base du site ; le site n'a plus aucune page ni lien vers le quiz ; pnpm check et le parcours de fin de carte passent"
---

# 180 — Sortir le quiz et ses données du site

## Pourquoi

Décision ADR-0008 : le quiz quitte le site pour une application à part, avec sa propre base, mise en attente jusqu'à sa relance.

## Action

1. **Application `apps/bbquizz`** : code du quiz déplacé (`git mv`) depuis `apps/site/app/bbquizz/` et `apps/site/lib/quizGame.ts`, avec ses tests ; base propre (base locale `bbquizz`) avec les cinq modèles du quiz et une table `QuizPlayerStats` qui reprend les quatre colonnes du quiz des membres. Le code reste en attente (non servi) ; un README liste ce qu'il empruntait au site et ce qu'il faudra remplacer pour le relancer.
2. **Données** : script de reprise des questions (et des scores) du backup de l'ancienne production vers la base de l'application ; la partie quiz du script de la carte 178 est retirée.
3. **Site** : tables du quiz et colonnes `quiz*` des membres retirées par une migration ; plus aucune page, lien, tuile ni chargement des questions dans `firstSetup.ts` (accord du responsable donné avec l'ADR-0008) ; suppression de compte, export des données du membre et tests mis à jour ; carte 143 (`quizStreak`) annulée.
4. **Documents** : fiche du quiz déplacée dans l'application, `ARCHITECTURE.md`, `README.md`, glossaire, registre RGPD si le quiz y figure.

## Résultat

**Application `apps/bbquizz`** (paquet `@bbfrance/bbquizz`, port 4200), calquée sur `apps/bbscheme` : `package.json` (scripts `dev`, `build`, `start`, `typecheck`, `db:start`, `db:generate`, `vercel-build`), `next.config.ts` avec les en-têtes de sécurité du hub, base Postgres propre (`BBQUIZZ_DATABASE_URL`, base locale `bbquizz` ajoutée à `scripts/local-postgres.mjs`), client Prisma généré hors de git. La page d'accueil dit « Le quiz revient bientôt ». `CLAUDE.md` et `README.md` expliquent son rôle, son état et comment la lancer.

**Base de l'application** : les cinq tables du quiz reprises du site (`QuizQuestion`, `QuizAttempt`, `QuizGame`, `QuizDailyWinner`, `QuizQuestionSuggestion`), où un membre n'est plus qu'un identifiant texte (`userId`, `authorId`), sans relation ; et une table `QuizPlayerStats` (clé `userId`, `totalScore`, `bestScore`, `streak`, `attemptsCount`, `updatedAt`) qui reprend les quatre colonnes du quiz de la fiche des membres. Migration initiale `20261105110000_init`, créée par `prisma migrate diff --from-empty` et appliquée sur la base locale `bbquizz`.

**Code en attente** : la page, les actions serveur, les composants, les pages proposer, valider et éditer, `utils.ts`, les questions de départ (`data/questions.ts`) et `lib/quizGame.ts` sont déplacés par `git mv` dans `apps/bbquizz/quiz-en-attente/`, exclu des pages servies et de la vérification des types. Les tests y sont aussi : `tests/bbquizz.spec.ts` (déplacé) et `tests/quiz-security.spec.ts` (la partie quiz de `security.spec.ts`, cartes 051 et 143, copiée telle quelle avec un nouvel en-tête et ses chemins d'import). Son `README.md` liste ce que le quiz empruntait au site (`@/lib/prisma`, `authGuard`, `roles`, `actionResult`, `ComposeScreen`, `ComposeActionBar`, `ForumListHeader`) et ce qu'il faudra adapter à la relance (lecture et écriture des scores dans `QuizPlayerStats` au lieu de `prisma.user`, nom et avatar des joueurs à demander au hub, suppression de compte et export des données par le hub).

**Données** :
- Base de développement du site : 299 questions (celles de `firstSetup`), aucune partie, proposition, gagnant du jour ni score de membre. Transfert vers la base locale `bbquizz` par un script ponctuel (supprimé ensuite) : les 299 questions y étaient déjà sous le même texte (clé naturelle), rien n'a été dupliqué.
- `apps/bbquizz/scripts/import-beta-backup.ts` lit la sauvegarde du 4 novembre 2026 en lecture seule (`node:sqlite`). Premier passage sur la base locale : 340 questions lues, 339 créées, 1 ignorée (texte en double dans la sauvegarde) ; 7 parties terminées créées ; 4 joueurs avec des scores créés dans `QuizPlayerStats` ; aucun gagnant du jour ni proposition (tables vides) ; la sauvegarde n'a pas de table `QuizGame`. Second passage : tout « inchangé ». Base locale `bbquizz` : 339 questions, 7 parties, 4 joueurs.
- La partie quiz du script de la carte 178 est retirée (table `QuizQuestion` et colonnes `quiz*` des membres) ; carte 178 et étape 5 bis de `DEPLOY.md` mises à jour.

**Site** : retirés l'entrée « Quizz » du menu (et l'icône devenue inutile), les adresses du quiz de `isComposePath`, la tuile de l'accueil, le chargement des questions dans `prisma/firstSetup.ts` (accord du responsable), les lignes du quiz de `lib/accountDeletion.ts` et `lib/hub/memberExport.ts` (l'export ne contient plus les parties de quiz), la mention « scores du quiz » de `app/mentions-legales/page.tsx` (fichier de la session RGPD, seule cette phrase change) et un commentaire de `lib/forumPostPrivacy.ts`. `/bbquizz` donne la page introuvable.

**Base du site** : migration `20261105120000_quiz_hors_du_site` écrite à partir de `prisma migrate diff --from-config-datasource` : uniquement la suppression des quatre clés étrangères, des cinq tables du quiz et des quatre colonnes `quizTotalScore`, `quizBestScore`, `quizStreak`, `quizAttemptsCount` de `User`. Appliquée en local, client régénéré, `CLIENT_VERSION` passé à `v27`. La série `quizStreak`, que la carte 143 laissait à décider, n'existe plus dans le site : la question passe à la relance du quiz (`QuizPlayerStats.streak`).

**Tests du site** : retirés les adresses du quiz et la proposition de test de `mobile-audit.spec.ts`, `/bbquizz` de `parcours.spec.ts`, la tuile de `accueil.spec.ts`, « Quizz » des menus de `coquille.spec.ts`, la partie quiz de `security.spec.ts`, le repère `quizTotalScore` de `articles-membres.spec.ts` (colonne disparue). Ajouté dans `smoke.spec.ts` : « l'ancienne adresse du quiz /bbquizz donne la page introuvable ». Lancés : `pnpm check` (tout correct, avec la nouvelle application), parcours de fin de carte (vert), `smoke.spec.ts` (55 réussis ; « créer une ligue sans nom » a échoué par lenteur du serveur, comme à la carte 179, et passe seul), `coquille.spec.ts` et `accueil.spec.ts` (25 réussis, après une coupure de la base de test locale qu'il a fallu recréer). `mobile-audit.spec.ts` et `security.spec.ts` n'ont pas été relancés (seuls des morceaux du quiz y ont été retirés). `pnpm build` de l'application passe.

**Vérifications automatiques** : `apps/bbquizz` ajoutée à `scripts/check.mjs` et à la CI (génération du client, contrôle des migrations ; types et build passent par turbo). Le code du quiz n'avait aucune erreur ESLint : le plafond du site reste à 203.

**Documents** : fiche `docs/features/bbquizz/README.md` (« application à part, en attente »), `ARCHITECTURE.md`, `README.md`, `apps/site/CLAUDE.md`, `DEPLOY.md` (étape 5 quater : base de l'application et reprise des données avant la migration du site), glossaire, registre RGPD (traitement du site : le quiz retiré du but, une phrase sur ses données gardées à part), skill `mobile-ux`, fiches pages diverses (la liste « Débuter » ne citait plus ni le quiz ni BBScheme à jour) et profil des membres, notes dans `docs/refonte/inventaire.md` et `docs/refonte/tests-manuels.md`, carte 178.

Reste à faire : la base de l'application en ligne et la reprise des données en production avant le déploiement de la migration du site (étape 5 quater de `DEPLOY.md`) ; la relance du quiz, dans une carte à part (le hub devra alors prévenir l'application des suppressions de compte et recueillir ses données pour l'export).
