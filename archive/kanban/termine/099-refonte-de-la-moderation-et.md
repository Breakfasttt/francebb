---
id: 099
title: "Refonte de la modération et de l'administration"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 15 et 16 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 099 — Refonte de la modération et de l'administration

## Pourquoi

Refaire les écrans de modération et d'administration selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 15 et 16 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 15 et 16 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Onglets gardés dans l'adresse (`?tab=`), avec leurs pastilles de compteur. Sur téléphone, liste d'onglets en haut de page.
- La remise à zéro de la base reste protégée par la saisie de la phrase de confirmation.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** `/moderation` et `/administration` utilisent maintenant les composants et les couleurs v2 de `packages/ui`. Les adresses (`?tab=…`), les actions serveur, les contrôles de rôle et les requêtes n'ont pas changé ; la logique de déplacement de la structure du forum a été recopiée telle quelle.
- **Mise en page commune** `StaffPageLayout` (`common/components/StaffPageLayout/`) : titre, puis onglets et contenu. Sur ordinateur, les onglets forment une colonne à gauche (ils sont trop nombreux pour une ligne) ; sur téléphone, une rangée en haut de la page qui défile de côté et se place d'elle-même sur l'onglet ouvert (avant : dans le panneau « Plus »). Chaque onglet est un lien ; les pastilles de compteur sont gardées.
- **`packages/ui`** : `LinkTabs` accepte `orientation="vertical"` (colonne d'onglets) ; `ConfirmDialog` accepte un contenu entre la phrase et les boutons (`children`), utilisé pour le commentaire du modérateur.
- **Modération** : journal en liste (modérateur, action, détails, « Voir l'élément », date), « Purger > 3 mois » confirmé dans `ConfirmDialog` ; une fiche par contenu signalé avec « Voir », « Détails » (signalement par signalement) et « Marquer comme traité » (avant : « Traité ») ; bannis en fiches (avant : tableau sur ordinateur) ; ressources avec « Approuver » en grand, « Éditer » et « Refuser » ; « Validation Ressources » devient « Ressources à valider ». Pagination `PageNav`.
- **Administration** : onglets renommés sans majuscules inutiles (« Gestion des rôles », « Membres & accès », « Structure du forum », « Annonces par e-mail », « Zone de danger »…). Rôles affichés par leur libellé (« Modérateur ») dans « Membres & accès » et dans les étiquettes d'accès de la structure. Structure du forum : poignée de 44 pixels pour glisser (au doigt sans faire défiler la page, ou au clavier), menu « ⋯ » par forum pour indenter, désindenter ou changer de catégorie, panneau « Modifier » (à droite sur ordinateur, en bas sur téléphone). Données de référence en fiches avec un interrupteur « Actif ». Guide du débutant : chaque éditeur porte le titre de sa section sur `/jouer`, bouton « Enregistrer le guide » collé en bas de l'écran. Zone de danger : les classes `.action-button` (sans style depuis la carte 095) sont remplacées par `Button` ; même protection qu'avant (trois cases et la phrase exacte), dans un panneau.
- Aucun `confirm()` natif n'existait dans ces écrans ; les anciennes fenêtres `ConfirmModal` et `Modal` y sont remplacées par `ConfirmDialog`.

**Fichiers.**
- Nouveaux : `apps/site/common/components/StaffPageLayout/StaffPageLayout.tsx`, `apps/site/tests/e2e/inventaire/moderation.spec.ts`, `apps/site/tests/e2e/inventaire/administration.spec.ts`.
- Refaits : `app/moderation/page.tsx` et ses 4 onglets, `app/administration/page.tsx` et ses 8 onglets.
- Modifiés : `packages/ui/src/tabs.tsx`, `packages/ui/src/confirm-dialog.tsx`, `tests/e2e/security.spec.ts`, `tests/e2e/mobile-audit.spec.ts`, `lint-baseline.json`, `docs/refonte/inventaire.md`, `docs/features/moderation/README.md`, `docs/features/administration/README.md`, skills `reuse-first` et `mobile-ux`.
- Supprimés (plus importés nulle part) : `app/moderation/page.css`, `page-mobile.css`, `component/ModerationSidebar.tsx`, `app/administration/page.css`, `page-mobile.css`, `component/AdminSidebar.tsx`.

**Ce qui est vérifié.**
- Les deux tests d'inventaire (6 tests pour la modération, 10 pour l'administration) ont été écrits avant la refonte ; l'ancienne version a seulement reçu des noms accessibles (champs, poignées, boutons d'icône, régions). Ils passaient sur l'ancienne version en ordinateur et en téléphone (un test des ressources y était instable : boutons restés désactivés) et passent sur la nouvelle sans modification : 32 sur 32. Données de test créées et supprimées par les tests (administrateur et super administrateur compris, rien dans `globalSetup` ni `firstSetup`). La remise à zéro n'est jamais déclenchée ; l'annonce par e-mail n'est jamais envoyée.
- `security.spec.ts` : la liste des bannis n'est plus un tableau ; le test repère maintenant chaque banni comme élément de la liste « Coachs bannis » et la flèche « Page suivante » par son nom, avec les mêmes vérifications.
- Inventaire, `security`, `coquille`, `smoke`, `session-refresh` et `profil` sur les deux tailles : 118 réussis, 1 ignoré ; deux échecs isolés (chargement lent de la liste des bannis, message d'un sujet du forum sur téléphone) ont repassé au second lancement (71 sur 71).
- `npx tsc --noEmit` sans erreur ; plafond ESLint du site abaissé de 435 à 319.
- Audit mobile de 11 adresses (onglets de la modération et de l'administration) à 360 et 390 pixels : rien de coupé, pas de défilement de côté, aucun champ sous 16 pixels ; restent le logo et les libellés de la barre du bas (coquille), la pastille de compteur en 11 pixels (défaut connu, carte 101) et le lien « Guide du coach » dans une phrase de l'onglet du guide.
- Captures relues à 360 et 1280 pixels en Vestiaire et en Saison 3, puis supprimées. Corrigés après relecture : onglet ouvert hors de la rangée sur téléphone, bouton « Modifier » d'une catégorie trop étroit, notifications qui cachaient les derniers boutons de la page.

**Choix à valider par le responsable.** Colonne d'onglets sur ordinateur et rangée sur téléphone ; « Marquer comme traité » à la place de « Traité » ; actions de niveau d'un forum rangées dans « ⋯ » ; grande marge sous le contenu sur téléphone pour laisser la place aux notifications ; libellés des onglets réécrits.

**À essayer à la main sur son téléphone.**
- `/moderation` : faire défiler la rangée d'onglets, ouvrir « Coachs bannis » ; ouvrir les détails d'un signalement et le marquer comme traité avec un commentaire ; approuver une ressource.
- `/administration?tab=roles` et `?tab=structure` : faire glisser un rôle personnalisé et un forum au doigt (poignée à gauche) ; ouvrir le menu « ⋯ » d'un forum, l'indenter puis le désindenter ; modifier un forum dans le panneau du bas.
- `?tab=reset` (super administrateur) : ouvrir le panneau et vérifier que le bouton reste grisé tant que la phrase n'est pas exacte, puis « Annuler ».
