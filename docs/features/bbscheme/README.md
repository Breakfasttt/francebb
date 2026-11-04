# BBScheme, application à part, en attente

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

BBScheme est un plateau de Blood Bowl interactif : le coach place des joueurs des deux équipes et le ballon, dessine des flèches, change l'état des joueurs (debout, à terre, sonné…) et enchaîne jusqu'à 50 images pour expliquer une action pas à pas. Le résultat s'affiche, animé, dans un message du forum ou un article grâce à la balise BBCode `[bbscheme]`.

Depuis la carte 179 (décision ADR-0008), BBScheme n'est plus dans le site : c'est l'application `apps/bbscheme`, avec sa propre base de données. Elle est **en attente** : l'éditeur ne tourne pas, son code est rangé dans `apps/bbscheme/editeur-en-attente/` et sera relancé par la carte 071, branché sur le hub de connexion. En attendant, on ne peut plus créer de schéma ; ceux déjà publiés restent affichés dans les messages.

## Ce que voit le coach

- **Dans un message ou un article** : `[bbscheme]identifiant[/bbscheme]` (ou `[bbscheme=vertical]`) affiche le lecteur `BBSchemePlayer` (lecture, pause, image par image, vitesse, rotation). Le bouton « Ouvrir dans l'éditeur » n'apparaît plus.
- **Schéma indisponible** : si l'application BBScheme est arrêtée, trop lente (plus de 3 secondes) ou ne connaît pas le schéma, le lecteur affiche « Schéma indisponible » (texte de 16 pixels), sans gêner le reste de la page.
- Plus d'entrée BBScheme dans le menu, ni de tuile sur l'accueil, ni d'outil « Schéma BBScheme » dans l'éditeur de messages. L'ancienne adresse `/bbscheme` du site donne la page introuvable.
- L'adresse de l'application (port 4100 en local) n'affiche qu'une page « BBScheme revient bientôt ».

## Comment le site lit un schéma

1. `lib/bbcode.ts` transforme la balise en élément `<bb-scheme data-board-id=…>`.
2. `common/components/BBCodeContent/BBCodeContent.tsx` y monte le lecteur du paquet `@bbfrance/bbscheme-player` et lui passe l'action serveur `getBoardState` (`app/bbschemeBoardActions.ts`).
3. Cette action appelle `fetchBoardData` (`lib/bbschemeBoard.ts`), qui demande `GET <BBSCHEME_URL>/api/boards/<identifiant>` depuis le serveur du site : pas de réglage CORS nécessaire, même si les deux applications vivent sur des domaines différents. L'identifiant est vérifié avant (lettres, chiffres, tiret, soulignement, 64 caractères au plus) ; la réponse est gardée une minute par le cache de Next.js.
4. L'application cherche le schéma par identifiant, puis par empreinte, et renvoie `{ "data": "<JSON du plateau>" }`, sans l'identifiant du créateur (cache d'une minute, 404 si inconnu).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/bbscheme/app/api/boards/[id]/route.ts` | Adresse publique de lecture d'un schéma, en lecture seule |
| `apps/bbscheme/prisma/schema.prisma` | Base de l'application : la seule table `BBSchemeState` (le créateur est un simple identifiant) |
| `apps/bbscheme/scripts/import-beta-backup.ts` | Reprise des schémas de l'ancienne production (sauvegarde du 4 novembre 2026), script ponctuel |
| `apps/bbscheme/editeur-en-attente/` | L'éditeur déplacé (page, actions, composants, hook du pincement, tests), hors des pages servies ; voir son `README.md` |
| `apps/site/lib/bbschemeBoard.ts`, `app/bbschemeBoardActions.ts` | Lecture d'un schéma auprès de l'application (testée par `tests/unit/bbschemeBoard.test.mjs`) |
| `packages/bbscheme-player/src/` | Lecteur, terrain, pions et types, partagés entre le site et l'éditeur |
| `apps/site/public/data/roster/*.json` | Rosters des équipes, lus par le lecteur par l'adresse `/data/roster/…` du site |

## Les pièges

- **Réglage `BBSCHEME_URL`** du site : sans lui, tous les schémas affichent « Schéma indisponible ». En production, l'application et sa base doivent être en ligne **avant** la migration du site qui retire la table (ordre écrit dans `DEPLOY.md`).
- **Suppression d'un compte** : le site ne peut plus vider le créateur des schémas d'un membre supprimé, qui sont dans une autre base. À traiter à la relance : l'application écoutera l'événement de suppression envoyé par le hub.
- Le lecteur affiche « Schéma indisponible » pour toute panne, sans distinguer un schéma inconnu d'une application arrêtée : c'est voulu, le coach n'y peut rien dans les deux cas.
- **Tests du site** : `playwright.config.ts` lance un faux serveur BBScheme (`tests/e2e/fakeBbschemeServer.mjs`, port 3199) qui connaît le seul schéma de test (plateau vide). Le message de test contient aussi un schéma inconnu, qui doit afficher « Schéma indisponible » (`smoke.spec.ts`).
- L'identifiant passé dans `[bbscheme]` est inséré dans un attribut HTML ; il est protégé parce que `parseBBCode` échappe d'abord les guillemets et que `SAFE_ID` refuse tout autre caractère.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Plateau, schéma (`BBSchemeState`) | Un schéma enregistré : son contenu JSON (images, dessins, rosters, rotation, vitesse), son empreinte et son créateur éventuel. |
| Image (*frame*) | Une position de tous les pions ; la suite des images forme l'animation (50 au plus). |
| Empreinte (*hash*) | Résumé MD5 du contenu, qui sert à reconnaître un plateau déjà enregistré. |
| Élément personnalisé (`<bb-scheme>`) | Balise HTML inventée par le site, que le navigateur remplace par le lecteur React quand elle apparaît dans un message. |

## État

- Marche : lecture des schémas publiés dans les messages et les articles, quand l'application BBScheme tourne.
- En attente : l'éditeur (création, partage, export GIF, interface téléphone). Son fonctionnement détaillé est décrit dans `apps/bbscheme/editeur-en-attente/README.md`.
- Données : 13 schémas dans la sauvegarde de l'ancienne production, repris dans la base de l'application par son script (la base de développement du site n'en contenait aucun).
- Cartes ouvertes : 071 (relancer l'éditeur et le brancher sur le hub), 068 (zoom à deux doigts : reste l'essai sur un vrai téléphone, à la relance).
