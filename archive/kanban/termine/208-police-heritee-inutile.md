---
id: 208
title: "Retirer la classe de police héritée devenue inutile"
epic:
app: packages/ui
depends_on: [207]
verify: "plus aucune classe [font-family:inherit] dans apps/ et packages/ ; boutons, onglets, menus et zones de texte gardent la police du site (Inter) ; les trois exceptions design-system-font ont disparu de .impeccable/config.json et le détecteur Impeccable ne signale plus de police ; corepack pnpm check et pnpm --filter @bbfrance/site test:parcours passent"
---

# 208 — Retirer la classe de police héritée devenue inutile

## Pourquoi

Dix éléments (bouton, onglets, menu d'actions de `packages/ui`, sept zones de texte du site) portent la classe Tailwind `[font-family:inherit]`, ajoutée quand la remise à zéro des styles du navigateur de Tailwind (le *preflight*) n'était pas encore active. Depuis la carte 101, le preflight donne `font: inherit` à tous les boutons, champs, listes et zones de texte, dans le site comme dans le hub : la classe ne sert plus à rien.

Vérifié le 16 novembre 2026 :
- dans le code : `preflight.css` de Tailwind 4.1.11, ligne 244, et aucun autre CSS ne change la police de ces éléments ;
- dans un navigateur (Chromium, sur `/`, `/mentions-legales` et `/auth/login`) : un bouton, un champ, une liste et une zone de texte sans aucune classe ont la même police que la page.

Elle gêne : le détecteur de l'outil de conception Impeccable la lit comme une police inconnue et a demandé trois exceptions.

## Action

1. Retirer la classe des dix endroits ; corriger les commentaires de `button.tsx` et `tabs.tsx`, qui disent que le preflight ne couvre pas tout ou qu'il est absent.
2. Retirer les trois exceptions `design-system-font` de `.impeccable/config.json`.
3. Vérifier : `corepack pnpm check`, détecteur Impeccable, `test:parcours`.

## Résultat

- La classe `[font-family:inherit]` est retirée des dix endroits (`Button`, onglets, menu d'actions, zones de texte des fenêtres de signalement, de bannissement, de modération, du nouveau forum et de l'éditeur BBCode). Les commentaires de `button.tsx` et `tabs.tsx` disent désormais que la police vient du preflight.
- Les trois exceptions `design-system-font` sont retirées de `.impeccable/config.json` ; le détecteur Impeccable ne signale plus aucune police (restent les couleurs documentées : autres thèmes, cadres de rang, couleur par défaut d'un rôle).
- Vérifications : `corepack pnpm check`, `test:parcours`, et un test ponctuel dans le navigateur (supprimé après usage) : sur `/`, `/mentions-legales`, `/auth/login` et `/forum`, chaque bouton, champ, liste, zone de texte et onglet a la même police que la page (Inter).
