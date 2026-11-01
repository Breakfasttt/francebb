# BBScheme (plateau tactique)

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

BBScheme est un plateau de Blood Bowl interactif : le coach place des joueurs des deux équipes et le ballon, dessine des flèches, change l'état des joueurs (debout, à terre, sonné…) et enchaîne jusqu'à 50 images pour expliquer une action pas à pas. Le résultat se partage par un lien et s'affiche, animé, dans un message du forum ou un article grâce à la balise BBCode `[bbscheme]`.

## Ce que voit le coach

- `/bbscheme` : l'éditeur. On choisit le roster de chaque équipe (35 fichiers dans `public/data/roster/`, dont les Star Players), on place les pions, on dessine, on ajoute des images, on lit l'animation (vitesse réglable), on tourne ou on zoome le terrain, on passe en plein écran. Le bouton retour fait 44 pixels, sur ordinateur comme sur téléphone (carte 148). Depuis la carte 100 (refonte, ADR 0006), l'habillage utilise les composants de `packages/ui` : sur ordinateur, barre d'outils en haut (outils, zoom, rotation, infos, plein écran, aide, « Partager »), une réserve de chaque côté du terrain, barre de l'animation en bas (images, vitesse, GIF) avec le pion choisi (« Remettre en réserve », « Désélectionner », choix du Star Player).
- Bouton « Partager » : le plateau est enregistré en base et le lien `/bbscheme?id=…` est copié dans le presse-papiers.
- `/bbscheme?id=…` recharge un plateau partagé dans l'éditeur (un indicateur « Chargement du plateau… » couvre le terrain pendant la lecture) ; `&embed=true` n'affiche que le lecteur, par-dessus la coquille du site (pour une iframe), à une largeur qui tient dans la hauteur du cadre ; `&layout=vertical` force le terrain vertical.
- Dans un message : `[bbscheme]lien ou id[/bbscheme]` (ou `[bbscheme=vertical]`) affiche le lecteur `BBSchemePlayer` (lecture, pause, image par image, vitesse).
- Accès : tout le monde, même sans compte. Le nom du créateur est enregistré s'il est connecté.
- **Sur téléphone** (1024 pixels de large ou moins) : l'éditeur reste complet. Depuis la carte 100, le terrain, toujours vertical, prend toute la place entre deux barres : en haut, une barre compacte des outils principaux (sélection, crayon, état du joueur, gomme, annuler) et le bouton « Plus d'outils », qui ouvre un panneau du bas avec le reste (pion choisi, zoom, ballon, dessins, infos, rotation, plein écran, vitesse, images, GIF, partage, aide, tout vider) ; en bas, à portée de pouce, les boutons « Bleue » et « Rouge » qui ouvrent chaque réserve dans un panneau du bas, et la lecture de l'animation (précédente, lecture, compteur, suivante ou ajout). Choisir un pion dans une réserve referme le panneau : on touche ensuite la case du terrain. Tous les boutons font 44 pixels, les champs 16 pixels. Le bouton retour va dans la barre haute du site (`MobilePortal`). On zoome aussi en pinçant le terrain à deux doigts (carte 068) : le point situé entre les doigts reste en place, dans les bornes du curseur (50 % à 200 %) ; un seul doigt fait défiler le terrain. Le lecteur intégré dans les messages a ses propres règles téléphone (`BBSchemePlayer-mobile.css`, dans le paquet `packages/bbscheme-player`).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/bbscheme/page.tsx` | L'éditeur entier (environ 1 550 lignes, composant client) : logique du plateau et habillage en classes Tailwind |
| `apps/site/app/bbscheme/component/ToolButton.tsx` | Bouton d'outil (icône, nom accessible, info-bulle, état allumé `aria-pressed`) |
| `apps/site/app/bbscheme/component/HelpSheet.tsx`, `GifExportSheet.tsx` | Fenêtres d'aide et d'export en GIF (`Sheet` de `packages/ui`) |
| `apps/site/common/hooks/usePinchZoom.ts` | Hook réutilisable du zoom au pincement à deux doigts (carte 068), branché sur le cadre `.pitch-viewport` de l'éditeur |
| `apps/site/app/bbscheme/actions.ts` | Actions serveur `saveBoardState` et `getBoardState` |
| `packages/bbscheme-player/src/BBSchemePlayer.tsx` | Lecteur seul, utilisé en mode `embed` et dans les messages. Il est dans le paquet `@bbfrance/bbscheme-player` depuis la carte 024 (voir son `CLAUDE.md`) et reçoit la fonction `loadBoard`, qui lit le plateau |
| `packages/bbscheme-player/src/Pitch.tsx`, `Token.tsx` | Le terrain (26 × 15 cases) et un pion, utilisés par le lecteur et par l'éditeur |
| `packages/bbscheme-player/src/types.ts` | Les types du plateau (`TokenData`, `BoardFrame`…), partagés par le lecteur et par l'éditeur |
| `apps/site/app/bbscheme/component/FigurineBox.tsx` | Réserve de pions d'une équipe (colonne sur ordinateur, panneau du bas sur téléphone) |
| `apps/site/lib/bbcode.ts` | Transforme `[bbscheme]` en élément `<bb-scheme data-board-id=…>` |
| `apps/site/common/components/BBCodeContent/BBCodeContent.tsx` | Déclare l'élément `<bb-scheme>` et y monte `BBSchemePlayer` du paquet, en lui passant l'action serveur `getBoardState` |
| `apps/site/public/data/roster/*.json` | Rosters des équipes et Star Players |

