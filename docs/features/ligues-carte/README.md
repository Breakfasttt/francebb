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
- **Sur téléphone** : sur `/ligues`, en dessous de 1024 pixels (même seuil que les classes `desktop-only` et `mobile-only`, au lieu de 900 avant la carte 054), la barre de recherche est masquée et son contenu (recherche, zone, choix grille/liste en boutons de 44 pixels, « Créer une Ligue ») s'ouvre avec le bouton flottant de filtres en forme d'entonnoir (`MobileFilterWrapper`, carte 054) ; la grille passe sur une colonne sous 600 pixels. Sur `/ligue/[id]`, les colonnes s'empilent sous 1100 pixels et le bloc « Gestion Ligue » part dans le menu latéral. Le formulaire de modification `/ligue/edit/[id]` importe maintenant `ligues/create/page-mobile.css`, comme la création : il passe sur une colonne sous 1000 pixels et le bouton d'envoi du blason mesure 44 pixels sur téléphone (carte 054). Sur `/carte`, la carte prend 70 % de la hauteur d'écran jusqu'à 1024 pixels (carte 055) ; le plein écran utilise `100vh`, qui peut passer sous la barre d'adresse des navigateurs mobiles (à vérifier).

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

- « Transférer propriété » et « Supprimer la ligue » (bloc « Gestion Ligue », `LigueAdminActions.tsx`) ouvrent une fenêtre de confirmation ; le transfert demande de choisir le nouveau chef avec la recherche de membres (`UserSearch`). Réservés au chef de ligue et à la modération, vérifiés côté serveur. `transferLigueOwnership` refuse un nouveau chef inexistant ou banni ; transfert et suppression sont tracés au journal de modération (carte 051).
- Supprimer une ligue garde ses tournois et ses articles : leur lien vers la ligue est seulement retiré.
- `createLigue` et `updateLigue` utilisent encore `throw new Error(...)`, contraire à la règle du projet (retourner `null` ou `{ error }`) ; `deleteLigue` et `transferLigueOwnership` renvoient `{ success, error }`.
- `searchAddressAction` et `reverseGeocodeAction` sont réservées aux membres connectés (carte 050) : sinon n'importe qui pouvait faire passer des requêtes Nominatim par notre serveur, dont la règle d'usage limite à une requête par seconde.
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
- Marche aussi depuis la carte 051 : transfert de propriété et suppression de la ligue.
- Sur téléphone : filtres de `/ligues` derrière le bouton flottant, formulaire de modification sur une colonne ; aucun contenu coupé ni cible trop petite sur `/ligues` à 360, 390 et 430 pixels (carte 054).
- Manque : `createLigue` et `updateLigue` sans `throw`.
- Cartes ouvertes : 049 (audit mobile). Aucune carte dédiée.
