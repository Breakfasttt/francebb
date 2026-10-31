# Ressources et Médias

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

`/ressources` est un annuaire de liens utiles aux coachs (outils, guides, aides de jeu), proposés par les membres puis validés par l'équipe de modération. `/media` regroupe les chaînes Twitch (directs) et YouTube (dernières vidéos) de la communauté.

## Ce que voit le coach

- `/ressources` (refaite par la carte 096) : la liste des ressources validées. En-tête « Ressources » avec le nombre de ressources trouvées et le bouton « Soumettre une ressource ». Au-dessus des résultats : la recherche dans le titre et la description (lancée 300 millisecondes après la dernière touche) et l'affichage en grille ou en liste. Le filtre par tags (avec les suggestions des tags existants) est dans la colonne « Filtres » sur ordinateur et dans le panneau « Filtrer les ressources » sur téléphone ; chaque tag choisi est rappelé en pastille avec une croix. 20 ressources par page, pagination `PageNav`. Les outils du site (« ressources système », comme bbscheme) passent en premier, avec le badge « Officiel ». Chaque carte ou ligne est entièrement cliquable : un lien hors du site s'ouvre dans un nouvel onglet, un lien du site dans le même onglet. L'auteur et la modération trouvent « Éditer » et « Supprimer » dans le menu « ⋯ » de la ressource ; la suppression passe par une fenêtre de confirmation (`ConfirmDialog`). La recherche, les tags, l'affichage et la page ne sont pas écrits dans l'adresse.
- `/ressources/submit` : un membre propose une ressource (titre, description de 200 caractères au plus avec un compteur, lien, image par adresse ou par envoi d'un fichier vers ImgBB, avec aperçu, tags). Elle reste invisible jusqu'à sa validation dans l'onglet ressources de `/moderation`.
- `/ressources/edit/[id]` : l'auteur ou un modérateur modifie une ressource, qui **repasse alors en attente de validation**. Une ressource système n'est modifiable que par un admin, et seulement sa description et son image (titre, lien et tags affichés mais fixes). Quelqu'un d'autre voit « Action non autorisée ».
- Ces deux formulaires sont un seul composant en blocs (la ressource, l'image, le classement) dans `ComposeScreen` : plein écran sur téléphone, sans barre du bas, avec « Annuler » et « Soumettre » ou « Mettre à jour » collés en bas ; colonne « Publication » sur ordinateur.
- `/media` : un lecteur Twitch par chaîne et la playlist des vidéos de chaque chaîne YouTube. Visible par tous.
- **Sur téléphone** (1024 pixels et moins) : une seule colonne ; sur un petit téléphone, la carte d'une ressource met son image en vignette à gauche, pour voir plusieurs ressources par écran. `/media` (refait par la carte 090) : une section « Directs Twitch » (chaque lecteur avec le nom de la chaîne et un bouton « Voir sur Twitch ») puis « Dernières vidéos » (YouTube) ; deux lecteurs par ligne sur ordinateur, un sur téléphone, toujours au format 16/9. Les lecteurs ne se chargent qu'à l'approche de l'écran. On y accède par le panneau « Plus » sur téléphone, et par le pied de page ou le menu « Plus » sur ordinateur.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/ressources/page.tsx` | Liste (composant client qui appelle `getResources`), droits d'édition et de suppression, suppression avec `ConfirmDialog` |
| `apps/site/app/ressources/submit/page.tsx` | Proposition d'une ressource (`ComposeScreen`) |
| `apps/site/app/ressources/edit/[id]/page.tsx` | Modification (page serveur), droits vérifiés par la page et par l'action |
| `apps/site/app/ressources/component/ResourceCard.tsx` | Carte (grille) ou ligne (liste) d'une ressource, menu « ⋯ » |
| `apps/site/app/ressources/component/ResourceFilters.tsx` | Colonne « Filtres », barre de recherche et d'affichage, pastilles, panneau « Filtrer les ressources » |
| `apps/site/app/ressources/component/ResourceForm.tsx` | Formulaire en blocs, envoi d'image vers ImgBB, envoi aux actions serveur |
| `apps/site/app/ressources/actions.ts` | Actions serveur |
| `apps/site/app/moderation/component/ResourceModerationTab.tsx` | Validation des propositions (feature modération) |
| `apps/site/app/media/page.tsx` | Page vidéos, lit les réglages `twitch_channels` et `youtube_channels` |

Actions serveur (`app/ressources/actions.ts`) : `submitResource`, `getResources` (seulement les validées), `getResourceTags`, `getResource`, `getUserResources`, `updateResourceAction`, `deleteResourceAction`, `getPendingResources` et `moderateResource` (modérateurs). Les changements sont tracés par `logModerationAction`.

## Les pièges

- Une ressource système ne doit jamais être supprimée : `deleteResourceAction` et `moderateResource` le refusent ; la page cache aussi le bouton pour l'id `bbscheme`.
- `getResource` et `getUserResources` ne montrent les ressources en attente ou refusées qu'à leur auteur et aux modérateurs ; `getUserResources` limite la page à 20 (carte 050).
- La clé ImgBB est publique (`NEXT_PUBLIC_IMGBB_API_KEY` dans `lib/siteConfig.ts`) : n'importe qui peut la lire et l'utiliser.
- Le lien n'est pas contrôlé côté serveur : la validation par un modérateur est le seul filet. La carte traite comme externe un lien qui commence par `http://` ou `https://`, et comme une page du site tout le reste.
- `/media` : aucun écran d'administration ne semble modifier `twitch_channels` et `youtube_channels` (à vérifier) ; le lecteur Twitch exige `NEXT_PUBLIC_DOMAIN` égal au domaine réel, sinon il refuse de s'afficher.
- La page `/ressources/submit` s'ouvre sans connexion, et le bouton « Soumettre une ressource » est montré aux visiteurs : c'est l'action serveur qui refuse leur envoi (« Non authentifié »), après qu'ils ont rempli le formulaire.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Ressource système | Ressource marquée `isSystem` : un outil du site lui-même. Toujours affichée en premier, jamais supprimable. |
| Statut | `PENDING` (en attente), `APPROVED` (validée, visible), `REJECTED` (refusée). |
| ImgBB | Service gratuit d'hébergement d'images, utilisé pour l'illustration d'une ressource. |
| Réglage du site (`SiteSetting`) | Paire clé/valeur en base, modifiable sans toucher au code (ex. la liste des chaînes Twitch). |
| Playlist « Uploads » | Liste automatique des vidéos d'une chaîne YouTube : son identifiant est celui de la chaîne avec `UU` à la place de `UC`. |

## État

- Marche : proposition, validation, modification, suppression, recherche, pages vidéo.
- Refonte (carte 096) : écrans refaits avec `packages/ui`, vérifiés par `tests/e2e/inventaire/ressources.spec.ts` en taille ordinateur et téléphone ; audit mobile sans défaut propre à ces écrans à 360 et 390 pixels.
- Manque : clé ImgBB côté serveur, écran pour gérer les chaînes de `/media`.
- Cartes ouvertes : 049 (audit mobile). Aucune carte dédiée.
