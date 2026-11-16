---
id: 067
title: Test instable des captures de la page des bannis
epic:
app: site
depends_on: [058]
adr:
verify: la suite complète des tests e2e passe deux fois de suite sans aucun dépassement de délai sur « page des bannis sur téléphone »
---

# 067 — Test instable des captures de la page des bannis

## Pourquoi

Pendant les cartes 019, 017 et 062, le test « page des bannis sur téléphone » (`tests/e2e/visual-themes.spec.ts`, ajouté par la carte 058) a dépassé son délai de 60 secondes pour un ou plusieurs thèmes, pendant la fermeture du navigateur (« Tearing down context »), sans aucun écart de capture. Relancé seul, il passe toujours. Un test qui échoue au hasard fait perdre du temps à chaque carte et finit par ne plus être cru.

## Action

- Trouver la cause : par exemple une connexion à la base de test ouverte par le test et pas refermée, une page qui garde une requête en cours, ou un compte banni recréé à chaque thème.
- Corriger la cause plutôt que d'allonger le délai.
- Vérifier avec deux passages complets de suite.

## Résultat

**Cause trouvée.** La base de test locale (`prisma dev`) ne sert qu'une connexion à la fois. Le test changeait le thème du membre banni dans la base avant chaque capture, puis le remettait après, en ouvrant à chaque fois sa propre connexion (`withTestDb`). Pendant la suite complète, le site garde déjà sa connexion ouverte : la base coupait celle du test, qui réessayait chaque seconde, jusqu'à 30 fois, et deux fois par thème. Le test prenait alors de 9 à 24 secondes au lieu de 1,3 (journal de la carte 062), et parfois plus de 60 : le délai était dépassé pendant la fermeture du navigateur, faute de temps restant. Lancé seul, le site n'a pas encore de connexion ouverte, d'où un test toujours vert.

**Correction.** Le jeu de données de test contient maintenant un membre banni par thème (`themedBannedId` dans `fixtures.ts`, créé par `globalSetup.ts`, même nom et même raison partout), sur le modèle des modérateurs par thème de la carte 051. Le test ne touche plus du tout la base. Aucune capture de référence n'a changé et aucun délai n'a été allongé.

**Vérification.** Deux passages complets de suite (`corepack pnpm test:e2e`, journaux `logs/067-e2e-1.log` et `logs/067-e2e-2.log`) : 71 tests réussis et 1 ignoré (l'audit mobile, lancé seulement à la demande) à chaque fois, sans aucun dépassement de délai. Le test « page des bannis sur téléphone » prend de 1,2 à 4,8 secondes par thème. Note ajoutée au glossaire (entrée « prisma dev ») et à la fiche `docs/features/pages-diverses/README.md`.
