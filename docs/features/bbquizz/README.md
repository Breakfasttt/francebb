# BBQuizz

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Un mini-jeu de culture Blood Bowl : 20 questions à choix multiple (règles, équipes, positionnels, Star Players, compétences), avec un chronomètre et trois jokers. Les scores alimentent un classement du jour, de la semaine et de tous les temps. Les coachs peuvent proposer des questions, que les modérateurs valident.

## Ce que voit le coach

- `/bbquizz` : le jeu et, à droite sur ordinateur, le classement (onglets « Du jour », « Semaine », « Panthéon »). L'accueil du jeu rappelle les règles et propose « Commencer le quizz ! ». Pendant une partie, une barre en haut de la carte montre la question en cours (« Question 3 / 20 »), le chronomètre et le score ; une fine barre de temps passe à l'orange pendant la lecture. Pour chaque question : 5 secondes de lecture (réponses floutées), puis 30 secondes pour répondre, puis les points gagnés ou perdus, l'explication et « Suivant » (sinon, la question suivante arrive seule après 5 secondes). Jokers, une fois chacun par partie : « 50/50 » (deux mauvaises réponses barrées), « Communauté » (pourcentage des réponses déjà données, en barre dans chaque réponse), « Passer ». Écran de fin : score, bonnes réponses, temps total, « Rejouer ». Réservé aux membres connectés.
- « Proposer une question » est sous le titre de `/bbquizz` ; pour un modérateur, le menu « Gestion du quizz » mène à « Valider les propositions » et « Éditer les questions ».
- `/bbquizz/proposer` : un membre propose une question, dans un formulaire en trois blocs (la question avec sa catégorie, les quatre réponses avec « Bonne réponse » à cocher, l'explication facultative).
- `/bbquizz/valider` : un modérateur approuve ou rejette les propositions en attente (une carte par proposition, la bonne réponse marquée en vert).
- `/bbquizz/editer` : un modérateur cherche, modifie (`?edit=<identifiant>`, même formulaire que la proposition) ou supprime une question, après confirmation.
- **Sur téléphone** (jusqu'à 1024 pixels) : pendant une partie, le titre de la page et le classement sont masqués, pour que la question, le chronomètre, le score, les quatre réponses (pleine largeur, 56 pixels de haut au moins) et les jokers tiennent dans l'écran sans défiler. Le classement est sous l'accueil du jeu et sous l'écran de fin. La proposition et la gestion des questions sont des écrans plein écran (`ComposeScreen`, sans la barre du bas, voir `isComposePath`), avec « Annuler » et « Envoyer » ou « Enregistrer » collés en bas. Comme `isComposePath` ne lit que le chemin de l'adresse, la liste de `/bbquizz/editer` est elle aussi sans barre du bas.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/bbquizz/page.tsx` | Page du jeu, envoie le visiteur vers la connexion (`/auth/login`) |
| `apps/site/app/bbquizz/component/QuizEngine.tsx` | Écran du jeu : titre et actions, accueil, partie (chronomètres, jokers, score), écran de fin, place du classement ; il ne fait qu'afficher ce que renvoie le serveur |
| `apps/site/lib/quizGame.ts` | Règles côté serveur : tirage équilibré des questions, lecture d'une question, temps restant et points |
| `apps/site/app/bbquizz/component/QuizLeaderboard.tsx` | Classement (jour, semaine, tout temps) |
| `apps/site/app/bbquizz/component/QuizForm.tsx` | Formulaire de question en blocs, partagé par proposer et éditer |
| `apps/site/app/bbquizz/proposer/`, `valider/`, `editer/` | Pages de proposition, de validation et d'édition (`page.tsx` serveur + `*Content.tsx` client ; `editer/EditQuestion.tsx` pour la modification) |
| `apps/site/tests/e2e/inventaire/bbquizz.spec.ts` | Test d'inventaire de la refonte (carte 098), en taille ordinateur et téléphone |
| `apps/site/app/bbquizz/actions.ts` | Actions serveur |
| `apps/site/app/bbquizz/data/questions.ts` | Questions de départ : insérées par `prisma/firstSetup.ts`, et utilisées si la base est vide |
| `apps/site/app/bbquizz/utils.ts` | `translateCategory` : nom français d'une catégorie ; `startOfQuizDay` et `startOfQuizWeek` : début du jour et de la semaine, heure de Paris |

Actions serveur (`app/bbquizz/actions.ts`) : `startQuizGame`, `getQuizQuestion`, `answerQuizQuestion`, `skipQuizQuestion`, `applyQuizFiftyFifty`, `applyQuizCommunity` (une partie), `getQuizLeaderboard`, `suggestQuizQuestion` (membres) ; `getQuizSuggestions`, `handleQuizSuggestion`, `getAllQuizQuestions`, `updateQuizQuestion`, `deleteQuizQuestion` (modérateurs).

## Les pièges

- **La partie est tenue par le serveur** (carte 051), pour empêcher la triche. Le navigateur ne reçoit qu'une question à la fois, sans la bonne réponse ni l'explication ; elles ne sont révélées qu'après la réponse. Le serveur note l'heure d'envoi de chaque question et calcule lui-même les points (100 plus le bonus de rapidité, ou -25), puis enregistre le score final. Ne jamais renvoyer `correctIndex` ou `explanation` au navigateur avant la réponse, ni accepter un score venu du navigateur. Un test e2e le vérifie (`tests/e2e/security.spec.ts`) : depuis la carte 098, il repère la question, les réponses, les points gagnés et le score par leur rôle et leur nom accessible (zone « Question en cours », groupe « Réponses », zone d'annonce « Score », voir « Rôle ARIA » dans le glossaire). Ne pas renommer ces éléments sans adapter le test.
- La partie en cours est une ligne de la table `QuizGame` (une seule par membre, supprimée quand le résultat passe dans `QuizAttempt`). Chaque réponse fait avancer la partie seulement si elle en est encore à la question attendue : répondre deux fois ou rejouer une ancienne réponse ne compte pas.
- Le chronomètre affiché dans le navigateur n'est qu'un affichage : c'est l'heure du serveur qui compte, avec 3 secondes de marge pour le trajet réseau. Une réponse arrivée trop tard compte comme fausse.
- Le joker « appel à la communauté » lit les compteurs `timesOption0` à `3` de la question, augmentés à chaque réponse depuis la carte 051. Sans aucune réponse enregistrée (ou pour les questions de départ hors base), il affiche 25 % partout.
- La série (`quizStreak`) est affichée dans le classement mais jamais mise à jour (la colonne est gardée : calculer la série ou la retirer reste à décider, carte 143).
- **Les propositions et les modifications sont contrôlées par le serveur** (carte 143), car une action serveur est appelable directement avec n'importe quelles données : catégorie, question et quatre réponses non vides, bonne réponse entre 0 et 3, longueurs maximales (question 500 caractères, réponse 200, explication 1 000). `updateQuizQuestion` ne recopie que ces champs : un compteur ou une autre colonne glissés dans la requête sont ignorés. Ces actions renvoient `{ success, error }`, et le message s'affiche dans une notification.
- `handleQuizSuggestion` ne traite qu'une proposition encore en attente : le statut change dans une transaction (une opération tout ou rien) seulement s'il vaut encore `PENDING`. Approuver deux fois, ou deux modérateurs en même temps, ne crée donc jamais la question en double. Une proposition inconnue donne « Proposition introuvable ».
- Les classements « Du jour » et « Semaine » commencent à minuit, **heure de Paris**, et la semaine **le lundi** (carte 143), quelle que soit l'heure réglée sur le serveur (Vercel tourne en heure universelle).
- Les pages `/bbquizz/valider` et `/bbquizz/editer` obtiennent la session par `getActiveSession()` (carte 052).

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
- Refonte visuelle (carte 098, ADR 0006) : composants de `packages/ui`, plus aucun fichier CSS propre au quizz. L'audit mobile mesure `/bbquizz`, `/bbquizz/proposer`, `/bbquizz/valider` et `/bbquizz/editer` : rien à signaler en dehors de la coquille.
- Carte 143 : contrôles côté serveur des propositions, des modifications et des validations, semaine du lundi à l'heure de Paris ; tests dans `tests/e2e/security.spec.ts`.
- Manque : série (`quizStreak`).
- Cartes ouvertes : 049 (audit mobile), 098 (refonte visuelle, en attente de validation sur téléphone).
