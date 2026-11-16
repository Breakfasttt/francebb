---
id: 205
title: "Accueil vivant"
epic: E11
app: site
depends_on: [204]
verify: "l'accueil suit la maquette choisie par le responsable, en visiteur et en membre connecté ; les 3 derniers messages du forum se mettent à jour seuls, avec une courte animation désactivée par le réglage « réduire les animations » ; un visiteur ne voit jamais un message d'un forum réservé ; tests inventaire/accueil verts en taille ordinateur et téléphone ; en 360 et 375 pixels, pas de défilement horizontal, boutons d'au moins 44 pixels, aucun texte sous 14 pixels ; corepack pnpm check et pnpm --filter @bbfrance/site test:parcours passent"
---

# 205 — Accueil vivant

## Pourquoi

Revue de l'accueil du 13 novembre 2026 (captures en 375 et 1366 pixels de large) :

- un membre qui revient ne voit rien de nouveau : l'accueil ne montre aucune activité du forum ;
- sur téléphone, les trois blocs de rubriques occupent la moitié de la page alors qu'ils répètent la barre basse et le panneau « Plus » ;
- l'en-tête du bloc des tournois (« Prochains tournois », « Tous les tournois ») passe sur deux lignes en 375 pixels ;
- sur ordinateur, les blocs « Débuter » et « La communauté » (2 liens) gardent un grand vide sous leurs liens, à côté de « Jouer en compétition » (4 liens) ;
- les descriptions des liens font 12,8 pixels, en couleur atténuée ;
- un tournoi sans nombre maximum affiche « x / ∞ places » ;
- sur téléphone, rien n'indique que l'article au hasard est un lien.

## Action

1. **Maquettes.** Proposer 2 ou 3 maquettes, en taille téléphone et ordinateur, dans le thème Vestiaire avec un aperçu dans deux autres thèmes, avec :
   - un bloc « Derniers messages du forum » : les 3 derniers messages publiés (titre du sujet, auteur, début du message, depuis combien de temps), chacun menant au message ;
   - des rubriques compactes sur téléphone ;
   - un bandeau plus court pour un membre connecté.
   Les maquettes reprennent les couleurs et les composants existants, sans nouvelle palette. Le responsable en choisit une.
2. **Données.** Les messages passent par `topicAccessWhere` (`apps/site/lib/forumAccess.ts:57`) : un visiteur ou un membre ne voit jamais un message d'un forum qui lui est réservé. Les messages et sujets supprimés ou masqués par la modération sont exclus. La requête est mise en cache (`unstable_cache`, ADR-0005) avec une étiquette vidée par `refreshTopic` (`apps/site/lib/pageRefresh.ts`) à chaque message publié ou supprimé.
3. **Mise à jour en direct.** Le site n'a pas d'envoi en direct depuis le serveur ; comme la messagerie (`app/messagerie/component/ConversationView.tsx:104`), la liste redemande les 3 derniers messages à intervalle régulier (environ 30 secondes), seulement quand l'onglet est visible. Un nouveau message entre en haut de la liste avec une courte animation (glissement et fondu, environ 250 millisecondes) ; le réglage « réduire les animations » du téléphone la supprime (carte 192). Les lecteurs d'écran ne sont pas interrompus à chaque arrivée.
4. **Garder** : les 3 prochains tournois, l'article au hasard, les liens « Créer » (tournoi, ligue), Discord seulement si l'invitation est réglée, la phrase qui explique le site.
5. **Corriger** les défauts listés dans « Pourquoi » : en-tête des tournois sur une ligne, descriptions en 14 pixels, « x inscrits » quand il n'y a pas de maximum, article au hasard qui ressemble à un lien sur téléphone, blocs de rubriques sans vide sur ordinateur.
6. Adapter `apps/site/tests/e2e/inventaire/accueil.spec.ts` (dont : un message d'un forum réservé n'apparaît pas pour un visiteur), la fiche `docs/features/pages-diverses/README.md` et `docs/refonte/inventaire.md`.
7. Vérifier en taille téléphone (360 et 375 pixels) et dans deux ou trois thèmes.

