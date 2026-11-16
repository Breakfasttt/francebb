---
id: 094
title: "Refonte des ligues et de la carte"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 9 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 094 — Refonte des ligues et de la carte

## Pourquoi

Refaire les ligues, la fiche d'une ligue, le formulaire de ligue et `/carte` selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 9 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 9 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** `/ligues`, la fiche d'une ligue, sa création, sa modification et `/carte` utilisent maintenant les composants et les couleurs v2 de `packages/ui`. Les adresses, leurs paramètres (`?view&query&region&page`, `/tournois?ligueId=`), les noms des champs du formulaire et les actions serveur n'ont pas changé.
- **`/ligues`** : en-tête « Ligues » avec le nombre de ligues et le bouton « Créer une ligue » (« Créer » sur un petit téléphone). Recherche toujours visible ; sur ordinateur, la liste des zones à côté ; sur téléphone, le bouton « Filtres » ouvre le panneau « Filtrer les ligues », sur le modèle de `/tournois` et `/membres`. La zone choisie est rappelée en pastille avec une croix. Choix grille ou liste en deux boutons de 44 pixels. Grille : une carte par ligue (blason, nom, acronyme, zone et ville, début de la présentation, membres et tournois), entièrement cliquable ; liste : une ligne par ligue. Pagination compacte `PageNav`, qui garde maintenant la recherche, la zone et l'affichage.
- **Fiche d'une ligue** : une carte de tête (blason, nom en grand, acronyme, zone et ville, adresse, membres et tournois), puis « Modifier » et le menu « ⋯ » (« Actions de la ligue » : transférer, supprimer, signaler). Le bloc « Gestion Ligue », qui partait dans le panneau « Plus » sur téléphone, n'existe plus. Ensuite « À propos de la ligue », « Prochains tournois » (pavés de date, « Voir tout »), « Chef et commissaires » (colonne de droite sur ordinateur) et « Membres ». La copie des styles BBCode (`id.css`) est remplacée par l'import de `app/forum/page.css`, comme `/jouer` et la messagerie. Le transfert s'ouvre dans un panneau, la suppression dans `ConfirmDialog`, le signalement dans `ReportModal`.
- **Création et modification** : un seul formulaire `LigueForm` en blocs (la ligue, blason, localisation, commissaires, présentation), dans l'écran de rédaction plein écran du forum (`ComposeScreen`) : sur téléphone, pas de barre du bas et « Annuler » et « Créer la ligue » ou « Enregistrer » collés en bas ; sur ordinateur, colonne « Publication ». Le choix du lieu utilise `MapPicker` (carte 089) dans un panneau. `ComposeScreen` accepte maintenant de ne pas avoir de fil d'Ariane du forum ; `isComposePath` (`navItems.ts`) connaît `/ligues/create` et `/ligue/edit/[id]`.
- **`/carte`** : sur téléphone, la carte occupe tout l'écran entre la barre du haut et la barre du bas (le titre n'est lu que par les lecteurs d'écran) ; sur ordinateur, elle remplit la page sous le titre. Choix « Tournois (n) » ou « Ligues (n) » en haut à gauche, « Plein écran » en haut à droite, nombre de points en bas à gauche, zoom en bas à droite (à portée de pouce). La bulle d'un repère, le zoom et la croix suivent les couleurs du thème ; zoom, croix et lien « Détails » à 44 pixels sur téléphone, zone de toucher des repères agrandie. En plein écran, la carte pose `data-fullscreen` (barre du bas retirée). La bibliothèque Leaflet n'a pas changé. La règle `.icon-accent` a disparu avec `carte/page.css` (plus utilisée).
- `MobileFilterWrapper` est gardé : `/articles` et `/ressources` l'utilisent encore.

