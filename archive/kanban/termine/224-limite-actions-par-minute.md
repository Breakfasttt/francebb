---
id: 224
title: Limite d'actions par minute
---

# 224 — Limite d'actions par minute

## Pourquoi
Relevé pendant la carte 221 : aucune action serveur ne limite le nombre d'appels. Un compte (ou un script) peut envoyer des centaines de messages, de signalements ou de messages privés en une minute. Le site est hébergé sans serveur permanent (Vercel), un simple compteur en mémoire ne suffit donc pas.

## À faire
- Choisir où compter : table Postgres (compteur par membre et par type d'action, fenêtre d'une minute) plutôt qu'un service externe, sauf accord du user pour une bibliothèque.
- Appliquer à : nouveau sujet, réponse, message privé, signalement, réaction, recherche.
- Message clair à l'écran (« Doucement : attends une minute avant de recommencer. »).
- Exemption pour la modération ; tests unitaires et e2e.

## Résultat
- Compteur dans Postgres, sans bibliothèque : table `ActionCounter` (membre, action, début de la minute, nombre), migration `20261122180000_limite_actions_par_minute` (création seulement). `rateLimitRefusal` (`lib/rateLimit.ts`) incrémente en un seul `upsert` et efface au passage les minutes de plus de dix minutes du membre.
- Seuils par minute (`lib/rateLimitRules.ts`) : 3 sujets, 10 réponses, 20 messages privés (démarrer une conversation compte), 5 signalements, 30 réactions (messages et articles), 20 recherches du forum. Message : « Doucement : attends une minute avant de recommencer. » La modération n'est pas limitée ; un visiteur n'est pas compté sur la recherche (il n'est pas identifiable).
- Branché dans `createTopic`, `createPost`, `togglePostReaction`, `toggleArticleReaction` (qui affiche maintenant le message du serveur), `sendMessage`, `startConversation`, `createReportAction` et la page `/forum/search` (« Trop de recherches »).
- Tests : `tests/unit/rateLimitRules.test.mjs` ; e2e `tests/e2e/limite-actions.spec.ts` (coach limité sur la recherche, modérateur jamais).
- Limite connue : la minute est fixe (de 14:32:00 à 14:32:59), pas glissante. Un script peut donc faire deux fois le seuil à cheval sur deux minutes, ce qui reste très loin des centaines d'actions possibles avant.
