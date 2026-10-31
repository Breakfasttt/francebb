---
id: 088
title: "Refonte de la recherche et de la modération du forum"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 3.7 et 3.8 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 088 — Refonte de la recherche et de la modération du forum

## Pourquoi

Refaire la recherche du forum, la création d'un forum et les fenêtres de modération (déplacer, modérer, modifier le titre, signaler) selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 3.7 et 3.8 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 3.7 et 3.8 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Formulaire de recherche replié dans un panneau sur téléphone, résultats en lignes avec l'extrait surligné.
- Fenêtres de modération construites avec les composants de `packages/ui`, à leur bon niveau de superposition.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** La recherche avancée, la création d'un forum et les quatre fenêtres de modération et de signalement ont été refaites avec les variables v2 et les composants de `packages/ui`. Les adresses et leurs paramètres (`?q=`, `author`, `forumId`, `date`, `sortBy`, `page`, `?categoryId=`, `?parentForumId=`), les noms des champs envoyés et les actions serveur (`createForum`, `moveTopic`, `updateTopicTitle`, `moderatePost`, `createReportAction`) n'ont pas changé. La façon dont la page d'un sujet ouvre ces fenêtres (`PostMoreMenu.tsx`, `TopicTools.tsx`) n'a pas été touchée.

- **Recherche (`/forum/search`).** En-tête compact (`ForumListHeader`), puis le champ des mots-clés et le bouton « Lancer la recherche », toujours visibles (sur téléphone, le bouton n'affiche que la loupe ; son nom reste lu par les lecteurs d'écran). Sur ordinateur, les quatre filtres (auteur, forum, période, tri) sont sur une ligne sous le champ. Sur téléphone, ils sont rangés dans un panneau « Filtres de recherche » qui monte du bas, ouvert par le bouton « Filtres », qui affiche le nombre de filtres actifs. Sous le formulaire, une pastille par filtre actif (« Auteur : … », « Forum : … », « Dernière année », « Plus anciens d'abord ») retire ce filtre d'un appui. Les résultats sont des lignes dans une carte : titre du sujet (avec un trophée pour un tournoi), forum, auteur, ancienneté, extrait avec les mots cherchés surlignés, vues, date du dernier message et bouton « Voir ». Pagination compacte `PageNav` ; liste vide avec `EmptyState`. Sur ordinateur, le curseur est placé dans le champ des mots-clés avant toute recherche ; pas sur téléphone, pour ne pas ouvrir le clavier tout seul.
- **Créer un forum (`/forum/new-forum`).** Une carte avec des champs à libellés (`Field`, `Input`, `Textarea`, `Select`), un groupe « Emplacement » (catégorie, forum parent, « Insérer après ») avec une phrase d'aide sous chaque liste, et les boutons « Créer le forum » et « Annuler » en bas, empilés en pleine largeur sur téléphone.
- **Fenêtres** « Déplacer le sujet », « Modifier le titre du sujet », « Modérer le message de … » et « Signaler un contenu » : composant `Sheet`, fenêtre centrée sur ordinateur et panneau qui monte du bas sur téléphone, au niveau commun des fenêtres (8000 et 8001), donc au-dessus de la barre de navigation du bas (5000) et du panneau « Plus » (7100). Champs à libellés, boutons de 44 pixels, « Annuler » sous le bouton principal sur téléphone. Les raisons du signalement sont des boutons à deux états (`aria-pressed`) avec une coche. La fenêtre de signalement ne se ferme toujours pas par un appui à côté, pour ne pas perdre les précisions saisies. `ModerationModal` et `ReportModal` sont partagées : la nouvelle apparence vaut aussi pour les articles et les ligues.
- `packages/ui/src/sheet.tsx` : le bouton de fermeture de tous les panneaux avait le fond et la bordure gris du navigateur (le style natif n'est pas encore remis à zéro) ; il est maintenant transparent.

**Fichiers.**
- Nouveau : `apps/site/tests/e2e/inventaire/forum-recherche.spec.ts`.
- Refaits : `app/forum/search/page.tsx`, `app/forum/component/SearchForm.tsx`, `app/forum/new-forum/page.tsx`, `app/forum/new-forum/component/NewForumForm.tsx`, `app/forum/component/MoveTopicModal.tsx`, `EditTopicTitleModal.tsx`, `ModerationModal.tsx`, `common/components/ReportModal/ReportModal.tsx`.
- Modifiés : `packages/ui/src/sheet.tsx`, `tests/e2e/visual-themes.spec.ts` (la fenêtre de signalement est repérée par son rôle et son titre au lieu de la classe `.report-modal`) et ses 8 captures `signalement-*`, `tests/e2e/mobile-audit.spec.ts` (recherche avec résultats), `lint-baseline.json`, `docs/refonte/inventaire.md`, `docs/features/forum/README.md`, `docs/GLOSSAIRE.md` (injection de code, pastille de filtre actif).
- Supprimés : `app/forum/search/page.css` (importé seulement par la recherche), `app/forum/new-forum/component/NewForumForm.css` et `NewForumForm-mobile.css` (importés seulement par le formulaire), `common/components/ReportModal/ReportModal-mobile.css` (importé seulement par la fenêtre). Les écrans refaits n'importent plus `app/forum/page.css` ni `page-mobile.css`, que d'autres pages du forum utilisent encore.

**Ce qui est vérifié.**
- Le test d'inventaire `forum-recherche.spec.ts` (13 tests, en taille ordinateur et en taille téléphone ; le test du panneau « Plus » n'existe qu'en taille téléphone) a été écrit avant la refonte et passait sur l'ancienne version (25 réussis, 1 sauté), après l'ajout de noms accessibles aux champs de la recherche et du formulaire de forum et au trophée. Il passe sur la nouvelle version sans changement de ses attentes (25 réussis, 1 sauté). Il vérifie chaque filtre (champ, options, valeurs reprises après la recherche, effet sur les résultats, paramètres de l'adresse), le forum parent qui inclut ses sous-forums, le contenu d'un résultat, l'extrait sans BBCode et surligné, les 20 résultats par page, le lien « Voir » qui mène au message sur la bonne page du sujet, le message « Aucun résultat », le renvoi d'un membre hors de `/forum/new-forum`, les trois erreurs de création, une création réussie, puis le déplacement, le changement de titre, la modération et les deux signalements réellement enregistrés dans la base, et la fenêtre de signalement ouverte depuis le panneau « Plus » sur téléphone.
- `npx tsc --noEmit` sans erreur (site et `packages/ui`) ; ESLint du site passe de 731 à 713 erreurs (plafond abaissé). `forum-recherche`, `forum-sujet`, `coquille` et `smoke` sur les deux tailles : 137 réussis, 2 sautés, 1 échec par dépassement du temps permis sur « modifier le titre » en taille ordinateur, réussi aux deux relances suivantes. `visual-themes.spec.ts` : les 8 captures `signalement-*` régénérées et relues (Vestiaire, NAF, Light, Blood), puis 26 réussis. Audit mobile de la recherche (vide et avec résultats), du nouveau forum et d'un sujet à 390 et 360 pixels : rien de coupé, aucun champ sous 16 pixels ; restent le logo de la barre du haut et les libellés de la barre basse (coquille) et le chiffre de la pastille `CountBadge` (11 pixels, composant partagé). Captures relues à 360, 390 et 1280 pixels en Vestiaire et en Saison 3 : recherche vide, avec résultats, panneau des filtres, extrait, aucun résultat, nouveau forum et les quatre fenêtres.

**Choix à valider par le responsable.** Filtres repliés dans un panneau sur téléphone et affichés en ligne sur ordinateur ; bouton de recherche réduit à la loupe sur téléphone ; pastilles des filtres actifs ; sans mot-clé, l'extrait d'un résultat est le début du message en texte simple (avant, le message entier mis en forme était affiché) ; bouton « Voir » gardé à droite de chaque ligne en plus du titre cliquable ; libellés reformulés (« Aucune (sous-forum) », « Aucun (forum principal) », « Après : … », « Précisions (facultatif) », « Forum de destination », « Nouveau titre ») ; bouton principal de la création de forum dans la couleur d'accent au lieu du violet réservé jusque-là aux actions d'administration.

**À essayer à la main sur son téléphone.**
- Recherche : taper un mot et lancer la recherche avec la touche Entrée du clavier, ouvrir « Filtres », changer le forum et la période, lancer depuis le panneau ; retirer une pastille ; parcourir les pages ; ouvrir un résultat et vérifier qu'on arrive sur le bon message.
- Créer un forum (modérateur) : choisir une catégorie puis un forum parent, et vérifier que « Insérer après » suit.
- Depuis un sujet : signaler un message (menu « ⋯ ») et le sujet (panneau « Outils du sujet » et rubrique « Cette page » du panneau « Plus »), avec le clavier ouvert dans « Précisions » ; en modérateur, déplacer le sujet, modifier son titre (smileys) et modérer un message. Vérifier que chaque fenêtre passe au-dessus de la barre du bas et que le bouton d'envoi reste atteignable avec le clavier ouvert.

**Bugs et remarques (hors carte).**
- Le bug de l'inventaire « le lien d'un résultat de `/forum/search` n'atteint pas le message » n'existe plus : il a été corrigé par la carte 104, et le test le vérifie.
- **Injection de code dans la recherche** (corrigée en passant, à faire valider) : l'ancien extrait était inséré tel quel dans la page (`dangerouslySetInnerHTML`) après avoir retiré seulement le BBCode, si bien qu'une balise HTML écrite dans un message pouvait s'exécuter chez toute personne qui le trouvait par la recherche. L'extrait est maintenant affiché comme du texte. Ce n'est pas vérifié par un test.
- **Mot-clé contenant une parenthèse** (corrigé en passant) : l'ancien code cherchait le mot-clé avec une expression régulière non protégée ; une recherche comme « ( » faisait planter la page. Les caractères spéciaux sont maintenant protégés.
- La pagination de la recherche construisait son adresse sans encoder les valeurs (un « & » dans un mot-clé cassait la page suivante) ; `PageNav` reçoit maintenant une adresse encodée.
- `SheetContent` lit le titre une seconde fois en texte caché quand on ne lui donne pas de description : une recherche de texte sur le titre le trouve alors deux fois. La fenêtre de modération a reçu une description pour cette raison.
- Les zones de texte de `packages/ui` (`Textarea`) prennent la police à chasse fixe du navigateur tant que le style natif n'est pas remis à zéro ; corrigé localement dans les fenêtres et le formulaire de cette carte (`[font-family:inherit]`), à corriger dans le composant lui-même (carte 101).
- Dans le thème Saison 3, le titre des panneaux garde le trait vertical de l'ancien style des titres.
