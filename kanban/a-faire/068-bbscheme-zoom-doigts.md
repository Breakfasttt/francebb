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
