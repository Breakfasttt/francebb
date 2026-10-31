---
id: 090
title: "Refonte de l'accueil et des pages fixes"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 5 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 090 — Refonte de l'accueil et des pages fixes

## Pourquoi

Refaire l'accueil, `/jouer`, les mentions légales, `/media`, les statistiques, la page 404 et la page « banni » selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 5 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 5 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** L'accueil, `/jouer`, `/media`, `/statistiques`, la page des bannis et la page introuvable (404) ont été refaits avec les variables v2 et les composants de `packages/ui`. Le pied de page de l'ordinateur a été restylé (même place, mêmes liens). Les adresses, les ancres du guide (`#how_to_play_…`), les réglages lus et les actions serveur n'ont pas changé. **Les mentions légales ne sont pas traitées** : leur texte était réécrit au même moment par la carte 126 ; leur mise en forme est reportée à la carte 101, et la ligne de l'inventaire reste non cochée.

- **Accueil** : un vrai en-tête dans le flux de la page (le grand logo, qui sert de titre, et une phrase de présentation) remplace le logo posé en position absolue sous la barre ; la règle provisoire `.refonte-shell .logo-overlay-container` de `AppShell.css` est retirée. Le logo s'affiche maintenant aussi sur téléphone (80 pixels de haut ; 126 sur ordinateur). Tuiles : « Jouer à Blood Bowl ! » en couleur d'accent, puis les dix autres en grille (deux colonnes sur téléphone, six sur ordinateur). Le lien « Créer » des tuiles Ligues et Tournois est posé dans leur coin (44 pixels), avec un nom lisible par les lecteurs d'écran : « Créer une ligue » et « Créer un tournoi ». Les prochains tournois réutilisent la carte de `/tournois` (`TournamentCard`) ; l'article aléatoire est une carte cliquable. La clé du cache des tournois devient `next-tournaments-v2`, parce que la requête lit maintenant le nom de l'organisateur : un ancien résultat gardé en cache ne peut pas être servi après la mise en ligne.
- **`/jouer`** : une colonne de lecture (880 pixels au plus), une carte par section (illustration en bandeau, icône, « Étape N », titre, texte, bouton « Prochaine étape »), puis la carte d'appel. Les styles des blocs BBCode (accordéons, spoilers, galeries) viennent maintenant de `app/forum/page.css`, comme dans les sujets du forum, au lieu d'une copie.
- **`/media`** : sections « Directs Twitch » et « Dernières vidéos », un lecteur par carte (deux par ligne sur ordinateur), bouton « Voir sur Twitch » de 44 pixels, lecteurs chargés seulement à l'approche de l'écran. Les lecteurs ont reçu un titre accessible (attribut `title`), ajouté avant la refonte pour le test.
- **`/statistiques`** : deux chiffres par ligne sur téléphone, trois sur ordinateur ; chaque chiffre est une paire nom et valeur (liste de définitions `dl`). Noms en français : « Courriels du mois », « Taille de la base » (l'explication parlait à tort d'un fichier SQLite), « Signalements », « Quota de stockage ». La partie réservée s'appelle « Console d'administration ».
- **Bannis et 404** : une carte centrée et un bouton principal de 44 pixels (pleine largeur sur téléphone).

**Fichiers.**
- Nouveau : `apps/site/tests/e2e/inventaire/accueil.spec.ts`.
- Refaits : `app/page.tsx`, `app/jouer/page.tsx`, `app/media/page.tsx`, `app/statistiques/page.tsx`, `app/statistiques/component/StatCard/StatCard.tsx`, `app/banned/page.tsx`, `app/not-found.tsx`.
- Modifiés : `app/layout.tsx` (pied de page), `app/globals.css` (règles du pied de page et de l'ancien accueil retirées), `app/theme/theme.saison3.css` (règle `.footer-link` devenue inutile), `common/components/AppShell/AppShell.css` (règle provisoire du logo retirée), `app/carte/page.css` (la règle `.icon-accent`, qui venait du CSS de l'accueil, y est recopiée), `tests/e2e/visual-themes.spec.ts` (la carte des bannis est repérée par son rôle) et ses captures de l'accueil, du forum (le pied de page y apparaît) et des bannis, `tests/e2e/mobile-audit.spec.ts` (statistiques vues par un administrateur et page 404), `lint-baseline.json`, `docs/refonte/inventaire.md`, fiches `pages-diverses`, `classement-statistiques` et `ressources-media`.
- Supprimés (plus importés nulle part) : `app/page.css`, `app/page-mobile.css`, `app/jouer/page.css` et `page-mobile.css`, `app/media/page.css` et `page-mobile.css`, `app/statistiques/page.css` et `page-mobile.css`, `StatCard.css`, `app/banned/page.css` et `page-mobile.css`, `app/not-found.css`.

