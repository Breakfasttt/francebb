# ADR-0007 — Passeport Blood Bowl : profil, RGPD, sécurité, API ouverte

- **Statut** : accepté
- **Date** : 2026-10-31
- **Conseil** : oui (`/council`). Cette décision prolonge l'ADR-0003 sans le remplacer.

> Rédigé pour quelqu'un qui découvre le projet. Les termes techniques sont expliqués sur place ou dans `docs/GLOSSAIRE.md`.

## Le problème

Le hub (`apps/hub`, le service de connexion commun à toutes les applications) ne garde que le pseudo, l'email et l'avatar d'un coach. Il ne permet ni de télécharger ses données ni de supprimer son compte. La limite du nombre de requêtes est gardée en mémoire, donc propre à chaque serveur. Les jetons Discord et Google sont stockés en clair. Enfin, le site garde sa session dans un jeton (`apps/site/auth.ts:88`) : un coach banni au hub reste connecté au site jusqu'à l'expiration de ce jeton.

Le hub doit devenir un « passeport Blood Bowl » :
- **une seule fiche par coach**, réutilisée par toutes les applications ;
- **conforme au RGPD** (règlement européen sur les données personnelles) ;
- **solide en sécurité** ;
- **ouvert** à nos applications et à des applications tierces validées.

## La décision

**Principe : le hub est indépendant.** Il ne connaît aucune application en particulier. Il ne s'adresse qu'à des « clients enregistrés ». Chacun a :
- une adresse de retour ;
- une adresse d'événements ;
- une adresse d'export ;
- un secret.

Aucune règle propre à une application (rôles, compte fantôme, anonymisation des résultats de tournoi) n'y figure.

Son apparence reprend une fois pour toutes les couleurs et la police du thème par défaut du site. Elles sont copiées dans le hub, sans choix de thème et sans lien avec le code du site. Ses composants viennent de `packages/ui`, la bibliothèque partagée. Il n'affiche aucun lien codé en dur vers une application. Un éventuel bouton de retour ramène uniquement à une adresse enregistrée pour le client qui a appelé le hub.

**Identifiant et pseudo sont distincts.** Chaque coach a :
- un **identifiant** créé par le hub, unique, jamais modifiable et jamais affiché. C'est la donnée `sub` du jeton OIDC. Les applications s'en servent pour rattacher un coach à leurs propres données, jamais du pseudo ni de l'email, qui peuvent changer ;
- un **pseudo** (le nom de coach), affiché partout et modifiable.

**Profil global du coach**, transmis à la connexion sous la portée `bbfrance:profile` (une portée est un droit d'accès qu'une application demande) :
- pseudo (nom de coach), modifiable, unique sans tenir compte des majuscules ;
- numéro NAF facultatif, toujours « déclaré » par le coach et jamais vérifié par le hub : chaque application décide de la confiance qu'elle lui accorde ;
- région, avatar, langue, fuseau horaire, date d'inscription.

La ligue principale n'est pas dans le passeport. Elle reste sur le site, qui possède la liste des ligues.

