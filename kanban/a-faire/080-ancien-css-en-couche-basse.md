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
