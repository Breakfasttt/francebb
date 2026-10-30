---
id: 080
title: "Ancien CSS en couche basse et classes Tailwind actives"
epic: E08
app: site
depends_on: [077]
adr: 0006
verify: captures de visual-themes.spec.ts et smoke.spec.ts identiques avant et après ; Tailwind génère ses classes pour apps/site
---

# 080 — Ancien CSS en couche basse et classes Tailwind actives

## Pourquoi

Pour construire les nouveaux écrans avec Tailwind, il faut que Tailwind génère ses classes pour le site, sans que l'ancien CSS change l'apparence des écrans pas encore refaits. Quatre classes anciennes portent le même nom qu'une classe Tailwind : `.container` (11 règles), `.hidden`, `.invisible` et `.grid`.

## Action

- Renommer les quatre classes en conflit dans le CSS et dans les fichiers TSX qui les utilisent (par exemple `.container` devient `.page-container`).
- Ranger l'ancien CSS dans une couche `legacy` de faible priorité dans `app/tailwind.css`.
- Retirer `source(none)` pour que Tailwind génère ses classes à partir des fichiers du site. Ne pas activer le preflight.
- Comparer les captures d'écran avant et après : elles doivent être identiques.

## Résultat

- **Génération Tailwind.** `apps/site/app/tailwind.css` génère désormais les classes Tailwind pour tout le site (`app`, `common`, `lib`) en plus de `packages/ui`.
- **Noms exclus.** Quatre noms ne sont jamais générés (`@source not inline`), parce que le CSS historique leur donne un autre sens :
  - `container` : 41 usages. Les écrans refaits utilisent `mx-auto max-w-*`.
  - `box-content` : Tailwind changerait la façon de calculer la taille des boîtes de BBScheme.
  - `text-muted` et `text-secondary` : dans le pont des couleurs, ce sont des fonds, le texte deviendrait illisible.
- **Classes renommées dans le code historique** pour libérer les noms Tailwind :
  - `hidden` devient `is-hidden` et `invisible` devient `is-invisible` (BBQuizz) ;
  - `outline` devient `is-outline` (badges de tournoi, deux règles mortes de BBQuizz et du classement) ;
  - la règle morte `.resource-card.grid` devient `.view-grid`.
- **Règles qui visent une balise.** Celles de `globals.css` (`a`, `h1` à `h6`, `label`) sont rangées dans la couche `legacy`, comme le reset l'était déjà. Une classe Tailwind posée sur un lien ou un titre d'un écran refait l'emporte donc.
- **Écart avec le plan.** Le reste du CSS historique n'est pas rangé dans une couche : la carte 021 avait montré que cela change le rendu. Il disparaît écran par écran, puis à la carte 101.
- **Effets voulus.**
  - Quelques classes Tailwind déjà écrites dans le code mais sans effet jusqu'ici s'appliquent enfin : la taille des icônes de BBQuizz, et le champ de fichier du blason de ligue, qui devient caché comme prévu.
  - L'interface de BBQuizz sera vérifiée à sa carte de refonte (098).
- **Vérifications.** Types verts. Suite e2e complète : 95 tests réussis, 1 ignoré. Les captures des thèmes sont identiques au pixel près.