## Les pièges

- **Paquet du lecteur** (carte 024) : `BBCodeContent` et l'éditeur prennent le lecteur, le terrain, les pions et les types dans `@bbfrance/bbscheme-player`, et non plus dans `app/bbscheme/component` ou `../page`. Le paquet ne lit pas la base : le site lui passe l'action serveur `getBoardState`. Il charge toujours les rosters par l'adresse `/data/roster/…` du site. Ses boutons sont ceux de `@bbfrance/ui` (36 pixels sur ordinateur, 44 sur téléphone). ESLint ne relit pas le paquet (le cliquet ne couvre que `apps/site`) : des `any` et les couleurs de jeu écrites en dur dans `Token.tsx`, `Token.css` et `Pitch.css` y restent.
- `saveBoardState` reste ouvert aux visiteurs (le partage est public), mais refuse un plateau de plus de 500 Ko ou qui n'est pas un plateau valide (carte 050). Un plateau identique (même empreinte) n'est enregistré qu'une fois.
- Un plateau enregistré n'est jamais modifié : chaque partage crée un nouvel identifiant si le contenu change.
- L'identifiant passé dans `[bbscheme]` est inséré dans un attribut HTML ; il est protégé parce que `parseBBCode` échappe d'abord les guillemets. Ne pas déplacer ce traitement avant l'échappement.
- La fonction « fosses » (zones des joueurs sortis : réserve, KO, blessés, expulsés) est désactivée. Son affichage (`Dugout.tsx`, `Dugout.css`) et sa fonction `handleZoneClick`, qui n'étaient plus utilisés, ont été supprimés par la carte 146 ; pour la remettre, il faudrait les récrire (ils restent lisibles dans l'historique git).
- **Bulle d'infos d'un pion** (carte 146) : au survol d'un pion, `Token.tsx` (paquet du lecteur) affiche une bulle (`role="tooltip"`) avec les caractéristiques du joueur. Elle est mesurée puis placée par la fonction `placeTooltip` au-dessus du pion, ramenée dans la partie visible de l'écran (`window.visualViewport`), et passée sous le pion s'il n'y a pas la place au-dessus : elle ne sort plus de l'écran près de la réserve de gauche.
- **Export GIF** : le fond des images capturées est la couleur de fond du thème choisi (variable `--bb-bg`), lue au moment de l'export (carte 146).
- Couleurs : l'habillage suit les variables v2 (`bg-bb-surface`, `text-bb-text`…) dans les 8 thèmes ; seules les couleurs des deux équipes (bleu, rouge, comme les pions) et celles du terrain (dans le paquet) sont fixes. Les règles propres à BBScheme du thème Saison 3 ont été retirées (carte 100).
- L'éditeur est un cadre fixé entre la barre haute du site (57 pixels sur téléphone, 65 sur ordinateur) et le pied de page de l'ordinateur (40 pixels) : si la hauteur de l'une de ces barres change, corriger les classes `top-[57px]`, `lg:top-[65px]` et `lg:bottom-10` de `page.tsx`.
- Gestes sur le terrain : les classes `pitch-viewport`, `pitch-resizer` et `pitch-rotator` portent les classes Tailwind des gestes (défilement au doigt, coupure des animations pendant un pincement, carte 101) et servent à `handleResize` et à l'export en GIF (capture de `.pitch-resizer`) : ne pas les renommer.
- **Zoom au pincement** (carte 068) : le cadre `.pitch-viewport` porte `touch-action: pan-x pan-y` (le navigateur fait défiler le terrain au doigt mais ne zoome plus la page) et le hook `usePinchZoom` annule le geste par défaut (`preventDefault`) dès que deux doigts sont posés. Le défilement à un doigt de `page.tsx` (`handleTouchStart`, `handleTouchMove`) s'arrête quand un deuxième doigt arrive. Pendant le geste, la classe `pinching` coupe les animations de taille du terrain. Les bornes du zoom sont les constantes `ZOOM_MIN` et `ZOOM_MAX` de `page.tsx`, communes au curseur, à la molette et au pincement. Le test `tests/e2e/bbscheme-pinch.spec.ts` simule deux doigts par le protocole de pilotage de Chrome (CDP) ; l'essai sur un vrai téléphone reste à faire.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Plateau (`BBSchemeState`) | Un schéma enregistré : son contenu JSON (images, dessins, rosters, rotation, vitesse), son empreinte et son créateur éventuel. |
| Image (*frame*) | Une position de tous les pions ; la suite des images forme l'animation (50 au plus). |
| Pion (*token*) | Un joueur bleu, rouge, ou le ballon, avec son état (`up`, `prone`, `stunned`…). |
| Roster | Liste des joueurs possibles d'une équipe (caractéristiques, compétences), lue dans un fichier JSON. |
| Empreinte (*hash*) | Résumé MD5 du contenu, qui sert à reconnaître un plateau déjà enregistré. |
| Mode `embed` | Affichage du seul lecteur, pour intégrer un plateau ailleurs. |
| Élément personnalisé (`<bb-scheme>`) | Balise HTML inventée par le site, que le navigateur remplace par le lecteur React quand elle apparaît dans un message. |

