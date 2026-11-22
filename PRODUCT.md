# Product

<!-- impeccable:product-schema 1 -->

> Ce fichier décrit FranceBB comme produit : à qui il sert, pourquoi il existe et ce qu'il faut préserver. Il est lu par l'outil de conception Impeccable (skill `impeccable`) avant tout travail d'interface. Il vaut pour toutes les applications du dépôt ; une application peut le préciser plus tard avec son propre `PRODUCT.md`. Il ne décrit pas l'apparence (couleurs, polices, composants) : c'est le rôle de `DESIGN.md` et du skill `ui`.

## Platform

web

## Users

FranceBB s'adresse à la communauté française de **Blood Bowl**, un jeu de plateau de football fantastique. Les joueurs s'appellent des **coachs**. Quatre profils, tous confirmés comme importants :

- **Le coach qui joue en tournoi.** Il s'inscrit à un tournoi, suit les résultats et sa place au classement national. Il consulte souvent le site sur son téléphone, en déplacement ou sur le lieu du tournoi.
- **L'organisateur de tournoi** (et ses commissaires). Il annonce le tournoi, gère les inscriptions et les paiements, puis saisit les résultats qui alimentent le classement.
- **Le membre du forum.** Il lit et écrit des messages, échange en messagerie privée, lit les articles et partage des schémas tactiques.
- **Le nouveau venu.** Il découvre le jeu et cherche une ligue (un club) ou un tournoi près de chez lui, grâce à l'annuaire des ligues et à la carte.

La plupart des coachs utilisent le site **sur téléphone**.

## Product Purpose

Réunir en un seul endroit, en français, tout ce dont la scène Blood Bowl française a besoin : forum, tournois (annonce, inscriptions, résultats), classement national, profils des coachs, messagerie privée, articles, annuaire des ligues, carte, et outils de jeu.

Le site réussit quand un coach trouve sans effort, depuis son téléphone, le prochain tournoi, sa place au classement ou la discussion qui l'intéresse, et quand un organisateur peut gérer son tournoi de bout en bout sans autre outil.

## Positioning

Ce que les autres outils des coachs (Discord, Facebook, sites internationaux de tournois) ne peuvent pas prétendre :

