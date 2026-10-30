# BBScheme (plateau tactique)

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

BBScheme est un plateau de Blood Bowl interactif : le coach place des joueurs des deux équipes et le ballon, dessine des flèches, change l'état des joueurs (debout, à terre, sonné…) et enchaîne jusqu'à 50 images pour expliquer une action pas à pas. Le résultat se partage par un lien et s'affiche, animé, dans un message du forum ou un article grâce à la balise BBCode `[bbscheme]`.

## Ce que voit le coach

- `/bbscheme` : l'éditeur. On choisit le roster de chaque équipe (35 fichiers dans `public/data/roster/`, dont les Star Players), on place les pions, on dessine, on ajoute des images, on lit l'animation (vitesse réglable), on tourne ou on zoome le terrain, on passe en plein écran.
- Bouton « Partager » : le plateau est enregistré en base et le lien `/bbscheme?id=…` est copié dans le presse-papiers.
- `/bbscheme?id=…` recharge un plateau partagé dans l'éditeur ; `&embed=true` n'affiche que le lecteur ; `&layout=vertical` force le terrain vertical.
- Dans un message : `[bbscheme]lien ou id[/bbscheme]` (ou `[bbscheme=vertical]`) affiche le lecteur `BBSchemePlayer` (lecture, pause, image par image, vitesse).
- Accès : tout le monde, même sans compte. Le nom du créateur est enregistré s'il est connecté.
- **Sur téléphone** (moins de 1024 pixels) : l'éditeur ne bascule **pas** sur `DesktopOnlyFallback` (l'appel est commenté dans `page.tsx`), contrairement à ce qu'indique la skill `mobile-ux`. Il propose une interface dédiée (`page-mobile.css`, environ 450 lignes) : terrain toujours vertical, barre d'outils qui défile horizontalement, curseur de zoom, panneaux d'équipe bleue et rouge ouverts par des boutons, bouton retour placé dans la barre de navigation par `MobilePortal`, déplacement du terrain au doigt. Depuis la carte 057, tous les boutons (outils, flèches, fermeture d'un panneau) font 44 pixels ; une flèche fait défiler la barre d'un écran presque entier (fonction `scrollMobileToolbar`) ; après un glissement, l'outil le plus proche se cale sur le bord gauche (« aimantation », `scroll-snap`) et un fondu sur les bords remplace la coupure nette de l'outil suivant ; le champ de vitesse est en 16 pixels (l'iPhone ne zoome pas en tapant dedans) ; dans un panneau de réserve, la liste des rosters prend toute la largeur et les textes font 12 pixels au moins. La hauteur utilise `100dvh` (correct avec la barre d'adresse). Depuis la carte 061, le haut de l'éditeur est calculé depuis la hauteur de la barre de navigation (variable CSS `--mobile-nav-height`, 64 pixels, dans `globals-mobile.css`) plus les deux bandeaux d'outils : variable `--bbscheme-mobile-top`. Avant, 168 pixels étaient écrits en dur en comptant une barre de 58 pixels, si bien que les outils recouvraient le bas de la barre. Pas encore de zoom à deux doigts (carte 068). Le lecteur intégré dans les messages a ses règles téléphone depuis la carte 061 (`BBSchemePlayer-mobile.css`, dans le paquet `packages/bbscheme-player` depuis la carte 024) : commandes sur deux lignes, boutons de 44 pixels, champ de vitesse en 16 pixels ; mesuré par l'audit mobile sur un sujet de test qui contient un schéma.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/bbscheme/page.tsx` | L'éditeur entier (environ 1 750 lignes, composant client) |
| `apps/site/app/bbscheme/actions.ts` | Actions serveur `saveBoardState` et `getBoardState` |
| `packages/bbscheme-player/src/BBSchemePlayer.tsx` | Lecteur seul, utilisé en mode `embed` et dans les messages. Il est dans le paquet `@bbfrance/bbscheme-player` depuis la carte 024 (voir son `CLAUDE.md`) et reçoit la fonction `loadBoard`, qui lit le plateau |
| `packages/bbscheme-player/src/Pitch.tsx`, `Token.tsx` | Le terrain (26 × 15 cases) et un pion, utilisés par le lecteur et par l'éditeur |
| `packages/bbscheme-player/src/types.ts` | Les types du plateau (`TokenData`, `BoardFrame`…), partagés par le lecteur et par l'éditeur |
| `apps/site/app/bbscheme/component/FigurineBox.tsx` | Réserve de pions d'une équipe |
| `apps/site/app/bbscheme/component/Dugout.tsx`, `Sidebar.tsx`, `Toolbar.tsx` | Non utilisés aujourd'hui (fosses désactivées, ancienne interface) |
| `apps/site/lib/bbcode.ts` | Transforme `[bbscheme]` en élément `<bb-scheme data-board-id=…>` |
| `apps/site/common/components/BBCodeContent/BBCodeContent.tsx` | Déclare l'élément `<bb-scheme>` et y monte `BBSchemePlayer` du paquet, en lui passant l'action serveur `getBoardState` |
| `apps/site/public/data/roster/*.json` | Rosters des équipes et Star Players |

## Les pièges

- **Paquet du lecteur** (carte 024) : `BBCodeContent` et l'éditeur prennent le lecteur, le terrain, les pions et les types dans `@bbfrance/bbscheme-player`, et non plus dans `app/bbscheme/component` ou `../page`. Le paquet ne lit pas la base : le site lui passe l'action serveur `getBoardState`. Il charge toujours les rosters par l'adresse `/data/roster/…` du site. Ses boutons sont ceux de `@bbfrance/ui` (36 pixels sur ordinateur, 44 sur téléphone). ESLint ne relit pas le paquet (le cliquet ne couvre que `apps/site`) : des `any` et les couleurs de jeu écrites en dur dans `Token.tsx`, `Token.css` et `Pitch.css` y restent.
- `saveBoardState` reste ouvert aux visiteurs (le partage est public), mais refuse un plateau de plus de 500 Ko ou qui n'est pas un plateau valide (carte 050). Un plateau identique (même empreinte) n'est enregistré qu'une fois.
- Un plateau enregistré n'est jamais modifié : chaque partage crée un nouvel identifiant si le contenu change.
- L'identifiant passé dans `[bbscheme]` est inséré dans un attribut HTML ; il est protégé parce que `parseBBCode` échappe d'abord les guillemets. Ne pas déplacer ce traitement avant l'échappement.
- La fonction « fosses » (réserve, KO, blessés, expulsés) est désactivée en commentaire.
- La barre mobile utilise les couleurs du thème (`var(--danger)` pour les icônes rouges depuis la carte 057). Les fichiers CSS ordinateur (`FigurineBox.css` notamment) contiennent encore des couleurs écrites en dur.
- La hauteur des deux bandeaux du haut (barre d'outils de 65 pixels, boutons de réserve de 45 pixels) entre dans la variable `--bbscheme-mobile-top` (début de `page-mobile.css`) : changer l'une de ces hauteurs oblige à corriger cette variable, à un seul endroit depuis la carte 061.

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
- Manque : limite de fréquence sur `saveBoardState`, nettoyage des composants inutilisés, mise à jour de la skill `mobile-ux` (qui parle encore de `DesktopOnlyFallback`), zoom à deux doigts sur le terrain (carte 068).
- La lecture dans un message est vérifiée par le test smoke « un message contenant [bbscheme] affiche le lecteur », en taille ordinateur et téléphone, sur un sujet de test créé par `tests/e2e/globalSetup.ts`.
- Cartes ouvertes : 071 (sortir l'éditeur dans une application à part), 068 (zoom à deux doigts sur téléphone).
