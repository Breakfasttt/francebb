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

## Résultat

- `packages/ui/src/themes/` : un fichier par thème (8) avec les variables v2, toutes préfixées `--bb-` pour ne jamais entrer en conflit avec les variables v1 pendant la cohabitation. Vestiaire est aussi posé sur `:root`. Le verre dépoli (`--bb-glass-blur`) n'est activé que pour « Sombre ».
- `packages/ui/src/tokens.css` : il importe les thèmes, documente chaque variable et crée les classes Tailwind correspondantes (`bg-bb-surface`, `text-bb-text-muted`, `rounded-bb-md`…). Il fixe aussi les valeurs communes à tous les thèmes : rayons, police, taille minimale d'une cible tactile.
- **Écart avec le plan : les variables v1 des 7 thèmes historiques ne deviennent pas des alias des v2.** Elles restent telles quelles, pour que les écrans pas encore refaits gardent exactement leur apparence. Seul Vestiaire, qui n'avait pas de variables v1, en reçoit sous forme d'alias de ses v2 (`apps/site/app/theme/theme.vestiaire.css`) : les écrans pas encore refaits s'affichent ainsi déjà en Vestiaire. Toutes les v1 disparaissent à la carte 101.
- « Vestiaire » ajouté à `lib/themes.ts` (en tête de liste, sans changer encore le thème par défaut) et aux aperçus du profil et de l'onboarding.
- `tests/e2e/contraste.spec.ts` : 20 paires texte / fond vérifiées dans chaque thème, et un fichier de thème obligatoire pour chaque entrée de `lib/themes.ts`. Le test a trouvé un défaut dans Néhékhara (bouton survolé à 4,47 pour 1), corrigé.
- **Vérifications** : types verts. Contraste vert pour les 8 thèmes. Captures `visual-themes.spec.ts` des 7 thèmes historiques inchangées.
