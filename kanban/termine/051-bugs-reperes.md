---
id: 051
title: Bugs repérés pendant la rédaction des fiches
epic: E03
app: site
depends_on: []
adr:
verify: chaque point corrigé (ou laissé avec une raison écrite) ; fiches de fonctionnalités mises à jour
---

# 051 — Bugs repérés pendant la rédaction des fiches

## Pourquoi

Comportements incorrects relevés dans les fiches `docs/features/` (sections « Les pièges » et « État »).

## Action

- `cleanupModerationLogs` calcule une date invalide : la purge automatique du journal ne supprime rien.
- `getRolePower` (`lib/roles.ts`) donne la puissance d'un simple coach aux rôles personnalisés, alors que `lib/forumAccess.ts` lit la vraie puissance en base : les deux calculs divergent.
- Ligues : les boutons « Transférer la propriété » et « Supprimer la ligue » ne font rien (actions jamais appelées).
- Tournois : la page de résultats accepte les modérateurs, mais l'enregistrement n'accepte que les admins ; le lien de secours `/tournois/[id]` mène à une page inexistante ; les points du championnat sont calculés dans le navigateur sans recalcul côté serveur.
- BBQuizz : le score et les bonnes réponses sont envoyés au navigateur (triche facile) ; un visiteur est envoyé vers `/auth/signin`, adresse inexistante.
- Statistiques : « Connectés » compte une table qui reste vide (sessions en JWT).
- Thèmes : le thème mémorisé dans le navigateur écrase celui du profil ; seuls 5 thèmes sur 7 sont proposés à l'inscription.
- Suppression d'un membre par un modérateur : ses messages sont effacés définitivement, alors que la suppression de compte par le membre les rattache à un compte « fantôme ».

## Résultat

Chaque point est corrigé. Les fiches de fonctionnalités concernées (modération, administration, ligues, tournois, BBQuizz, classement et statistiques, pages diverses, profil et membres, connexion) et le glossaire sont à jour.

- **Purge du journal de modération** : `cleanupModerationLogs` (`app/moderation/actions.ts`) recule maintenant correctement de 3 mois. Attention : au premier passage après la mise en ligne, toutes les entrées de plus de 3 mois seront supprimées d'un coup, comme prévu à l'origine.
- **Puissance des rôles personnalisés** : plutôt que de faire lire la base à `lib/roles.ts` (utilisé aussi dans le navigateur), la règle est rendue explicite et imposée. Un rôle personnalisé reste toujours sous Modérateur : `createCustomRole` le refuse au-dessus (`reorderRoles` le faisait déjà). Il n'a donc jamais de droit de modération, et `lib/roles.ts` (droits) et `lib/forumAccess.ts` (accès au forum) ne peuvent plus se contredire. La règle est expliquée en commentaire de `getRolePower`.
- **Ligues** : « Transférer propriété » ouvre une fenêtre de confirmation avec la recherche de membres, « Supprimer la ligue » une fenêtre de confirmation (`LigueAdminActions.tsx`). `deleteLigue` et `transferLigueOwnership` renvoient `{ success, error }` au lieu de lever une erreur, refusent un nouveau chef inexistant ou banni, et sont tracés au journal de modération (nouvelle action `LIGUE_TRANSFERRED`). Les tournois et articles d'une ligue supprimée restent en ligne.
- **Tournois** :
  - toutes les actions sur les résultats (`saveTournamentResults`, `finishTournament`, `cancelTournament`, `unfinishTournament`, `clearTournamentResults`) acceptent maintenant l'organisateur, les commissaires et la modération (`isModerator`), comme la page `/results` et `updateTournament` ;
  - la page `/results` passe par `getActiveSession()` et renvoie vers `/auth/login` ;
  - le lien de secours `/tournois/[id]` (liste des tournois, fiche d'une ligue, carte) mène à la liste des tournois ;
  - pour un tournoi CDF, `saveTournamentResults` recalcule les points avec `calculateCdfPoints` à partir du rang, avec les mêmes paramètres que l'éditeur, et ignore ceux envoyés par le navigateur.
- **BBQuizz** : la partie est désormais tenue par le serveur.
  - Nouvelle table `QuizGame` (migration `20261029120000_quiz_game`, création de table seulement, aucune donnée touchée).
  - Nouvelles actions `startQuizGame`, `getQuizQuestion`, `answerQuizQuestion`, `skipQuizQuestion`, `applyQuizFiftyFifty` et `applyQuizCommunity`, règles dans `lib/quizGame.ts`. Les anciennes `getRandomQuizQuestions`, `submitQuizAttempt` et `getCommunityStats` sont supprimées.
  - Le navigateur reçoit une question à la fois, sans la bonne réponse ni l'explication, révélées seulement après la réponse.
  - Le serveur mesure le temps de réponse, calcule les points, empêche de répondre deux fois à la même question et enregistre seul le score final.
  - Les jokers sont vérifiés par le serveur. Le joker « appel à la communauté » s'appuie enfin sur de vrais compteurs, augmentés à chaque réponse.
  - `/bbquizz` et `/bbquizz/proposer` envoient le visiteur vers `/auth/login`, tout comme le bouton « Créer mon compte » de `/jouer`, qui pointait aussi vers `/auth/signin`.
  - Un test e2e vérifie que rien ne trahit la bonne réponse avant la réponse et que le score est celui du serveur.
- **Statistiques** : le compteur devient « En ligne » et compte les membres qui ont lu un sujet du forum ces 15 dernières minutes (table `TopicView`), au lieu de la table `Session`, toujours vide.
- **Thèmes** :
  - pour un membre connecté, le thème de son profil gagne toujours et il est recopié dans le navigateur ; le thème mémorisé dans le navigateur ne sert plus qu'aux visiteurs (`ThemeProvider`). L'accès à la mémoire du navigateur est protégé contre un blocage ;
  - l'inscription (onboarding) propose les 7 thèmes, avec des pastilles de 44 pixels sur téléphone ;
  - le test des captures de la fenêtre de signalement se connecte maintenant avec un modérateur par thème (créés par `tests/e2e/globalSetup.ts`), puisque c'est le thème du profil qui s'affiche. Les captures de référence n'ont pas changé.
- **Suppression d'un membre par un modérateur** : `deleteUser` passe par la même fonction que la suppression de compte par le membre, `anonymizeAndDeleteUser` (`lib/accountDeletion.ts`). Ses contenus publics sont rattachés au compte fantôme au lieu d'être effacés, et l'action est tracée au journal (`USER_DELETED`). La fonction rattache aussi au compte fantôme les tournois organisés, les gagnants du jour du quiz, les signalements envoyés et les entrées du journal de modération du membre : sans cela, la base refusait la suppression d'un organisateur ou d'un modérateur.

Hors du périmètre de la carte, laissé tel quel : `unbanUserAction` ne vérifie toujours pas le rang du membre à débannir (signalé dans la fiche de la modération).

Vérifications : `npx tsc --noEmit` sans erreur ; ESLint en baisse (plafond abaissé de 557 à 551) ; tests e2e (`pnpm test:e2e`) verts. Sur téléphone (390 pixels de large), vérifié par un test ponctuel puis supprimé : fenêtres de transfert et de suppression de ligue, pastilles de thème de l'inscription (44 pixels, 7 thèmes), partie de BBQuizz avec jokers et page des statistiques, sans défilement horizontal.

Pour les tests, `tests/e2e/fixtures.ts` gagne `withTestDb` : la petite base de test locale coupe parfois une nouvelle connexion quand le site a déjà la sienne, la fonction réessaie alors.
