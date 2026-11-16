---
id: 100
title: "Refonte de l'habillage de BBScheme"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 13 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 100 — Refonte de l'habillage de BBScheme

## Pourquoi

Refaire l'habillage de BBScheme (barres d'outils, panneaux de réserve, fenêtres) selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 13 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 13 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Ne pas toucher au lecteur (`packages/bbscheme-player`) ni au pincement à deux doigts : seulement ce qui entoure le terrain.
- Garder les paramètres d'adresse `?id=`, `&embed=true` et `&layout=vertical`.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** L'habillage de `/bbscheme` (barres d'outils, réserves, fenêtres, chargement) utilise maintenant les composants et les couleurs v2 de `packages/ui`. La logique du plateau (déplacements, tracés, ballon, images, partage, export), le lecteur `packages/bbscheme-player`, le zoom à la molette et le pincement à deux doigts n'ont pas changé. Les paramètres d'adresse `?id=`, `&embed=true` et `&layout=vertical` sont gardés.
- **Ordinateur** : barre d'outils en haut (sélection, crayon, état du joueur, gomme, lâcher le ballon, effacer les dessins, annuler, tout vider ; zoom, rotation, infos, plein écran, aide, « Partager »), une réserve de chaque côté du terrain, barre de l'animation en bas (précédente, lecture, compteur, suivante ou ajout, dupliquer, supprimer, vitesse, GIF) avec le pion choisi (« Remettre en réserve », « Désélectionner », choix du Star Player). Chaque bouton d'icône a un nom lu par les lecteurs d'écran et une info-bulle.
- **Téléphone** : le terrain vertical prend toute la place entre deux barres. En haut, les cinq outils principaux et « Plus d'outils » (panneau du bas : pion choisi, zoom, ballon, dessins, infos, rotation, plein écran, vitesse, images, GIF, partage, aide, tout vider). En bas, « Bleue » et « Rouge » ouvrent chaque réserve dans un panneau du bas (choisir un pion le referme), et la lecture de l'animation. La barre qui défilait avec des flèches et les deux bandeaux de réserve sont remplacés.
- **Gagné au passage** : sur téléphone, le choix d'un Star Player, la rotation, le plein écran, la gomme (outil) et « Lâcher le ballon » (l'ancien bouton « ballon » du téléphone ne faisait rien de plus que la sélection) ; sur ordinateur, « Remettre en réserve », « Désélectionner » et « Effacer les dessins ». Le choix « Aucun » du Star Player remet maintenant le pion générique (avant, il ne faisait rien).
- **Chargement** : BBScheme a son propre indicateur (« Chargement du plateau… » sur le terrain pendant la lecture d'un `?id=`) ; la classe `.loader-container`, qui n'avait plus de style, n'est plus utilisée ; `/classement` n'est pas touché.
- **Mode embed** : il affichait le lecteur sous la barre du site et son pied de page, et le bas du lecteur était caché. Le lecteur couvre maintenant tout le cadre, sans coquille, à une largeur qui tient dans la hauteur. Un `embed=true` sans `id` affiche « Aucun plateau à afficher » (avant : un terrain vide sans commandes).
- Fenêtres : « Tout vider » passe par `ConfirmDialog` ; l'aide (« Guide de BBScheme », réécrite) et l'export en GIF par `Sheet`. Il n'y avait aucun `confirm()` ni `alert()` natif.

**Fichiers.**
- Nouveaux : `apps/site/app/bbscheme/component/ToolButton.tsx`, `HelpSheet.tsx`, `GifExportSheet.tsx`, `apps/site/tests/e2e/inventaire/bbscheme.spec.ts`.
- Refaits : `apps/site/app/bbscheme/page.tsx` (habillage seulement), `component/FigurineBox.tsx`, `page.css` (réduit aux règles du cadre du terrain, dont dépendent les gestes au doigt).
- Modifiés : `apps/site/app/theme/theme.saison3.css` (règles BBScheme devenues sans objet retirées), `tests/e2e/bbscheme-pinch.spec.ts` (le zoom est lu sur la largeur du terrain, le curseur étant rangé dans « Plus d'outils » sur téléphone), `tests/e2e/mobile-audit.spec.ts` (ajout du mode embed), `lint-baseline.json`, `docs/refonte/inventaire.md`, `docs/features/bbscheme/README.md`, `docs/GLOSSAIRE.md` (« Iframe »), skill `mobile-ux`.
- Supprimés (plus importés nulle part) : `page-mobile.css`, `component/FigurineBox.css`, et l'ancienne interface jamais branchée `component/Sidebar.tsx`, `Sidebar.css`, `Sidebar-mobile.css`, `Toolbar.tsx`, `Toolbar.css`, `Toolbar-mobile.css`. `Dugout.tsx` (fosses désactivées) est gardé.

**Ce qui est vérifié.**
- Le test d'inventaire (7 tests, dont un propre au téléphone) a été écrit avant la refonte ; l'ancienne version a seulement reçu des noms accessibles (boutons d'icône, curseur, champ de vitesse, listes de rosters, régions « Terrain », « Plateau » et réserves, pions de la réserve). Il passait sur l'ancienne version et passe sur la nouvelle sans modification de ses attentes, en ordinateur et en téléphone (13 réussis, 1 ignoré : le test propre au téléphone en taille ordinateur). Seul ajout après coup : masquer la pastille de développement de Next.js, qui couvrait le bouton « Bleue » sur certains écrans.
- Inventaire BBScheme, pincement, `coquille` et `smoke` sur les deux tailles : 74 réussis, 2 ignorés. Un échec isolé (délai dépassé pendant une compilation lente du serveur de développement) a repassé trois fois de suite. Les autres tests qui citent BBScheme (`accueil`, `forum-editeur`, `forum-sujet`), sur les deux tailles : 102 réussis.
- `npx tsc --noEmit` sans erreur ; plafond ESLint du site abaissé de 319 à 261.
- Audit mobile de `/bbscheme` et du mode embed à 360 et 390 pixels : rien de coupé, pas de défilement de côté, aucun texte sous 12 pixels ni champ sous 16 pixels ; reste le logo de la barre du site (coquille, 35 pixels de haut).
- Captures relues à 360, 390 et 1280 pixels en Vestiaire, Saison 3 et NAF, puis supprimées.

**Choix à valider par le responsable.** Sur téléphone : garder la barre haute du site (bouton retour, logo) plutôt que de la couvrir ; cinq outils en haut et le reste dans « Plus d'outils » ; réserves et lecture en bas, à portée de pouce ; la vitesse et le zoom au curseur sont dans « Plus d'outils » (le pincement reste le geste principal). Sur ordinateur : animation et pion choisi dans une barre sous le terrain. Les couleurs des deux équipes (bleu, rouge) restent fixes dans tous les thèmes, comme les pions.

**À essayer à la main sur son téléphone.**
- `/bbscheme` : ouvrir « Bleue », choisir un roster, toucher un pion (le panneau se referme), puis une case ; dessiner au crayon ; changer l'état d'un joueur avec la baguette ; annuler.
- Pincer le terrain pour zoomer, le faire défiler d'un doigt ; vérifier que la page elle-même ne bouge pas.
- « Plus d'outils » : régler le zoom et la vitesse, choisir un Star Player, « Remettre en réserve », « Partager » (le lien est copié), « Exporter en GIF » puis « Télécharger ».
- Ajouter quelques images avec le bouton à droite du compteur, puis « Lecture ».
- Ouvrir un lien partagé avec `&embed=true` : le lecteur seul doit remplir l'écran.
