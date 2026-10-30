---
id: 102
title: "Skills et captures après la refonte"
epic: E08
app: site
depends_on: [101]
adr: 0006
verify: skills theming-rules, ui-components, mobile-ux, reuse-first et project-structure relus et à jour ; captures des 8 thèmes régénérées ; épic E08 fermé
---

# 102 — Skills et captures après la refonte

## Pourquoi

Les skills décrivent encore les 7 thèmes, le verre dépoli partout et le menu latéral. Une IA ou un développeur qui les lirait referait l'ancien site.

## Action

- Réécrire les skills `theming-rules`, `ui-components`, `mobile-ux`, `reuse-first` et `project-structure` selon l'ADR 0006.
- Régénérer volontairement les captures de `visual-themes.spec.ts` dans les 8 thèmes.
- Mettre à jour les fiches de `docs/features/` touchées, et fermer l'épic E08.
