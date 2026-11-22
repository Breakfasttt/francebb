# Pages diverses (accueil, jouer, spy, mentions légales, banni, 404, thèmes)

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour en fin de gros chantier (commande `/ship`) ou quand le comportement visible change. Environ 80 lignes au plus.

## À quoi ça sert

Les petites pages du site, trop courtes pour une fiche chacune : la porte d'entrée, le guide du débutant, le profil public d'un coach, les pages légales et d'erreur, et le choix du thème de couleurs.

## Ce que voit le coach

### Accueil — `/` (`app/page.tsx`)
**Deux accueils en tableau de bord (carte 210, refaits par la carte 220).** La page choisit entre l'accueil du visiteur et celui du membre. Les deux utilisent la coquille `SiteLayout` en « tableau de bord » : une colonne principale (le flux) et une colonne de contexte, à droite dès 1025 pixels de large (320 pixels, puis 380 à partir de 1440), sous le flux sur téléphone. Le terrain dessiné en fond (`PitchField.tsx`), les deux « camps » du visiteur et les repères de défilement sur le côté (`HomeWaypoints.tsx`) ont été supprimés par la carte 220. Le plus important est l'accès au forum ; Discord n'apparaît que si l'invitation est réglée dans l'administration (carte 189). Dans les blocs, les dates sont relatives (« il y a 2 heures », composant `RelativeTime`), avec la date complète au survol.

**Visiteur** (`app/component/VisitorHome.tsx`) : en haut, une bande courte, sur toute la largeur : le titre « Blood Bowl en France », une phrase qui dit ce qu'est le site (tout se lit sans compte ; un compte se crée en un clic avec Discord, Google ou un e-mail), puis « Créer mon compte » (le seul bouton rouge), « Découvrir le jeu » (le guide `/jouer`) et, si l'invitation est réglée, « Discord » en bouton discret. « Créer mon compte » mène à `/auth/login`, qui sert à la fois à l'inscription et à la connexion. Ensuite, les mêmes blocs que le membre : dans le flux, « Derniers sujets du forum » (les sujets au dernier message le plus récent des forums ouverts aux visiteurs, `getRecentForumTopics`, sans la phrase « Tu as tout lu » ni Discord), les prochains tournois (« Annoncer un tournoi » seulement quand la liste est vide ; le lien passe par la connexion, qui renvoie ensuite vers le formulaire) et l'article au hasard ; dans le contexte, le classement, les « Dernières ligues », les ressources et les médias, sans les liens « Créer », « Écrire » ni « Proposer ».

**Membre connecté** (`app/component/MemberHome.tsx`) : pas de bandeau d'accueil (le titre « Accueil » n'est lu que par les lecteurs d'écran).
- Dans le flux, dans cet ordre :
  1. le forum : ses sujets non lus les plus récents (« Non lus au forum » : titre, forum, auteur et date du dernier message, début de ce message), avec « Voir les N sujets non lus » vers `/forum/unread`. La liste est la même que celle de cette page (`getUnreadState`) : seuls comptent les forums ouverts au rôle du membre. Sans non-lu, le bloc s'appelle « Derniers sujets du forum », dit « Tu as tout lu. Voici les sujets les plus récents. » et montre les sujets au dernier message le plus récent (`getMemberForumTopics`). « Aller au forum » est dans l'en-tête du bloc ; « Rejoindre le Discord » au pied, si l'invitation est réglée ;
  2. les prochains tournois, avec « Tout voir » et « Créer » dans l'en-tête (un seul bouton, même quand la liste est vide) ; un tournoi où il est inscrit le dit (« Tu es inscrit ») ;
  3. « Articles » : l'article au hasard, avec « Tout voir » et « Écrire ».
- Dans le contexte :
  1. « Classement <année> » : les 5 premiers du Championnat de France de l'année (même calcul que `/classement`, gardé dix minutes en cache), chaque coach lié à sa fiche ;
  2. « Ligues de ta région » : les 3 ligues de la région de son profil (`User.region`, comparée à la zone de la ligue `Ligue.geographicalZone`, deux valeurs de la même liste de référence), les plus fournies en membres d'abord, avec « Tout voir », « Créer » et « Voir les ligues sur la carte ». Sans région au profil ou sans ligue dans sa région, le bloc s'appelle « Dernières ligues ». Sur ordinateur seulement, une petite carte de ces ligues sous la liste (`app/component/LiguesMiniMap.tsx`, carte `/carte` en version `compact`) ; la bibliothèque de carte n'est chargée que lorsque le bloc arrive à l'écran ;
  3. « Ressources » : les 3 dernières ressources validées, avec « Tout voir » et « Proposer » ;
  4. « Médias » : les chaînes Twitch et YouTube réglées dans l'administration, qui mènent à `/media`.

