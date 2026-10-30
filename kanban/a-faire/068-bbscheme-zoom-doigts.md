---
id: 068
title: "BBScheme : zoom à deux doigts sur le terrain"
epic: E03
app: site
depends_on: [061]
adr:
verify: sur téléphone (390 pixels, puis un vrai téléphone), écarter deux doigts sur le terrain de /bbscheme l'agrandit et les rapprocher le réduit, sans zoomer toute la page ni gêner le déplacement des joueurs ; le curseur de zoom suit la valeur ; audit mobile de /bbscheme toujours à 0 défaut
---

# 068 — BBScheme : zoom à deux doigts sur le terrain

## Pourquoi

Sur téléphone, le terrain de BBScheme ne se règle qu'avec le curseur de zoom de la barre d'outils. Le geste habituel sur un téléphone, écarter ou rapprocher deux doigts (« pincer »), n'agit pas sur le terrain. Ce point faisait partie de la carte 061 ; il a été reporté ici parce qu'il demande de gérer les gestes tactiles dans l'éditeur (`app/bbscheme/page.tsx`, plus de 1 600 lignes), sans casser le déplacement des joueurs au doigt, le dessin et le défilement du terrain. C'est un travail à part entière, à tester sur un vrai téléphone.

## Action

- Lire comment le zoom est appliqué aujourd'hui (curseur `mobile-zoom-control`, cadre `.pitch-viewport`).
- Reconnaître le geste à deux doigts sur le terrain (événements tactiles ou `pointer events` du navigateur, sans nouvelle bibliothèque) et modifier la même valeur de zoom que le curseur, en gardant le point situé entre les deux doigts au même endroit de l'écran.
- Empêcher que le geste zoome toute la page à la place du terrain (propriété CSS `touch-action` sur le terrain seulement).
- Vérifier que déplacer un joueur, dessiner et faire défiler le terrain avec un seul doigt marchent comme avant ; vérifier l'affichage ordinateur inchangé.
- Mettre à jour la fiche `docs/features/bbscheme`.

## Résultat

- Le pincement à deux doigts règle maintenant le zoom du terrain. Le nouveau hook `apps/site/common/hooks/usePinchZoom.ts` écoute les événements tactiles natifs du cadre `.pitch-viewport` : avec deux doigts, il annule le comportement par défaut du navigateur (la page entière ne zoome plus), calcule le zoom à partir de l'écart entre les doigts, dans les bornes du curseur (50 % à 200 %), et fait défiler le cadre pour garder le point situé entre les doigts au même endroit. Le curseur suit la valeur, puisqu'il lit la même variable `zoom`. Aucune bibliothèque ajoutée.
- `page.tsx` : bornes du zoom réunies dans les constantes `ZOOM_MIN` et `ZOOM_MAX` (curseurs, molette, pincement) ; le défilement à un doigt s'interrompt dès qu'un deuxième doigt est posé.
- `page.css` : `touch-action: pan-x pan-y` sur `.pitch-viewport` (défilement au doigt permis, zoom de la page bloqué) et animations de taille coupées pendant le geste (classe `pinching`).
- Test `apps/site/tests/e2e/bbscheme-pinch.spec.ts`, en 390 × 844 pixels : deux doigts simulés par le protocole de pilotage de Chrome (CDP) agrandissent puis réduisent le terrain sans zoomer la page ; un seul doigt fait encore défiler le terrain agrandi. Le déplacement d'un pion se fait par deux touchers (le pion, puis la case) : il n'existait pas de test de glisser d'un pion, aucun n'a été ajouté.
- Vérifications : ce test, `smoke.spec.ts` et `visual-themes.spec.ts` passent (69 tests) ; audit mobile de `/bbscheme` à 0 défaut en 390 × 844 et 360 × 640 ; `npx tsc --noEmit` sans erreur ; `lint-ratchet` sans plafond dépassé (site 817/817, `bbscheme-player` 23/23).
- Fiche `docs/features/bbscheme/README.md`, glossaire (CDP, hook React, pincement) et skill `reuse-first` mis à jour.
- **Reste à faire par le user** : l'essai sur un vrai téléphone (Android et iPhone), en vérifiant aussi le dessin au doigt et le choix d'un pion pendant et après un pincement.
