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