Les blocs (sauf les tournois, dans `HomeBlocks.tsx`) sont dans `app/component/HomeSections.tsx`, partagés par les deux accueils. Statistiques est au pied de page sur ordinateur ; Membres (lié au forum), Jouer, Statistiques et Médias sont dans le panneau « Plus », Membres aussi dans le panneau gauche du forum.

**Sur téléphone**, une seule colonne : la bande du visiteur, puis le flux, puis les blocs du contexte ; chaque bouton fait au moins 44 pixels de haut et aucun texte de lecture ne fait moins de 14 pixels.

Les requêtes de la page sont dans `app/component/homeData.ts` ; les tournois et le lien Discord sont gardés en cache (60 s et 1 h).

**Derniers messages (carte 205, retiré le 17 novembre 2026).** L'accueil du visiteur montrait les 3 derniers messages du forum, mis à jour toutes les 30 secondes. Il montre maintenant les sujets récents, comme l'accueil du membre ; la liste en direct (`LatestPosts.tsx`, `homeActions.ts`, cache `home-latest-posts`) a été supprimée.

### Jouer — `/jouer` (`app/jouer/page.tsx`)
Le « Guide du coach » : six sections (C'est quoi Blood Bowl, plateformes, communauté, tournois, NAF/CdF/RTC, challenges régionaux), dont le texte en BBCode est saisi par un admin dans l'administration (`getHowToPlaySettings`). Une section sans texte est masquée, sauf la première.
Depuis la carte 220, c'est une page de lecture : sur ordinateur, le sommaire « Les étapes » (numéro et titre de chaque section affichée) est dans le panneau gauche de `SiteLayout` ; le texte est calé à gauche, à largeur de lecture (75 caractères environ), chaque section séparée par un filet (« Étape N », titre, texte, lien « Étape suivante : … » vers l'ancre de la section suivante). Puis « Et maintenant ? » avec « Créer mon compte » et « Parcourir le forum ». Les six illustrations générées et les icônes ont été retirées par la carte 220. Le texte lui-même reste à reprendre dans l'administration (tutoiement). Les styles des blocs BBCode (accordéons, spoilers, galeries) viennent de `common/components/BBCodeContent/bbcode.css`, chargé pour tout le site (carte 101).
**Sur téléphone** : le sommaire est masqué, les sections se suivent sur une colonne ; boutons de 44 pixels, empilés en pleine largeur.

