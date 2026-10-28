---
id: 033
title: Une seule recherche d'utilisateurs + useDebounce
status: done
epic: E05
app: site
depends_on: []
adr: 0001
verify: une seule server action searchUsers ; anciens composants de recherche branchés dessus ; typecheck vert
---

# 033 — Une seule recherche d'utilisateurs + useDebounce

## Action

Fusionner les recherches d'utilisateurs dupliquées en une server action `searchUsers` (auth vérifiée, `select` minimal, sans email) et un hook `common/hooks/useDebounce.ts`.

## Résultat

Filtre commun `lib/userSearch.ts` (`userSearchWhere`) pour `searchUsersAction` (forum) et `searchUsers` (messagerie). **Faille corrigée** : la recherche forum cherchait aussi dans l'email, donc un membre pouvait deviner l'email d'un autre lettre par lettre. Les bannis sont exclus partout. `findUsersSearch` (aucun appelant) supprimée. Messagerie : la recherche part après 300 ms sans frappe (`common/hooks/useDebounce.ts`), avant elle partait à chaque touche. Les deux server actions restent séparées : leurs retours diffèrent (cadre d'avatar contre groupe plein). Test smoke « recherche par pseudo, jamais par email ».
