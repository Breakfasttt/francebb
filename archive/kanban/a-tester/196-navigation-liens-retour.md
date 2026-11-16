---
id: 196
title: "Navigation : filtres dans l'adresse et retours fiables"
epic: E11
app: site
depends_on: [189]
verify: "sur /membres, /ressources, /classement et /carte, un filtre choisi apparaît dans l'adresse, se partage par lien et est retrouvé après le retour arrière ; le plein écran de la carte se ferme avec Échap et avec le bouton retour du téléphone sans quitter la page ; « Nouveau forum » s'ouvre en écran de rédaction sans barre basse ; le bouton retour du profil, des statistiques et des pages de l'équipe ramène à la page d'où l'on vient ; corepack pnpm check et pnpm --filter @bbfrance/site test:parcours passent"
---

# 196 — Navigation : filtres dans l'adresse et retours fiables

## Pourquoi

La revue de l'interface du 13 novembre 2026 a relevé des retours arrière qui perdent le travail du coach ou l'emmènent ailleurs :

- les filtres de quatre listes sont gardés seulement dans la page (`useState`) : `/membres` (`MembersTable.tsx:79-84`), `/ressources` (`app/ressources/page.tsx:30-34`), `/classement` (`app/classement/page.tsx:64`) et `/carte` (`CarteClient.tsx:51`). Après l'ouverture d'une ressource puis un retour, la recherche est perdue, et on ne peut pas envoyer un lien vers une liste filtrée. Les articles, les tournois, les ligues et la recherche du forum gardent déjà leurs filtres dans l'adresse. Le user a décidé le 13 novembre 2026 d'aligner `/ressources` sur eux, contrairement à ce que dit aujourd'hui le skill `mobile-ux` ;
- le plein écran de la carte (`CarteClient.tsx:52`, `:83`, `:102`) ne se ferme qu'avec son bouton : sur téléphone, le geste de retour quitte toute la page ;
- l'écran « Nouveau forum » (`app/forum/new-forum/page.tsx:27`) n'utilise pas l'écran de rédaction `ComposeScreen` et manque dans `isComposePath` (`navItems.ts:115-117`) : la barre basse reste affichée, contrairement aux autres écrans de création ;
- le bouton retour du profil (`app/profile/page.tsx:103`), des statistiques (`app/statistiques/page.tsx:36`) et des pages de l'équipe (`StaffPageLayout.tsx:40`) mène toujours à l'accueil, même quand on vient d'ailleurs ;
- petits manques : la carte sans tournoi ni ligue s'affiche vide sans message (`CarteClient.tsx:56`), « Supprimer la ligne » de l'archive du classement (`ArchiveEditor.tsx:279`) et « Débloquer » (`ProfileBlockedUsers.tsx:75`) agissent sans confirmation, et le renommage d'un sujet (`EditTopicTitleModal.tsx:39`) ne confirme pas sa réussite.

Les écrans de chargement de Next.js (`loading.tsx`) ne font pas partie de cette carte : la carte 188 les a retirés parce qu'ils faisaient répondre « OK » aux pages introuvables au lieu de 404.

## Action

