---
name: mobile-ux
description: Règles d'affichage et d'ergonomie sur téléphone pour BBFrance (règle absolue - mobile impeccable) - menu latéral global, déplacement des colonnes latérales, bouton de filtres, bouton retour. À lire avant toute modification d'interface.
---

# BBFrance sur téléphone

**Règle absolue du projet : le site doit être impeccable sur téléphone** (voir `README.md`). La plupart des coachs l'utilisent depuis leur mobile.

## Ce que chaque écran doit respecter

- Pas de défilement horizontal.
- Textes lisibles sans zoomer.
- Boutons et liens d'au moins 44 pixels de haut, assez espacés pour le pouce.
- Fenêtres, menus et listes déroulantes qui s'ouvrent et se ferment sans bug.
- Lisible dans les 7 thèmes.
- Fluide : pas de saut de mise en page au chargement, réponse immédiate au toucher.

Mesure rapide après une correction, sans écrire de test temporaire : dans `apps/site`, `node scripts/e2e-db.mjs` puis `MOBILE_AUDIT=1 MOBILE_AUDIT_PAGES=profile,tournois npx playwright test tests/e2e/mobile-audit.spec.ts --project=chromium` (chemins sans « / » au début sous Git Bash).
Le résumé affiché à la fin donne, par page et par taille d'écran, les cibles trop petites, les textes sous 12 pixels, les champs sous 16 pixels et les éléments coupés ; le détail est dans `logs/mobile-audit.json` (voir `docs/mobile-audit.md`).

Vérification : tests automatiques en taille téléphone, plus un contrôle à l'œil (sur un vrai téléphone : voir « Tester sur un vrai téléphone » dans le `README.md`).

## Principes

- **Ne rien casser sur ordinateur** : les règles mobiles sont à part, dans `page-mobile.css` ou un bloc `@media (max-width: 1024px)`.
- Sur téléphone, on empile les éléments verticalement (`flex-direction: column`) et on garde de l'air (marges intérieures).
- Un tableau trop large passe en liste verticale ou défile dans son propre cadre (`overflow-x: auto`), jamais la page entière.
- Si un composant est trop complexe à adapter, on simplifie son affichage mobile.

## Un seul seuil : 1024 pixels

Le site passe de l'affichage ordinateur à l'affichage téléphone à **1024 pixels de large** (carte 055). Les tablettes reçoivent donc l'affichage téléphone. Ce seuil est le même partout :

- en JavaScript : la constante `MOBILE_BREAKPOINT` de `common/hooks/useIsMobile.ts`, utilisée par défaut par `useIsMobile()`, `MobilePortal`, `MobileFilterWrapper`, `TabSystem` et `PageHeader`. Ne jamais passer d'autre valeur à `useIsMobile` ni écrire `window.innerWidth <= …` ;
- en CSS : `@media (max-width: 1024px)` pour les règles téléphone, `@media (min-width: 1025px)` pour les règles réservées à l'ordinateur. Le CSS ne sait pas lire une variable dans un `@media`, d'où la valeur écrite en clair ;
- les classes `.mobile-only` et `.desktop-only` (`globals.css`, `globals-mobile.css`) basculent à la même largeur.

Pourquoi : avant la carte 055, une partie du site basculait à 768 pixels et l'autre à 1024. Entre les deux (tablettes), des colonnes étaient masquées par le CSS sans être encore déplacées dans le menu par le JavaScript : les onglets de la modération devenaient inaccessibles.

D'autres largeurs (`600px`, `480px`, `900px`, `1100px`…) restent permises **seulement pour ajuster une grille ou un tableau à la place disponible** (passer de 3 colonnes de cartes à 2, réduire une marge). Elles ne doivent jamais masquer, déplacer ou remplacer une colonne latérale, un onglet, un menu ou des filtres : cela, c'est le rôle du seuil unique.

## Le menu latéral global (téléphone uniquement)

Sur téléphone, la barre de navigation devient un bouton « hamburger » (trois traits) qui ouvre un menu latéral. Ce menu contient, dans l'ordre :
1. le logo ;
2. le profil du membre (avatar, connexion ou déconnexion) ;
3. les liens principaux (messagerie, forum, modération, administration) ;
4. un séparateur ;
5. un emplacement libre `<div id="mobile-page-sidebar-slot">` pour la colonne latérale propre à la page ;
6. en bas : mentions légales et lien GitHub.

## Colonne latérale d'une page

Si une page a sa propre colonne latérale (onglets du profil, de l'administration…) :
- sur ordinateur, elle s'affiche normalement ;
- sur téléphone, son contenu est déplacé dans l'emplacement libre du menu global, avec le composant `<MobilePortal target="mobile-page-sidebar-slot">` et le hook `useIsMobile`. La colonne d'origine est masquée en CSS mobile.

## Filtres et longs formulaires

Sur téléphone, les colonnes de filtres disparaissent. À la place, un **bouton flottant** (icône entonnoir, en bas à droite) ouvre un panneau qui monte du bas de l'écran, avec tous les filtres et un bouton « Appliquer les filtres » (composant `MobileFilterWrapper`). Exemples : `/membres`, `/articles`, `/ressources`, `/ligues`, `/tournois` (carte 054).

- Sur ordinateur, le composant affiche ses enfants dans une simple `<div className={className}>`. Avec `mobileOnly`, il n'affiche rien sur ordinateur : à utiliser quand la page a déjà sa colonne de filtres.
- Le bouton flottant remplace les filtres jusqu'au seuil commun (1024 pixels), comme la classe `desktop-only` qui masque les colonnes de filtres. Le réglage `breakpoint` existe encore mais ne doit pas être utilisé : une autre valeur recréerait des largeurs où les filtres ne sont nulle part.
- Le bouton et le panneau sont affichés directement dans `<body>` (portail React) : un parent masqué ou en verre dépoli ne peut pas les cacher ni les décaler.
- Ne plus envoyer les filtres dans le menu latéral global (`#mobile-page-sidebar-slot`) : ce menu est réservé à la navigation et aux onglets des pages (profil, administration…).

## Titre de page et bouton retour

Utiliser `<PageHeader />`. Sur téléphone, le bouton retour (`BackButton`) est déplacé dans la barre de navigation (emplacement `#mobile-back-button-slot`) : il reste accessible même quand on fait défiler la page.

## Pages impossibles sur téléphone

Si une fonctionnalité ne peut vraiment pas fonctionner sur téléphone (ex. l'éditeur BBScheme et son grand plateau interactif), afficher `<DesktopOnlyFallback>` avec un message clair : « Optimisé pour ordinateur ou tablette ».
