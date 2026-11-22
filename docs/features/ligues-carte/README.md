# Ligues et Carte

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour en fin de gros chantier (commande `/ship`) ou quand le comportement visible change. Environ 80 lignes au plus.

## À quoi ça sert

L'annuaire des ligues permet à chaque club de Blood Bowl de se présenter (nom, sigle, blason, lieu, description) et aux coachs de trouver un club près de chez eux. La carte place sur un plan de la France les prochains tournois et les ligues qui ont une adresse.

## Ce que voit le coach

- **Carte** (carte 196) : le choix tournois ou ligues est écrit dans l'adresse (`/carte?vue=ligues`). Le plein écran se ferme avec son bouton, avec la touche Échap ou avec le bouton retour du téléphone, sans quitter la page.
Ces écrans ont été refaits par la carte 094 (refonte visuelle, ADR 0006) avec les composants de `packages/ui`, puis remis en page par la carte 220 (coquille `SiteLayout`, liste en lignes seulement). Les adresses, leurs paramètres (`?query&region&page` ; l'ancien `view` est ignoré), les noms des champs et les actions serveur n'ont pas changé.

- `/ligues` : titre « Ligues » avec le nombre de ligues, recherche par nom ou sigle toujours visible, puis les ligues en lignes, 20 par page (la bascule grille ou liste a été retirée par la carte 220). Sur ordinateur, un panneau à gauche porte l'action principale « Créer une ligue », la liste des zones géographiques (« Toutes les zones » puis chaque zone, la zone choisie marquée d'un trait) et le lien « Voir les ligues sur la carte ». Sur téléphone, ce panneau est masqué : « Créer une ligue » est dans l'en-tête et le bouton « Filtres » ouvre le panneau « Filtrer les ligues » avec le choix de la zone. La zone choisie est rappelée en pastille, avec une croix pour la retirer. Chaque ligne de ligue est entièrement cliquable ; le blason n'apparaît que si la ligue en a un.
- `/ligues/create` et `/ligue/edit/[id]` : un même formulaire (`LigueForm`) en blocs : la ligue (nom, acronyme), le blason, la localisation (zone, ville, région, département, adresse avec « Choisir sur la carte »), les commissaires, puis la présentation en BBCode. Sur téléphone, l'écran est plein écran (sans la barre du bas, comme la rédaction d'un message) et « Annuler » et « Créer la ligue » ou « Enregistrer » sont collés en bas. Le choix du lieu (`MapPicker`, partagé avec les tournois) s'ouvre dans un panneau. Un membre connecté crée une ligue et en devient le chef. La modification est ouverte au chef, aux commissaires et à la modération ; seuls le chef et la modération changent la liste des commissaires.
- `/ligue/[id]` : une page de détail (carte 220). En tête, le fil d'Ariane « Ligues › nom de la ligue », le blason (seulement s'il existe), le nom, l'acronyme, le lieu, le nombre de membres et de tournois, l'adresse, puis « Modifier » (chef, commissaires, modération) et le menu « ⋯ » (« Actions de la ligue ») : « Transférer la propriété » et « Supprimer la ligue » (chef et modération), « Signaler la ligue » (membre connecté, sauf le chef pour sa propre ligue, revue 221). Ensuite : « À propos », les cinq prochains tournois avec « Voir tout » (`/tournois?ligueId=`) et la liste des membres (membres connectés seulement). « Chef et commissaires » est une colonne de contexte à droite sur ordinateur (une ligne par personne, ses rôles réunis : le chef peut aussi être commissaire) ; sur téléphone, elle passe sous le reste. Un modérateur y voit un badge « Banni » à côté d'un chef ou d'un commissaire banni ; les autres ne le voient pas. La plateforme des tournois s'affiche en clair (`platformLabel`). Notez le singulier `ligue` dans l'adresse.
- `/carte` : carte OpenStreetMap. Sur téléphone, elle occupe tout l'écran entre la barre du haut et la barre du bas ; sur ordinateur, elle remplit la page sous le titre. Par-dessus : le choix « Tournois » ou « Ligues » (avec le nombre de points), le bouton « Plein écran », le nombre de points affichés et, en bas à droite, le zoom. Un appui sur un repère ouvre une bulle avec un lien « Détails » vers le sujet du tournoi ou la fiche de la ligue. Plusieurs tournois (ou ligues) au même endroit partagent un seul repère (revue 221) : sa bulle les liste tous (« 3 tournois à Lyon »), chacun avec son lien. Avant, les repères se superposaient et un seul restait cliquable. La liste `/tournois` mène à la carte par « Voir sur la carte ».
- Un coach rejoint une ligue depuis son profil (`app/profile/actions.ts`, onglet « Modifier mon profil »), pas depuis la fiche de la ligue. Depuis la revue 221, la fiche le dit sous la liste des membres : « Pour rejoindre cette ligue, ajoute-la dans ton profil » (ou « Tu es membre… Tu peux la retirer dans ton profil »). Un visiteur lit « Connecte-toi pour voir les membres et rejoindre cette ligue ».

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/ligues/page.tsx` | Annuaire, filtres lus dans l'adresse, panneau gauche (`SiteLayout`, `PanelLink`) avec « Créer une ligue » et les zones |
| `apps/site/app/ligues/component/LigueFilters.tsx` | Recherche, zone dans le panneau « Filtrer les ligues » (téléphone), pastille du filtre actif |
| `apps/site/app/ligues/component/LigueCard.tsx`, `LigueBlason.tsx` | Ligne d'une ligue (`LigueRow` ; la carte `LigueCard` n'est plus utilisée) ; blason partagé par la liste, la fiche et le formulaire, qui n'affiche rien quand la ligue n'a pas d'image (le bouclier de remplacement ne reste que dans l'aperçu du formulaire, carte 220) |
| `apps/site/app/ligues/component/LigueForm.tsx`, `LigueBlasonUpload.tsx` | Formulaire de création et de modification ; envoi du blason vers ImgBB |
| `apps/site/app/ligues/create/page.tsx`, `apps/site/app/ligue/edit/[id]/page.tsx` | Pages du formulaire (droits, données de référence) |
| `apps/site/app/ligue/[id]/page.tsx`, `component/LigueActions.tsx` | Fiche d'une ligue ; « Modifier », menu « ⋯ », transfert, suppression, signalement |
| `apps/site/app/ligues/actions.ts` | Actions serveur |
| `apps/site/app/carte/page.tsx` | Charge 100 tournois à venir et toutes les ligues |
| `apps/site/app/carte/component/CarteClient.tsx`, `LeafletMapContainer.tsx` | Carte interactive (chargée seulement dans le navigateur) |

Actions serveur (`app/ligues/actions.ts`) : `createLigue`, `updateLigue`, `deleteLigue`, `transferLigueOwnership`, `searchLiguesAction` (utilisée par `LigueSearch` et `MultiLigueSearch`), `searchAddressAction` et `reverseGeocodeAction` (utilisées par `forum/component/MapPicker.tsx`).

## Les pièges

- **Données de référence (carte 203).** Les listes fixes (régions, départements, éditions du jeu, plateformes, formats et types de tournoi, régions des coachs) se lisent seulement par `lib/referenceData.ts` : `getReferenceData`, `getReferenceLists` (plusieurs groupes en une requête), `getTournamentFormLists`, `getLigueFormLists`, `getReferenceLabel`. Ne pas écrire `prisma.referenceData.findMany` dans une page. L'action publique `getReferenceDataAction` (profil, inscription) n'accepte plus que le groupe `COACH_REGION`.
- Transfert et suppression : le transfert s'ouvre dans un panneau avec la recherche du nouveau chef (`UserSearch`), la suppression dans une fenêtre de confirmation (`ConfirmDialog`). Réservés au chef et à la modération, vérifiés côté serveur. `transferLigueOwnership` refuse un nouveau chef inexistant ou banni ; transfert et suppression sont tracés au journal de modération (carte 051).
- Supprimer une ligue garde ses tournois et ses articles : leur lien vers la ligue est seulement retiré. Ses signalements en attente se ferment (`closePendingReports`, carte 221).
- Carte : les points sont regroupés par coordonnées arrondies à 5 décimales (environ un mètre, `groupByPlace` dans `LeafletMapContainer.tsx`).
- Les actions renvoient `{ success, error }`. Le formulaire passe par `ActionForm`, qui affiche le refus dans une notification sans vider les champs ; `createLigue` redirige vers la nouvelle ligue en cas de succès, et la modification affiche « Ligue mise à jour avec succès ! ».
- Le formulaire garde la classe `ligue-form` : le test `smoke.spec.ts` s'en sert pour retrouver le formulaire.
- Le département d'une ligue est enregistré par son numéro (« 35 »), comme celui d'un tournoi (carte 137). Les ligues enregistrées avant portent encore le libellé (« 35 - Ille-et-Vilaine ») : le formulaire le ramène au numéro (`departmentNumber` de `lib/france.ts`), et la ligue passe au nouveau format à sa prochaine modification. Les données existantes n'ont pas été reprises en base (une reprise demande l'accord du responsable).
- Depuis la carte 221, une modification par un commissaire ou par la modération (pas par le créateur) est inscrite au journal de modération (« Ligue modifiée », `LIGUE_UPDATED`).
- Le formulaire n'a pas de champ « lien Google Maps » : `updateLigue` ne change ce lien que s'il est envoyé, et garde sinon celui qui est enregistré. Avant la carte 137, chaque modification l'effaçait.
- `searchAddressAction` et `reverseGeocodeAction` sont réservées aux membres connectés (carte 050) : sinon n'importe qui pouvait faire passer des requêtes Nominatim par notre serveur, dont la règle d'usage limite à une requête par seconde.
- Le blason est envoyé à ImgBB par le serveur (`uploadImageFile`, puis l'action `uploadImage` de `app/imageUploadActions.ts`), qui garde la clé secrète et refuse un fichier de plus de 4 Mo ou qui n'est pas une image (carte 141).
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

## Interactions

**Elle agit sur**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Tournois | `Tournament.ligueId`, `/tournois?ligueId=` | Un tournoi peut être rattaché à une ligue ; la page de la ligue mène à ses tournois. |
| Articles | `Article.ligueId` | Un article peut être rattaché à une ligue. |
| Profil | Fiche d'un coach, auteur d'un message | Les ligues du membre sont affichées. |
| Carte, accueil | `/carte`, `homeData.ts` | Les ligues avec une adresse sont placées sur la carte. |

**Elle dépend de**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Rôles | `isModerator` | Un modérateur modifie, transfère ou supprime n'importe quelle ligue. |
| Bannissement | `transferLigueOwnership` | On ne transfère pas une ligue à un banni ; une ligue dont le créateur est banni reste en ligne. |
| Modération | Signalements `LIGUE`, journal | Une ligue se signale ; création, transfert, suppression et modification sont tracés. |
| Données de référence | Administration | Régions et départements du formulaire. |

Vue d'ensemble : [../INTERACTIONS.md](../INTERACTIONS.md).

## État

- Marche : annuaire, création, fiche, modification, commissaires, signalement, transfert de propriété, suppression, carte.
- Vérifié par `apps/site/tests/e2e/inventaire/ligues.spec.ts` (carte 094), en taille ordinateur et en taille téléphone ; adapté à la carte 220 (panneau gauche, lignes, fiche en page de détail) mais pas encore relancé.
- Audit mobile (carte 094) de `/ligues`, de sa liste, de son panneau de filtres, d'une fiche, du formulaire et de `/carte` à 360 et 390 pixels : rien de coupé, aucun champ sous 16 pixels. Restaient la coquille (logo, devenu depuis le nom du site écrit en lettres avec une zone de 44 pixels ; libellés de la barre du bas), un lien dans le texte de la présentation et, sur `/carte`, les deux liens du crédit obligatoire « Leaflet | © OpenStreetMap » ; les tuiles de la carte, plus larges que l'écran, sont comptées comme « coupées » mais c'est normal.
- Les images des repères de `/carte` (rouge pour un tournoi, doré pour une ligue, et leur ombre) sont des dessins SVG du site, dans `apps/site/public/images/carte/` (carte 138). Avant, elles venaient d'un dépôt GitHub extérieur et du site cdnjs : si l'un d'eux ne répondait plus, les repères disparaissaient. Depuis la carte 150, le choix du lieu (`MapPicker`) utilise lui aussi le repère rouge du site ; avant, il chargeait le sien depuis le site extérieur unpkg. Les fonds de carte restent ceux d'OpenStreetMap, servis par leur propre site.
