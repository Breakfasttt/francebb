---
id: 015
title: Liste d'un forum : count isArchived + Promise.all
status: done
epic: E03
app: site
depends_on: []
adr: 
verify: totalPages juste ; requêtes `/forum/[id]` < 20/31
---

# 015 — Liste d'un forum : count isArchived + Promise.all

## Problème

`app/forum/[id]/page.tsx` : count sans `isArchived` (bug totalPages), requêtes séquentielles.

## Résultat

Count aligné sur la liste (`isArchived: false`), count + liste + non-lus en parallèle, `select` minimal (auteur, tournoi), non-lu des sous-forums via `getUnreadState` (avant : seulement le dernier topic). `/forum/[id]` connecté 31 → 21 requêtes.