**Fichiers.**
- Nouveaux : `apps/site/app/ligues/component/LigueBlason.tsx`, `LigueForm.tsx`, `apps/site/app/ligue/[id]/component/LigueActions.tsx`, `apps/site/tests/e2e/inventaire/ligues.spec.ts`.
- Refaits : `app/ligues/page.tsx`, `component/LigueCard.tsx`, `LigueFilters.tsx`, `LigueBlasonUpload.tsx`, `app/ligues/create/page.tsx`, `app/ligue/[id]/page.tsx`, `app/ligue/edit/[id]/page.tsx`, `app/carte/page.tsx`, `component/CarteClient.tsx`, `LeafletMapContainer.tsx`.
- Modifiés : `app/forum/component/ComposeScreen.tsx` (fil d'Ariane facultatif), `MapPicker.tsx` (nom accessible « Carte du lieu » sur la carte), `app/tournois/component/TournamentListItems.tsx` (`DateBlock` exporté), `common/components/AppShell/navItems.ts`, `tests/e2e/mobile-audit.spec.ts`, `docs/refonte/inventaire.md`, `docs/features/ligues-carte/README.md`, `docs/GLOSSAIRE.md`, skills `reuse-first` et `mobile-ux`, `lint-baseline.json`.
- Supprimés (plus importés nulle part) : `app/ligues/page.css`, `page-mobile.css`, `component/LigueCard.css`, `create/page.css`, `create/page-mobile.css`, `create/LigueLocationFields.tsx`, `create/UserSearchWrapper.tsx`, `app/ligue/edit/LigueEditSubmit.tsx`, `app/ligue/[id]/id.css`, `id-mobile.css`, `component/LigueAdminActions.tsx`, `component/ReportLigueButton.tsx`, `app/carte/page.css`, `page-mobile.css`.

**Ce qui est vérifié.**
- `tests/e2e/inventaire/ligues.spec.ts` (7 tests) a été écrit avant la refonte. L'ancienne version a d'abord reçu des noms accessibles (recherche, zone, boutons d'affichage, champs du formulaire, carte de `MapPicker`, nom des repères de `/carte`). Il passait alors sur l'ancienne version : 14 sur 14, après l'ajout d'une attente avant « Enregistrer » sur téléphone (bug connu de la carte 113). Sur la nouvelle version : 14 sur 14, sans modification du test (fichier comparé à sa copie d'avant la refonte).
- `npx tsc --noEmit` sans erreur ; ESLint du site en baisse, plafond abaissé de 560 à 530.
- `ligues`, `tournois` (le formulaire de tournoi lie toujours une ligue avec `LigueSearch`), `coquille` et `smoke` sur les deux tailles : 95 réussis, 1 sauté, aucun échec.
- Audit mobile (`/ligues`, sa liste, son panneau de filtres, une fiche, la création, la modification et `/carte`, ajoutés à `mobile-audit.spec.ts`) à 360 et 390 pixels : aucun champ sous 16 pixels, rien de coupé sauf les tuiles de la carte (normal, elles dépassent du cadre qui les masque). Restent la coquille (logo, libellés de la barre du bas), un lien dans le texte de la présentation et les deux liens du crédit « Leaflet | © OpenStreetMap ». Le bouton « Enregistrer les modifications » débordait à 360 pixels : il s'appelle « Enregistrer » dans la barre du bas.
- Captures relues à 360, 390 et 1280 pixels en Vestiaire et en Saison 3, puis supprimées. Corrigés après relecture : la bulle d'un repère passait sous le choix « Tournois / Ligues » (marges du recentrage automatique), et un double espace dans « Créer une ligue ».

**Choix à valider par le responsable.** Zone en liste visible sur ordinateur et dans un panneau sur téléphone ; « Modifier » visible, les autres actions de la fiche dans « ⋯ » (le signalement aussi) ; le formulaire en plein écran sur téléphone, commissaires avant la présentation ; la zone affichée par son libellé (« R2 - Nord-Ouest ») et non par sa clé ; avatars du chef, des commissaires et des membres sans cadre de rang (`Avatar` de `packages/ui`) ; pas de liste des points ni de panneau sur `/carte` (le seul réglage, Tournois ou Ligues, reste posé sur la carte) ; zoom de la carte déplacé en bas à droite ; boutons de zoom en français (« Zoomer », « Dézoomer »).

**À essayer à la main sur son téléphone.**
- `/ligues` : chercher un nom, ouvrir « Filtres », choisir une zone, retirer la pastille, passer en liste, aller à la page 2.
- Fiche d'une ligue : ouvrir « ⋯ », signaler ; en chef de ligue, « Transférer la propriété » (le clavier ouvert ne doit pas cacher la liste des coachs trouvés), puis annuler.
- « Créer une ligue » : remplir chaque bloc, envoyer un vrai blason, « Choisir sur la carte », chercher une adresse, déplacer le repère, valider ; ajouter un commissaire ; « Créer la ligue » depuis la barre du bas.
- `/carte` : déplacer et zoomer la carte au doigt, passer de « Tournois » à « Ligues », toucher un repère puis « Détails », passer en plein écran et en sortir ; vérifier que rien ne passe sous la barre de l'iPhone.

**Remarques (hors carte, non corrigées).**
- `updateLigue` efface `gmapsUrl` à chaque modification : le formulaire n'a jamais eu ce champ.
- Le département d'une ligue est enregistré par son libellé (« 35 - Ille-et-Vilaine ») alors que les tournois enregistrent le numéro.
- Les icônes des repères de `/carte` viennent d'un dépôt GitHub extérieur (`raw.githubusercontent.com`) et d'un site de fichiers extérieur ; si l'un ne répond plus, les repères disparaissent.
- `UserSearch` (recherche des commissaires et du nouveau chef) garde son ancien style ; ses résultats sont des `div` cliquables, sans rôle de bouton ni accès au clavier.
