---
id: 017
title: Layout sans force-dynamic + jwt throttlé
status: refine
epic: E03
app: site
depends_on: []
adr: 
verify: routes non `ƒ` au build ; requêtes connecté en baisse sur toutes les routes
---

# 017 — Layout sans force-dynamic + jwt throttlé

## Action

Retirer `force-dynamic` (`app/layout.tsx`), compteurs MP/modération en `<Suspense>`, thème lu du cookie ; callback jwt : relecture BDD seulement si `token.refreshedAt` > 5 min (attention : délai de prise d'effet d'un ban — `getActiveSession` doit rester sûr).
