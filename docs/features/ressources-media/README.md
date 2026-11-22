# Ressources et Médias

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour en fin de gros chantier (commande `/ship`) ou quand le comportement visible change. Environ 80 lignes au plus.

## À quoi ça sert

`/ressources` est un annuaire de liens utiles aux coachs (outils, guides, aides de jeu), proposés par les membres puis validés par l'équipe de modération. `/media` regroupe les chaînes Twitch (directs) et YouTube (dernières vidéos) de la communauté.

## Ce que voit le coach

- **Filtres dans l'adresse** (carte 196) : la recherche, les tags et la page de `/ressources` sont écrits dans l'adresse (`?q=…&tags=…&page=2`). Un lien partagé ou un retour depuis une ressource retrouve la même liste. Le paramètre `vue=liste` y figure encore mais n'a plus d'effet depuis que la grille a disparu (carte 220).
- `/ressources` (refaite par la carte 096) : la liste des ressources validées. En-tête « Ressources » avec le nombre de ressources trouvées. Le bouton « Proposer une ressource » (« Soumettre une ressource » avant la carte 220) n'est montré qu'aux membres connectés (carte 141) : en haut du panneau gauche sur ordinateur, dans l'en-tête sur téléphone. Au-dessus des résultats : la recherche dans le titre et la description (lancée 300 millisecondes après la dernière touche). Le filtre par tags (avec les suggestions des tags existants) est dans le panneau gauche, sous « Filtres », sur ordinateur (« Réinitialiser » n'apparaît que si un tag est choisi) et dans le panneau « Filtrer les ressources » sur téléphone ; chaque tag choisi est rappelé en pastille avec une croix. Les ressources s'affichent en lignes, 20 par page, pagination `PageNav` (la bascule grille ou liste a été retirée par la carte 220) ; l'image d'une ressource n'apparaît que si elle existe et se charge (plus d'image de remplacement). Pendant le chargement, des lignes grises tiennent la place de la liste ; une liste vide affiche une simple phrase. Les outils du site (« ressources système », comme bbscheme) passent en premier, avec le badge « Officiel ». Chaque ligne est entièrement cliquable : un lien hors du site s'ouvre dans un nouvel onglet, un lien du site dans le même onglet. L'auteur et la modération trouvent « Éditer » et « Supprimer » dans le menu « ⋯ » de la ressource ; la suppression passe par une fenêtre de confirmation (`ConfirmDialog`).
- `/ressources/submit`, titre « Proposer une ressource » (carte 221) : un membre propose une ressource (titre, description de 200 caractères au plus avec un compteur, lien, image par adresse ou par envoi d'un fichier vers ImgBB, avec aperçu, tags). Elle reste invisible jusqu'à sa validation dans l'onglet ressources de `/moderation`. Un visiteur non connecté qui ouvre cette adresse est envoyé vers la connexion, puis ramené au formulaire (carte 141).
- `/ressources/edit/[id]` : l'auteur ou un modérateur modifie une ressource, qui **repasse alors en attente de validation**. Une ressource système n'est modifiable que par un admin, et seulement sa description et son image (titre, lien et tags affichés mais fixes). Quelqu'un d'autre voit « Action non autorisée ».
- Ces deux formulaires sont un seul composant en blocs (la ressource, l'image, le classement) dans `ComposeScreen` : plein écran sur téléphone, sans barre du bas, avec « Annuler » et « Proposer » (« Proposer la ressource » sur ordinateur) ou « Enregistrer » collés en bas ; colonne « Publication » sur ordinateur. Avant la carte 221 : « Soumettre » et « Mettre à jour ».
- `/media`, titre « Médias » et sous-titre « Vidéos et directs de la communauté » (carte 221, même nom que le lien de l'accueil) : un lecteur Twitch par chaîne et la playlist des vidéos de chaque chaîne YouTube. Visible par tous.
- **Sur téléphone** (1024 pixels et moins) : une seule colonne. `/media` (refait par la carte 090, élargi par la carte 220) : une section « Directs Twitch » (chaque lecteur avec le nom de la chaîne et un bouton « Voir sur Twitch ») puis « Dernières vidéos » (YouTube), sans icône devant les titres ; un lecteur par ligne sur téléphone, deux sur ordinateur, trois à partir de 1440 pixels, toujours au format 16/9. Une section sans chaîne n'est pas affichée ; sans aucune chaîne, la page dit seulement « Pas encore de chaîne référencée » (plus de boîtes « Aucune chaîne configurée »). Les lecteurs ne se chargent qu'à l'approche de l'écran. On y accède par le panneau « Plus » sur téléphone, et par le pied de page ou le menu « Plus » sur ordinateur.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/ressources/page.tsx` | Liste (composant client qui appelle `getResources`), droits d'édition et de suppression, suppression avec `ConfirmDialog` |
| `apps/site/app/ressources/submit/page.tsx` | Proposition d'une ressource (`ComposeScreen`) |
| `apps/site/app/ressources/edit/[id]/page.tsx` | Modification (page serveur), droits vérifiés par la page et par l'action |
| `apps/site/app/ressources/component/ResourceCard.tsx` | Ligne d'une ressource (`view="list"`, la seule utilisée par la page depuis la carte 220 ; la carte de grille reste dans le composant), image seulement si elle existe, menu « ⋯ » |
| `apps/site/app/ressources/component/ResourceFilters.tsx` | Panneau gauche (`ResourceFilterAside` : « Proposer une ressource » puis « Filtres »), barre de recherche, pastilles, panneau « Filtrer les ressources » |
| `apps/site/app/ressources/component/ResourceForm.tsx` | Formulaire en blocs, envoi d'image (par `uploadImageFile`), envoi aux actions serveur |
| `apps/site/app/imageUploadActions.ts`, `apps/site/common/utils/imageUpload.ts` | Envoi d'une image vers ImgBB par le serveur, qui garde la clé secrète ; partagé avec les avatars, les blasons et l'éditeur BBCode (carte 141) |
| `apps/site/app/ressources/actions.ts` | Actions serveur |
| `apps/site/app/moderation/component/ResourceModerationTab.tsx` | Validation des propositions (feature modération) |
| `apps/site/app/media/page.tsx` | Page vidéos, lit les réglages `twitch_channels` et `youtube_channels` |

Actions serveur (`app/ressources/actions.ts`) : `submitResource`, `getResources` (seulement les validées), `getResourceTags`, `getResource`, `getUserResources`, `updateResourceAction`, `deleteResourceAction`, `getPendingResources` et `moderateResource` (modérateurs). Les changements sont tracés par `logModerationAction`.

## Les pièges

- Une ressource système ne doit jamais être supprimée : `deleteResourceAction` et `moderateResource` le refusent ; la page cache aussi le bouton pour l'id `bbscheme`.
- `getResource` et `getUserResources` ne montrent les ressources en attente ou refusées qu'à leur auteur et aux modérateurs ; `getUserResources` limite la page à 20 (carte 050).
- La clé ImgBB (`IMGBB_API_KEY`) n'est lue que par le serveur, dans `app/imageUploadActions.ts` (carte 141). Ne jamais lui remettre le préfixe `NEXT_PUBLIC_`, qui la rendrait lisible par tous. L'action refuse les visiteurs, les fichiers de plus de 4 Mo et tout fichier qui n'est pas une vraie image PNG, JPEG, GIF ou WebP (reconnue par ses premiers octets). En test (`E2E_FAKE_IMAGE_UPLOAD=1`, seulement avec `next dev`), elle renvoie une adresse factice sans appeler ImgBB.
- Le lien et l'image sont contrôlés côté serveur (carte 141) : un lien doit commencer par `http://` ou `https://` ; une adresse comme `javascript:…`, qui exécuterait du code au clic, est refusée. Seul un outil officiel peut avoir un lien interne au site (`/bbscheme`). La carte traite comme externe un lien qui commence par `http://` ou `https://`, et comme une page du site tout le reste.
- `/media` : aucun écran d'administration ne semble modifier `twitch_channels` et `youtube_channels` (à vérifier) ; le lecteur Twitch exige `NEXT_PUBLIC_DOMAIN` égal au domaine réel, sinon il refuse de s'afficher.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Ressource système | Ressource marquée `isSystem` : un outil du site lui-même. Toujours affichée en premier, jamais supprimable. |
| Statut | `PENDING` (en attente), `APPROVED` (validée, visible), `REJECTED` (refusée). |
| ImgBB | Service gratuit d'hébergement d'images, utilisé pour l'illustration d'une ressource (et pour les avatars, les blasons et les images des messages). |
| Réglage du site (`SiteSetting`) | Paire clé/valeur en base, modifiable sans toucher au code (ex. la liste des chaînes Twitch). |
| Playlist « Uploads » | Liste automatique des vidéos d'une chaîne YouTube : son identifiant est celui de la chaîne avec `UU` à la place de `UC`. |

## Interactions

**Elle agit sur**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Accueil | `homeData.ts` | Ressources validées et média. |

**Elle dépend de**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Modération | Onglet « Ressources à valider », `moderateResource` | Une ressource n'apparaît qu'une fois validée. Depuis la carte 221, la modération ne modifie ni ne rejette un outil système. |
| Rôles | `isAdmin` | Seuls les admins modifient un outil système (description et image). |
| Envoi d'images | `app/imageUploadActions.ts` | Image d'une ressource envoyée par le serveur. |

Vue d'ensemble : [../INTERACTIONS.md](../INTERACTIONS.md).

## État

- Marche : proposition, validation, modification, suppression, recherche, pages vidéo.
- Carte 220 : action principale dans le panneau gauche, présentation en lignes seulement, pas d'image de remplacement, chargement en lignes, `/media` sans états vides passe-partout.
- Refonte (carte 096) : écrans refaits avec `packages/ui`, vérifiés par `tests/e2e/inventaire/ressources.spec.ts` en taille ordinateur et téléphone ; audit mobile sans défaut propre à ces écrans à 360 et 390 pixels.
- Carte 141 : accès des visiteurs, contrôle du lien et clé ImgBB côté serveur ; tests dans `tests/e2e/security.spec.ts`.
- Manque : écran pour gérer les chaînes de `/media`.
- Cartes ouvertes : 049 (audit mobile). Aucune carte dédiée.