### Profil public — `/spy/[id]` (`app/spy/[id]/page.tsx`)
Le profil d'un autre coach, ouvert depuis un message du forum ou le classement : activité, articles, « Message privé » (grisé avec sa raison si le membre est banni ou si un blocage existe, carte 221), signalement et blocage. Réservé aux membres connectés. Détail : fiche `profil-membres`.
**Sur téléphone** (jusqu'à 1024 pixels) : la carte du membre (`ProfileSidebar`) passe au-dessus du contenu, et les onglets forment une rangée qui défile de côté (`LinkTabs`) ; voir la fiche `profil-membres`.

### Mentions légales — `/mentions-legales`
Éditeur, hébergeur, propriété intellectuelle, RGPD, cookies. Visible par tous, lien dans le panneau « Plus » sur téléphone et dans le pied de page sur ordinateur. **Sur téléphone** : une colonne, marges réduites. Sa mise en forme n'a pas été refaite par la carte 090 (le texte était réécrit en même temps par la carte 126) : elle est reportée à la carte 101.

### Pied de page (`app/layout.tsx`)
Sur ordinateur seulement, à la fin de la page (dans le flux depuis la carte 220 ; il était fixé en bas de l'écran avant) : « Mentions légales », « Code source » (le dépôt GitHub) et « Statistiques ». La mention « Conçu avec l'aide de l'IA » a été retirée par la carte 220. Sur téléphone, ces liens sont dans le panneau « Plus ».

### Écrans de chargement et d'erreur (carte 188)
- **Chargement** : dès qu'on appuie sur un lien du site, une fine barre colorée avance en haut de l'écran jusqu'à l'arrivée de la page suivante, pour que l'appui se voie tout de suite (composant `NavigationProgress`, monté dans `app/layout.tsx`). Elle n'apparaît qu'après 150 millisecondes, pour ne pas clignoter quand la page arrive aussitôt. Le site n'utilise volontairement pas d'écran de chargement de Next.js (`loading.tsx`) : avec lui, une page introuvable répondait « OK » au lieu de l'erreur 404, et les renvois vers une autre page se faisaient dans le navigateur avec une erreur (carte 188).
- **Erreur dans une page** (`app/error.tsx`) : la coquille reste affichée et la page est remplacée par une carte dans le style de la page introuvable, « Match interrompu par l'orage ! », avec « Réessayer » et « Retour à l'accueil », et la référence de l'erreur en petit (l'identifiant noté dans les journaux du serveur). « Réessayer » appelle `unstable_retry`, la fonction conseillée par Next.js 16.2 : elle redemande la page au serveur, alors que `reset` la réafficherait telle quelle.
- **Erreur dans la mise en page générale** (`app/global-error.tsx`) : le même écran remplace tout le site ; il pose ses propres balises `<html>` et `<body>` et charge la feuille du site. Sans attribut `data-theme`, il prend les couleurs du thème par défaut, posées sur `:root`.
- Le contenu commun aux deux écrans d'erreur est dans `common/components/ErrorScreen/ErrorScreen.tsx`.
**Sur téléphone** : boutons empilés sur toute la largeur, 44 pixels de haut.

### Lien « Aller au contenu » (carte 189)
Premier élément de chaque page (`app/layout.tsx`) : invisible, il apparaît en haut à gauche au premier appui sur la touche Tabulation et mène à la zone `<main id="contenu">`, pour sauter la barre de navigation au clavier.

### Bandeau des cookies (carte 190)
`common/components/CookieBanner/CookieBanner.tsx`, monté par `app/layout.tsx`. Il apparaît 1,5 seconde après l'arrivée d'un visiteur qui n'a pas encore répondu : « Cookies techniques seulement. En savoir plus », le bouton « Accepter » (mémorisé dans le navigateur) et une croix qui le ferme pour la session. Le lien « En savoir plus » mène aux mentions légales ; sa zone d'appui fait 44 pixels de haut sans agrandir la ligne. **Sur téléphone**, le texte tient sur deux lignes à 360 pixels de large, sur la même rangée que les boutons, et le titre « Respect de la vie privée » n'est affiché que sur ordinateur (il reste le nom de la zone pour les lecteurs d'écran). Le bandeau ne s'affiche pas sur les écrans de rédaction (adresses reconnues par `isComposePath`), où il recouvrait la barre « Annuler / Publier » : il revient sur la page suivante.

### Barre du haut sur la page de connexion (carte 190)
Le bouton « Se connecter / S'inscrire » de la barre du haut (téléphone et ordinateur) est masqué sur `/auth/login` : il y mènerait à la page déjà ouverte.

