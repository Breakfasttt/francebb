---
id: 061
title: "Mobile : derniers défauts de l'audit"
epic: E03
app: site
depends_on: [058]
adr:
verify: audit mobile complet à 0 cible trop petite et 0 texte sous 12 px (hors liens de texte et faux positifs écrits dans docs/mobile-audit.md), /administration mesurée avec un compte administrateur
---

# 061 — Mobile : derniers défauts de l'audit

## Pourquoi

Après les cartes 053 à 058, l'audit mobile relève encore 20 cibles tactiles trop petites et 4 textes de moins de 12 pixels. D'autres défauts ont été notés pendant ces cartes sans entrer dans leur périmètre.

## Action

- Corriger les cibles trop petites restantes, dont les 9 cases à cocher de 22 pixels de `/tournois`.
- Corriger les 4 textes de moins de 12 pixels de `/profile`.
- Faire mesurer `/administration` par l'audit avec un compte administrateur : un modérateur est renvoyé vers l'accueil, la page n'est donc pas mesurée aujourd'hui.
- Liste des tournois : sous 900 pixels, les colonnes lieu, format et prix disparaissent ; les rendre visibles autrement (par exemple dans la carte du tournoi) sur téléphone.
- BBScheme : le décalage fixe de 168 pixels sous la barre de navigation, le zoom à deux doigts sur le terrain, et le lecteur `BBSchemePlayer` affiché dans les messages du forum.