- **Le lieu unique francophone** : forum, tournois, classement et profils réunis et reliés entre eux, en français.
- **Le classement français officiel** : le classement de la Coupe de France (CDF) est calculé sur le site à partir des résultats des tournois CDF, selon le règlement officiel, avec les archives des années passées (y compris celles reprises de l'ancien site teamfrancebb.fr).
- **Des outils de jeu maison** : BBScheme (schémas tactiques) et BBQuizz (quiz sur les règles), aujourd'hui en attente de relance.
- **Associatif et non commercial** : un site bénévole de la communauté, sans publicité ni abonnement.

## Operating Context

- **Plusieurs applications dans un même dépôt** :
  - `apps/site`, le site communautaire, en ligne ;
  - `apps/hub`, le hub de connexion : un compte unique (le « passeport Blood Bowl ») pour toutes les applications. Prêt, pas encore en ligne. Il est indépendant et ne connaît aucune application en particulier (ADR-0007) ;
  - `apps/bbscheme` et `apps/bbquizz`, en attente : elles n'affichent qu'une page « revient bientôt » (ADR-0008).
- **Le tournoi rythme la vie du site** : annonce sur le forum, inscriptions, paiement géré par l'organisateur et ses commissaires, saisie des résultats, puis mise à jour du classement.
- **Le téléphone est l'appareil principal.** Sur téléphone, la navigation passe par une barre basse à cinq onglets (Accueil, Forum, Tournois, Messages, Plus). Le seuil entre téléphone et ordinateur est unique : 1024 pixels (skill `ui`).
- Le projet est maintenu par un développeur bénévole, aidé par l'IA. Toute la documentation est écrite en français clair, pour quelqu'un qui découvre le projet.

## Capabilities and Constraints

- Fonctionnalités en ligne, décrites chacune dans `docs/features/<nom>/README.md` : forum, tournois, classement et statistiques, profils des membres, messagerie, notifications, articles, ressources et médias, ligues et carte, modération, administration.
- Les coachs choisissent l'un des **5 thèmes visuels** (carte 218) : Sombre (le thème par défaut, ancien Vestiaire), Saison 3 (le thème officiel), NAF, Néhékhara et Violet. Chaque thème a ses couleurs ; la mise en page est la même pour tous (ADR-0006). Un test vérifie le contraste AA dans chaque thème.
- **Aucune fonctionnalité ne disparaît** lors d'une refonte d'écran : la liste de contrôle est `docs/refonte/inventaire.md`.
- Les composants d'interface partagés vivent dans `packages/ui` (composants Radix pour le comportement, mis en forme selon `DESIGN.md`) et sont réutilisés avant d'en créer de nouveaux (skill `reuse-first`).
- Pas de nouvelle bibliothèque sans accord du responsable du projet. Une seule police (Archivo, variable en graisse et en largeur), servie par le site lui-même : aucune donnée de visiteur n'est envoyée à Google.
- Les données des membres sont protégées (RGPD) : les emails ne sortent jamais par défaut, et un compte supprimé est anonymisé.
- Pas encore décidé : la date de mise en ligne du hub, et la relance de BBScheme et de BBQuizz.

## Brand Commitments

- Le nom est **France Blood Bowl**, abrégé **FranceBB** (jamais « Blood Bowl France » ni « BBFrance »). Les outils gardent leurs noms : **BBScheme**, **BBQuizz**.
- Le vocabulaire du jeu et de la communauté est conservé : coach, roster, ligue, commissaire, CDF, NAF.
- Les identifiants des thèmes sont un engagement envers les membres : ils ne changent jamais, même quand un nom affiché change (ADR-0009). Saison 3 est le thème officiel, avec une pelouse. La source unique des thèmes est `packages/ui/src/themes/themeData.mjs`.
- Le hub reprend une fois pour toutes les couleurs et la police du thème par défaut, sans choix de thème.

## Evidence on Hand

- Contenu réel de la communauté : sujets du forum, tournois, résultats, classements et archives CDF dans la base de production.
- Fiches de fonctionnalité : `docs/features/`. Décisions : `docs/adr/`. Audits : `archive/docs/audits/`, `docs/mobile-audit.md`.
- Images du site : `apps/site/public/images/`.
- Aucun témoignage, chiffre d'audience ni article de presse n'a été fourni : ne pas en inventer.

## Product Principles

1. **Le téléphone d'abord.** Une page n'est terminée que si elle est lisible sans zoom, utilisable au pouce (zones d'appui d'au moins 44 pixels) et sans défilement horizontal sur téléphone.
2. **Rien ne se perd.** Une refonte améliore la forme sans retirer une fonctionnalité ni une donnée que les coachs utilisent.
3. **Compréhensible par tous.** Textes de l'interface et documentation en français clair ; chaque terme technique est expliqué.
4. **Au service de la communauté.** Pas de publicité, pas d'abonnement, pas de collecte de données inutile.
5. **Tout est relié.** Un tournoi mène à son sujet du forum, un coach à son profil et à ses résultats, une ligue à ses tournois : on ne repart jamais à zéro.

## Accessibility & Inclusion

- Contraste AA (norme d'accessibilité WCAG) vérifié automatiquement dans chacun des 5 thèmes (`apps/site/tests/e2e/contraste.spec.ts`).
- Zones d'appui d'au moins 44 pixels (variable `--bb-tap`).
- Les tests repèrent les actions par leur rôle et leur nom accessible : chaque bouton et chaque lien doit avoir un nom clair.
- Le flou d'arrière-plan est désactivé par défaut, pour rester fluide sur les téléphones modestes.
