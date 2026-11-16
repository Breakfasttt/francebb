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

## Résultat

L'IA ne peut pas manipuler un vrai téléphone. Les protections prévues par cette carte sont donc construites directement dans la coquille (carte 081), et vérifiées dans un navigateur en taille téléphone par `tests/e2e/inventaire/coquille.spec.ts` :
- la barre basse se cache dès qu'un champ de saisie a le focus (attribut `data-typing` sur `<html>`) ;
- la zone protégée de l'iPhone est respectée (`env(safe-area-inset-bottom)`) ;
- la barre est absente de BBScheme ;
- le bandeau cookies, le bouton de filtres, les notifications et les widgets de développement sont remontés au-dessus de la barre ;
- ordre de superposition : barre 5000, panneau « Plus » 7000 et 7100, fenêtres 8000, notifications 9000.

**À essayer par le user sur son téléphone** (iPhone et Android si possible), avant de ranger la carte dans `termine/` :
1. Ouvrir un sujet du forum et taper une réponse : le clavier ne cache pas la zone de texte, et la barre basse disparaît puis revient.
2. Sur BBScheme, le pincement à deux doigts et les barres d'outils fonctionnent, sans barre basse.
3. Le bandeau cookies (navigation privée) reste au-dessus de la barre, et ses boutons se touchent facilement.
4. Ouvrir « Plus » : tout se lit sans zoom, et la page « Cette page » d'un sujet du forum affiche ses outils.
