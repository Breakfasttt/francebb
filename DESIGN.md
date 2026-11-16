---
name: BBFrance
description: Le site de la communauté française de Blood Bowl, pensé d'abord pour le téléphone.
colors:
  vestiaire-bg: "#111215"
  vestiaire-surface: "#1a1c21"
  vestiaire-surface-2: "#252830"
  vestiaire-border: "#2f333b"
  vestiaire-text: "#eceef1"
  vestiaire-text-muted: "#a3a9b3"
  blood-red: "#c8102e"
  blood-red-hover: "#a90d26"
  on-accent: "#ffffff"
  blood-red-text: "#ff7b80"
  success-text: "#4ade80"
  warning-text: "#fbbf24"
  unread-blue: "#5aa9ff"
  rank-gold: "#e2b54a"
  nav-bg: "#16181c"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
    lineHeight: 1.15
  display-lg:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1.08
  headline-lg:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  section:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  title-lg:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.375
  lead:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  title:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
  body:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  action:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
  secondary:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
  label:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.05em"
  caption:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  tap: "44px"
components:
  button-primary:
    backgroundColor: "{colors.blood-red}"
    textColor: "{colors.on-accent}"
    typography: "{typography.action}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.blood-red-hover}"
  button-secondary:
    backgroundColor: "{colors.vestiaire-surface-2}"
    textColor: "{colors.vestiaire-text}"
    typography: "{typography.action}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-quiet:
    textColor: "{colors.vestiaire-text-muted}"
    typography: "{typography.action}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-quiet-hover:
    backgroundColor: "{colors.vestiaire-surface-2}"
    textColor: "{colors.vestiaire-text}"
  card:
    backgroundColor: "{colors.vestiaire-surface}"
    textColor: "{colors.vestiaire-text}"
    rounded: "{rounded.lg}"
  input:
    backgroundColor: "{colors.vestiaire-surface-2}"
    textColor: "{colors.vestiaire-text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  badge-neutral:
    backgroundColor: "{colors.vestiaire-surface-2}"
    textColor: "{colors.vestiaire-text-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  count-badge:
    backgroundColor: "{colors.blood-red}"
    textColor: "{colors.on-accent}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    height: "20px"
  bottom-nav:
    backgroundColor: "{colors.nav-bg}"
    textColor: "{colors.vestiaire-text-muted}"
    typography: "{typography.caption}"
    height: "52px"
---

# Design System: BBFrance

> Ce fichier décrit l'apparence actuelle de BBFrance, relevée dans le code. Il est lu par l'outil de conception Impeccable (skill `impeccable`) pour que les nouveaux écrans restent cohérents. Les valeurs de l'en-tête (entre les lignes `---`) sont celles du thème par défaut « Vestiaire » ; la source de vérité reste le code : `packages/ui/src/tokens.css` et `packages/ui/src/themes/`. Les règles des thèmes sont dans le skill `theming-rules`, celles du téléphone dans le skill `mobile-ux`.

## Overview

**Creative North Star: "Le Vestiaire"**

Les coulisses d'avant-match : une pièce sombre, rangée, où tout sert. On y vient pour se préparer, pas pour admirer le décor. Le fond est presque noir, les surfaces sont pleines et se distinguent par de légers écarts de gris, et une seule couleur forte, le rouge Blood Bowl, signale ce qui compte : l'action principale, le compteur à lire, l'onglet ouvert.

L'interface est tactile et robuste. Elle est pensée pour un coach qui tient son téléphone d'une main, sur le lieu d'un tournoi : chaque zone d'appui fait au moins 44 pixels, le texte des champs fait 16 pixels pour éviter le zoom automatique de l'iPhone, et la navigation principale tient dans une barre basse à cinq onglets. La densité est moyenne : des listes serrées mais aérées par des lignes d'au moins 56 pixels et des séparateurs fins.

