---
id: 086
title: "Refonte de la page d'un sujet"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 3.3 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 086 — Refonte de la page d'un sujet

## Pourquoi

Refaire la page d'un sujet selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 3.3 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 3.3 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Sur téléphone, en-tête de message compact : avatar de 40 px, nom, rang, date. Les statistiques de l'auteur s'ouvrent dans une « fiche coach ».
- « Citer », « Répondre » et les réactions restent toujours visibles. Seules les actions rares passent dans le menu « ⋯ » : partager, signaler, marquer non lu, modifier, supprimer, modérer.
- Garder tous les états d'un message (supprimé, bloqué, banni, modéré), la signature, les blocs de tournoi, la pagination, le saut au premier non-lu et « aller au dernier message ».
- Panneau « Outils du sujet » : suivre, modifier le titre, signaler, gestion du tournoi, modération. Barre « Répondre » collée en bas de l'écran.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** La page d'un sujet du forum (`/forum/topic/[id]`) a été refaite avec les variables v2 et les composants de `packages/ui` (cartes, boutons, badges, menu « ⋯ », panneau qui monte du bas, pagination `PageNav`). Les adresses, les paramètres (`?page=`, `?quotePostId=`), les ancres (`#post-<id>`, `id="quick-reply-area"`), l'événement `bbcode-insert-text` et la logique serveur n'ont pas changé : les actions de `app/forum/actions.ts` et les requêtes de la page sont les mêmes.

