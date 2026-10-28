---
id: 017
title: Layout sans force-dynamic + jwt throttlé
epic: E03
app: site
depends_on: []
adr: 
verify: routes non `ƒ` au build ; requêtes connecté en baisse sur toutes les routes
---

# 017 — Layout sans force-dynamic + jwt throttlé

## Action

Retirer `force-dynamic` (`app/layout.tsx`), compteurs MP/modération en `<Suspense>`, thème lu du cookie ; callback jwt : relecture BDD seulement si `token.refreshedAt` > 5 min (attention : délai de prise d'effet d'un ban — `getActiveSession` doit rester sûr).

## Notes (2026-10-28)

Déjà fait en 014 : layout sans relecture du User, session mémoïsée par requête.
Throttle du jwt : inefficace tel quel — dans un server component Auth.js ne peut pas réécrire le cookie, le token rafraîchi n'est pas persisté ; il faudrait déplacer le rafraîchissement dans `proxy.ts` (runtime Node). Retirer `force-dynamic` n'a d'effet qu'avec des compteurs en `<Suspense>` (le layout lit les cookies).