### Compte banni — `/banned` (`app/banned/page.tsx`)
Un membre banni y est renvoyé par `BannedRedirect` (monté dans `app/layout.tsx`) et voit la raison du bannissement. Tout autre visiteur est renvoyé à l'accueil. Depuis la carte 058, la page n'utilise que des variables de thème (avant, ses couleurs écrites en dur la rendaient presque illisible dans le thème clair) : depuis la carte 090, c'est une carte (composant `Card` de `packages/ui`). Depuis la carte 221, la page n'a plus de navigation (coquille `AppShell` en mode `bare`, comme l'inscription) : elle donne la raison du bannissement, comment le contester (lien Discord du réglage `discord_invite`, sinon une phrase générale) et le bouton « Me déconnecter » (`LogoutButton`), seule sortie ; l'ancien « Retour à l'accueil » renvoyait ici. La carte est une région nommée « Compte banni », que le test des captures repère par ce nom. Captures de référence dans les thèmes : test « page des bannis sur téléphone » de `tests/e2e/visual-themes.spec.ts`. Depuis la carte 067, ce test utilise un membre banni par thème, préparé par `globalSetup.ts` (`themedBannedId`) : il ne modifie plus la base pendant que le site tourne, ce qui le faisait parfois dépasser son délai.
**Sur téléphone** : marges réduites, bouton de retour sur toute la largeur et de 44 pixels de haut au moins. Audit mobile propre à 360 et 390 pixels.

### Page introuvable — 404 (`app/not-found.tsx`)
Une carte sobre, alignée à gauche (revue 221 : plus d'icône géante ni de « Oups ») : « Erreur 404 », le titre « Terrain impraticable », la phrase « Cette page n'existe pas ou a été déplacée. Vérifie l'adresse, ou repars de l'accueil. » et le bouton « Retour à l'accueil ». **Sur téléphone** : bouton sur toute la largeur, 44 pixels de haut ; audit mobile propre à 360 et 390 pixels.

### Thèmes
5 thèmes depuis la carte 218 : Sombre (identifiant `vestiaire`, le thème par défaut), Saison 3, NAF, Néhékhara et Violet (identifiant `elfes-noirs`). Les 35 thèmes de l'ADR-0009 (un par équipe) ont été essayés, puis réduits à ces 5 à la demande du responsable. Tous viennent d'une source unique, `packages/ui/src/themes/themeData.mjs`, dont le script `corepack pnpm themes:build` (à la racine du dépôt) génère les fichiers de couleurs et la liste lue par le site (voir le skill `ui`). Le site est conçu d'abord pour « Sombre », puis vérifié dans les autres (captures dans les 5 thèmes à la carte 220). Le coach choisit le sien dans le sélecteur (panneau « Plus », menu du compte, profil, inscription) : une liste simple, une ligne de 44 pixels par thème avec un aperçu de ses couleurs. Le thème est enregistré en base (`updateTheme`) et dans le navigateur ; un membre qui avait choisi un thème retiré voit le thème par défaut.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/page.tsx` | Accueil : lit les données et choisit l'accueil du visiteur ou du membre (carte 210) |
| `apps/site/common/components/SiteLayout/SiteLayout.tsx` | Coquille des pages (carte 220) : en-tête, panneau gauche, contenu, colonne de contexte ; `contextFrom="lg"` pour les tableaux de bord sans panneau gauche (accueils) |
| `apps/site/common/components/RelativeTime/RelativeTime.tsx` | Date relative des listes et des blocs, date complète au survol (carte 220) |
| `apps/site/app/component/VisitorHome.tsx`, `MemberHome.tsx` | Les deux accueils (carte 210), en tableau de bord depuis la carte 220 |
| `apps/site/app/component/HomeSections.tsx` | Blocs des deux accueils : forum, classement, ligues, articles, ressources, médias |
| `apps/site/app/component/HomeBlocks.tsx`, `homeData.ts` | Styles des blocs, liens « Créer » et « Tout voir », prochains tournois, boutons forum et Discord ; requêtes de l'accueil (carte 210) |
| `apps/site/app/component/LiguesMiniMap.tsx` | Petite carte des ligues de l'accueil du membre, sur ordinateur (carte 210) |
| `apps/site/lib/homeLatestPosts.ts` | Début lisible d'un message (`postExcerpt`), sous chaque sujet du bloc du forum |
| `apps/site/app/jouer/page.tsx` | Guide du débutant, page de lecture avec sommaire dans le panneau gauche (sans image depuis la carte 220) |
| `apps/site/common/components/SiteLogo/SiteLogo.tsx` | Nom du site « BBFRANCE » composé en lettres (police d'affichage), lien vers l'accueil dans la barre du haut, sur téléphone et sur ordinateur. Depuis la carte 220, plus d'écusson ni d'image (`logo3.png` est supprimé) ; « BB » prend la couleur active de la barre et « FRANCE » son texte éclairci, pour rester lisible dans chaque thème, y compris sur les barres rouges. Zone cliquable d'au moins 44 pixels |
| `apps/site/app/spy/[id]/page.tsx` | Profil public (client), lit `/api/users/[id]` et les actions de `app/profile/actions.ts` |
| `apps/site/app/mentions-legales/page.tsx`, `page.css`, `page-mobile.css` | Mentions légales. La page appartient au chantier RGPD ; sa mise en forme (carte 101) passe par `page.css` (variables v2), `PageHeader` et `PremiumCard`, ses seuls utilisateurs. C'est le dernier `page.css` du site : le jour où la page est réécrite, passer ses classes en Tailwind et supprimer les deux fichiers CSS |
| `apps/site/app/banned/page.tsx`, `common/components/BannedRedirect/BannedRedirect.tsx` | Page et redirection des bannis |
| `apps/site/tests/e2e/inventaire/accueil.spec.ts` | Test d'inventaire de la section 5 (accueil, `/jouer`, `/media`, statistiques, bannis, 404), en taille ordinateur et en taille téléphone |
| `apps/site/app/not-found.tsx` | Page 404 |
| `apps/site/common/components/NavigationProgress/NavigationProgress.tsx` | Barre de progression de la navigation (carte 188) |
| `apps/site/app/error.tsx`, `app/global-error.tsx`, `common/components/ErrorScreen/ErrorScreen.tsx` | Écrans d'erreur (carte 188) |
| `packages/ui/src/themes/<id>.css` | Couleurs de chaque thème en variables v2 (`[data-theme='…']`, skill `ui`) |
| `apps/site/common/components/ThemeProvider/ThemeProvider.tsx` | `useTheme()` : thème actif, `setTheme`, liste des thèmes |
| `apps/site/common/components/DebugAuthWidget/DebugAuthWidget.tsx` | Comptes de test, bouton de la barre haute en développement seulement (carte 204) |

## Les pièges

- Thème : pour un membre connecté, le thème enregistré dans son profil gagne toujours ; `ThemeProvider` le recopie dans le `localStorage` (carte 051). Le `localStorage` ne sert plus qu'aux visiteurs, qui retrouvent le dernier thème utilisé sur l'appareil. Un thème choisi à l'instant s'affiche tout de suite, en attendant que le serveur renvoie le profil à jour. L'accès au `localStorage` est protégé par `try/catch` (il peut être bloqué en navigation privée). Depuis la carte 147, `ThemeProvider` recopie aussi le thème affiché dans le cookie `bbfrance_theme` (constante `THEME_COOKIE` de `lib/themes.ts`, gardé un an) ; pour un visiteur non connecté, `app/layout.tsx` lit ce cookie et l'envoie dans l'attribut `data-theme` de la page : la page arrive directement dans le bon thème, sans passer un instant par le thème par défaut (ADR 0005). Une valeur qui n'est pas un des thèmes du site est ignorée. Test : `tests/e2e/bugs/divers.spec.ts`.
- `/spy` envoie un visiteur vers `/auth/login?callbackUrl=/spy/<id>`, comme le reste du site.
- `/jouer` : une section vide est masquée (sauf la première). Les étapes sont numérotées parmi les sections affichées, et le lien « Étape suivante » (« Prochaine étape » avant la carte 220) vise la section affichée suivante ; la dernière section affichée n'a pas ce lien (carte 132, testé par `tests/e2e/bugs/articles-membres.spec.ts`).
- Accueil : l'article au hasard n'est jamais un article masqué par la modération (carte 139) ; sans invitation Discord réglée, aucun lien Discord n'est affiché (avant la carte 189, ils menaient à `#`, c'est-à-dire nulle part). Le réglage est gardé en cache une heure : un changement dans l'administration peut mettre ce temps à apparaître.
- `/spy` : le renvoi vers `/profile` quand on ouvre son propre profil ne passe plus par `redirect()` dans un `try/catch` (qui interceptait la redirection).
- Mentions légales : seul Vercel est cité comme hébergeur ; l'hébergeur de la base (Neon, ADR-0004) n'apparaît pas.

## Les mots expliqués

| Mot | Sens |
|---|---|
| `data-theme` | Attribut posé sur la balise `<html>` ; chaque fichier `theme.*.css` redéfinit les couleurs quand il vaut son nom. |
| `localStorage` | Petite mémoire du navigateur, propre à un appareil, où le thème est aussi rangé. |
| Spy | Nom interne de la page de profil d'un autre coach (« espionner » son profil). |
| `BannedRedirect` | Composant invisible présent sur toutes les pages, qui envoie un membre banni vers `/banned`. |

## Interactions

**Elle agit sur**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Tout le site | Thème (`lib/themes.ts`, cookie `bbfrance_theme`) | Couleurs de toutes les pages ; le thème d'un membre connecté est celui de son profil. |

**Elle dépend de**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Administration | Réglages `discord_invite`, `how_to_play_*` | Lien Discord de l'accueil, textes de `/jouer`. |
| Tournois, forum, articles, ligues, classement, ressources, média | `app/component/homeData.ts` | Contenu de l'accueil. |
| Bannissement | `/banned` | Page montrée à un membre banni. |

Vue d'ensemble : [../INTERACTIONS.md](../INTERACTIONS.md).

## État

- Marche : toutes ces pages s'affichent et le changement de thème fonctionne.
- Manque : liste blanche dans `updateTheme`, hébergeur de la base dans les mentions légales.
- Cartes ouvertes : 049 (audit mobile), 017 (layout sans `force-dynamic`, qui prévoit de lire le thème depuis un cookie).
