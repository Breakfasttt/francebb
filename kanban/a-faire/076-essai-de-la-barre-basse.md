---
id: 076
title: "Essai de la barre basse sur téléphone"
epic: E08
app: site
depends_on: [075]
adr: 0006
verify: compte rendu dans la carte, avec captures prises sur un vrai téléphone (clavier ouvert, éditeur, BBScheme, bandeau cookies)
---

# 076 — Essai de la barre basse sur téléphone

## Pourquoi

L'avocat du diable a signalé qu'une barre fixée en bas de l'écran peut cacher le champ de saisie quand le clavier virtuel s'ouvre, gêner l'éditeur de message et le terrain de BBScheme, ou se superposer au bandeau cookies. Il faut le vérifier avant de construire la vraie coquille.

## Action

- Construire une maquette jetable de la barre basse sur une page d'essai, sans toucher la navigation actuelle.
- Essayer sur un vrai téléphone, iPhone et Android si possible : clavier ouvert dans un champ, éditeur BBCode, terrain BBScheme avec pincement, bandeau cookies, notifications.
- Tester le masquage de la barre quand un champ a le focus (événements `focusin` et `focusout`, et `visualViewport`), et la marge de la zone protégée de l'iPhone (`env(safe-area-inset-bottom)`).
- Écrire dans la carte ce qui marche, ce qui ne marche pas, et l'ordre de superposition retenu. Supprimer la page d'essai.
