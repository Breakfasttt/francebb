---
id: 054
title: Mobile : listes et filtres (membres, articles, ressources, ligues, tournois)
epic: E03
app: site
depends_on: [049]
adr: 0004
verify: audit mobile : rien de coupé sur /membres ; filtres accessibles par le bouton flottant sur les 5 pages
---

# 054 — Mobile : listes et filtres (membres, articles, ressources, ligues, tournois)

## Pourquoi

Le tableau des membres déborde (915 px dans 360) ; les filtres sont rangés dans le menu au lieu du bouton flottant prévu ; deux CSS mobiles ne sont jamais chargés.

## Action

`/membres` : afficher les membres en cartes empilées sur téléphone, liens d'au moins 44 px. Filtres de `/membres`, `/articles`, `/ressources`, `/ligues`, `/tournois` derrière le bouton flottant `MobileFilterWrapper`. Importer `ressources/page-mobile.css` et le CSS mobile du formulaire dans `/ligue/edit/[id]`.
