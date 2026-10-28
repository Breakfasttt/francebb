# Ligues et Carte

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

L'annuaire des ligues permet à chaque club de Blood Bowl de se présenter (nom, sigle, blason, lieu, description) et aux coachs de trouver un club près de chez eux. La carte place sur un plan de la France les prochains tournois et les ligues qui ont une adresse.

## Ce que voit le coach

- `/ligues` : l'annuaire, en grille (12 par page) ou en liste (20), avec recherche par nom ou sigle et filtre par zone géographique. Visible par tous.
- `/ligues/create` : un membre connecté crée une ligue ; il en devient le chef (créateur). Le lieu se saisit à la main ou en pointant sur une carte (`MapPicker`).
- `/ligue/[id]` : la fiche d'une ligue (blason, description en BBCode, chef, commissaires, membres, 5 prochains tournois) avec un bouton de signalement. Notez le singulier `ligue` dans l'adresse.
- `/ligue/edit/[id]` : modification par le chef, un commissaire ou un modérateur. Seuls le chef et les modérateurs changent la liste des commissaires.
- `/carte` : carte OpenStreetMap avec un interrupteur « Tournois / Ligues » et un bouton plein écran ; un clic sur un repère ouvre une bulle avec un lien vers le tournoi ou la ligue.
- Un coach rejoint une ligue depuis son profil (`app/profile/actions.ts`), pas depuis la fiche de la ligue.
- **Sur téléphone** : sur `/ligues`, la barre de recherche est masquée et son contenu (filtres, choix grille/liste en gros boutons, « Créer une Ligue ») est déplacé dans le menu latéral global par `MobilePortal` ; la grille passe sur une colonne sous 600 pixels. Il n'y a pas de bouton flottant de filtres. Sur `/ligue/[id]`, les colonnes s'empilent sous 1100 pixels et le bloc « Gestion Ligue » part dans le menu latéral. **`/ligue/edit/[id]` n'importe pas `ligues/create/page-mobile.css`** : le formulaire garde sans doute ses deux colonnes (`1fr 350px`) et déborde sur téléphone (à vérifier). Sur `/carte`, la carte prend 70 % de la hauteur d'écran sous 768 pixels ; le plein écran utilise `100vh`, qui peut passer sous la barre d'adresse des navigateurs mobiles (à vérifier).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/ligues/page.tsx` | Annuaire, filtres lus dans l'adresse |
| `apps/site/app/ligues/component/LigueCard.tsx`, `LigueFilters.tsx` | Carte d'une ligue, champs de recherche |
| `apps/site/app/ligues/component/LigueBlasonUpload.tsx` | Envoi du blason vers ImgBB |
| `apps/site/app/ligues/create/page.tsx` | Création ; `LigueLocationFields.tsx` (lieu + carte), `UserSearchWrapper.tsx` (commissaires) |
| `apps/site/app/ligue/[id]/page.tsx` | Fiche d'une ligue ; `component/LigueAdminActions.tsx`, `ReportLigueButton.tsx` |
| `apps/site/app/ligue/edit/[id]/page.tsx`, `ligue/edit/LigueEditSubmit.tsx` | Modification |
| `apps/site/app/ligues/actions.ts` | Actions serveur |
| `apps/site/app/carte/page.tsx` | Charge 100 tournois à venir et toutes les ligues |
| `apps/site/app/carte/component/CarteClient.tsx`, `LeafletMapContainer.tsx` | Carte interactive (chargée seulement dans le navigateur) |

Actions serveur (`app/ligues/actions.ts`) : `createLigue`, `updateLigue`, `deleteLigue`, `transferLigueOwnership`, `searchLiguesAction` (utilisée par `LigueSearch` et `MultiLigueSearch`), `searchAddressAction` et `reverseGeocodeAction` (utilisées par `forum/component/MapPicker.tsx`).

## Les pièges

- **Les boutons « Transférer propriété » et « Supprimer la ligue » ne font rien** : ils n'ont pas d'action au clic, et `deleteLigue` / `transferLigueOwnership` ne sont appelées nulle part.
- Les actions de ce fichier utilisent `throw new Error(...)`, contraire à la règle du projet (retourner `null` ou `{ error }`).
- `transferLigueOwnership` ne vérifie pas que le nouveau chef existe ni qu'il n'est pas banni.
- `searchAddressAction` et `reverseGeocodeAction` sont ouvertes à tous sans connexion : n'importe qui peut faire passer des requêtes Nominatim par notre serveur, dont la règle d'usage limite à une requête par seconde.
- La clé ImgBB du blason est publique (`NEXT_PUBLIC_IMGBB_API_KEY`).
- Les coordonnées : si latitude et longitude manquent, le serveur les calcule depuis la ville et l'adresse (géocodage) ; une ligue sans coordonnées n'apparaît pas sur la carte.
- Lien de connexion de la page d'édition : `?callback=` au lieu de `?callbackUrl=` ailleurs, le retour après connexion ne marche probablement pas (à vérifier).
- La fiche charge le chef et les commissaires en entier (`include`), plus que nécessaire.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Chef de ligue (créateur) | Membre qui a créé la ligue (`creatorId`) ; il gère les commissaires. |
| Commissaire | Membre désigné par le chef pour modifier les informations de la ligue. |
| Zone géographique | Grande région de rattachement, choisie dans les données de référence `COACH_REGION`. |
| Géocodage | Transformer une adresse en coordonnées (latitude, longitude), ou l'inverse, via le service gratuit Nominatim d'OpenStreetMap. |
| Leaflet | Bibliothèque d'affichage de cartes ; elle ne fonctionne que dans le navigateur, d'où son chargement différé (`ssr: false`). |
| Blason | Logo de la ligue, hébergé sur ImgBB. |

## État

- Marche : annuaire, création, fiche, modification, commissaires, signalement, carte.
- Manque : brancher le transfert et la suppression, styles mobiles de la page d'édition, actions sans `throw`, protection des actions de géocodage.
- Cartes ouvertes : 049 (audit mobile). Aucune carte dédiée.
