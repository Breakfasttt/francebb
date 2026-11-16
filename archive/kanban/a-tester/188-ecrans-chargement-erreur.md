---
id: 188
title: "Écrans de chargement et d'erreur aux couleurs du site"
epic: E10
app: site
depends_on: []
verify: "en appuyant sur un lien, une fine barre colorée avance en haut de l'écran jusqu'à la page suivante ; une page introuvable répond toujours 404 ; une erreur du serveur affiche une page en français, dans le style de la page introuvable, avec « Réessayer » et « Retour à l'accueil »"
---

# 188 — Écrans de chargement et d'erreur aux couleurs du site

## Pourquoi

Audit, section 4.7 : sur une connexion lente, un appui sur un onglet ne montre rien pendant que la page se prépare, comme si l'appui avait raté ; si la base ne répond pas, le coach voit une page d'erreur brute en anglais.

## Action

`app/loading.tsx` (et des variantes pour le forum et un sujet si utile) avec les silhouettes `Skeleton` de `packages/ui` ; `app/error.tsx` et `app/global-error.tsx` dans le style de la page introuvable (« Terrain impraticable »), avec « Réessayer » et « Retour à l'accueil » ; textes en français ; vérifié dans les 8 thèmes et sur téléphone.

## Résultat

Quand on appuie sur un lien du site, une fine barre colorée avance maintenant en haut de l'écran jusqu'à l'arrivée de la page suivante (`common/components/NavigationProgress/NavigationProgress.tsx`, monté dans `app/layout.tsx`). Elle n'apparaît qu'après 150 millisecondes, pour ne pas clignoter quand la page arrive aussitôt, et s'arrête seule au bout de 15 secondes.

Une première version utilisait des écrans de chargement de Next.js (`loading.tsx`, des silhouettes grises). Les tests de bout en bout ont montré qu'avec eux, Next.js envoie le début de la page, avec la réponse « OK », avant la fin des contrôles. Une page introuvable (forum réservé, sujet réservé) répondait alors « OK » au lieu de 404, et chaque renvoi vers une autre page (`redirect()`) se faisait dans le navigateur, avec une erreur React qui interrompait la navigation suivante. Le responsable a choisi le 5 novembre de les retirer et de les remplacer par la barre, qui ne change rien à la réponse du serveur.

Quand une page plante, `app/error.tsx` affiche, dans la coquille du site, une carte dans le style de la page introuvable : « Match interrompu par l'orage ! », une phrase rassurante, les boutons « Réessayer » et « Retour à l'accueil » (44 pixels, empilés sur toute la largeur sur téléphone) et, en petit, la référence de l'erreur notée dans les journaux du serveur. « Réessayer » appelle `unstable_retry`, la fonction que conseille Next.js 16.2 : elle redemande la page au serveur, alors que `reset` l'aurait réaffichée sans la redemander, donc avec la même erreur. `app/global-error.tsx` montre le même écran quand c'est la mise en page générale qui plante : il pose ses propres balises `<html>` et `<body>`, charge la feuille du site et prend les couleurs du thème par défaut. Le contenu commun est dans `common/components/ErrorScreen/ErrorScreen.tsx`. Les couleurs ne sont que des variables v2.

La fiche `pages-diverses`, la skill `reuse-first` et le glossaire sont à jour. `corepack pnpm check` passe. Les écrans d'erreur n'ont pas été vus à l'écran (il faudrait provoquer une panne de la base).
