---
id: 146
title: "BBScheme : bulle d'infos d'un pion, code mort"
epic: E01
app: site
depends_on: [102]
adr: 
verify: sur téléphone et sur ordinateur, la bulle d'infos d'un pion reste entière dans l'écran, même près d'une réserve ; test e2e
---

# 146 — BBScheme : bulle d'infos d'un pion, code mort

## Pourquoi

Défauts trouvés pendant la refonte de l'habillage de BBScheme (carte 100) :

- La bulle d'infos d'un pion, affichée par le lecteur (`packages/bbscheme-player`), apparaît décalée et à moitié hors de l'écran près de la réserve de gauche.
- `handleZoneClick` dans `apps/site/app/bbscheme/page.tsx` n'est plus appelé, car les fosses (zones des joueurs sortis) sont désactivées. `Dugout.tsx` n'est plus affiché pour la même raison.
- La couleur de fond de l'export GIF est écrite en dur dans `page.tsx` au lieu de suivre le thème.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Garder la bulle d'infos dans les limites de l'écran (position calculée à partir du bord visible).
- Décider avec le responsable si les fosses doivent revenir ; sinon, retirer `handleZoneClick` et `Dugout.tsx` après avoir listé ce qui les utilise.
- Lire la couleur de fond de l'export depuis les variables du thème.
- Ajouter un test dans `apps/site/tests/e2e/inventaire/bbscheme.spec.ts`.
