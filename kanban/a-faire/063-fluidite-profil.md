---
id: 063
title: "Fluidité mobile : page du profil à 90/100"
epic: E03
app: site
depends_on: [059]
adr: 0004
verify: pnpm lighthouse (dans apps/site) donne au profil une note médiane d'au moins 90/100 et un CLS sous 0,1, et docs/mobile-audit.md est mis à jour
---

# 063 — Fluidité mobile : page du profil à 90/100

## Pourquoi

La mesure Lighthouse de la carte 059 (voir `docs/mobile-audit.md`, section « Fluidité sur téléphone ») donne à la page `/profile` une note de **75/100** sur téléphone, sous l'objectif de 90. Les autres pages principales sont entre 91 et 97.

Causes relevées par Lighthouse sur le profil :

1. **Contenu qui saute pendant le chargement** (CLS de 0,25, la limite conseillée est 0,1 ; c'est la cause principale). La carte de résumé du profil (`app/profile/component/ProfileSidebar.tsx`, boîte `profile-summary-box`) est d'abord affichée dans sa version ordinateur, puis remplacée par sa version téléphone quand le JavaScript a démarré : le hook `useIsMobile` ne connaît la largeur de l'écran que dans le navigateur. Tout ce qui est en dessous est décalé.
2. **Plus gros élément affiché tard** (LCP de 3,9 secondes, conseillé sous 2,5) : le sous-titre de la page attend une dizaine de petits fichiers CSS qui bloquent l'affichage (gain estimé de 610 ms).
3. **Logo du menu latéral trop lourd** : 85 Ko de plus que nécessaire pour son affichage en 96 × 42 pixels (commun à toutes les pages).
4. **JavaScript inutilisé** (environ 21 Ko) et code de compatibilité pour d'anciens navigateurs (14 Ko), communs à toutes les pages.

## Action

- Supprimer le saut de la carte de résumé : choisir l'affichage téléphone ou ordinateur en CSS (`@media (max-width: 1024px)`, le seuil unique du site) plutôt qu'avec `useIsMobile`, ou réserver dès le départ la place de la version téléphone. Suivre les skills `mobile-ux` et `ui-components`.
- Réduire le logo à une taille adaptée à son affichage (composant `Image` de Next.js avec une largeur et une hauteur réelles, ou un fichier plus léger). Ce gain profite à toutes les pages.
- Regarder si les fichiers CSS bloquants de la page peuvent être regroupés ou allégés (les causes 2 et 4 touchent tout le site : si la correction est large, proposer une carte à part).
- Relancer `pnpm lighthouse`, vérifier le profil en taille téléphone (360 et 390 pixels) et mettre à jour `docs/mobile-audit.md`.
