---
id: 195
title: "Zones d'appui et informations accessibles au doigt"
epic: E11
app: site
depends_on: []
verify: "à 360 pixels de large, les pastilles de filtre de l'annuaire, les liens de ligue du profil, le lien NAF et le lien « Meilleur coach » font au moins 44 pixels de haut ; le nom complet d'une ligue et la liste des membres qui ont réagi s'affichent d'un appui ; le choix d'émojis du forum se ferme avec Échap et ne dépasse pas de l'écran ; chaque émoji de réaction a un nom en français pour le lecteur d'écran ; corepack pnpm check passe"
---

# 195 — Zones d'appui et informations accessibles au doigt

## Pourquoi

La revue de l'interface du 13 novembre 2026 a relevé des zones trop petites pour un doigt et des informations visibles seulement au survol de la souris, donc introuvables sur téléphone :

- pastilles de filtre de l'annuaire à 36 pixels (`MembersTable.tsx:355-358`), alors que les cinq autres listes ont `min-h-11 lg:min-h-9` ;
- liens de ligue du profil à 32 pixels (`ProfileSidebar.tsx:247`), lien NAF (`MembersTable.tsx:293`) et lien « Meilleur coach » (`RankingViews.tsx:184`) sans hauteur minimale ;
- informations rangées dans l'attribut `title` (bulle qui n'apparaît qu'au survol) : liste des membres qui ont réagi à un article (`ArticleReactions.tsx:112`), nom complet de la ligue derrière son sigle (`ProfileSidebar.tsx:244`, `PostAuthorSheet.tsx:116`, `MembersTable.tsx:288`) ;
- émojis de réaction sans nom lisible (`PostReactions.tsx:141`, `ArticleReactions.tsx:96`, `SmileyGrid.tsx:18`) : le lecteur d'écran lit le nom anglais du caractère ;
- choix d'émojis du forum fait à la main (`PostReactions.tsx:131-139`) : pas de fermeture par Échap, pas de gestion du focus, et il peut dépasser à droite à 360 pixels ;
- menu d'actions sur ordinateur (`packages/ui/src/action-menu.tsx:81`) : l'élément choisi au clavier n'a qu'un fond, sans contour, peu visible dans certains thèmes.

## Action

- Porter chaque zone d'appui citée à 44 pixels sur téléphone.
- Rendre les informations cachées dans `title` consultables d'un appui (fenêtre `Popover` de `packages/ui`) ou visibles en texte.
- Donner à chaque émoji de réaction un `aria-label` en français.
- Remplacer le choix d'émojis du forum par un `Popover`, comme dans `ArticleReactions`.
- Ajouter un contour de focus visible au menu d'actions.
- Vérifier en 360 pixels de large et dans les 8 thèmes.

## Résultat

Zones d'appui : les pastilles de filtre actif de l'annuaire, le lien NAF de l'annuaire, les liens de ligue de la carte du profil et le lien « Meilleur coach » du classement font 44 pixels de haut sur téléphone (`min-h-11`), et reprennent leur taille d'avant sur ordinateur.

Informations qui n'étaient que dans `title` (bulle visible seulement au survol de la souris) : dans l'annuaire, le sigle d'une ligue devient un lien vers la page de la ligue (il était inerte), et le nom complet est lu par le lecteur d'écran (texte `sr-only`) ; sur le profil et dans la fiche de l'auteur d'un message, le nom complet est ajouté de la même façon dans le lien existant. Sous un article, un bouton « Voir qui a réagi » (44 pixels, seulement s'il y a des noms) ouvre un petit panneau qui liste, par émoji, les membres qui ont réagi.

Émojis : le nouveau fichier `common/utils/reactionLabels.ts` donne un nom en français à chaque émoji de réaction (`reactionName`) et le texte d'une pastille (`reactionPillLabel`, par exemple « Pouce levé, 3 réactions (votre réaction) »), utilisés par les réactions des articles et du forum ; les smileys de l'éditeur s'annoncent « Insérer le smiley :) ». Le choix d'émojis du forum, fait à la main (fond cliquable, position absolue), passe par `Popover` sur ordinateur et `Sheet` sur téléphone, comme celui des articles : il se ferme avec Échap, garde le focus et ne déborde plus à 360 pixels.

Le menu d'actions de `packages/ui` (`action-menu.tsx`) entoure d'un contour de focus l'élément choisi au clavier. Le skill `reuse-first` cite `reactionLabels.ts`.

Tests modifiés, sans être lancés (tests longs regroupés en fin de série, à la demande du user) : `forum-sujet.spec.ts` et `articles.spec.ts` cherchent les pastilles par leur nom français (« Pouce levé, 1 réaction »…), `forum-editeur.spec.ts` cherche le smiley par « Insérer le smiley :) ».

Vérifications : `corepack pnpm check` passe.

À essayer à la main, à 360 pixels : réagir à un message du forum (le choix d'émojis monte du bas, se ferme d'un geste ou avec Échap sur ordinateur) ; « Voir qui a réagi » sous un article ; appuyer sur le sigle d'une ligue dans l'annuaire ; parcourir le menu « ⋯ » au clavier sur ordinateur dans deux thèmes.
