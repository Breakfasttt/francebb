---
id: 053
title: Mobile : forum (sujet, réponse, signalement)
epic: E03
app: site
depends_on: [049]
adr: 0004
verify: audit mobile : 0 cible trop petite sur /forum/topic/[id] et /reply ; captures ordinateur des 7 thèmes inchangées
---

# 053 — Mobile : forum (sujet, réponse, signalement)

## Pourquoi

La page d'un sujet compte 35 cibles trop petites pour le pouce, celle de réponse 27 (`docs/mobile-audit.md`). Le forum est la partie la plus utilisée.

## Action

Agrandir à 44 pixels minimum, en taille téléphone seulement : fil d'Ariane, boutons « Profil » et « MP » de l'auteur, icônes d'action des messages, barre d'outils de l'éditeur BBCode. Donner à la fenêtre de signalement une hauteur maximale et un défilement interne. Créer `app/forum/page-mobile.css` et y déplacer les règles mobiles qui sont à la fin de `page.css`.