**Ce qui est vérifié.**
- Le test d'inventaire `accueil.spec.ts` (9 tests, en taille ordinateur et en taille téléphone) a été écrit avant la refonte et passait sur l'ancienne version ; il passe sur la nouvelle sans changement de ses attentes (18 sur 18). Il vérifie le logo (sur ordinateur seulement, car l'ancien accueil n'en avait pas sur téléphone), chaque tuile et son adresse, la tuile Discord, les liens « Créer » pour un visiteur (vers la connexion, avec retour au formulaire) et pour un membre (directement vers le formulaire), les trois prochains tournois et pas le quatrième, l'article aléatoire, le guide `/jouer` (première section vide affichée, sixième vide masquée, ancre « Prochaine étape », boutons d'appel), les lecteurs Twitch et YouTube et leurs liens, les statistiques publiques, la partie réservée (absente pour un visiteur et un modérateur, présente pour un administrateur), la page des bannis et la page 404.
- `npx tsc --noEmit` sans erreur ; ESLint du site en baisse (plafond abaissé) ; `coquille` et `smoke` sur les deux tailles (59 réussis, 1 ignoré) ; audit mobile de `/`, `/jouer`, `/media`, `/statistiques` (visiteur et administrateur), `/banned` et de la page 404 à 360 et 390 pixels : aucun élément coupé, aucun champ trop petit ; les seuls relevés restants viennent de la coquille (petit logo de la barre du haut, libellés de la barre du bas en 11,5 pixels), pas de ces pages. Captures relues à 390 et 1280 pixels en Vestiaire ; captures de référence régénérées et relues dans les huit thèmes (Saison 3 et clair notamment).

**Choix à valider par le responsable.** Grand logo affiché aussi sur téléphone ; « Jouer à Blood Bowl ! » mis en avant en couleur d'accent ; tuile Discord aux couleurs du thème (avant : le violet de Discord) ; prochains tournois affichés avec la carte de `/tournois` (nom du tournoi au lieu du titre de son sujet, avec badges, places et prix) ; accueil qui défile sur ordinateur (avant, il tenait dans la hauteur de l'écran) ; libellés des statistiques en français ; « Vidéo & Stream » devient « Vidéos et directs » ; pied de page gardé fixe en bas de l'écran sur ordinateur.

**À essayer à la main sur son téléphone.**
- Accueil : le logo et les tuiles tiennent sur deux colonnes sans déborder ; toucher « Créer » sur Ligues sans être connecté, se connecter, arriver sur le formulaire ; toucher un tournoi et l'article.
- `/jouer` : faire défiler, toucher « Prochaine étape » (la section suivante s'affiche sous la barre du haut, pas cachée par elle) ; ouvrir un spoiler ou un accordéon s'il y en a dans le texte.
- `/media` (depuis le panneau « Plus ») : lancer un direct Twitch et une vidéo YouTube, passer en plein écran, toucher « Voir sur Twitch ».
- `/statistiques`, puis une adresse qui n'existe pas (page 404) ; en administrateur, la console d'administration.

**Bugs et remarques (hors carte, non corrigés).**
- `/media` est bien accessible hors du pied de page : il figure dans le panneau « Plus » du téléphone et dans le menu « Plus » de l'ordinateur (`MORE_NAV` dans `navItems.ts`, vérifié aussi par `coquille.spec.ts`). Le bug signalé n'existe pas.
- `/jouer` : le bouton « Prochaine étape » de la dernière section affichée vise la section suivante même quand elle est masquée (vide) ; il ne mène alors nulle part.
- La taille de la base est écrite avec un point décimal (« 9.50 Mo ») au lieu d'une virgule (calcul dans `app/statistiques/actions.ts`).
- Les styles des blocs BBCode sont recopiés dans plusieurs CSS de pages (`forum/page.css`, `ligue/[id]/id.css`, `messagerie/page.css`) : une feuille partagée serait préférable (carte 101).
- En thème Saison 3, les titres de section (h2) restent bleu marine : une ancienne règle du thème (`[data-theme='saison3'] h2`) passe devant la couleur de la refonte. C'est cohérent avec l'esprit du thème, mais à revoir avec la fin de l'ancien CSS (carte 101).
- Lors d'un premier lancement, le serveur de test a répondu « introuvable » à `/statistiques` et du HTML à `/api/auth/csrf` au milieu du test ; le même test, relancé deux fois, est passé en entier. Sans doute un raté passager du serveur de développement.
