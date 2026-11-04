# BBQuizz — application du quiz

BBQuizz est le quiz de culture Blood Bowl de Blood Bowl France : 20 questions à choix multiple, un chronomètre, trois jokers, et des classements du jour, de la semaine et de tous les temps. Les coachs peuvent proposer des questions, que les modérateurs valident.

Depuis la carte 180 (décision ADR-0008), BBQuizz est une application à part dans le dépôt, avec sa propre base de données Postgres. Le site n'a plus de page, de menu ni de tuile vers le quiz : son ancienne adresse `/bbquizz` donne la page introuvable.

## État : en attente

- Le quiz ne tourne pas : son code est rangé dans `quiz-en-attente/` (voir son `README.md`), en attendant une relance qui le branchera aussi sur le hub de connexion.
- L'application sert seulement une page d'accueil « Le quiz revient bientôt ».
- Les données sont gardées dans la base de l'application : les questions, les parties terminées, les gagnants du jour, les propositions en attente, et les scores des joueurs (table `QuizPlayerStats`, qui reprend les quatre colonnes `quizTotalScore`, `quizBestScore`, `quizStreak` et `quizAttemptsCount` retirées de la fiche des membres du site).
- **Points à traiter à la relance** :
  - quand un membre supprime son compte, le site ne peut plus effacer ses parties, ses propositions et ses scores, qui sont dans cette base. L'application devra écouter l'événement de suppression de compte envoyé par le hub et effacer (ou rendre anonymes) les lignes de ce membre ;
  - de même, l'export des données d'un membre (droit d'accès du RGPD) ne contient plus ses données de quiz : l'application devra les fournir au hub.

## La base de données

| Table | Contenu |
|---|---|
| `QuizQuestion` | Les questions : catégorie, texte, quatre réponses (texte JSON), indice de la bonne, explication, compteurs de réponses |
| `QuizAttempt` | Les parties terminées : joueur, score, bonnes réponses, durée, jokers utilisés |
| `QuizGame` | La partie en cours d'un joueur, tenue par le serveur pour empêcher la triche |
| `QuizDailyWinner` | Le meilleur joueur de chaque jour |
| `QuizQuestionSuggestion` | Les questions proposées par les membres, en attente de validation |
| `QuizPlayerStats` | Les scores de chaque joueur qui a déjà joué : total, meilleur score, série, nombre de parties |

Un membre est désigné par son identifiant (celui du site, puis celui du hub à la relance) : cette base n'a pas de table de membres.

## Lancer l'application en local

Depuis `apps/bbquizz` :

1. `cp .env.example .env` (rien à remplir en local) ;
2. `pnpm db:start` : démarre la base locale `bbquizz` (Postgres lancé par `prisma dev`, sans Docker) et écrit son adresse dans `.env.local` ;
3. `pnpm db:generate` puis `npx prisma migrate deploy` : crée le client Prisma et les tables ;
4. facultatif : `BBQUIZZ_DATABASE_URL="$(node ../../scripts/local-postgres.mjs url bbquizz)" npx tsx scripts/import-beta-backup.ts ../../docs/backup-db/bbfrance-db-backup-20261104.db` reprend les données du quiz de l'ancienne production (la sauvegarde n'est pas dans git) ;
5. `pnpm dev` : l'application répond sur http://localhost:4200.

## Relancer le quiz

Voir `quiz-en-attente/README.md` : déplacer les fichiers dans `app/`, remplacer ce que le quiz empruntait au site, brancher le hub, adapter le code à la table `QuizPlayerStats`, puis rebrancher les tests.
