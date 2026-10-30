---
id: 085
title: "Refonte des listes du forum"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 3.1, 3.2 et 3.9 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 085 — Refonte des listes du forum

## Pourquoi

Refaire l'accueil du forum, la page d'un forum et la liste des non-lus selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 3.1, 3.2 et 3.9 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 3.1, 3.2 et 3.9 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Afficher les sujets en lignes lisibles d'un coup d'œil, à la manière de Discourse : titre dominant, pastille de non-lu, avatar de l'auteur, nombre de réponses, dernière activité, statut de tournoi, épinglé, verrouillé.
- Garder les catégories repliables, les sous-forums, la pagination et le message affiché après une suppression.
- Sur téléphone, les actions de la colonne latérale passent dans une barre d'actions et dans « Cette page ».
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** L'accueil du forum (`/forum`), la page d'un forum (`/forum/[id]`) et la liste des sujets non lus (`/forum/unread`) ont été refaits avec les variables v2 et les composants de `packages/ui` (cartes, boutons, badges, avatar, pagination `PageNav`, `EmptyState`). Les adresses, les paramètres (`?page=`, `?deletedTopic=`, `?deletedForum=`, `?forumId=`) et la logique serveur n'ont pas changé. Seul ajout aux requêtes : la photo de l'auteur (`author.image`) dans la liste des sujets d'un forum, pour afficher son avatar, comme le demande la carte.

- Accueil : en-tête compact « Forum », bandeau « N sujets non lus › Voir » pour le membre qui a du non-lu, catégories en cartes dont l'en-tête est un bouton repliable (avec `aria-expanded`), une ligne par forum (icône de 40 pixels, nom en gras s'il y a du non-lu, cadenas, description, dernier sujet, « N sujets · par X · date », point bleu de non-lu).
- Page d'un forum : fil d'Ariane, titre avec cadenas et point de non-lu, sous-forums en lignes, sujets en lignes à la manière de Discourse (avatar, titre dominant, épinglé, tournoi, badge « Annulé », « Terminé » ou « Passé », cadenas, « par X · date », messages, vues, dernière activité). Une seule colonne sur téléphone ; sur ordinateur, des colonnes de chiffres et une colonne d'actions à droite qui reste visible pendant le défilement.
- Sur téléphone, « Nouveau sujet » et « Nouveau tournoi » (ou le bouton désactivé « Forum verrouillé ») sont visibles en haut de la liste. La recherche avancée, les membres, les non-lus, « Tout marquer comme lu » et l'administration du forum passent dans la rubrique « Cette page » du panneau « Plus ». La pagination est en bas de la liste, sur les deux tailles d'écran (avant, il n'y en avait pas sur téléphone pour les non-lus).
- Non-lus : une ligne par sujet (avatar, titre, forum, auteur, messages, date du dernier message) avec une coche de 44 pixels « Marquer ce sujet comme lu », « Tout marquer comme lu » en tête, et l'état vide « Vous êtes à jour ».
- Le message affiché après une suppression et le fil d'Ariane du forum utilisent les nouvelles couleurs. Le fil d'Ariane est partagé avec les autres pages du forum : il garde sa marge habituelle, sauf sur la page d'un forum.

**Fichiers.**
- Nouveaux : `app/forum/component/ForumListItems.tsx` (lignes de forum et de sujet, point de non-lu, badge de tournoi), `app/forum/component/ForumListHeader.tsx` (en-tête compact et bouton retour du téléphone), `tests/e2e/inventaire/forum-listes.spec.ts`.
- Modifiés : `app/forum/page.tsx`, `app/forum/[id]/page.tsx`, `app/forum/unread/page.tsx`, `app/forum/component/` (`ForumCategory`, `ForumSidebar`, `DeletionToast`, `MarkAllAsReadButton`, `NewForumButton`, `DeleteForumButton`, `ForumBreadcrumbs`, `LockButton`), `app/forum/unread/component/MarkTopicReadButton.tsx`, `tests/e2e/mobile-audit.spec.ts` (ajout de `/forum/e2e_forum` et `/forum/unread`), les captures `forum-*` de `visual-themes.spec.ts`, `lint-baseline.json`.
- `LockButton` reçoit une option `refonte` : la page d'un sujet, pas encore refaite, garde l'ancien bouton.
- Supprimé : `app/forum/unread/component/UnreadSidebar.tsx` (remplacé par `PageNav`).
- `app/forum/page.css` et `page-mobile.css` ne sont pas supprimés : la page d'un sujet, la réponse, l'éditeur et les formulaires du forum les utilisent encore. Seules les règles devenues inutiles ont été retirées (lignes de forum, catégories, statistiques, badges de statut et leurs animations), après une recherche de chaque classe dans le code.

**Ce qui est vérifié.**
- Le test d'inventaire `forum-listes.spec.ts` (14 tests, en taille ordinateur et en taille téléphone) a été écrit avant la refonte et passait sur l'ancienne version. Il passe sur la nouvelle sans changement de ses attentes. Seule préparation faite avant la refonte : un nom accessible (`aria-label`) a été donné aux deux boutons-icônes « Tout marquer comme lu » et « Marquer ce sujet comme lu », qui n'en avaient pas.
- Une copie temporaire du test, sans les exceptions pour le téléphone, passe aussi : sur téléphone, on voit maintenant le nombre de sujets, le dernier sujet, les messages, les vues et la pagination des non-lus, qui étaient masqués avant.
- `npx tsc --noEmit` sans erreur ; ESLint passe de 817 à 810 erreurs (plafond abaissé) ; dossier `tests/e2e/inventaire` et `smoke.spec.ts` : 91 tests réussis, 1 ignoré (prévu pour le téléphone seulement) ; captures des 8 thèmes régénérées puis relues (Vestiaire, Saison 3, NAF) ; audit mobile des trois pages : rien de coupé, aucun champ trop petit.

**Écarts et ce qui reste.**
- Sept lignes de l'inventaire restent à cocher par le responsable après relecture des captures, parce que le test ne pouvait pas les vérifier sur l'ancienne version (icônes sans nom accessible, mise en valeur visuelle) ou parce que l'accueil garde sa liste en cache 60 secondes : tri des catégories et mise en valeur du non-lu, icônes, cadenas et cloche sur l'accueil et dans les listes, « Aucun sujet » sur l'accueil, trophée et date dans la liste des non-lus. La nouvelle version donne un nom lisible à ces marques (« Forum verrouillé », « Sujet verrouillé », « Épinglé », « Tournoi », « Messages non lus »), ce qui permettra de les tester.
- La cloche de non-lu est remplacée par un point bleu, et le lien « Posts non lus (N) » s'appelle maintenant « Sujets non lus (N) », comme dans les maquettes.
- L'audit mobile relève encore, sur ces pages, le logo de la barre du haut (35 pixels de haut) et les libellés de la barre basse (11,5 pixels) : ils appartiennent à la coquille (carte 081), pas à cette carte.
- Le dernier sujet affiché sur l'accueil pour « E2E Forum » varie d'un lancement à l'autre (deux sujets créés à la même seconde) ; la tolérance des captures l'absorbe.
- Reste à faire : la validation par le responsable sur son téléphone.
