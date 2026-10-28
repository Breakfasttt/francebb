---
id: 015
title: Liste d'un forum : count isArchived + Promise.all
status: refine
epic: E03
app: site
depends_on: []
adr: 
verify: totalPages juste ; requêtes `/forum/[id]` < 20/31
---

# 015 — Liste d'un forum : count isArchived + Promise.all

## Problème

`app/forum/[id]/page.tsx` : count sans `isArchived` (bug totalPages), requêtes séquentielles.
