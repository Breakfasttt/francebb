---
id: 070
title: "Mesurer le temps de réponse des pages principales"
epic: E03
app: site
depends_on: []
adr: 0005
verify: une commande produit un rapport daté dans logs/ avec le temps de réponse du serveur pour l'accueil, le forum, un sujet, le profil et les tournois, et signale toute page au-dessus du seuil d'une seconde ; /ship la lance
---

# 070 — Mesurer le temps de réponse des pages principales

## Pourquoi

L'ADR 0005 renonce à `cacheComponents` : les pages restent calculées par le serveur à chaque visite. Pour savoir si cela devient un problème, il faut mesurer le temps de réponse au lieu d'optimiser à l'aveugle. Un dépassement du seuil est l'une des conditions pour rouvrir la question du cache.

## Action

- Écrire un script (ou réutiliser la configuration Lighthouse, `playwright.lighthouse.config.ts`) qui mesure, sur le site construit (`next build` puis `next start`), le temps de réponse du serveur des 5 pages principales, plusieurs fois chacune, et garde la médiane.
- Écrire le résultat dans un rapport daté dans `logs/`, avec un avertissement clair pour toute page au-dessus d'une seconde.
- Ajouter l'étape au skill `/ship` (`.claude/skills/ship/`) et documenter la commande dans `README.md`.
