---
id: 178
title: "Reprendre les données utiles de la bêta dans la nouvelle base"
epic: E10
app: site
depends_on: []
adr: 0004
verify: "le script de reprise, lancé sur une base Postgres vide et à jour de ses migrations, y copie les membres et les données utiles du backup de l'ancienne production ; les comptes et les archives du classement sont présents ; aucun message privé ni message du forum n'est copié ; le script est rejouable sans créer de doublon"
---

# 178 — Reprendre les données utiles de la bêta dans la nouvelle base

## Pourquoi

L'ancienne production (base SQLite chez Turso) a été arrêtée le 4 novembre 2026. Le responsable en a récupéré une copie : `docs/backup-db/bbfrance-db-backup-20261104.db` (fichier ignoré par git, à ne jamais commiter : il contient des données personnelles).

L'ADR-0004 prévoyait de repartir d'une base vide. Décision du responsable (4 novembre 2026) : repartir d'une base Postgres neuve, mais y reprendre ce qui est utile et les membres ; pas les messages privés.

## Ce qui est repris

- Les membres (`User`) et leurs liaisons Discord ou Google (`Account`), pour qu'ils retrouvent leur compte en se reconnectant ; leurs rôles et leur bannissement éventuel.
- Les rôles (`RoleConfig`), les réglages du site (`SiteSetting`), les données de référence (`ReferenceData`).
- Les ligues (avec leurs membres et commissaires), les ressources et leurs étiquettes, les articles (avec leurs étiquettes et réactions).
- Les archives du classement (`RankingArchive`).
- Les données du quiz ne font plus partie de cette carte depuis la carte 180 : ses tables et les colonnes de scores des membres ont quitté la base du site, et elles sont reprises dans la base de l'application BBQuizz par `apps/bbquizz/scripts/import-beta-backup.ts` (procédure « Étape 5 quater » de `DEPLOY.md`).
- Les schémas BBScheme ne font plus partie de cette carte depuis la carte 179 : leur table a quitté la base du site, et ils sont repris dans la base de l'application BBScheme par `apps/bbscheme/scripts/import-beta-backup.ts` (procédure « Étape 5 ter » de `DEPLOY.md`).

## Ce qui n'est pas repris

Les messages privés et les conversations ; les sujets et messages du forum de la bêta, et ce qui en dépend (le tournoi, attaché à un sujet, ses inscriptions, les réactions, mentions et lectures) ; le journal de modération et les signalements ; les sessions et jetons de connexion ; les parties de quiz.

## Action

1. Comparer les colonnes de chaque table reprise entre le backup (SQLite) et le schéma actuel (`apps/site/prisma/schema.prisma`) : colonnes ajoutées depuis (valeurs par défaut), supprimées, renommées, types (dates, booléens SQLite).
2. Écrire `apps/site/scripts/import-beta-backup.ts` : lit le backup en lecture seule, écrit dans la base désignée par `DATABASE_URL` avec des `upsert` (rejouable), dans l'ordre des dépendances. Les données de référence et les rôles déjà créés par `firstSetup` ne sont pas dupliqués. Résumé affiché à la fin : nombre de lignes lues, créées et mises à jour par table.
3. Le tester sur une base Postgres locale **à part**, vide et à jour de ses migrations (jamais sur la base de développement ni la production).
4. En production : seulement par le responsable, ou avec son accord exprès, sur la nouvelle base Neon (carte 047), après ses migrations et `firstSetup`. Procédure écrite dans `DEPLOY.md`.
5. Supprimer le script après la reprise en production.

## Résultat

Le script `apps/site/scripts/import-beta-backup.ts` lit la sauvegarde avec le module SQLite intégré à Node (`node:sqlite`), ouvert en lecture seule : aucune bibliothèque n'a été ajoutée. Il écrit dans la base désignée par `DATABASE_URL`, en gardant les identifiants d'origine : une ligne absente est créée, une ligne présente n'est mise à jour que si ses valeurs diffèrent, et rien n'est jamais supprimé. Les dates (texte ou millisecondes) et les booléens (0 ou 1) de SQLite sont convertis.

Différences de colonnes traitées : chez les membres, la colonne `notifMention`, disparue, est ignorée ; `autoFollowTopics` et `forumReadAllAt` prennent leur valeur par défaut ; comme pour la migration de la carte 078, tous les membres passent au thème « vestiaire » et leur ancien thème est rangé dans `previousTheme`. Quand une donnée existe déjà sous la même clé naturelle avec un autre identifiant (rôle, donnée de référence, question du quiz, archive d'une même année, schéma de même empreinte, étiquette de même nom), la version déjà en base, en général celle de `firstSetup`, est gardée et la ligne de la sauvegarde est comptée comme ignorée. Les champs facultatifs qui pointeraient vers une donnée non reprise sont vidés ; une ligne dont un champ obligatoire pointe vers une donnée non reprise est ignorée.

Essai le 4 novembre 2026 sur une base Postgres locale à part (`import-test`, ajoutée à `scripts/local-postgres.mjs`, puis arrêtée et effacée), après `prisma migrate deploy` et `firstSetup` :

- Premier passage : 16 membres (15 créés, le membre « Système » de `firstSetup` mis à jour), 14 liaisons Discord ou Google, 3 ligues avec 3 membres et 1 commissaire, 3 ressources, 1 article avec son étiquette et 3 réactions, 14 archives du classement, 13 schémas BBScheme, 1 donnée de référence et 41 questions du quiz créées. Les 6 rôles et les 6 réglages du site étaient identiques à ceux de `firstSetup`. 139 données de référence et 299 questions du quiz étaient déjà créées par `firstSetup` et n'ont pas été dupliquées (2 de ces questions avaient un texte identique mais d'autres valeurs : la version de `firstSetup` est gardée, et les compteurs de réponses de la bêta ne sont pas repris).
- Second passage : aucune création ni mise à jour, toutes les lignes reprises sont « inchangées ».
- Comptes vérifiés dans la base : 16 membres, 14 liaisons, 14 archives, 340 questions, 13 schémas ; aucun message privé, conversation, sujet, message du forum, tournoi, journal de modération, session ni partie de quiz.

Mise à jour par la carte 179 : la partie BBScheme a été retirée du script (les 13 schémas sont repris par le script de l'application BBScheme). Les chiffres ci-dessus datent d'avant ce retrait.

Mise à jour par la carte 180 : la partie quiz a été retirée du script (questions, et colonnes `quizTotalScore`, `quizBestScore`, `quizStreak`, `quizAttemptsCount` des membres). Les 340 questions, les 7 parties terminées et les scores de 4 joueurs sont repris par le script de l'application BBQuizz. Les chiffres ci-dessus sur les questions datent d'avant ce retrait.

Reste à faire : la reprise en production sur la nouvelle base Neon (carte 047), par le responsable ou avec son accord, selon la procédure « Étape 5 bis » de `DEPLOY.md`, puis la suppression du script.
