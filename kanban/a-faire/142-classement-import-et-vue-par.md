---
id: 142
title: "Classement : import en double, vue par roster"
epic: E01
app: site
depends_on: [102]
adr: 
verify: un import n'appelle teamfrancebb.fr qu'une fois ; getRanking n'écrit plus dans la console ; la vue « Par roster » suit l'année choisie ; test e2e pour la vue
---

# 142 — Classement : import en double, vue par roster

## Pourquoi

Trois défauts trouvés pendant la refonte du classement du Championnat de France (carte 097) :

- Pendant un import d'archive, `fetchLegacyRanking` est appelé deux fois : le site interroge deux fois teamfrancebb.fr pour rien.
- `getRanking` écrit des messages `console.log` à chaque appel, ce qui encombre les journaux du serveur.
- La vue « Par roster » porte toujours sur l'année civile en cours, quelle que soit l'année choisie dans l'onglet « Année ».

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Ne garder qu'un appel à `fetchLegacyRanking` par import (`apps/site/app/classement/actions.ts`).
- Retirer les `console.log` de `getRanking`.
- Faire suivre l'année choisie à la vue « Par roster », ou indiquer clairement l'année affichée.
- Compléter `apps/site/tests/e2e/inventaire/classement.spec.ts`.
