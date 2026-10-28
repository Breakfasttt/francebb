# Ressources et Médias

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

`/ressources` est un annuaire de liens utiles aux coachs (outils, guides, aides de jeu), proposés par les membres puis validés par l'équipe de modération. `/media` regroupe les chaînes Twitch (directs) et YouTube (dernières vidéos) de la communauté.

## Ce que voit le coach

- `/ressources` : la liste des ressources validées, en grille ou en liste, 20 par page, avec recherche par texte et par tags. Les outils du site (« ressources système », comme bbscheme) passent en premier. Un clic ouvre le lien, dans un nouvel onglet s'il pointe hors du site.
- `/ressources/submit` : un membre connecté propose une ressource (titre, description de 200 caractères au plus, lien, image, tags). Elle reste invisible jusqu'à sa validation dans l'onglet ressources de `/moderation`.
- `/ressources/edit/[id]` : l'auteur ou un modérateur modifie une ressource, qui **repasse alors en attente de validation**. Une ressource système n'est modifiable que par un admin, et seulement sa description et son image.
- `/media` : un lecteur Twitch par chaîne et la playlist des vidéos de chaque chaîne YouTube. Visible par tous.
- **Sur téléphone** : la colonne de filtres des ressources est masquée et copiée dans le menu latéral global (`GlobalPortal` vers `#mobile-page-sidebar-slot`), sans bouton flottant de filtres. **Le fichier `ressources/page-mobile.css` n'est importé nulle part** : ses règles (grille sur une colonne, liste sans cadre) ne s'appliquent pas, il faut vérifier sur un vrai téléphone si la grille déborde. En liste, les tags sont cachés. Les boutons modifier et supprimer d'une carte ont une icône de 12 pixels : sans doute sous les 44 pixels conseillés (à vérifier). Sur `/media`, les deux colonnes Twitch et YouTube s'empilent sous 1024 pixels et les lecteurs gardent un format 16/9.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/ressources/page.tsx` | Liste (composant client qui appelle `getResources`), suppression avec `ConfirmModal` |
| `apps/site/app/ressources/submit/page.tsx` | Proposition d'une ressource |
| `apps/site/app/ressources/edit/[id]/page.tsx` | Modification, droits vérifiés côté page et côté action |
| `apps/site/app/ressources/component/ResourceCard/ResourceCard.tsx` | Carte d'une ressource (grille ou ligne) |
| `apps/site/app/ressources/component/ResourceFilterSidebar/ResourceFilterSidebar.tsx` | Recherche, tags, choix grille/liste, copie mobile |
| `apps/site/app/ressources/component/ResourceForm/ResourceForm.tsx` | Formulaire, envoi d'image vers ImgBB |
| `apps/site/app/ressources/actions.ts` | Actions serveur |
| `apps/site/app/moderation/component/ResourceModerationTab.tsx` | Validation des propositions (feature modération) |
| `apps/site/app/media/page.tsx` | Page vidéos, lit les réglages `twitch_channels` et `youtube_channels` |

Actions serveur (`app/ressources/actions.ts`) : `submitResource`, `getResources` (seulement les validées), `getResourceTags`, `getResource`, `getUserResources`, `updateResourceAction`, `deleteResourceAction`, `getPendingResources` et `moderateResource` (modérateurs). Les changements sont tracés par `logModerationAction`.

## Les pièges

- Une ressource système ne doit jamais être supprimée : `deleteResourceAction` et `moderateResource` le refusent ; la page cache aussi le bouton pour l'id `bbscheme`.
- `getResource` et `getUserResources` ne montrent les ressources en attente ou refusées qu'à leur auteur et aux modérateurs ; `getUserResources` limite la page à 20 (carte 050).
- La clé ImgBB est publique (`NEXT_PUBLIC_IMGBB_API_KEY` dans `lib/siteConfig.ts`) : n'importe qui peut la lire et l'utiliser.
- Le lien n'est pas contrôlé côté serveur ; pour un lien interne la carte fait `window.location.href = lien`. Un lien `javascript:` serait-il bloqué ? À vérifier ; la validation par un modérateur est le seul filet.
- La liste des tags proposés dans les filtres est vide (`availableTags={[]}`), alors que `getResourceTags` existe.
- `/media` : aucun écran d'administration ne semble modifier `twitch_channels` et `youtube_channels` (à vérifier) ; le lecteur Twitch exige `NEXT_PUBLIC_DOMAIN` égal au domaine réel, sinon il refuse de s'afficher.
- Les erreurs d'envoi d'image utilisent `alert()` au lieu de `Toast`.

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
- Manque : import de `ressources/page-mobile.css`, tags proposés dans les filtres, clé ImgBB côté serveur, écran pour gérer les chaînes de `/media`.
- Cartes ouvertes : 049 (audit mobile). Aucune carte dédiée.
