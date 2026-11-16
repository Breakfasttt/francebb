---
id: 021
title: Spike A : CSS legacy en @layer sous Tailwind v4
epic: E05
app: site
depends_on: [023]
adr: 
verify: 2 pages où les utilities Tailwind gagnent sur le CSS legacy
---

# 021 — Spike A : CSS legacy en @layer sous Tailwind v4

## Problème

`app/globals.css:42` `* {padding:0;margin:0}` hors `@layer` écrase les utilities v4.

## Action

`@import "globals.css" layer(legacy)` + ordre `@layer theme, base, legacy, components, utilities`. Timeboxé.

## Résultat (branche `refacto/p4-spike-tailwind`, partie de `refacto/p3-monorepo`) — concluant

- Tailwind v4.1.11 (`tailwindcss` + `@tailwindcss/postcss`, versions exactes) via `postcss.config.mjs` ; entrée `app/tailwind.css` importée par le layout.
- **Ranger tout `globals.css` dans une couche = rendu modifié** (logo, sidebar : ~1 % de pixels) : il perd alors contre le CSS des composants. Rejeté.
- **Retenu** : `globals.css` reste hors couche ; seul son reset `* { padding: 0; margin: 0 }` passe en `@layer legacy` (avant `utilities`). Pas de preflight Tailwind.
- `source(none)` + `@source <dossier>` : Tailwind ne scanne que le nouveau code — évite que des noms de classes historiques qui sont aussi des utilitaires (`container`…) changent les pages existantes quand on y ajoutera du Tailwind.
- Preuves (`apps/site/tests/e2e/visual-spike.spec.ts`) : captures `/`, `/forum`, `/tournois` identiques au pixel avant/après (local Windows) ; `p-4` donne bien 16 px malgré le reset.
- Avant P4 réel : supprimer la page `app/spike-tailwind`, remplacer `@source "./spike-tailwind"` par le dossier de `packages/ui`, étendre les captures aux 7 thèmes.

