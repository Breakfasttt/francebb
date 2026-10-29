# BBQuizz

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Un mini-jeu de culture Blood Bowl : 20 questions à choix multiple (règles, équipes, positionnels, Star Players, compétences), avec un chronomètre et trois jokers. Les scores alimentent un classement du jour, de la semaine et de tous les temps. Les coachs peuvent proposer des questions, que les modérateurs valident.

## Ce que voit le coach

- `/bbquizz` : le jeu et, à côté, le classement. Pour chaque question : 5 secondes de lecture, puis 30 secondes pour répondre, puis l'explication. Jokers : « 50/50 » (retire deux mauvaises réponses), « appel à la communauté » (pourcentages des réponses), « passer ». Réservé aux membres connectés.
- `/bbquizz/proposer` : un membre propose une question (catégorie, 4 réponses, la bonne, une explication).
- `/bbquizz/valider` : un modérateur accepte ou refuse les propositions en attente.
- `/bbquizz/editer` : un modérateur modifie ou supprime les questions existantes.
- Ces trois pages s'ouvrent depuis l'écran d'accueil du jeu (`QuizEngine`).
- **Sur téléphone** : sous 768 pixels, le classement passe sous le jeu, les quatre réponses s'empilent sur une colonne avec des boutons d'au moins 48 pixels de haut, les titres rapetissent. Dans les pages de gestion, les boutons d'action prennent toute la largeur. Pas de colonne latérale à déplacer ni de filtre, donc pas besoin de `MobilePortal`. Le classement reste en bas de page : sur téléphone, il faut faire défiler toute la partie pour le voir. Lisibilité des 7 thèmes et taille des boutons de joker : à vérifier.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/bbquizz/page.tsx` | Page du jeu, envoie le visiteur vers la connexion (`/auth/login`) |
| `apps/site/app/bbquizz/component/QuizEngine/QuizEngine.tsx` | Affichage d'une partie : chronomètres, jokers, score ; il ne fait qu'afficher ce que renvoie le serveur |
| `apps/site/lib/quizGame.ts` | Règles côté serveur : tirage équilibré des questions, lecture d'une question, temps restant et points |
| `apps/site/app/bbquizz/component/QuizLeaderboard/QuizLeaderboard.tsx` | Classement (jour, semaine, tout temps) |
| `apps/site/app/bbquizz/component/QuizForm/QuizForm.tsx` | Formulaire de question, partagé par proposer et éditer |
| `apps/site/app/bbquizz/proposer/`, `valider/`, `editer/` | Pages de proposition, de validation et d'édition (`page.tsx` serveur + `*Content.tsx` client) |
| `apps/site/app/bbquizz/actions.ts` | Actions serveur |
| `apps/site/app/bbquizz/data/questions.ts` | Questions de départ : insérées par `prisma/firstSetup.ts`, et utilisées si la base est vide |
| `apps/site/app/bbquizz/utils.ts` | `translateCategory` : nom français d'une catégorie |

Actions serveur (`app/bbquizz/actions.ts`) : `startQuizGame`, `getQuizQuestion`, `answerQuizQuestion`, `skipQuizQuestion`, `applyQuizFiftyFifty`, `applyQuizCommunity` (une partie), `getQuizLeaderboard`, `suggestQuizQuestion` (membres) ; `getQuizSuggestions`, `handleQuizSuggestion`, `getAllQuizQuestions`, `updateQuizQuestion`, `deleteQuizQuestion` (modérateurs).

## Les pièges

- **La partie est tenue par le serveur** (carte 051), pour empêcher la triche. Le navigateur ne reçoit qu'une question à la fois, sans la bonne réponse ni l'explication ; elles ne sont révélées qu'après la réponse. Le serveur note l'heure d'envoi de chaque question et calcule lui-même les points (100 plus le bonus de rapidité, ou -25), puis enregistre le score final. Ne jamais renvoyer `correctIndex` ou `explanation` au navigateur avant la réponse, ni accepter un score venu du navigateur. Un test e2e le vérifie (`tests/e2e/security.spec.ts`).
- La partie en cours est une ligne de la table `QuizGame` (une seule par membre, supprimée quand le résultat passe dans `QuizAttempt`). Chaque réponse fait avancer la partie seulement si elle en est encore à la question attendue : répondre deux fois ou rejouer une ancienne réponse ne compte pas.
- Le chronomètre affiché dans le navigateur n'est qu'un affichage : c'est l'heure du serveur qui compte, avec 3 secondes de marge pour le trajet réseau. Une réponse arrivée trop tard compte comme fausse.
- Le joker « appel à la communauté » lit les compteurs `timesOption0` à `3` de la question, augmentés à chaque réponse depuis la carte 051. Sans aucune réponse enregistrée (ou pour les questions de départ hors base), il affiche 25 % partout.
- La série (`quizStreak`) est affichée dans le classement mais jamais mise à jour.
- `updateQuizQuestion` reçoit `data: any`.
- Les pages `/bbquizz/valider` et `/bbquizz/editer` utilisent encore `auth()` au lieu de `getActiveSession()`.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Partie (*attempt*) | Une session de 20 questions ; enregistrée avec score, bonnes réponses et durée. |
| Partie en cours (`QuizGame`) | Partie pas encore finie, gardée en base par le serveur : questions tirées, question en cours, heure d'envoi, score, jokers utilisés. |
| Joker | Aide utilisable une fois par partie : 50/50, appel à la communauté, passer. |
| Proposition (*suggestion*) | Question envoyée par un membre, en attente (`PENDING`) jusqu'à acceptation ou refus par un modérateur. |
| Panthéon / classement | Les 10 meilleurs : meilleur score de tous les temps, ou meilleure partie du jour ou de la semaine. |
| Pioche équilibrée | Les questions sont tirées à tour de rôle dans chaque catégorie, pour ne pas avoir 20 questions du même thème. |

## État

- Marche : partie complète, classements, proposition, validation, édition.
- Marche aussi depuis la carte 051 : score calculé par le serveur, réponses cachées jusqu'à la réponse, adresse de connexion corrigée, compteurs du joker communauté.
- Manque : série (`quizStreak`).
- Cartes ouvertes : 049 (audit mobile). Aucune carte dédiée.