**Modification du profil par les applications.** Les pages du passeport ne sont pas le seul moyen de modifier le profil. Une application peut proposer sa propre interface (par exemple le site, pour changer de pseudo). Elle envoie alors la modification au hub par l'API : `PATCH /api/v1/profile`, avec le jeton d'accès du coach et la portée `bbfrance:profile:write`. Le hub vérifie les données (par exemple l'unicité du nom de coach), les enregistre, puis prévient toutes les applications par l'événement `user.updated`. Le hub reste la seule référence. Une application ne modifie jamais sa copie locale sans passer par le hub.

**Événements signés (webhooks).** Un webhook est un message que le hub envoie de lui-même à l'adresse d'événements d'une application. Trois événements existent : `user.updated` (profil modifié), `user.banned` (coach banni) et `user.deleted` (compte supprimé). Chaque message porte :
- une signature HMAC, c'est-à-dire une empreinte calculée avec le secret du client, qui prouve qu'il vient du hub ;
- un horodatage, refusé au-delà de 5 minutes ;
- un identifiant unique, pour qu'un message rejoué soit ignoré ;
- un numéro de version.

Les messages sont rangés dans une table Postgres. Ils sont renvoyés tant que l'application n'a pas accusé réception. Chaque application traite l'événement à sa façon. Le site relit l'état du compte à chaque requête : un bannissement s'applique donc tout de suite.

**Suppression de compte.**
1. Le coach demande la suppression depuis le passeport.
2. Un délai de grâce de 30 jours commence. Pendant ce délai, l'accès est bloqué et la suppression peut être annulée.
3. Le hub envoie `user.deleted` à chaque client.
4. Le hub efface ses propres données quand tous les clients ont accusé réception. Un client qui ne répond pas déclenche une alerte.

Le nom de coach supprimé reste réservé : le hub garde son empreinte, pas le nom lui-même.

**Export des données.** Le hub appelle l'adresse d'export signée de chaque client. Il assemble les réponses en un seul fichier JSON, téléchargeable depuis le passeport.

**Sécurité, avant la mise en ligne du hub :**
- limite de requêtes stockée dans la base Postgres ;
- chiffrement des jetons Discord et Google (`encryptOAuthTokens`) ;
- renouvellement régulier des clés JWKS (les clés publiques qui servent à vérifier les jetons du hub) ;
- en-têtes de sécurité envoyés au navigateur ;
- journal d'audit (la liste des actions sensibles), dans lequel l'identifiant et l'adresse IP sont remplacés par une empreinte, et qui est conservé 1 an.

La double authentification (un code en plus à la connexion) n'est finalement pas retenue. Le plugin de Better Auth ne protège que la connexion par mot de passe, qui n'existe pas en production. La sécurité repose sur Discord et Google, qui ont leur propre double authentification, et sur la boîte mail du coach.

**Documentation de l'API en JSON.** `GET /api/doc` renvoie la description complète de l'API au format OpenAPI. OpenAPI est un format standard que des outils et des IA savent lire. `GET /api/doc?route=<chemin>` ne renvoie que la partie qui décrit une route. Les routes d'administration en sont exclues. Les routes propres au hub sont préfixées par `/api/v1`.

**Applications tierces.** Une application tierce est enregistrée à la main, après validation. Elle passe par un écran de consentement rédigé en français et elle a un quota de requêtes. L'ouverture aux tiers reste désactivée par un réglage tant qu'aucune application tierce n'a été validée.

## Pourquoi

- Better Auth (la bibliothèque de connexion du hub) fait déjà presque tout cela : champs ajoutés au jeton, limite de requêtes stockée en base, chiffrement des jetons, rotation des clés, double authentification, suppression de compte, consentement, description OpenAPI. Le vérificateur des faits l'a contrôlé dans le code de Better Auth 1.7.7.
- Il ne reste à écrire que les événements, l'export, le journal d'audit et les pages du passeport. Une table Postgres suffit pour les événements.
- Options écartées, parce qu'elles alourdissent l'ensemble sans besoin réel pour un projet tenu par une seule personne :
  - une file de messages externe ;
  - GraphQL ;
  - une passerelle d'API.
- Un hub indépendant peut servir n'importe quelle application (site, BBScheme, tiers) sans modification.

## Ce qu'on ne fait pas

- **Déconnexion à distance (back-channel logout).** Elle exige des adresses en https. L'événement `user.banned`, combiné à la vérification du site à chaque requête, suffit.
- **Clés d'accès sans mot de passe (passkeys).** Elles demandent un paquet séparé.
- **Vérification du numéro NAF.**
- **Bibliothèque cliente générée automatiquement et bac à sable** de faux coachs.
- **Champs écartés du profil :** email public, date de naissance, équipe, statistiques, ligue (gérée par le site).

## Risques

- **Jetons émis par le hub en clair.** Les jetons d'accès qu'il délivre aux applications restent en clair dans sa base. Ce qui limite le risque : base séparée, durées de validité courtes.
- **Renvois peu fréquents.** Sur l'offre gratuite de Vercel, une tâche planifiée tourne au plus une fois par jour. Un `user.updated` raté peut donc arriver avec retard. C'est accepté, car le profil est aussi transmis à chaque connexion.
- **Thème du site qui change.** Si le thème par défaut du site évolue, le hub ne suit pas. C'est voulu ; un changement passera par une carte.
- **Retour arrière.** Chaque fonction est derrière un réglage activable. Les migrations sont réversibles. La base Neon est sauvegardée avant chaque migration.

## Cartes

- **Créées :** 117 à 127, épic E09.
- **Concernées :** 035 (mise en ligne du hub) et 047 (mise en production), qui attendent les cartes 118 et 124 ; 039 (widget de compte), qui reprendra la portée `bbfrance:profile`.