- En-tête du sujet : fil d'Ariane, bouton retour (dans la barre du haut sur téléphone), titre en grand avec le badge « ARCHIVÉ », nom du forum en lien, et sur téléphone un bouton « Outils du sujet ».
- Un message : en-tête compact avec l'avatar et son cadre de rang (40 pixels sur téléphone, 48 sur ordinateur), le pseudo, un badge de rang (Bronze, Argent, Or…), puis une ligne discrète « rôle · date · #N » (et « modifié le … »). Un appui sur l'avatar ou le pseudo ouvre la « fiche coach » : statistiques de l'auteur (NAF avec lien, équipe, région, ligues, ligue saisie) et boutons « Profil » et « MP ». Le corps du message est en 16 pixels, limité à environ 70 caractères de large sur ordinateur ; les citations sont sur un encadré de surface ; la signature est séparée par un filet. Sous le message, les réactions et « Citer » restent toujours visibles.
- Le bouton « ⋯ » de chaque message regroupe les actions rares : partager (avec la notification « Lien copié ! »), signaler, marquer comme non lu à partir d'ici, modifier, supprimer (avec confirmation), modérer ou restaurer. Toutes les fenêtres de confirmation existantes sont gardées.
- Tous les états d'un message sont conservés : supprimé, auteur bloqué ou banni (masqué, « Afficher le message », « AFFICHAGE TEMPORAIRE », « Masquer à nouveau »), modéré, premier message d'un tournoi mis en valeur (bordure d'accent et badge « Premier message ») sur les pages suivantes, animation du nouveau message.
- Outils du sujet : sur ordinateur, une colonne à droite en cartes (Sujet, Gestion du tournoi, Modération), collée en haut de l'écran et qui défile pour elle-même si elle est plus haute que l'écran. Sur téléphone, les mêmes outils dans le panneau « Outils du sujet » et dans la rubrique « Cette page » du panneau « Plus ».
- Sur téléphone, une barre collée en bas, au-dessus de la barre de navigation, donne la pagination compacte et « Répondre ». Elle s'efface pendant la saisie et quand la zone de réponse est à l'écran (sinon, en réapparaissant à la fermeture du clavier, elle se glissait sous le doigt au moment d'appuyer sur « Envoyer ma réponse »). Sous 375 pixels de large, « Répondre » n'affiche que son icône. Sur ordinateur, la pagination est en haut et en bas de la liste.
- Réponse rapide : une carte « Votre réponse » avec l'éditeur BBCode inchangé (refait à la carte 087) et « Envoyer ma réponse » ; sinon l'encart « Sujet verrouillé ».
- Les notifications et les widgets de développement montent au-dessus de la barre du bas grâce à une nouvelle variable CSS, `--app-page-bar-space`, posée par la coquille quand une page a une barre collée en bas (attribut `data-page-bottom-bar`).

**Fichiers.**
- Nouveaux : `app/forum/component/TopicTools.tsx` (outils du sujet, barre du bas, pagination), `PostMoreMenu.tsx` (menu « ⋯ »), `PostAuthorSheet.tsx` (fiche coach), `tests/e2e/inventaire/forum-sujet.spec.ts`.
- Refaits : `app/forum/topic/[id]/page.tsx` (rendu seulement), `PostItem.tsx`, `PostActions.tsx` (pied du message : réactions et « Citer »), `PostReactions.tsx`, `QuickReply.tsx`.
- Modifiés : `common/components/UserAvatar/UserAvatar.tsx` (le calcul du rang affiché est sorti dans `resolveRank`, sans changement, et les noms des rangs sont dans `RANK_LABELS`), `common/components/AppShell/AppShell.css`, `DebugThemeWidget.tsx`, `DebugAuthWidget.tsx`, `packages/ui/src/toaster.tsx` (variable `--app-page-bar-space`), les captures `signalement-*` de `visual-themes.spec.ts`, `lint-baseline.json`, les fiches `docs/features/forum` et `docs/features/moderation`.
- Supprimés : `TopicSidebar.tsx`, `SharePostButton.tsx`, `ReportPostButton.tsx`, `MarkUnreadAction.tsx` (leur logique est reprise telle quelle dans `TopicTools` et `PostMoreMenu`).
- `app/forum/page.css` et `page-mobile.css` ne sont pas supprimés : la page de réponse, la modification d'un message, les formulaires et la recherche les utilisent encore, et la page d'un sujet y garde les styles des blocs BBCode (spoiler, accordéon, galerie) et l'animation du nouveau message. Les règles de l'ancienne mise en page des messages et de l'ancienne colonne ont été retirées, après une recherche de chaque classe dans le code.

**Ce qui est vérifié.**
- Le test d'inventaire `forum-sujet.spec.ts` (27 tests, en taille ordinateur et en taille téléphone) a été écrit avant la refonte et passait sur l'ancienne version. Il passe sur la nouvelle sans changement de ses attentes. Préparation faite avant la refonte : un nom accessible (`aria-label`) a été donné aux boutons-icônes « Citer », « Modifier », « Supprimer », « Partager ce message », « Signaler ce message », « Marquer comme non lu à partir d'ici » et « Ajouter une réaction », et l'état « réaction choisie » (`aria-pressed`) aux pastilles de réaction.
- `npx tsc --noEmit` sans erreur ; ESLint passe de 810 à 789 erreurs (plafond abaissé) ; dossier `tests/e2e/inventaire`, `smoke.spec.ts` et `security.spec.ts` réussis sur les deux tailles (un test de la carte 085 a échoué une fois à la fermeture du navigateur, puis réussi seul : il est instable, sans lien avec cette carte) ; captures de la fenêtre de signalement régénérées dans les 8 thèmes et relues (Vestiaire, Saison 3, NAF) : elles montrent maintenant le titre du sujet, parce que le premier bouton « Signaler » de la page est celui du sujet ; audit mobile des pages de sujet et de réponse, à 390 et 360 pixels : rien de coupé, aucun champ trop petit, seuls restent le logo et les libellés de la barre basse (coquille, carte 081).

**Écarts et ce qui reste.**
- Trois lignes de la section 3.3 restent à cocher : le cadre de rang de l'avatar (vérifiable seulement sur les captures), « une page trop grande est ramenée à la dernière » (voir le bug ci-dessous) et « Citer » sans réponse rapide. Les lignes des réactions (retour en arrière si le serveur refuse), de l'animation du nouveau message et de l'aperçu du titre sont cochées pour l'essentiel, mais ces trois détails ne sont pas vérifiés par le test. Dans la partie « Rendu des messages », la ligne « toutes les balises » reste à vérifier. Dans la section 2, la ligne de l'événement `bbcode-insert-text` (citation insérée par « Citer ») est cochée, car le test la vérifie.
- Bugs repérés, non corrigés (hors carte) : avec `?page=99`, la pagination indique la dernière page mais aucun message n'est affiché, car la requête utilise le numéro demandé ; `getQuoteStatusMap` ne reconnaît que les citations courtes `[quote=membre|message]`, pas celles que crée « Citer » (`[quote=membre|message|nom]`), si bien qu'une citation d'un message supprimé ou modéré reste affichée telle quelle ; sur un sujet verrouillé, l'encart « Sujet verrouillé » porte l'ancre de la réponse rapide, donc « Citer » y fait défiler au lieu de mener à la page de réponse.
- Choix à valider par le responsable : le libellé « Posté le » disparaît devant la date (ligne « rôle · date · #N ») ; le badge « Premier message » sur le premier message d'un tournoi ; la fiche coach affiche « Ce coach n'a pas renseigné de statistiques. » quand il n'y en a pas ; le séparateur « Nouveaux messages » n'a pas été ajouté (il demandait une requête de plus).
- Reste à faire : la validation par le responsable sur son téléphone.
