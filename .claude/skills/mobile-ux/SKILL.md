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

Vérification : tests automatiques en taille téléphone, plus un contrôle à l'œil (sur un vrai téléphone : voir « Tester sur un vrai téléphone » dans le `README.md`).

## Principes

- **Ne rien casser sur ordinateur** : les règles mobiles sont à part, dans `page-mobile.css` ou un bloc `@media (max-width: 768px)`.
- Sur téléphone, on empile les éléments verticalement (`flex-direction: column`) et on garde de l'air (marges intérieures).
- Un tableau trop large passe en liste verticale ou défile dans son propre cadre (`overflow-x: auto`), jamais la page entière.
- Si un composant est trop complexe à adapter, on simplifie son affichage mobile.

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

Sur téléphone, les colonnes de filtres disparaissent. À la place, un **bouton flottant** (icône entonnoir, en haut à droite) ouvre une fenêtre avec tous les filtres et un bouton « Appliquer » (composant `MobileFilterWrapper`).

## Titre de page et bouton retour

Utiliser `<PageHeader />`. Sur téléphone, le bouton retour (`BackButton`) est déplacé dans la barre de navigation (emplacement `#mobile-back-button-slot`) : il reste accessible même quand on fait défiler la page.

## Pages impossibles sur téléphone

Si une fonctionnalité ne peut vraiment pas fonctionner sur téléphone (ex. l'éditeur BBScheme et son grand plateau interactif), afficher `<DesktopOnlyFallback>` avec un message clair : « Optimisé pour ordinateur ou tablette ».
