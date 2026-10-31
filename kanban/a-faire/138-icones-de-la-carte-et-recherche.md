---
id: 138
title: "Icônes de /carte et recherche de membre"
epic: E01
app: site
depends_on: [102]
adr: 
verify: les icônes des repères de /carte sont servies par le site lui-même ; les résultats de UserSearch se choisissent au clavier et sont annoncés comme des boutons ; test e2e
---

# 138 — Icônes de /carte et recherche de membre

## Pourquoi

Deux défauts trouvés pendant la refonte (carte 094) :

- Les icônes des repères de la carte interactive `/carte` sont chargées depuis `raw.githubusercontent.com` et cdnjs, deux sites extérieurs. Si l'un d'eux ne répond plus, les repères disparaissent de la carte.
- Le composant partagé `UserSearch` (recherche d'un membre, utilisé pour transférer une ligue et ailleurs) affiche ses résultats dans des `div` cliquables : on ne peut pas les choisir au clavier, les lecteurs d'écran ne les annoncent pas comme des boutons, et le composant garde l'ancien style.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Copier les icônes des repères dans `apps/site/public/` (en vérifiant leur licence) et les charger depuis le site.
- Refaire les résultats de `UserSearch` avec des boutons de `packages/ui` (ou réutiliser `MemberPicker` de la messagerie s'il convient), en gardant son interface publique.
- Ajouter les tests e2e.
