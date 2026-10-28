---
id: 016
title: Page topic : include factorisé, forums de déplacement si modo
status: refine
epic: E03
app: site
depends_on: []
adr: 
verify: requêtes `/forum/topic/[id]` connecté < 89 (baseline), cible ≤ 60
---

# 016 — Page topic : include factorisé, forums de déplacement si modo

## Problème

`app/forum/topic/[id]/page.tsx` : `findUnique` géant + `forum.findMany` complet pour tout le monde.
