# BBQuizz, application à part, en attente

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Un mini-jeu de culture Blood Bowl : 20 questions à choix multiple (règles, équipes, positionnels, Star Players, compétences), avec un chronomètre et trois jokers. Les scores alimentent un classement du jour, de la semaine et de tous les temps. Les coachs peuvent proposer des questions, que les modérateurs valident.

Depuis la carte 180 (décision ADR-0008), le quiz n'est plus dans le site : c'est l'application `apps/bbquizz`, avec sa propre base de données. Elle est **en attente** : le quiz ne tourne pas, son code est rangé dans `apps/bbquizz/quiz-en-attente/` (son `README.md` explique comment le relancer). Les questions, les parties et les scores sont gardés dans la base de l'application.

## Ce que voit le coach

- Plus d'entrée « Quizz » dans le menu du site, ni de tuile sur l'accueil. L'ancienne adresse `/bbquizz` du site (et ses pages `/bbquizz/proposer`, `/valider`, `/editer`) donne la page introuvable.
- L'adresse de l'application (port 4200 en local) n'affiche qu'une page « Le quiz revient bientôt », lisible sur téléphone (texte de 18 pixels, largeur limitée à l'écran).

## Comment le quiz fonctionnait (à garder pour la relance)

- `/bbquizz` : le jeu et le classement (onglets « Du jour », « Semaine », « Panthéon »). Pour chaque question : 5 secondes de lecture, puis 30 secondes pour répondre, puis les points gagnés ou perdus et l'explication. Jokers, une fois chacun par partie : « 50/50 », « Communauté » (pourcentage des réponses déjà données), « Passer ». Réservé aux membres connectés.
- `/bbquizz/proposer` (membres), `/bbquizz/valider` et `/bbquizz/editer` (modérateurs, menu « Gestion du quizz »).
- **Sur téléphone** : pendant une partie, le titre et le classement sont masqués pour que la question, le chronomètre, le score, les quatre réponses (56 pixels de haut au moins) et les jokers tiennent dans l'écran sans défiler. La proposition et l'édition des questions sont des écrans plein écran, sans la barre du bas.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/bbquizz/app/page.tsx` | Page d'attente « Le quiz revient bientôt » |
| `apps/bbquizz/prisma/schema.prisma` | Base de l'application : les cinq tables du quiz et `QuizPlayerStats` (les scores des joueurs) ; un membre n'y est qu'un identifiant |
| `apps/bbquizz/scripts/import-beta-backup.ts` | Reprise des données du quiz de l'ancienne production (sauvegarde du 4 novembre 2026) |
| `apps/bbquizz/quiz-en-attente/` | Le code du quiz, non servi : page, actions serveur, règles du jeu (`lib/quizGame.ts`), composants, questions de départ, tests |
| `apps/bbquizz/quiz-en-attente/README.md` | Ce que le quiz empruntait au site et comment le relancer |
| `apps/site/tests/e2e/smoke.spec.ts` | Vérifie que `/bbquizz` donne la page introuvable dans le site |

## Les pièges (pour la relance)

- **La partie est tenue par le serveur** (carte 051), pour empêcher la triche. Le navigateur ne reçoit qu'une question à la fois, sans la bonne réponse ni l'explication ; le serveur note l'heure d'envoi de chaque question et calcule lui-même les points (100 plus le bonus de rapidité, ou -25). Ne jamais renvoyer `correctIndex` ou `explanation` au navigateur avant la réponse, ni accepter un score venu du navigateur. Les tests de sécurité correspondants sont dans `quiz-en-attente/tests/quiz-security.spec.ts`.
- La partie en cours est une ligne de `QuizGame` (une seule par membre). Une réponse ne compte que si la partie en est encore à la question attendue. Le chronomètre du navigateur n'est qu'un affichage : c'est l'heure du serveur qui compte, avec 3 secondes de marge.
- **Les propositions et les modifications sont contrôlées par le serveur** (carte 143) : champs non vides, bonne réponse entre 0 et 3, longueurs maximales. Une proposition approuvée deux fois ne crée pas de doublon (transaction).
- Les classements « Du jour » et « Semaine » commencent à minuit, **heure de Paris**, et la semaine **le lundi**.
- Les scores des joueurs ne sont plus sur la fiche des membres (le site a perdu ses colonnes `quiz*`) : le code en attente lit et écrit encore `prisma.user` et doit passer à `QuizPlayerStats`.
- **Données personnelles** : la suppression d'un compte et l'export des données d'un membre, faits par le site, ne touchent plus le quiz. À la relance, l'application devra écouter l'événement de suppression envoyé par le hub et fournir ses données à l'export.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Partie (*attempt*) | Une session de 20 questions ; enregistrée avec score, bonnes réponses et durée. |
| Partie en cours (`QuizGame`) | Partie pas encore finie, gardée en base par le serveur : questions tirées, question en cours, heure d'envoi, score, jokers utilisés. |
| Joker | Aide utilisable une fois par partie : 50/50, appel à la communauté, passer. |
| Proposition (*suggestion*) | Question envoyée par un membre, en attente (`PENDING`) jusqu'à acceptation ou refus par un modérateur. |
| Questions de départ | Environ 300 questions écrites dans `quiz-en-attente/data/questions.ts`, utilisées par le jeu quand la base n'a aucune question. Elles ne sont plus chargées par `firstSetup.ts` du site. |

## État

- Carte 180 : le quiz est sorti du site. Base de l'application remplie par la reprise de l'ancienne production : 339 questions (340 lues, un texte en double ignoré), 7 parties terminées, les scores de 4 joueurs. Les tables et les colonnes du quiz ont été retirées de la base du site par la migration `20261105120000_quiz_hors_du_site`.
- La série (`quizStreak`, devenue `QuizPlayerStats.streak`) était affichée mais jamais calculée : à décider à la relance.
- Reste à faire : mettre en ligne l'application et sa base, reprendre les données en production (`DEPLOY.md`), puis relancer le quiz dans une carte à part.
