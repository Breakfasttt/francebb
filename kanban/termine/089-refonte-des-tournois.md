---
id: 089
title: "Refonte des tournois"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 4 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 089 — Refonte des tournois

## Pourquoi

Refaire la liste des tournois et les écrans de tournoi (création, modification, inscriptions, résultats) selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 4 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 4 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Filtres de `/tournois` dans un panneau sur téléphone, pastilles des filtres actifs, tri, affichage en grille ou en liste.
- Formulaire de tournoi découpé en blocs lisibles sur téléphone, avec le choix du lieu sur la carte.
- Module d'inscription et saisie des résultats utilisables au doigt.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** La liste des tournois, la fiche d'un tournoi dans son sujet, le module d'inscription, le bloc des résultats, la création et la modification d'un tournoi, la saisie des résultats et le classement final ont été refaits avec les variables v2 et les composants de `packages/ui`. Les adresses et leurs paramètres (`?query=`, `region`, `dept`, `isTeam`, `platform`, `edition`, `structure`, `isNAF`…, `history`, `ligueId`, `sort`, `view`, `page`, `?forumId=`), les noms des champs du formulaire et les actions serveur n'ont pas changé.

- **`/tournois`** : en-tête compact « Tournois » avec le nombre de tournois. Sur ordinateur, la colonne « Filtres » à gauche (collée en haut pendant le défilement) ; sur téléphone, une seule colonne et un bouton « Filtres » (avec le nombre de filtres actifs) qui ouvre le panneau « Filtrer les tournois », avec « Réinitialiser » et « Voir N tournois » en bas. Au-dessus des résultats : la recherche par nom, le tri et le choix grille ou liste (deux boutons de 44 pixels). Les filtres actifs sont rappelés en pastilles, chacune avec une croix. Grille : une carte par tournoi (date en pavé, nom dominant, lieu, date et durée, badges, places et prix), entièrement cliquable. Liste : une ligne par tournoi ; sur téléphone, le lieu, le format, le prix et les places passent sous le nom. Pagination compacte `PageNav`.
- **Fiche d'un tournoi** (`TournamentSummary`) : statut, mode par équipes et circuits en badges, nom, ligue organisatrice, puis les informations pratiques sur deux colonnes sur téléphone et quatre sur ordinateur, et la logistique en pastilles (oui ou non).
- **Module d'inscription** : bouton « Gestion des inscriptions » qui déplie les listes, badge « Inscriptions closes », actions du membre en pleine largeur sur téléphone (« Me pré-inscrire », « Annuler mon inscription », « Inscrire une équipe », « Être mercenaire », « Modifier mon équipe », « Désinscrire mon équipe »). Pour l'organisateur : liste du paiement et trois boutons de statut de 44 pixels par inscrit, avec un nom lisible (« Valider l'inscription de … »). L'équipe, ses détails et les confirmations s'ouvrent dans des panneaux qui montent du bas.
- **Résultats dans le sujet** : bloc repliable « Résultats du tournoi » avec les onglets « Classement » et « Matchs » ; le classement est partagé avec `/results/view`.
- **Création et modification** : écran de rédaction plein écran sur téléphone (comme répondre ou créer un sujet), formulaire découpé en huit blocs (le tournoi, dates, lieu, participants, championnats et points, jeu, prix et logistique, présentation), barre « Annuler » et « Publier le tournoi » collée en bas sur téléphone, colonne « Publication » sur ordinateur. Le choix du lieu (`MapPicker`) s'ouvre dans un panneau : recherche d'adresse, carte sur la moitié de l'écran, « Valider ce lieu ». Il n'a plus de largeur minimale de 600 pixels (il débordait sur téléphone).
- **Saisie des résultats** : écran plein écran sur téléphone ; « Importer un rapport NAF » et « Vider les résultats » en haut ; onglets « Classement » et « Rondes et matchs » ; une carte par coach avec des champs libellés sur téléphone, une ligne par coach sur ordinateur ; poignée de glisser-déposer de 44 pixels ; « Publier les résultats » dans la barre du bas. **Le `window.confirm()` de « Vider les résultats » est remplacé par une fenêtre `ConfirmDialog`**, sans changer l'action.
- **Nouveau composant partagé** : `ConfirmDialog` dans `packages/ui` (documenté dans le skill `reuse-first` et le glossaire).
- `packages/ui/src/tabs.tsx` : les onglets gardaient le fond et la bordure gris du navigateur (pas de remise à zéro du style natif) ; ils sont maintenant transparents. Ce composant n'était encore utilisé nulle part ailleurs.
- `navItems.ts` (`isComposePath`) : la création, la modification d'un tournoi et la saisie des résultats sont des écrans de rédaction (pas de barre de navigation du bas sur téléphone).

**Fichiers.**
- Nouveaux : `apps/site/app/tournois/component/TournamentFilters.tsx`, `TournamentListItems.tsx`, `packages/ui/src/confirm-dialog.tsx`, `apps/site/tests/e2e/inventaire/tournois.spec.ts`.
- Refaits : `app/tournois/page.tsx`, `app/forum/component/TournamentSummary.tsx`, `RegistrationModule.tsx`, `TournamentResultWidget.tsx`, `TournamentForm.tsx`, `MapPicker.tsx`, `app/forum/new-tournament/page.tsx`, `app/forum/edit-tournament/[id]/page.tsx`, `app/forum/tournament/[id]/results/page.tsx`, `TournamentResultsEditor.tsx`, `results/view/page.tsx`.
- Modifiés : `packages/ui/src/index.ts`, `packages/ui/src/tabs.tsx`, `common/components/AppShell/navItems.ts`, `tests/e2e/mobile-audit.spec.ts`, `docs/refonte/inventaire.md`, `docs/features/tournois/README.md`, `docs/GLOSSAIRE.md`, skills `reuse-first` et `mobile-ux`, `lint-baseline.json`.
- Supprimés (plus importés nulle part) : `app/tournois/page.css`, `page-mobile.css`, `component/ActiveFilters.tsx`, `component/TournamentFilterSidebar.tsx` et son `.css`, `app/forum/component/RegistrationModule.css` et `-mobile.css`, `TournamentResultWidget.css` et `-mobile.css`, `TournamentSummary.css`, `CreateTopicSidebar.tsx`, `.css` et `-mobile.css` (utilisé seulement par le formulaire de tournoi), `results/TournamentResultsEditor.css`. `MobileFilterWrapper` est gardé : `/membres`, `/articles`, `/ressources` et `/ligues` l'utilisent encore.

**Ce qui est vérifié.**
- Le test d'inventaire `tournois.spec.ts` (11 tests, en taille ordinateur et en taille téléphone) a été écrit avant la refonte et passait sur l'ancienne version, après l'ajout de noms accessibles aux champs, boutons et listes qui n'en avaient pas, et le remplacement de `display: none` par un masquage visuel sur les cases des championnats (pour qu'elles restent annoncées aux lecteurs d'écran). Il passe sur la nouvelle version sans changement de ses attentes. Il vérifie la grille, la liste, la pagination et la recherche, chaque filtre (paramètre écrit dans l'adresse et effet sur les résultats), le lien d'une ligue (`?ligueId=`), les pastilles, les six tris, les badges, l'ouverture du sujet, chaque champ du formulaire de tournoi et le panneau de la carte, une création et une modification réellement enregistrées (et le refus d'un autre membre), l'inscription, la désinscription, le mercenariat, la création, la modification, les détails et la suppression d'une équipe, les statuts d'inscription et de paiement, la fermeture et la réouverture des inscriptions, la saisie du classement et des rondes, l'import d'un rapport NAF, la publication et l'effacement des résultats, terminer, réouvrir et annuler un tournoi, le classement final et la page introuvable sans résultat.
- `npx tsc --noEmit` sans erreur (site et `packages/ui`) ; ESLint du site en baisse (plafond abaissé) ; `forum-sujet`, `forum-listes`, `coquille` et `smoke` sur les deux tailles ; audit mobile des écrans de tournoi à 360 et 390 pixels ; captures relues à 360, 390 et 1280 pixels en Vestiaire et en Saison 3.

**Choix à valider par le responsable.** Filtres repliés dans un panneau sur téléphone ; tri et choix grille ou liste restés visibles au-dessus des résultats ; changer un filtre ramène à la page 1 ; la recherche par nom part 400 millisecondes après la dernière touche (avant, à chaque touche) ; la pagination garde maintenant les filtres (avant, elle les perdait) ; les lignes de la liste sont entièrement cliquables (le bouton « Voir » a disparu) ; le formulaire de tournoi et la saisie des résultats en plein écran sur téléphone ; « Annuler » devient « Annuler mon inscription », « Modifier » devient « Modifier mon équipe », « Désinscrire » devient « Désinscrire mon équipe » ; un coéquipier non capitaine voit « Inscrit avec l'équipe … » au lieu d'un bouton grisé ; les avatars du module d'inscription et du classement sont ceux de `packages/ui` (initiale quand il n'y a pas de photo, sans le cadre de rang) ; le fond de carte n'est plus inversé dans les thèmes sombres.