## Résultat

Le responsable a demandé de terminer la carte sans attendre de validation : il n'y a pas eu de maquettes à choisir, la mise en page a été décidée pendant la carte et vérifiée à l'écran.

- **Derniers messages du forum** : nouveau bloc « Derniers messages » avec les 3 derniers messages (titre du sujet, auteur, « il y a 5 min », début du message sans citations ni balises BBCode), chacun menant au message par son lien permanent `/forum/post/<id>`. La requête (`lib/homeLatestPosts.ts`) passe par `topicAccessWhere` et écarte les messages supprimés, masqués par la modération ou écrits par un membre banni. Elle est gardée en cache 30 secondes par ensemble de rôles (étiquette `home-latest-posts`), cache vidé par `refreshTopic` à chaque message publié ou supprimé. La modération d'un message, qui ne passe pas par `refreshTopic`, apparaît au plus tard après 30 secondes.
- **Mise à jour sans recharger** : `app/component/LatestPosts.tsx` rappelle l'action `fetchLatestPosts` (`app/homeActions.ts`) toutes les 30 secondes quand l'onglet est visible, et aussitôt quand il le redevient. L'action ne prend aucun paramètre : les rôles viennent de la session. Un nouveau message entre avec l'apparition `bb-fade-in` déjà définie dans `app/globals.css` (simple fondu avec « réduire les animations »), et une zone `role="status"` l'annonce aux lecteurs d'écran par une phrase complète. Vérifié à l'écran : une requête vers le serveur toutes les 30 secondes.
- **Mise en page** : sur téléphone, bandeau, tournois, derniers messages, article au hasard, puis les rubriques ; sur ordinateur, bandeau et tournois côte à côte, puis derniers messages et article côte à côte, puis les rubriques en trois colonnes, chacune à sa hauteur (plus de vide sous « Débuter » et « La communauté »).
- **Rubriques compactes sur téléphone** : le nom seul, sans les phrases de description, liens de 48 pixels de haut. Sur ordinateur, les descriptions passent de 12,8 à 14 pixels.
- **Membre connecté** : « Bon retour, <pseudo> » au-dessus du titre et plus de phrase de présentation.
- **Corrections** : en-tête des tournois sur une ligne en 360 pixels (« Tout voir », nom complet pour les lecteurs d'écran) ; « 5 inscrits » quand il n'y a pas de maximum ; « Lire l'article » visible sur téléphone ; petit titre en capitales passé de 12 à 14 pixels. Plus aucun texte de l'accueil sous 14 pixels.
- **Tests** : `accueil.spec.ts` cherche les liens des rubriques dans leur navigation (un titre de sujet peut commencer par « Tournois ») et gagne deux tests : un visiteur voit le message public et jamais celui du forum réservé, un modérateur voit les deux.
- Fiche `pages-diverses`, `docs/refonte/inventaire.md` et skill `reuse-first` (`postExcerpt`) à jour.

Vérifié à l'écran en 360 pixels et en 1366 pixels (visiteur, thème par défaut de la base de développement, sans tournoi ni article) : pas de défilement horizontal, aucune zone d'appui sous 44 pixels. `corepack pnpm check` passe.

**À essayer sur un vrai téléphone** : l'accueil en visiteur puis connecté, dans deux ou trois thèmes ; publier un message depuis un autre appareil et le voir arriver sur l'accueil en moins de 30 secondes, avec son animation ; la liste des tournois et l'article au hasard remplis (la base de développement n'en avait pas).

Tests : `accueil.spec.ts` passe en entier (22 tests, tailles ordinateur et téléphone) après deux corrections du test lui-même : les tournois sont cherchés dans leur bloc (les messages de leurs sujets apparaissent aussi dans « Derniers messages »), et chaque taille a ses propres messages de test (les deux tournent en même temps). Le parcours de fin de carte (`test:parcours`) passe.
