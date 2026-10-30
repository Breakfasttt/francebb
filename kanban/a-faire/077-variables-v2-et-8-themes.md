---
id: 077
title: "Variables v2 et 8 thèmes dans packages/ui"
epic: E08
app: packages/ui
depends_on: [075]
adr: 0006
verify: test de contraste AA vert pour les 8 thèmes ; captures de visual-themes.spec.ts inchangées sur les pages actuelles ; typecheck et lint verts
---

# 077 — Variables v2 et 8 thèmes dans packages/ui

## Pourquoi

Les 7 thèmes actuels utilisent 98 variables déclarées 642 fois. La refonte a besoin d'une liste courte de variables nommées selon leur usage, partagée par toutes les applications, et d'un nouveau thème « Vestiaire ».

## Action

- Définir environ 30 variables v2 dans `packages/ui/src/tokens.css` (fond, surface, surface en relief, texte, texte discret, accent, texte sur accent, danger, succès, avertissement, bordure, focus, non-lu, etc.) et les relier à Tailwind par `@theme inline`.
- Créer `packages/ui/src/themes/` avec un fichier par thème : « Vestiaire » (sombre et sobre, accent rouge Blood Bowl) et les 7 thèmes actuels réécrits en v2, chacun gardant son esprit.
- Rendre le verre dépoli facultatif par thème, désactivé par défaut.
- Transformer les variables v1 de `apps/site/app/theme/*.css` en alias des variables v2 : les pages actuelles ne doivent pas changer d'apparence.
- Ajouter un test automatique qui calcule le contraste de chaque paire texte et fond, dans chaque thème, et échoue sous le niveau AA.
- Ajouter « vestiaire » à `apps/site/lib/themes.ts`, sans changer encore le thème par défaut.