Le Vestiaire est le thème par défaut parmi huit. Chaque thème garde ses couleurs et son esprit (Saison 3 en parchemin et bleu marine, NAF en bleu marine et jaune…), mais la mise en page, les formes et les composants sont les mêmes pour tous. Les styles refusés sont le look « jeu vidéo » chargé (textures, néons, typographies fantasy, effets métalliques), le verre dépoli généralisé, et le tableau de bord SaaS générique (dégradés violets, cartes à ombre douce, icônes dans des pastilles).

**Key Characteristics:**
- Fond sombre et surfaces pleines, séparées par des bordures fines plutôt que par des ombres.
- Un seul accent, le rouge Blood Bowl, utilisé avec parcimonie.
- Une seule police, Inter, en gras pour les actions et les titres.
- Cibles tactiles de 44 pixels partout, barre de navigation basse sur téléphone.
- Huit thèmes interchangeables qui ne changent que les couleurs.

## Colors

Une palette quasi neutre, froide et sombre, réveillée par un rouge franc et trois couleurs de signal (bleu, or, vert).

### Primary
- **Rouge Blood Bowl** (`blood-red`) : fond du bouton principal, pastille de compteur, badge d'accent. C'est aussi la couleur des actions destructrices (`--bb-danger`), ce qui garde la palette courte.
- **Rouge Blood Bowl foncé** (`blood-red-hover`) : survol du bouton principal.
- **Rouge clair de lecture** (`blood-red-text`) : le rouge en version lisible sur fond sombre, pour un texte, une icône, l'onglet ouvert (`--bb-accent-text`, `--bb-nav-active`) ou un message d'erreur (`--bb-danger-text`). Son voile à 14 % d'opacité (`--bb-accent-soft`) marque le fond d'un élément actif.

### Secondary
- **Bleu non-lu** (`unread-blue`) : sujets et messages non lus, et contour du focus clavier (`--bb-focus`). Le bleu dit « il y a du nouveau » ou « tu es ici ».

### Tertiary
- **Or de rang** (`rank-gold`) : cadre et badge de rang des membres (`--bb-rank`). Réservé à la reconnaissance.

### Neutral
- **Noir de vestiaire** (`vestiaire-bg`) : fond de la page.
- **Ardoise** (`vestiaire-surface`) : cartes et panneaux.
- **Ardoise en relief** (`vestiaire-surface-2`) : champs de saisie, citations, bouton secondaire, survol des boutons discrets.
- **Joint gris** (`vestiaire-border`) : bordures et séparateurs, y compris ceux de la navigation.
- **Craie** (`vestiaire-text`) : texte principal.
- **Craie passée** (`vestiaire-text-muted`) : texte secondaire, toujours au contraste AA.
- **Fond de barre** (`nav-bg`) : barre du haut, barre basse et pied de page, un cran plus clair que la page.
- Signaux : **vert succès** (`success-text`) et **ambre alerte** (`warning-text`), en texte ou en contour, jamais en grand aplat.

### Named Rules
**The One Red Rule.** Le rouge plein est réservé à l'action principale d'un écran et aux compteurs. Une page qui montre trois boutons rouges en a deux de trop : les autres passent en `secondary` ou `quiet`.

**The Variable Only Rule.** Une couleur s'écrit toujours par sa variable `--bb-` (ou la classe `bb-` qui la porte), jamais en dur. C'est ce qui permet aux huit thèmes de fonctionner. Seules exceptions : les couleurs de jeu du lecteur BBScheme, les cadres de rang de `UserAvatar.css` et les pastilles d'aperçu du choix de thème.

**The AA Everywhere Rule.** Chaque paire texte et fond atteint le contraste AA dans chacun des huit thèmes ; le test `apps/site/tests/e2e/contraste.spec.ts` le vérifie.

## Typography

**Display Font:** Inter (avec system-ui, -apple-system, Segoe UI, Roboto)
**Body Font:** Inter (même famille)

**Character:** Une seule famille, Inter en version variable, servie par le site lui-même (`next/font/local`, fichier dans `apps/site/app/fonts/`). La hiérarchie vient du poids (gras pour les actions et les titres, demi-gras pour les libellés) bien plus que de la taille : l'échelle est courte, adaptée à l'écran d'un téléphone.

