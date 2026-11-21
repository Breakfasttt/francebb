---
name: BBFrance
description: Le forum et le site de tournois de la communauté française de Blood Bowl, sur téléphone et sur ordinateur.
colors:
  bg: "#111215"
  surface: "#1a1c21"
  surface-2: "#252830"
  border: "#2f333b"
  text: "#eceef1"
  text-muted: "#a3a9b3"
  accent: "#c8102e"
  accent-hover: "#a90d26"
  on-accent: "#ffffff"
  accent-text: "#ff7b80"
  unread: "#5aa9ff"
  rank: "#e2b54a"
  nav-bg: "#16181c"
typography:
  display:
    fontFamily: "Archivo (variable), largeur 68 %"
    fontWeight: 800
    textTransform: uppercase
  heading:
    fontFamily: "Archivo (variable), largeur 75 %"
    fontWeight: 700
    textTransform: uppercase
  body:
    fontFamily: "Archivo (variable), largeur 100 %"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "3px"
  md: "5px"
  lg: "6px"
  full: "999px"
spacing:
  tap: "44px"
---

# Design System : BBFrance

> Ce fichier **dirige** l'apparence du site : toute nouvelle page ou refonte s'y conforme. Les couleurs de l'en-tête sont celles du thème par défaut « Sombre » ; la source de vérité des couleurs reste `packages/ui/src/themes/themeData.mjs`, celle des tailles et polices `packages/ui/src/tokens.css`. Le rangement des fichiers et l'outillage technique sont dans le skill `ui`, l'inventaire des composants dans le skill `reuse-first`.

## L'idée : la feuille de match

BBFrance n'est ni une application SaaS ni un jeu vidéo. C'est **le forum et le tableau des tournois** d'une communauté de joueurs de plateau. Le modèle est la **feuille de match et le tableau d'affichage du club** : des lignes nettes, des chiffres qui se lisent d'un coup d'œil, des titres en capitales serrées comme sur un maillot ou un tableau de score, et un seul rouge pour ce qui compte.

Trois principes, dans cet ordre :
1. **Lisible avant d'être joli.** Un coach doit trouver le prochain tournoi, sa place au classement ou la discussion qui l'intéresse sans réfléchir.
2. **Dense mais rangé.** Un forum se lit en lignes, pas en cartes. On montre plus d'information par écran, séparée par des filets fins et des alignements stricts, pas par des boîtes.
3. **Une voix de terrain.** Les capitales condensées, les chiffres tabulaires et le vocabulaire de la communauté donnent le caractère. Pas les effets.

## Typographie

Une seule famille, **Archivo** en police variable (axes graisse et largeur), servie par le site lui-même (`apps/site/app/fonts/`, licence OFL). La largeur variable donne deux voix avec un seul fichier :

- **Display** (`font-bb-display`) : Archivo condensé (largeur 68 %), graisse 800, **capitales**, interlettrage léger. Pour le titre d'une page (`h1`), le nom du site, les grands chiffres (score, points, classement).
- **Heading** (`font-bb-heading`) : Archivo semi-condensé (75 %), graisse 700, capitales, interlettrage 0,04 em. Pour les en-têtes de section et de tableau, les intitulés de panneau (« Catégories », « Dernières discussions »), la navigation principale sur ordinateur.
- **Texte** (`font-bb-sans`) : Archivo normal, 400 pour lire, 600 pour un titre de ligne ou un pseudo. Interligne 1,6 dans les messages.
- **Chiffres** : toujours `tabular-nums` dans les tableaux, compteurs et dates, pour qu'ils s'alignent en colonne.

Règles :
- **Les capitales sont réservées aux voix Display et Heading.** Un titre de sujet, un bouton, un message restent en casse normale.
- Un texte qu'on lit fait au moins 14 px ; un champ de saisie 16 px (pas de zoom automatique sur iPhone).
- Pas de police fantasy, pas d'italique décoratif, pas de texte en dégradé.

## Couleur

