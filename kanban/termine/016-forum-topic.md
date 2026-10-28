---
id: 016
title: Page topic : include factorisé, forums de déplacement si modo
epic: E03
app: site
depends_on: []
adr: 
verify: requêtes `/forum/topic/[id]` connecté < 89 (baseline), cible ≤ 60
---

# 016 — Page topic : include factorisé, forums de déplacement si modo

## Problème

`app/forum/topic/[id]/page.tsx` : `findUnique` géant + `forum.findMany` complet pour tout le monde.

## Résultat

Cause principale : `markTopicAsRead` (appelée à chaque ouverture) faisait `revalidatePath` du topic → page re-rendue en entier (~40 requêtes). Retiré. Liste des forums (déplacement) chargée seulement pour les modos. Connecté 85 → 46.

Reste : ~20 requêtes par rendu dues aux nombreuses relations incluses (tournoi, auteurs, ligues) — une requête par relation côté Prisma.