**À essayer à la main sur son téléphone.**
- `/tournois` : taper un nom, ouvrir « Filtres », choisir une région puis un département, cocher un circuit, fermer avec « Voir N tournois », retirer une pastille, changer le tri, passer en liste, aller à la page 2.
- Sujet d'un tournoi : se pré-inscrire puis annuler ; sur un tournoi par équipes, inscrire une équipe avec un coéquipier (clavier ouvert dans la recherche), la modifier, ouvrir ses détails, la désinscrire. En organisateur : déplier les inscriptions, changer un paiement, valider un inscrit.
- Créer un tournoi : remplir chaque bloc, ouvrir « Choisir sur la carte », chercher une adresse, déplacer le repère, valider ; publier depuis la barre du bas.
- Saisie des résultats : importer un fichier NAF depuis le téléphone, réordonner deux coachs à la poignée, ajouter une ronde et un match, publier ; « Vider les résultats » puis annuler.

**Bugs et remarques (hors carte, non corrigés).**
- Les régions du filtre de `/tournois` sont écrites sans accent (« Ile-de-France », « Auvergne-Rhone-Alpes ») alors que le formulaire enregistre celles des données de référence, avec accent : ces tournois ne sont pas trouvés par le filtre de région.
- Le filtre « Places restantes min. » compare le nombre maximum de places, pas les places restantes.
- Modifier un tournoi rattaché à une ligue du site lui retire sa ligue : la page de modification ne transmet pas la ligue au champ `LigueSearch` (seul le nom personnalisé est repris).
- Les composants historiques `UserSearch`, `UserMapper` et `LigueSearch` gardent leur ancien style (petite police) ; dans la saisie des résultats, leur champ et leurs boutons sont agrandis localement. Le pseudo choisi dans `UserMapper` reste écrit en 11 pixels.
- En développement, le bouton flottant historique de filtres (`MobileFilterWrapper`, encore utilisé par d'autres pages) est caché sous les widgets « Dev Theme » et « Dev Auth » ; rien à voir en production.
