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

## Résultat

- Les règles pour téléphone et tablette du forum quittent la fin de `page.css` pour un fichier à part, `app/forum/page-mobile.css`, importé juste après `page.css` dans les dix pages du forum. Les règles sont recopiées à l'identique.
- Sur téléphone (jusqu'à 768 pixels), toutes les cibles tactiles du forum mesurent au moins 44 pixels : liens du fil d'Ariane, boutons « Profil » et « MP » de l'auteur, icônes en tête de message (non lu, partager, signaler), boutons sous le message (modérer, réactions, citer, modifier, supprimer), barre d'outils de l'éditeur de messages (`BBCodeEditor-mobile.css`). Seule la zone que l'on touche grandit : textes et icônes ne changent pas.
- Fenêtre de signalement (`ReportModal-mobile.css`) : hauteur limitée à l'écran avec défilement interne, bouton de fermeture et choix de raison à 44 pixels, zone de texte en 16 pixels (pas de zoom automatique sur iPhone), boutons « Annuler » et « Envoyer » empilés. En la testant, un autre défaut est apparu : la fenêtre était placée sous la barre de navigation (ordre d'affichage 2000 au lieu de 8000), qui cachait son titre. Elle utilise maintenant la valeur commune des fenêtres, `var(--z-index-modal-bottom)`.
- Audit mobile : 0 cible trop petite et 0 contenu coupé sur `/forum`, `/forum/topic/[id]` et `/forum/topic/[id]/reply`, à 360, 390 et 430 pixels de large (avant : 35 sur un sujet, 27 sur la réponse). Captures téléphone dans `logs/053-mobile/`.
- Captures ordinateur des 7 thèmes inchangées ; suite complète des tests de bout en bout : 52 réussis, 1 ignoré volontairement (l'audit mobile).
