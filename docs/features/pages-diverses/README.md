# Pages diverses (accueil, jouer, spy, mentions légales, banni, 404, thèmes)

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Les petites pages du site, trop courtes pour une fiche chacune : la porte d'entrée, le guide du débutant, le profil public d'un coach, les pages légales et d'erreur, et le choix du thème de couleurs.

## Ce que voit le coach

### Accueil — `/` (`app/page.tsx`)
Refaite par la carte 155 (ADR 0006), d'après la maquette choisie par le responsable ; il n'y a plus de logo. En haut, un bandeau de présentation : le titre de la page (un texte), puis trois boutons. « Aller au forum » est le plus visible (couleur d'accent, un peu plus grand), à côté de « Jouer à Blood Bowl ! » et « Rejoindre le Discord ». À côté du bandeau, les 3 prochains tournois en liste compacte (date, nom, ville, places prises) ; s'il n'y en a aucun, le message « Aucun tournoi prévu pour l'instant » et un lien « Créer un tournoi ». Ensuite, toutes les rubriques en trois blocs, chaque lien avec une courte description : « Débuter » (Jouer, Ressources ; le quiz et BBScheme en sont partis avec les cartes 179 et 180), « Jouer en compétition » (Tournois et Ligues, chacun avec un lien « Créer », La Carte, Championnat de France) et « La communauté » (Forum, Articles, Discord). Pour un visiteur, « Créer » mène à la connexion, qui renvoie ensuite vers le formulaire. Enfin, un article tiré au hasard ; s'il n'y a aucun article, ce bloc n'est pas affiché. Visible par tous. Les tournois et le lien Discord sont gardés en cache (60 s et 1 h).
**Sur ordinateur** : le bandeau et les tournois côte à côte, les trois blocs de rubriques en colonnes, l'article en bandeau horizontal. **Sur téléphone** : tout l'un sous l'autre ; « Aller au forum » occupe toute la largeur, « Jouer » et « Discord » se partagent la ligne suivante ; chaque lien fait au moins 56 pixels de haut.

### Jouer — `/jouer` (`app/jouer/page.tsx`)
Le « Guide du Coach » : six sections illustrées (C'est quoi Blood Bowl, plateformes, communauté, tournois, NAF/CdF/RTC, challenges régionaux), dont le texte en BBCode est saisi par un admin dans l'administration (`getHowToPlaySettings`). Une section sans texte est masquée, sauf la première.
Depuis la carte 090 : une seule colonne de 880 pixels au plus, une carte par section (illustration en bandeau, icône, « Étape N », titre, texte, bouton « Prochaine étape » vers l'ancre de la section suivante), puis une carte d'appel avec « Créer mon compte » et « Parcourir le forum ». Les styles des blocs BBCode (accordéons, spoilers, galeries) viennent de `common/components/BBCodeContent/bbcode.css`, chargé pour tout le site (carte 101).
**Sur téléphone** : la même colonne, boutons de 44 pixels, boutons d'appel empilés en pleine largeur. Depuis la carte 019, les six images passent par `next/image` (voir le glossaire) : chacune pèse environ 1 Mo dans `public/images/how-to-play/` (des JPEG malgré leur extension `.png`), et le téléphone reçoit maintenant une version WebP à la largeur de l'écran, de 100 à 150 Ko. Elles se chargent seulement quand on approche de leur section.

### Profil public — `/spy/[id]` (`app/spy/[id]/page.tsx`)
Le profil d'un autre coach, ouvert depuis un message du forum ou le classement : activité, articles, bouton « Contacter » (ouvre une conversation) et blocage. Réservé aux membres connectés.
**Sur téléphone** (jusqu'à 1024 pixels) : la carte du membre (`ProfileSidebar`) passe au-dessus du contenu, et les onglets forment une rangée qui défile de côté (`LinkTabs`) ; voir la fiche `profil-membres`.

### Mentions légales — `/mentions-legales`
Éditeur, hébergeur, propriété intellectuelle, RGPD, cookies. Visible par tous, lien dans le panneau « Plus » sur téléphone et dans le pied de page sur ordinateur. **Sur téléphone** : une colonne, marges réduites. Sa mise en forme n'a pas été refaite par la carte 090 (le texte était réécrit en même temps par la carte 126) : elle est reportée à la carte 101.

### Pied de page (`app/layout.tsx`)
Sur ordinateur seulement, fixé en bas de l'écran : mentions légales, « Conçu avec l'aide de l'IA », GitHub, Statistiques, Médias. Restylé avec les variables v2 par la carte 090 (même place, mêmes liens). Sur téléphone, ces liens sont dans le panneau « Plus ».

### Compte banni — `/banned` (`app/banned/page.tsx`)
Un membre banni y est renvoyé par `BannedRedirect` (monté dans `app/layout.tsx`) et voit la raison du bannissement. Tout autre visiteur est renvoyé à l'accueil. Depuis la carte 058, la page n'utilise que des variables de thème (avant, ses couleurs écrites en dur la rendaient presque illisible dans le thème clair) : depuis la carte 090, c'est une carte centrée (composants `Card` et `Button` de `packages/ui`) avec l'icône de la couleur « danger » du thème, l'encadré de la raison et le bouton « Retour à l'accueil ». La carte est une région nommée « Compte banni », que le test des captures repère par ce nom. Captures de référence dans les 8 thèmes : test « page des bannis sur téléphone » de `tests/e2e/visual-themes.spec.ts`. Depuis la carte 067, ce test utilise un membre banni par thème, préparé par `globalSetup.ts` (`themedBannedId`) : il ne modifie plus la base pendant que le site tourne, ce qui le faisait parfois dépasser son délai.
**Sur téléphone** : marges réduites, bouton de retour sur toute la largeur et de 44 pixels de haut au moins. Audit mobile propre à 360 et 390 pixels.

### Page introuvable — 404 (`app/not-found.tsx`)
« Erreur 404 », le titre « Terrain impraticable ! » et un bouton de retour à l'accueil, dans une carte centrée (carte 090). **Sur téléphone** : bouton sur toute la largeur, 44 pixels de haut ; audit mobile propre à 360 et 390 pixels.

### Thèmes
Sept thèmes : `saison3` (par défaut), `default`, `light`, `blood`, `malpierre`, `naf`, `nehekhara`. Le coach choisit le sien dans son profil ou à l'inscription ; il est enregistré en base (`updateTheme`) et dans le navigateur. `DebugThemeWidget` est un sélecteur flottant visible seulement en développement.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/page.tsx` | Accueil |
| `apps/site/app/jouer/page.tsx` | Guide du débutant ; images dans `public/images/how-to-play/`, affichées par `next/image` en mode `fill` (l'image remplit un bandeau au format 16/7) |
| `apps/site/common/components/SiteLogo/SiteLogo.tsx` | Logo du site (barre du haut des autres pages que l'accueil ; zone cliquable d'au moins 44 pixels depuis la carte 101). `next/image` reçoit la largeur et la hauteur réellement affichées, calculées à partir des dimensions du fichier `logo3.png` (1347 × 589 pixels, 1,5 Mo) |
| `apps/site/app/spy/[id]/page.tsx` | Profil public (client), lit `/api/users/[id]` et les actions de `app/profile/actions.ts` |
| `apps/site/app/mentions-legales/page.tsx`, `page.css`, `page-mobile.css` | Mentions légales. La page appartient au chantier RGPD ; sa mise en forme (carte 101) passe par `page.css` (variables v2), `PageHeader` et `PremiumCard`, ses seuls utilisateurs. C'est le dernier `page.css` du site : le jour où la page est réécrite, passer ses classes en Tailwind et supprimer les deux fichiers CSS |
| `apps/site/app/banned/page.tsx`, `common/components/BannedRedirect/BannedRedirect.tsx` | Page et redirection des bannis |
| `apps/site/tests/e2e/inventaire/accueil.spec.ts` | Test d'inventaire de la section 5 (accueil, `/jouer`, `/media`, statistiques, bannis, 404), en taille ordinateur et en taille téléphone |
| `apps/site/app/not-found.tsx` | Page 404 |
| `packages/ui/src/themes/<id>.css` | Couleurs de chaque thème en variables v2 (`[data-theme='…']`, skill `theming-rules`) |
| `apps/site/common/components/ThemeProvider/ThemeProvider.tsx` | `useTheme()` : thème actif, `setTheme`, liste des thèmes |
| `apps/site/common/components/DebugThemeWidget/DebugThemeWidget.tsx` | Sélecteur de développement |

## Les pièges

- Thème : pour un membre connecté, le thème enregistré dans son profil gagne toujours ; `ThemeProvider` le recopie dans le `localStorage` (carte 051). Le `localStorage` ne sert plus qu'aux visiteurs, qui retrouvent le dernier thème utilisé sur l'appareil. Un thème choisi à l'instant s'affiche tout de suite, en attendant que le serveur renvoie le profil à jour. L'accès au `localStorage` est protégé par `try/catch` (il peut être bloqué en navigation privée). Depuis la carte 147, `ThemeProvider` recopie aussi le thème affiché dans le cookie `bbfrance_theme` (constante `THEME_COOKIE` de `lib/themes.ts`, gardé un an) ; pour un visiteur non connecté, `app/layout.tsx` lit ce cookie et l'envoie dans l'attribut `data-theme` de la page : la page arrive directement dans le bon thème, sans passer un instant par le thème par défaut (ADR 0005). Une valeur qui n'est pas un des thèmes du site est ignorée. Test : `tests/e2e/bugs/divers.spec.ts`.
- `/spy` envoie vers `/auth/login?callback=…` ; ailleurs le paramètre est `callbackUrl` (retour après connexion à vérifier). L'accueil utilise bien `callbackUrl`.
- `/jouer` : une section vide est masquée (sauf la première). Les étapes sont numérotées parmi les sections affichées, et « Prochaine étape » vise la section affichée suivante ; la dernière section affichée n'a pas ce bouton (carte 132, testé par `tests/e2e/bugs/articles-membres.spec.ts`).
- Accueil : l'article au hasard n'est jamais un article masqué par la modération (carte 139) ; le lien Discord vaut `#` si le réglage est vide.
- `/spy` : le renvoi vers `/profile` quand on ouvre son propre profil appelle `redirect()` dans un `useEffect`, à l'intérieur d'un `try/catch` qui intercepte la redirection (à vérifier). « Contacter » affiche les erreurs avec `alert()`.
- Mentions légales : seul Vercel est cité comme hébergeur ; l'hébergeur de la base (Neon, ADR-0004) n'apparaît pas.

## Les mots expliqués

| Mot | Sens |
|---|---|
| `data-theme` | Attribut posé sur la balise `<html>` ; chaque fichier `theme.*.css` redéfinit les couleurs quand il vaut son nom. |
| `localStorage` | Petite mémoire du navigateur, propre à un appareil, où le thème est aussi rangé. |
| Spy | Nom interne de la page de profil d'un autre coach (« espionner » son profil). |
| `BannedRedirect` | Composant invisible présent sur toutes les pages, qui envoie un membre banni vers `/banned`. |

## État

- Marche : toutes ces pages s'affichent et le changement de thème fonctionne.
- Manque : liste blanche dans `updateTheme`, hébergeur de la base dans les mentions légales.
- Cartes ouvertes : 049 (audit mobile), 017 (layout sans `force-dynamic`, qui prévoit de lire le thème depuis un cookie).
