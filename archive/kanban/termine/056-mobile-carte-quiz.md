---
id: 056
title: Mobile : carte et quiz
epic: E03
app: site
depends_on: [049]
adr: 0004
verify: audit mobile : 0 cible trop petite hors liens de texte sur /carte et /bbquizz
---

# 056 — Mobile : carte et quiz

## Pourquoi

Sur `/carte`, les boutons « Tournois » / « Ligues » (38 px) et le zoom (30 px) sont trop petits ; sur `/bbquizz`, les onglets font 30 px.

## Action

Agrandir ces boutons à 44 pixels minimum en taille téléphone.

## Résultat

- **`/carte`** (règles dans `app/carte/page-mobile.css`, ordinateur inchangé) : les boutons « Tournois » et « Ligues » passent de 38 à 44 pixels de haut ; les boutons de zoom de Leaflet (la bibliothèque qui affiche la carte) passent de 30 à 44 pixels et sont placés sous les boutons « Tournois / Ligues », qu'ils chevauchaient sur un écran de 360 pixels. Dans la bulle d'un repère, la croix de fermeture (24 pixels) et le lien « Détails » (28 pixels de haut) passent à 44 pixels ; le lien reçoit pour cela la classe `map-popup-link` dans `LeafletMapContainer.tsx`. La zone qui réagit au toucher autour d'un repère passe de 25 × 41 à 45 × 61 pixels, sans déplacer l'image. En plein écran, la carte prend la hauteur réellement visible (`100dvh`) au lieu de `100vh`, qui passait sous la barre d'adresse des navigateurs de téléphone.
- **`/bbquizz`** (nouveaux fichiers `QuizLeaderboard-mobile.css` et `QuizEngine-mobile.css`) : les onglets « Du jour », « Semaine » et « Panthéon » passent de 30 à 44 pixels de haut. Pendant une partie, les trois jokers passent de 38 à 44 pixels ; les lettres des réponses (A à D), les pastilles des jokers et l'étiquette de catégorie passent à 12 pixels au moins (11 et 10 pixels avant). La logique de la partie, tenue par le serveur depuis la carte 051, n'est pas modifiée.
- **Le patch d'un agent précédent** sur `LeafletMapContainer.tsx` (lien de secours vers `/tournois`) était déjà appliqué par la carte 051 : rien à reprendre.
- **Mesures** (360, 390 et 430 pixels ; page d'accueil du quiz, partie en cours, réponse affichée, carte, bulle ouverte, plein écran) : avant, 6 à 9 cibles trop petites sur `/carte`, 3 sur `/bbquizz` et 6 pendant une partie, plus 7 textes de moins de 12 pixels pendant une partie ; après, 0 sur `/bbquizz` et pendant la partie, et sur `/carte` seulement les deux liens de texte du crédit obligatoire « Leaflet | © OpenStreetMap ». Aucun défilement horizontal. Les tuiles de la carte qui dépassent du bord sont coupées par le cadre de la carte (faux positif déjà connu). Audit mobile complet : 47 cibles trop petites au total avant, 33 après. Captures dans `logs/056-mobile/avant/` et `logs/056-mobile/apres/`.
- **Vérifications** : types, 0 erreur ; ESLint, 551 erreurs, égal au plafond ; tests de bout en bout, 52 réussis et 1 ignoré volontairement (l'audit), dont les captures ordinateur des 7 thèmes et le test de sécurité de BBQuizz.
