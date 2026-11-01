# Ligues et Carte

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

L'annuaire des ligues permet à chaque club de Blood Bowl de se présenter (nom, sigle, blason, lieu, description) et aux coachs de trouver un club près de chez eux. La carte place sur un plan de la France les prochains tournois et les ligues qui ont une adresse.

## Ce que voit le coach

Ces écrans ont été refaits par la carte 094 (refonte visuelle, ADR 0006) avec les composants de `packages/ui`. Les adresses, leurs paramètres (`?view&query&region&page`), les noms des champs et les actions serveur n'ont pas changé.

- `/ligues` : titre « Ligues » avec le nombre de ligues et le bouton « Créer une ligue », recherche par nom ou sigle toujours visible, choix grille (12 par page) ou liste (20 par page), filtre par zone géographique. Sur ordinateur, la zone est une liste à côté de la recherche ; sur téléphone, le bouton « Filtres » ouvre le panneau « Filtrer les ligues ». La zone choisie est rappelée en pastille, avec une croix pour la retirer. Chaque carte ou ligne de ligue est entièrement cliquable.
- `/ligues/create` et `/ligue/edit/[id]` : un même formulaire (`LigueForm`) en blocs : la ligue (nom, acronyme), le blason, la localisation (zone, ville, région, département, adresse avec « Choisir sur la carte »), les commissaires, puis la présentation en BBCode. Sur téléphone, l'écran est plein écran (sans la barre du bas, comme la rédaction d'un message) et « Annuler » et « Créer la ligue » ou « Enregistrer » sont collés en bas. Le choix du lieu (`MapPicker`, partagé avec les tournois) s'ouvre dans un panneau. Un membre connecté crée une ligue et en devient le chef. La modification est ouverte au chef, aux commissaires et à la modération ; seuls le chef et la modération changent la liste des commissaires.
- `/ligue/[id]` : en tête, le blason, le nom, l'acronyme, la zone, la ville et l'adresse, le nombre de membres et de tournois, puis « Modifier » (chef, commissaires, modération) et le menu « ⋯ » (« Actions de la ligue ») : « Transférer la propriété » et « Supprimer la ligue » (chef et modération), « Signaler la ligue » (membre connecté). Ensuite : « À propos de la ligue », les cinq prochains tournois avec « Voir tout » (`/tournois?ligueId=`), le chef et les commissaires (colonne de droite sur ordinateur), et la liste des membres (membres connectés seulement). Notez le singulier `ligue` dans l'adresse.
- `/carte` : carte OpenStreetMap. Sur téléphone, elle occupe tout l'écran entre la barre du haut et la barre du bas ; sur ordinateur, elle remplit la page sous le titre. Par-dessus : le choix « Tournois » ou « Ligues » (avec le nombre de points), le bouton « Plein écran », le nombre de points affichés et, en bas à droite, le zoom. Un appui sur un repère ouvre une bulle avec un lien « Détails » vers le sujet du tournoi ou la fiche de la ligue.
- Un coach rejoint une ligue depuis son profil (`app/profile/actions.ts`), pas depuis la fiche de la ligue.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/ligues/page.tsx` | Annuaire, filtres lus dans l'adresse |
| `apps/site/app/ligues/component/LigueFilters.tsx` | Recherche, zone (panneau sur téléphone), pastille, grille ou liste |
| `apps/site/app/ligues/component/LigueCard.tsx`, `LigueBlason.tsx` | Carte et ligne d'une ligue ; blason (ou bouclier) partagé par la liste, la fiche et le formulaire |
| `apps/site/app/ligues/component/LigueForm.tsx`, `LigueBlasonUpload.tsx` | Formulaire de création et de modification ; envoi du blason vers ImgBB |
| `apps/site/app/ligues/create/page.tsx`, `apps/site/app/ligue/edit/[id]/page.tsx` | Pages du formulaire (droits, données de référence) |
| `apps/site/app/ligue/[id]/page.tsx`, `component/LigueActions.tsx` | Fiche d'une ligue ; « Modifier », menu « ⋯ », transfert, suppression, signalement |
| `apps/site/app/ligues/actions.ts` | Actions serveur |
| `apps/site/app/carte/page.tsx` | Charge 100 tournois à venir et toutes les ligues |
| `apps/site/app/carte/component/CarteClient.tsx`, `LeafletMapContainer.tsx` | Carte interactive (chargée seulement dans le navigateur) |

Actions serveur (`app/ligues/actions.ts`) : `createLigue`, `updateLigue`, `deleteLigue`, `transferLigueOwnership`, `searchLiguesAction` (utilisée par `LigueSearch` et `MultiLigueSearch`), `searchAddressAction` et `reverseGeocodeAction` (utilisées par `forum/component/MapPicker.tsx`).

## Les pièges

- Transfert et suppression : le transfert s'ouvre dans un panneau avec la recherche du nouveau chef (`UserSearch`), la suppression dans une fenêtre de confirmation (`ConfirmDialog`). Réservés au chef et à la modération, vérifiés côté serveur. `transferLigueOwnership` refuse un nouveau chef inexistant ou banni ; transfert et suppression sont tracés au journal de modération (carte 051).
- Supprimer une ligue garde ses tournois et ses articles : leur lien vers la ligue est seulement retiré.
- Les actions renvoient `{ success, error }`. Le formulaire passe par `ActionForm`, qui affiche le refus dans une notification sans vider les champs ; `createLigue` redirige vers la nouvelle ligue en cas de succès, et la modification affiche « Ligue mise à jour avec succès ! ».
- Le formulaire garde la classe `ligue-form` : le test `smoke.spec.ts` s'en sert pour retrouver le formulaire.
- Le département est enregistré par son libellé (« 35 - Ille-et-Vilaine »), pas par son numéro, comme avant la refonte.
- `searchAddressAction` et `reverseGeocodeAction` sont réservées aux membres connectés (carte 050) : sinon n'importe qui pouvait faire passer des requêtes Nominatim par notre serveur, dont la règle d'usage limite à une requête par seconde.
- La clé ImgBB du blason est publique (`NEXT_PUBLIC_IMGBB_API_KEY`).
- Les coordonnées : si latitude et longitude manquent, le serveur les calcule depuis la ville et l'adresse (géocodage) ; une ligue sans coordonnées n'apparaît pas sur la carte.
- La feuille de style de Leaflet (`leaflet.css`) l'emporte sur les classes Tailwind du site : `CarteClient.tsx` habille la bulle, le zoom et les repères avec des classes à priorité forcée (suffixe `!`).
- Les blocs BBCode de la présentation d'une ligue (spoiler, accordéon…) sont mis en forme par `common/components/BBCodeContent/bbcode.css`, chargé pour tout le site (carte 101).

## Les mots expliqués

| Mot | Sens |
|---|---|
| Chef de ligue (créateur) | Membre qui a créé la ligue (`creatorId`) ; il gère les commissaires. |
| Commissaire | Membre désigné par le chef pour modifier les informations de la ligue. |
| Zone géographique | Grande région de rattachement, choisie dans les données de référence `COACH_REGION`. |
| Géocodage | Transformer une adresse en coordonnées (latitude, longitude), ou l'inverse, via le service gratuit Nominatim d'OpenStreetMap. |
| Leaflet | Bibliothèque d'affichage de cartes ; elle ne fonctionne que dans le navigateur, d'où son chargement différé (`ssr: false`). |
| `100dvh` | Hauteur de l'écran réellement visible. `100vh` compte aussi la place de la barre d'adresse des navigateurs de téléphone, et le bas de la page passe alors dessous. |
| Blason | Logo de la ligue, hébergé sur ImgBB. |

## État

- Marche : annuaire, création, fiche, modification, commissaires, signalement, transfert de propriété, suppression, carte.
- Vérifié par `apps/site/tests/e2e/inventaire/ligues.spec.ts` (carte 094), en taille ordinateur et en taille téléphone.
- Audit mobile (carte 094) de `/ligues`, de sa liste, de son panneau de filtres, d'une fiche, du formulaire et de `/carte` à 360 et 390 pixels : rien de coupé, aucun champ sous 16 pixels. Restent la coquille (logo, libellés de la barre du bas), un lien dans le texte de la présentation et, sur `/carte`, les deux liens du crédit obligatoire « Leaflet | © OpenStreetMap » ; les tuiles de la carte, plus larges que l'écran, sont comptées comme « coupées » mais c'est normal.
- Les icônes des repères viennent d'un dépôt GitHub extérieur (`leaflet-color-markers`) : si ce site ne répond plus, les repères disparaissent.
