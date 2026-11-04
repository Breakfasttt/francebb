---
id: 156
title: "Plus de portail React dans le code"
epic: E08
app: site
depends_on: []
adr: 0006
verify: grep -rn "createPortal\|GlobalPortal\|MobilePortal" apps/site ne trouve rien ; tests inventaire coquille, forum-listes et forum-sujet verts en taille ordinateur et téléphone
---

# 156 — Plus de portail React dans le code

## Pourquoi

Un **portail** React (`createPortal`) dessine un composant à un autre endroit de la page que celui où il est écrit. Le site s'en sert pour envoyer le bouton retour dans la barre du haut sur téléphone, et les outils d'une page dans la rubrique « Cette page » du panneau « Plus ». Ce mécanisme rend le code difficile à suivre (on ne voit pas où le contenu s'affiche) et fragile (il faut attendre que l'emplacement existe). Le responsable ne veut plus de portail dans le code du projet. Les composants de la bibliothèque Radix (fenêtres, panneaux, menus) gardent le leur, qui reste interne à la bibliothèque.

## Action

- Bouton retour : affiché sur place, en tête de page, à toutes les tailles (`PageHeader`, `ForumListHeader`, `ComposeScreen`, pages d'un sujet, d'un article, d'une ligue, BBScheme). L'emplacement `#mobile-back-button-slot` de `AppShell` est supprimé.
- « Cette page » : `TopicTools` garde seulement son panneau « Outils du sujet » ; `ForumSidebar` ouvre sur téléphone un panneau « Outils » depuis l'en-tête de la liste. La rubrique « Cette page » est retirée du panneau « Plus ».
- Administration : l'aperçu du glisser-déposer (`DragOverlay` dans `StructureTab`) est affiché sans portail.
- Supprimer `GlobalPortal` et `MobilePortal`. Adapter les tests d'inventaire, l'inventaire et les skills `mobile-ux`, `reuse-first` et `ui-components`.
- Vérifier en taille téléphone.

## Résultat

Plus aucun portail React (`createPortal`) dans le code du site : les composants `GlobalPortal` et `MobilePortal` sont supprimés. Les portails internes des composants Radix de `packages/ui` (fenêtres, panneaux, menus) restent, comme décidé.

- Le bouton retour est affiché dans l'en-tête de chaque page, à gauche du titre, à toutes les tailles d'écran (44 pixels sur téléphone). Sur la fiche d'un article ou d'une ligue, c'est le lien « Tous les articles » ou « Toutes les ligues », désormais visible aussi sur téléphone. Dans BBScheme, il est en tête de la barre d'outils.
- La rubrique « Cette page » du panneau « Plus » est retirée. Les outils d'un forum sont dans un bloc « Outils du forum », sous la liste (sur téléphone) ; ceux d'un sujet restent dans le panneau « Outils du sujet ».
- L'aperçu du glisser-déposer de l'administration (structure du forum) s'affiche sans portail.
- Tests inventaire coquille, coquille-fin, forum-listes et forum-sujet verts en taille ordinateur et téléphone. Le relevé mobile-audit ne tourne qu'avec MOBILE_AUDIT=1 : il a été sauté ; le parcours de fin de carte (carte 157) a ensuite contrôlé ces pages en taille téléphone, sans problème. Plafond ESLint du site abaissé de 226 à 225.

**À essayer sur un vrai téléphone** : le bouton retour d'un sujet du forum, d'une liste de forum et de BBScheme ; le bloc « Outils du forum » sous une liste ; dans l'administration, déplacer une catégorie ou un forum à la souris (l'aperçu doit suivre le pointeur).