- Garder les filtres des quatre listes dans l'adresse (paramètres après le `?`), sur le modèle des articles et des tournois (lire le skill `reuse-first` pour reprendre l'outil existant).
- Plein écran de la carte : fermeture par Échap et ajout d'une entrée d'historique, pour que le retour du téléphone ferme le plein écran.
- Passer « Nouveau forum » en `ComposeScreen` et l'ajouter à `isComposePath`.
- Retour vers la page d'origine quand elle fait partie du site, l'accueil sinon, avec l'outil de retour existant.
- Ajouter le message de carte vide (`EmptyState`), les confirmations (`ConfirmDialog`) et la notification de réussite.
- Mettre à jour le skill `mobile-ux` (filtres de `/ressources` dans l'adresse) et les fiches `profil-membres`, `ressources-media`, `classement-statistiques`, `ligues-carte` et `forum`.
- Vérifier en 360 pixels de large, avec le geste de retour du téléphone.

## Résultat

Filtres dans l'adresse : le nouvel outil `common/hooks/useUrlFilters.ts` (`useSyncUrlFilters`, `readList`, `readPositiveInt`) réécrit l'adresse à chaque changement de réglage avec `window.history.replaceState`, que Next.js prend en charge sans recharger la page depuis le serveur ni ajouter d'entrée à l'historique ; la page lit ses réglages de départ avec `useSearchParams`, dans un `<Suspense>`. Il est branché sur `/ressources` (`?q=`, `tags=`, `vue=liste`, `page=`), sur l'annuaire `/membres` (`?q=`, `role=`, `ligue=`, `region=`, `tri=naf-desc`, `page=`), sur le classement (`?vue=CDF_2026`, `ROLLING`, `ROSTER_2025`, `HOF`, `ARCHIVES` ; une vue écrite dans l'adresse n'est plus remplacée par l'année la plus récente au chargement) et sur la carte (`?vue=ligues`). Le skill `mobile-ux` dit maintenant que les filtres d'une liste vont toujours dans l'adresse.

Plein écran de la carte : l'ouvrir ajoute une entrée à l'historique (`pushState`) ; le bouton retour du téléphone la retire et ferme le plein écran sans quitter la page, la touche Échap et le bouton « Quitter le plein écran » font de même.

Écran « Nouveau forum » : il utilise `ComposeScreen`, et `/forum/new-forum` est ajouté à `isComposePath` ; sur téléphone, la barre basse disparaît et « Annuler » et « Créer le forum » sont collés en bas de l'écran (`ComposeActionBar`).

Retour vers la page d'origine : `BackButton` accepte `preferHistory` (et `ForumListHeader`, `backPreferHistory`). Le bouton revient alors à la page précédente si elle fait partie du site, et suit son lien (l'accueil) si la page a été ouverte directement. Les pages visitées dans l'onglet sont notées par `InAppHistoryTracker`, monté dans `app/layout.tsx`, selon les règles pures de `common/utils/inAppHistory.ts` (vérifiées par `tests/unit/inAppHistory.test.mjs`). Activé sur « Mon compte », les statistiques, l'annuaire, le classement et les pages de l'équipe (`StaffPageLayout`) ; leur titre devient « Retour ».

Petits manques : « Débloquer » dans l'onglet des membres bloqués demande confirmation (`ConfirmDialog`), comme sur la carte du profil ; « Supprimer la ligne » de l'éditeur d'archives affiche « Ligne supprimée » avec « Annuler », plutôt qu'une confirmation à chaque ligne ; le renommage d'un sujet confirme sa réussite par une notification. La carte vide avait déjà son message (« Aucun tournoi à venir placé sur la carte » dans la légende) : rien à ajouter.

Le test `profil.spec.ts` confirme maintenant le déblocage dans la fenêtre ; il n'a pas été lancé (tests longs regroupés en fin de série, à la demande du user). `corepack pnpm check` passe, tests unitaires compris. Skills `mobile-ux` et `reuse-first`, glossaire (« Historique du navigateur ») et fiches `ressources-media`, `profil-membres`, `classement-statistiques`, `ligues-carte` et `forum` à jour.

À essayer à la main, sur un vrai téléphone : filtrer `/ressources` ou `/membres`, ouvrir un élément, revenir en arrière (la liste filtrée revient) ; copier l'adresse d'une liste filtrée dans un autre onglet ; ouvrir la carte en plein écran puis faire le geste de retour (le plein écran se ferme, on reste sur la carte) ; ouvrir « Mon compte » depuis le forum puis appuyer sur le bouton retour (retour au forum), et l'ouvrir dans un nouvel onglet (retour à l'accueil) ; créer un forum à 360 pixels.

Contrôle à l'écran (navigateur invisible, 360 pixels, réglage « réduire les animations ») : la recherche de `/ressources` s'écrit dans l'adresse (`?q=guide`), `/carte?vue=ligues` est écrit après l'appui sur « Ligues », le plein écran de la carte se ferme avec Échap et avec le retour arrière en restant sur la carte, aucune erreur JavaScript, aucun défilement horizontal.