## État

- Marche : édition, animation, partage par lien, lecture dans les messages, interface téléphone dédiée.
- Poids (carte 019) : les bibliothèques d'export GIF (`html2canvas` et `gifshot`) sont chargées par un import dynamique, seulement au clic sur l'export. Le JavaScript chargé à l'ouverture de `/bbscheme` pèse 211 Ko compressés (mesure du 30/10/2026, objectif sous 235 Ko). L'image du GIF exporté reste une balise `<img>` : c'est une image fabriquée dans le navigateur (adresse `data:`), que `next/image` ne sait pas optimiser.
- Manque : limite de fréquence sur `saveBoardState`.
- Refonte (carte 100) : test d'inventaire `tests/e2e/inventaire/bbscheme.spec.ts` (section 13 de `docs/refonte/inventaire.md`), écrit avant la refonte et passé sans modification après, en taille ordinateur et téléphone. Le test du pincement lit maintenant le zoom sur la largeur du terrain, le curseur étant rangé dans « Plus d'outils » sur téléphone.
- La lecture dans un message est vérifiée par le test smoke « un message contenant [bbscheme] affiche le lecteur », en taille ordinateur et téléphone, sur un sujet de test créé par `tests/e2e/globalSetup.ts`.
- Cartes ouvertes : 071 (sortir l'éditeur dans une application à part), 068 (zoom à deux doigts : fait, reste l'essai sur un vrai téléphone).