Le thème par défaut est sombre et froid. **Un seul accent, le rouge Blood Bowl**, et il est rare :
- **Rouge plein** : l'action principale de l'écran (une seule), les pastilles de compteur.
- **Rouge de lecture** (`accent-text`) : l'élément actif (onglet, rubrique sélectionnée, trait à gauche), un lien de titre au survol.
- **Bleu** (`unread`) : « nouveau » (non lu) et le contour du focus clavier.
- **Or** (`rank`) : le rang des coachs, rien d'autre.
- Tout le reste est en gris : fond, surface, filets, texte et texte discret.

Toute couleur passe par une variable `--bb-*` (ou la classe `bb-*` qui la porte), jamais en dur : c'est ce qui fait marcher les 5 thèmes. Les thèmes sont secondaires : on conçoit pour « Sombre », puis on vérifie les autres avec le test de contraste (`apps/site/tests/e2e/contraste.spec.ts`).

## Formes et profondeur

- **Angles presque droits** : 3 px (badges), 5 px (boutons, champs), 6 px (panneaux). Le cercle est réservé aux avatars et aux pastilles.
- **Plat.** Les zones se distinguent par un écart de teinte et des filets d'un pixel. L'ombre est réservée à ce qui flotte (menus, fenêtres, notifications).
- **Filets plutôt que boîtes** : dans une liste, chaque ligne est séparée par un filet ; on n'enferme pas chaque ligne dans une carte.
- **Trait d'accent** : 3 px à gauche de l'élément actif d'un panneau, 2 px sous l'onglet actif.

## Mise en page

### Le téléphone d'abord, l'ordinateur en entier

