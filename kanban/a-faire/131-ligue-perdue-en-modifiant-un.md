---
id: 131
title: "Ligue perdue en modifiant un tournoi"
epic: E01
app: site
depends_on: [102]
adr: 
verify: modifier un tournoi rattaché à une ligue du site, sans toucher à la ligue, garde le rattachement ; test e2e qui le vérifie
---

# 131 — Ligue perdue en modifiant un tournoi

## Pourquoi

Bug trouvé pendant la refonte (carte 089). La page de modification d'un tournoi ne transmet pas la ligue déjà rattachée au champ de recherche de ligue (`LigueSearch`). Le champ s'affiche vide et, à l'enregistrement, le tournoi perd sa ligue sans que l'organisateur l'ait voulu.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Dans `apps/site/app/forum/edit-tournament/[id]/page.tsx`, lire la ligue rattachée et la passer au formulaire, pour que `LigueSearch` l'affiche déjà choisie.
- Ajouter un test e2e : rattacher un tournoi à une ligue, le modifier sans toucher à la ligue, vérifier qu'elle est toujours là.
