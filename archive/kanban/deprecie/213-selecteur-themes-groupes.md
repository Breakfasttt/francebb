---
id: 213
title: "Sélecteur de thèmes en liste groupée"
epic: E11
app: site
depends_on: [211]
adr: 0009
verify: "le sélecteur présente les thèmes en liste verticale par groupes, chaque ligne fait au moins 44 pixels et montre un aperçu des couleurs ; aucun défilement horizontal en 360 pixels ; le thème actif est signalé"
---

# 213 — Sélecteur de thèmes en liste groupée

## Pourquoi

Des pastilles ne tiennent pas pour 35 thèmes sur téléphone (ADR-0009).

## Action

Remplacer les pastilles du sélecteur par une liste verticale par groupes (Généraux, Chaos, Elfes…), avec le nom du thème et un aperçu de ses couleurs, en lignes de 44 pixels au moins.

## Résultat

Fait : `ThemePicker` présente les thèmes par rubrique (`<details>` dépliables, celle du thème actif ouverte), une ligne de 44 pixels par thème avec un aperçu (fond, carte, accent) lu dans la liste générée ; l'ancien `ThemePicker.css` (pastilles) est supprimé. Capture en 360 pixels dans le panneau « Plus » : aucune cible sous 44 pixels, aucun défilement horizontal. À essayer à la main : choisir un thème depuis le profil et depuis le menu du compte sur ordinateur.

## Remplacée

Le 16 novembre 2026, la carte 218 ramène le site à 5 thèmes : le sélecteur redevient une liste simple, sans rubriques (une ligne de 44 pixels par thème, avec l'aperçu de ses couleurs).