- **Téléphone (jusqu'à 1024 px)** : une colonne, barre du haut de 56 px, barre basse à cinq onglets. Le panneau de gauche devient une rangée de filtres qui défile ou un tiroir ; la colonne de contexte passe sous le contenu ou disparaît. Cibles d'au moins 44 px.
- **Ordinateur (à partir de 1025 px)** : **on utilise la largeur**. Pas de colonne centrée étroite avec de grands vides. La coquille (`SiteLayout`) a trois zones :
  - **panneau gauche** (240 px) : l'action principale de la rubrique en haut (« Nouveau sujet », « Annoncer un tournoi »), puis la navigation de la rubrique (catégories avec compteurs, filtres), collé au défilement ;
  - **contenu** : fluide, il prend toute la place restante ;
  - **contexte à droite** (300 px, à partir de 1440 px) : seulement s'il sert (dernières discussions, prochain tournoi, membres en ligne). Jamais de remplissage.
- **Largeur de lecture** : seul le texte long (corps d'un message, d'un article) est limité à environ 75 caractères ; le reste de la ligne sert aux informations (auteur, date, actions).
- Contenu borné à 1760 px pour les très grands écrans, avec des marges de 24 à 32 px.

### Les types d'écran (même grammaire partout)

| Type | Pages | Structure |
|---|---|---|
| **Liste** | forum, catégorie, tournois, classement, membres, articles, ligues, ressources | en-tête de page, panneau gauche (action + filtres), tableau de lignes, pagination |
| **Détail** | sujet, tournoi, profil, article, ligue | en-tête (titre, fil d'Ariane, actions), contenu, contexte à droite |
| **Formulaire** | créer, modifier, réglages | une colonne de 720 px au plus, boutons d'envoi en bas (collés en bas sur téléphone) |
| **Tableau de bord** | accueil visiteur, accueil membre | une colonne principale de flux + contexte, pas de mosaïque de blocs |
| **Administration** | modération, administration | panneau gauche d'onglets, contenu en tableau |

### Logiques communes

- **En-tête de page** (`PageHeader`) : titre en voix Display, fil d'Ariane au-dessus (une seule ligne, tronquée au milieu sur téléphone), action principale à droite sur ordinateur.
- **Une seule action principale par écran**, toujours au même endroit : en haut du panneau gauche sur ordinateur, dans l'en-tête de page sur téléphone. Les autres actions sont secondaires ou discrètes, ou rangées dans un menu « … ».
- **Recherche, filtres, tri** : même composant partout ; **cachés quand la liste est vide**.
- **État vide** (`EmptyState`) : une phrase qui dit ce qui se passe et, s'il y en a une, l'action qui le change. Pas d'icône géante, pas de « Oups ».
- **Dates** : dans une liste, la date relative (« il y a 2 h ») avec la date complète au survol ; dans un message, **la date et l'heure exactes** (« 21/11/2026 à 14:32 »), visibles.
- **Lexique** : un mot par action, partout : Créer, Modifier, Supprimer, Répondre, Citer, Signaler, Enregistrer, Annuler. Tutoiement partout (communauté de joueurs).

## Le forum (modèle de référence)

- **Liste des catégories** : sections repliables avec un en-tête en voix Heading ; chaque forum est une ligne : nom (600) et description (discrète) à gauche, nombre de sujets et de messages en colonnes, dernier message (avatar, titre tronqué, auteur, date) à droite. Sur téléphone, la ligne passe sur deux niveaux.
- **Liste des sujets** : une ligne par sujet : état (non lu en bleu, épinglé, verrouillé) par un petit marqueur, titre, auteur et date de création, réponses et vues en colonnes, dernier message à droite.
- **Sujet** : **chaque message est un bloc net**, séparé du suivant. **L'auteur est dans une colonne à gauche du texte** (avatar avec cadre de rang, pseudo, rôle, nombre de messages, ligue) ; sur téléphone, cette colonne devient une ligne compacte en tête du message. En haut du message : **date et heure exactes** et numéro (`#12`), lien permanent. Citations encadrées avec l'auteur cité, repliables si longues. Pagination en haut et en bas. Actions du message (Répondre, Citer, …) en bas à droite, discrètes.
- **Sujet de tournoi** : le même sujet, avec en tête une fiche du tournoi (date, lieu, format, places) et les actions d'inscription.

## Icônes

Lucide, **seulement quand l'icône apporte du sens** : navigation de la barre basse, état (verrou, épingle), action répétée en ligne (répondre, citer). **Pas d'icône devant chaque libellé**, pas d'icône dans une pastille colorée, pas d'icône décorative dans un titre ou un état vide.

## Mouvement

Rare et court (150 à 200 ms), seulement pour un changement d'état (ouverture d'un menu, d'un tiroir). Rien ne bouge au survol d'une ligne à part la couleur. Tout s'arrête si le système demande de réduire les animations. Exception assumée : les **cadres de rang** des avatars (`apps/site/common/components/UserAvatar/`), le seul endroit au look « jeu vidéo » (lueurs, rotation), parce que le rang est une récompense.

## Interdits

Ces motifs signent un site généré par IA ou un modèle tout fait. Ils sont refusés :
- les dégradés violets ou indigo, le texte en dégradé, le verre dépoli, les halos ;
- la **mosaïque de cartes** icône + titre + phrase, et la page faite de blocs identiques empilés « Titre … Tout voir » ;
- les blocs « Tu découvres / Tu joues déjà » et autres scissions de public ;
- les emoji dans les titres, l'icône devant chaque libellé, les badges décoratifs ;
- tout centré, les grands vides latéraux sur ordinateur, l'espacement identique partout ;
- plus d'un bouton rouge plein par écran ;
- les états vides passe-partout (grande icône + « Aucun élément pour l'instant ») ;
- les logos dessinés ou les images générées : le nom **BBFRANCE** s'écrit en voix Display, sans écusson ;
- les images de remplissage (placeholder) ;
- les formules creuses : « Découvrez », « N'hésitez pas », « crucial », « Bienvenue sur la plateforme de référence ».

## Écriture

Français simple, tutoiement, phrases courtes. Le vocabulaire de la communauté (coach, roster, ligue, commissaire, CDF, NAF, TV, sortie) est utilisé tel quel. Un bouton dit ce qu'il fait (« Annoncer le tournoi », pas « Valider »). Le skill `ecriture-fr` donne les règles, `humaniseur-fr` sert à une passe complète sur un texte long.