### Hierarchy
Chaque rôle a sa classe ; les classes `text-bb-…` sont définies dans `packages/ui/src/tokens.css` (carte 207), les autres sont celles de Tailwind. Aucune taille écrite à la main (`text-[1.05rem]`) : un besoin nouveau devient un rôle ici, puis une classe.

- **Display** (800, 1,625 rem puis 2,5 rem sur ordinateur, `text-bb-display` et `lg:text-bb-display-lg`) : grand titre de l'accueil et d'un article, rien d'autre.
- **Headline** (700, 1,5 rem, `text-2xl`, puis 1,875 rem sur ordinateur, `lg:text-3xl`) : titre principal d'une page (`h1`).
- **Section** (700, 1,25 rem, `text-xl`) : titre d'une section de lecture (mentions légales, titre d'un article au hasard sur ordinateur).
- **Title-lg** (700, 1,125 rem, `text-lg`) : titre mis en avant dans une carte.
- **Lead** (400, 1,0625 rem, `text-bb-lead`) : texte de lecture long (article, présentation d'une ligue, page « Jouer ») et titre d'un sujet dans une liste du forum.
- **Title** (700, 1 rem, `text-base`) : titre d'une carte (`CardTitle`), sans majuscules ni italique.
- **Body** (400, 1 rem, interligne 1,625) : texte courant, messages du forum, champs de saisie. 16 pixels minimum dans un champ.
- **Action** (700, 0,95 rem) : texte des boutons et des onglets (les onglets en 600).
- **Secondary** (400 à 600, 0,875 rem, `text-sm`) : informations sous un titre (auteur, date, nombre de réponses), libellés de formulaire, texte d'aide, aperçu d'une conversation. C'est la taille la plus utilisée du site, et **la plus petite pour un texte qu'on lit**.
- **Label** (700, 0,8125 rem, capitales espacées, `text-bb-label uppercase tracking-wide`) : intertitre d'un groupe de liens, en-tête de colonne, légende d'un groupe de champs, intitulé d'une donnée (`dt`).
- **Caption** (600 à 700, 0,75 rem, `text-xs`) : badges, pastilles de compteur, libellés de la barre basse et des tuiles du panneau « Plus », unité sous un nombre (« points », « CAS »), heure d'un message.

### Named Rules
**The Weight Not Size Rule.** Pour faire ressortir un élément, on monte le poids avant la taille. Une page n'a qu'un seul titre au-dessus de 1 rem.

**The 14 Pixel Floor Rule.** Un texte qu'on lit (phrase, information, aperçu, libellé de champ) fait au moins 14 pixels (`text-sm`), sur téléphone comme sur ordinateur. Seuls les rôles Label (en capitales, 13 pixels) et Caption (12 pixels) descendent plus bas, et jamais sous 12 pixels.

**The No Fantasy Type Rule.** Aucune police décorative ou « fantasy » : l'univers du jeu passe par les mots et les images, pas par la typographie.

## Layout

- **Seuil unique** : téléphone jusqu'à 1024 pixels, ordinateur à partir de 1025 pixels (`max-lg:` et `lg:`). Il n'y a pas d'autre point de rupture.
- **Téléphone** : barre du haut de 56 pixels, contenu en une colonne, barre de navigation basse fixe à cinq onglets (Accueil, Forum, Tournois, Messages, Plus). L'onglet « Plus » ouvre un panneau qui contient le reste. Les formulaires longs passent en plein écran, sans la barre basse, avec leurs boutons collés en bas.
- **Ordinateur** : barre du haut de 64 pixels avec la navigation en ligne, contenu centré sur 1280 pixels au plus, colonne latérale quand la page en a besoin (onglets verticaux de la modération et de l'administration).
- **Rythme** : multiples de 4 pixels. Marges intérieures courantes de 16 pixels sur les côtés et 12 pixels en hauteur (en-tête de carte, ligne de liste), écarts de 8 à 12 pixels entre éléments.
- **Défilement** : jamais de défilement horizontal de la page. Une rangée d'onglets trop longue défile seule, avec un fondu sur le bord où il reste des onglets.

**The Thumb Reach Rule.** Toute cible d'appui mesure au moins 44 × 44 pixels (`--bb-tap`) ; une ligne de liste cliquable, au moins 56 pixels de haut.

## Elevation & Depth

Le système est plat. La profondeur vient d'abord de l'écart de teinte entre le fond, la surface et la surface en relief, et des bordures fines d'un pixel. Une seule ombre existe (en dehors des cadres de rang des avatars, voir Components), réservée à ce qui flotte au-dessus de la page (fenêtres, menus, panneaux, notifications). Le voile sombre (`--bb-overlay`, noir à 60 %) isole une fenêtre ouverte.

### Shadow Vocabulary
- **Ombre flottante** (`box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35)`, variable `--bb-shadow`) : fenêtres, menus déroulants, panneaux, notifications.

### Named Rules
**The Flat Surface Rule.** Une carte posée dans la page n'a pas d'ombre : elle a une bordure. L'ombre est réservée aux éléments qui passent au-dessus des autres.

**The No Glass Rule.** Le verre dépoli (flou d'arrière-plan) est désactivé par défaut, parce qu'il ralentit les téléphones modestes. Seul un thème peut l'activer, par `--bb-glass-blur` (aujourd'hui seul « Sombre »), et un composant ne l'utilise qu'à travers la prop `glass` de `Card`, jamais avec un flou écrit en dur.

## Shapes

Des angles adoucis, jamais tout ronds sauf pour les pastilles. Trois arrondis suffisent : 8 pixels pour les petits éléments (badges), 12 pixels pour ce qu'on touche (boutons, champs, onglets verticaux, cases de pagination), 16 pixels pour ce qui contient (cartes, panneaux). Le cercle complet est réservé aux avatars et aux pastilles de compteur. Les bordures font un pixel, toujours de la couleur `--bb-border` ; un trait plus épais ne sert qu'à marquer l'état actif (2 pixels sous un onglet, 3 pixels à gauche d'un onglet vertical).

## Components

Tous les composants viennent de `packages/ui` (fondé sur shadcn et Radix) et se réutilisent avant d'en créer un nouveau (skill `reuse-first`). Leur caractère commun : tactiles et robustes.

### Buttons
- **Shape :** angles adoucis (12 px), texte en gras, icône et texte espacés de 8 px.
- **Primary :** fond rouge Blood Bowl, texte blanc, taille tactile `tap` (44 px de haut, 16 px de marge sur les côtés). Une seule par écran.
- **Secondary :** fond ardoise en relief, bordure grise, texte craie ; la bordure s'éclaircit au survol.
- **Quiet :** sans fond, texte craie passée ; au survol, fond ardoise en relief et texte craie. Pour les actions de second plan et les boutons d'icône (`tap-icon`, 44 × 44 px).
- **Danger :** fond rouge, texte blanc, légère transparence au survol, pour supprimer ou bannir.
- **Hover / Focus :** changement de couleur seulement, sans mouvement. Focus clavier : contour bleu de 2 px décalé de 2 px.
- **Disabled :** opacité à 50 %, plus de clic.

### Chips (badges)
- **Style :** petite étiquette en gras de 12 px, angles de 8 px, contour d'un pixel. Variantes : neutre (fond ardoise en relief), accent (fond rouge), contour rouge, rang (contour or), non-lu (fond bleu), danger, succès.
- **Pastille de compteur :** rond rouge de 20 px, nombre en gras blanc, « 9+ » au-delà de neuf, rien quand le compte est nul.

### Cards / Containers
- **Corner Style :** 16 px.
- **Background :** ardoise (`--bb-surface`).
- **Shadow Strategy :** aucune ombre (voir The Flat Surface Rule).
- **Border :** un pixel gris joint ; l'en-tête est séparé du corps par la même bordure.
- **Internal Padding :** 16 px pour le corps, 12 × 16 px pour l'en-tête et les lignes de liste.

### Inputs / Fields
- **Style :** fond ardoise en relief, bordure grise d'un pixel, angles de 12 px, 44 px de haut, texte de 16 px.
- **Focus :** bordure et contour bleus de 2 px.
- **Error / Disabled :** bordure rouge et message rouge juste sous le champ, relié au champ pour les lecteurs d'écran ; jamais dans une notification. Désactivé : opacité à 60 %.
- **Structure :** `Field` empile libellé (14 px, demi-gras), champ, puis aide ou erreur.

### Navigation
- **Barre basse (téléphone) :** fond de barre, bordure haute, cinq cases égales d'au moins 52 px. Icône au-dessus d'un libellé de 12 px ; onglet ouvert en rouge clair et en gras, les autres en craie passée. Pastille de compteur sur l'icône.
- **Barre du haut (ordinateur) :** 64 px, liens en ligne, lien ouvert marqué par `aria-current="page"` et la couleur active.
- **Onglets dans la page :** texte demi-gras de 0,95 rem, trait de 2 px rouge clair sous l'onglet ouvert. Rangée qui défile sur téléphone, avec fondu sur les bords.
- **Pagination :** « ‹ Page 3 sur 5 › » en cases de 44 px, accès direct à la dernière page.

### Cadres de rang (exception assumée)
Les avatars des membres portent un cadre selon leur rang (`common/components/UserAvatar/UserAvatar.css`) : bronze, argent, or qui pulse, platine bleu électrique, diamant qui scintille, maître violet et rose qui tourne, grand maître rouge et or qui tourne. C'est **le seul endroit du site où le look « jeu vidéo » est permis** (lueurs, couleurs vives, mouvement), décision du responsable du projet : le rang est une récompense, il doit se voir. Ces couleurs sont écrites en dur et ne suivent pas le thème.
- **Performance :** une animation de cadre ne joue que sur l'opacité ou la rotation, que la carte graphique calcule sans redessiner l'avatar. Jamais d'ombre (`box-shadow`) ni de filtre (`filter`) animés : une lueur qui pulse est un calque fixe dont seule l'opacité varie (carte 207).
- **Mouvement réduit :** toutes les animations de cadre s'arrêtent quand le téléphone demande de réduire les animations.
- **Membre banni :** cadre rouge barré et étiquette « Banni », sans animation.

## Do's and Don'ts

### Do:
- **Do** utiliser les variables `--bb-` et les classes `bb-` pour toute couleur, dans les huit thèmes.
- **Do** donner à toute cible d'appui au moins 44 × 44 pixels (`size="tap"`, `size="tap-icon"`, `min-h-11`).
- **Do** vérifier chaque écran en taille téléphone et dans les huit thèmes avant de le dire terminé.
- **Do** réserver le rouge plein à une seule action principale par écran.
- **Do** séparer les surfaces par une bordure d'un pixel et un écart de teinte, et garder l'ombre pour ce qui flotte.
- **Do** écrire un texte de 16 pixels au moins dans les champs de saisie.
- **Do** prendre la taille d'un texte dans l'échelle de la section Typography : 14 pixels au moins pour ce qu'on lit.

### Don't:
- **Don't** écrire une couleur en dur ni réintroduire les anciennes variables (`--primary`, `--card-bg`, `--glass-border`…).
- **Don't** adopter un look « jeu vidéo » chargé : textures, néons, typographies fantasy, effets métalliques. Seule exception : les cadres de rang des avatars.
- **Don't** généraliser le verre dépoli ni écrire un flou en dur.
- **Don't** produire un tableau de bord SaaS générique : dégradés violets, cartes à ombre douce, icônes dans des pastilles colorées.
- **Don't** ajouter une deuxième police ni charger une police depuis Google.
- **Don't** créer un défilement horizontal de la page ou un point de rupture autre que 1024/1025 pixels.
