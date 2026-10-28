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
| `apps/site/app/bbquizz/page.tsx` | Page du jeu, redirige le visiteur vers la connexion |
| `apps/site/app/bbquizz/component/QuizEngine/QuizEngine.tsx` | Déroulé d'une partie : chronomètres, jokers, score, envoi du résultat |
| `apps/site/app/bbquizz/component/QuizLeaderboard/QuizLeaderboard.tsx` | Classement (jour, semaine, tout temps) |
| `apps/site/app/bbquizz/component/QuizForm/QuizForm.tsx` | Formulaire de question, partagé par proposer et éditer |
| `apps/site/app/bbquizz/proposer/`, `valider/`, `editer/` | Pages de proposition, de validation et d'édition (`page.tsx` serveur + `*Content.tsx` client) |
| `apps/site/app/bbquizz/actions.ts` | Actions serveur |
| `apps/site/app/bbquizz/data/questions.ts` | Questions de départ : insérées par `prisma/firstSetup.ts`, et utilisées si la base est vide |
| `apps/site/app/bbquizz/utils.ts` | `translateCategory` : nom français d'une catégorie |

Actions serveur (`app/bbquizz/actions.ts`) : `getRandomQuizQuestions`, `submitQuizAttempt`, `getQuizLeaderboard`, `getCommunityStats`, `suggestQuizQuestion` (membres) ; `getQuizSuggestions`, `handleQuizSuggestion`, `getAllQuizQuestions`, `updateQuizQuestion`, `deleteQuizQuestion` (modérateurs).

## Les pièges

- **Le score est calculé dans le navigateur et cru sur parole** par `submitQuizAttempt` : n'importe quel membre peut envoyer le score qu'il veut et prendre la tête du classement.
- **Les bonnes réponses partent dans le navigateur** (`correctIndex` est renvoyé avec chaque question) : on peut les lire avant de répondre.
- **Le visiteur non connecté est envoyé vers `/auth/signin`**, adresse qui n'existe pas (la page de connexion est `/auth/login`). Même erreur dans `proposer/page.tsx`.
- Le joker « appel à la communauté » lit des compteurs (`timesOption0` à `3`) que rien n'incrémente : il affiche 0 % partout, ou des chiffres inventés (45/20/15/20) si la question n'est pas en base.
- La série (`quizStreak`) est affichée dans le classement mais jamais mise à jour.
- `getRandomQuizQuestions` charge toutes les questions de la base à chaque partie pour en garder 20, avec un mélange `sort(() => 0.5 - Math.random())` peu uniforme.
- `submitQuizAttempt` retrouve le membre par son email : un compte sans email ne peut pas enregistrer de score.
- `updateQuizQuestion` reçoit `data: any`.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Partie (*attempt*) | Une session de 20 questions ; enregistrée avec score, bonnes réponses et durée. |
| Joker | Aide utilisable une fois par partie : 50/50, appel à la communauté, passer. |
| Proposition (*suggestion*) | Question envoyée par un membre, en attente (`PENDING`) jusqu'à acceptation ou refus par un modérateur. |
| Panthéon / classement | Les 10 meilleurs : meilleur score de tous les temps, ou meilleure partie du jour ou de la semaine. |
| Pioche équilibrée | Les questions sont tirées à tour de rôle dans chaque catégorie, pour ne pas avoir 20 questions du même thème. |

## État

- Marche : partie complète, classements, proposition, validation, édition.
- Manque : calcul du score côté serveur et réponses cachées jusqu'à la réponse, adresse de connexion corrigée, compteurs du joker communauté, série.
- Cartes ouvertes : 049 (audit mobile). Aucune carte dédiée.
