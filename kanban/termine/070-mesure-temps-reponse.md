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

## Résultat

La commande `pnpm --filter @bbfrance/site temps-reponse` (dans `apps/site`, `corepack pnpm temps-reponse`) réutilise le montage de la mesure Lighthouse (`playwright.lighthouse.config.ts` : construction du site, base de test recréée, `next start` sur le port 3200). Le test `apps/site/tests/lighthouse/temps-reponse.spec.ts` mesure le temps jusqu'au premier octet avec l'API Performance du navigateur : un passage à blanc, puis 5 mesures par page, et la médiane est gardée. Le rapport est écrit dans `apps/site/logs/temps-reponse-AAAA-MM-JJ.txt`, avec un avertissement pour toute page au-dessus de 1000 ms (la commande n'échoue pas pour autant). La commande `lighthouse` ne lance plus que son propre test. L'étape est ajoutée à `/ship` (`.claude/commands/ship.md`) et au `README.md`.

Médianes du 30 octobre 2026 (site de production, base de test) :

| Page | Médiane |
|---|---|
| Accueil | 40 ms |
| Forum | 25 ms |
| Sujet | 425 ms |
| Profil (membre connecté) | 108 ms |
| Tournois | 85 ms |

Aucune page n'est au-dessus du seuil d'une seconde. Pendant le lancement, le serveur a affiché des erreurs de connexion à la base (`ConnectionClosed`) sans conséquence sur les réponses, probablement liées à la recréation de la base de test.
