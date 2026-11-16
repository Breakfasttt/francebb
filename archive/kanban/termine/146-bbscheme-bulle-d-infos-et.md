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

## Résultat

Fait (test écrit, pas encore lancé).

- **Bulle d'infos** (`packages/bbscheme-player/src/Token.tsx`, `Token.css`) : la bulle est d'abord affichée invisible, mesurée, puis placée par la fonction `placeTooltip` : au-dessus du pion, centrée, ramenée dans la partie visible de l'écran (`window.visualViewport`, marge de 8 pixels), et passée sous le pion s'il n'y a pas la place au-dessus. Elle porte maintenant le rôle `tooltip` et ne dépasse jamais la largeur de l'écran (un nom très long passe à la ligne). Les gestes du terrain ne sont pas touchés.
- **Code mort** : rien n'utilisait plus `handleZoneClick` ni `Dugout.tsx` (seul un import en commentaire les citait). Les fosses restant désactivées, `handleZoneClick`, l'import en commentaire, `Dugout.tsx` et `Dugout.css` sont supprimés, et la mention de `Dugout.css` est retirée du skill `theming-rules`. Pour remettre les fosses, il faudra les récrire (le code reste dans l'historique git).
- **Export GIF** : le fond des images capturées est lu dans la variable `--bb-bg` du thème au moment de l'export, au lieu de `#0c0c14` écrit en dur.
- Fichiers : `packages/bbscheme-player/src/Token.tsx`, `packages/bbscheme-player/src/Token.css`, `apps/site/app/bbscheme/page.tsx`, suppression de `apps/site/app/bbscheme/component/Dugout.tsx` et `Dugout.css`, `.claude/skills/theming-rules/SKILL.md`, fiche `docs/features/bbscheme/README.md`.
- Test : `apps/site/tests/e2e/bugs/divers.spec.ts` (survol de deux pions de la réserve bleue, bulle entière dans l'écran, en taille ordinateur et téléphone), plutôt que `inventaire/bbscheme.spec.ts`, selon la répartition des fichiers de test entre les lots.
- À essayer à la main : survoler les pions de la réserve de gauche et ceux du bord du terrain, sur ordinateur et sur téléphone (en touchant un pion), y compris terrain tourné et zoomé ; exporter un GIF dans le thème Clair et vérifier la couleur du fond.
