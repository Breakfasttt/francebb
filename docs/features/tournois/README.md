# Tournois

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Les coachs trouvent les tournois de Blood Bowl en France, s'y inscrivent seuls ou en équipe, et consultent les résultats. Un tournoi n'a pas de page à lui : c'est un sujet du forum, créé dans un forum de tournoi, auquel sont attachées les informations du tournoi, les inscriptions et les résultats. Les résultats des tournois de la Coupe de France alimentent le classement (`docs/features/classement-statistiques/`).

## Ce que voit le coach

- `/tournois` : la recherche des tournois à venir, en grille (10 par page) ou en liste (20 par page), avec recherche par nom, filtres (région, département, mode, plateforme, version, structure, circuits NAF, CDF, CGO, TGE, TSC, logement, repas, arrivée le vendredi, prix maximum, places, historique) et tri par date, prix ou places. Les filtres actifs sont rappelés en pastilles au-dessus des résultats ; la croix d'une pastille retire ce filtre. Badges « Passé », « Terminé », « Annulé ». Une carte (ou une ligne) ouvre le sujet du forum du tournoi. La pagination garde les filtres, le tri et l'affichage.
- `/forum/new-tournament?forumId=…` : créer un tournoi. Le formulaire (`TournamentForm`) est découpé en blocs : le tournoi, les dates, le lieu (avec le choix sur une carte et la recherche d'adresse, `MapPicker`), les participants et commissaires, les championnats, le jeu, les prix et la logistique, la présentation. Réservé aux membres connectés, dans un forum de tournoi auquel ils ont accès. La case « CDF » (Coupe de France) n'est affichée qu'aux modérateurs et aux administrateurs (carte 162) ; un autre membre lit à la place une phrase qui l'invite à leur demander.
- `/forum/topic/[id]` : le sujet du tournoi, avec sa fiche (`TournamentSummary`), le bloc « Résultats du tournoi » quand il est terminé, et le module d'inscription (inscription, désinscription, mercenaire, équipes ; statut d'inscription et de paiement pour l'organisateur). Terminer, annuler, réouvrir le tournoi et ouvrir ou fermer les inscriptions sont dans les outils du sujet (`TopicTools.tsx`, carte 086).
- `/forum/edit-tournament/[id]` : modifier le tournoi (organisateur, commissaire ou modérateur), même formulaire.
- `/forum/tournament/[id]/results` : saisir les résultats (classement et rondes), à la main ou par import d'un rapport NAF, ou les effacer. Réservé à l'organisateur, aux commissaires et aux modérateurs.
- `/forum/tournament/[id]/results/view` : le classement final, visible par tous.
- **Validation des résultats CDF (carte 162)** : pour un tournoi de la Coupe de France, un bandeau sous le titre du bloc « Résultats du tournoi » (et en haut de `/results/view`) dit « Résultats en attente de validation par la modération » ou « Résultats validés par la modération le … ». Les modérateurs et les administrateurs y ont le bouton « Valider les résultats CDF » ou « Retirer la validation » (44 pixels de haut, toute la largeur sur téléphone). Seuls les résultats validés comptent au classement national. Republier ou vider les résultats retire la validation. L'écran de saisie rappelle ces règles dans un encadré.
- **Refonte (carte 089, ADR 0006)** : tous ces écrans utilisent les composants de `packages/ui` et les couleurs v2 ; leurs anciens fichiers CSS ont été supprimés.
- **Sur téléphone** : sur `/tournois`, une seule colonne ; le bouton « Filtres » (avec le nombre de filtres actifs) ouvre le panneau « Filtrer les tournois » qui monte du bas, avec « Réinitialiser » et « Voir N tournois » en bas du panneau. La recherche, le tri et le choix grille ou liste restent dans la barre au-dessus des résultats. En liste, le lieu, le format et le prix passent sous le nom du tournoi. La création, la modification et la saisie des résultats sont des écrans de rédaction plein écran (pas de barre de navigation du bas, barre d'envoi collée en bas). Le choix du lieu, l'équipe, ses détails et les confirmations s'ouvrent dans des panneaux qui montent du bas. Dans la saisie des résultats, chaque coach est une carte avec des champs libellés ; chaque match aussi. Tous les boutons font au moins 44 pixels.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/tournois/page.tsx` | Recherche des tournois (lecture des filtres dans l'adresse, requête paginée). |
| `apps/site/app/tournois/component/TournamentFilters.tsx`, `TournamentListItems.tsx` | Filtres (colonne et panneau du téléphone), barre de recherche, tri et affichage, pastilles ; carte et ligne d'un tournoi. |
| `apps/site/app/tournois/actions.ts` | Clôture, annulation, réouverture, sauvegarde et effacement des résultats, lecture d'un rapport NAF. |
| `apps/site/app/forum/new-tournament/page.tsx`, `apps/site/app/forum/edit-tournament/[id]/page.tsx` | Création et modification. |
| `apps/site/app/forum/component/TournamentForm.tsx`, `MapPicker.tsx` | Formulaire du tournoi et choix du lieu sur une carte. |
| `apps/site/app/forum/component/TournamentSummary.tsx`, `RegistrationModule.tsx`, `TournamentResultWidget.tsx` | Blocs affichés dans le sujet du tournoi. |
| `apps/site/app/forum/component/CdfValidationPanel.tsx` | Bandeau « en attente » ou « validés » des résultats CDF, avec le bouton de validation pour la modération (carte 162). |
| `apps/site/app/forum/tournament/[id]/results/TournamentResultsEditor.tsx` | Saisie des résultats et calcul des points CDF. |
| `ConfirmDialog` (`packages/ui`) | Confirmations du module d'inscription et de l'effacement des résultats. |

Actions serveur : dans `app/forum/actions.ts`, `createTopic` (crée le tournoi quand le forum est un forum de tournoi), `updateTournament`, `joinTournament`, `leaveTournament`, `toggleMercenary`, `createTeam`, `updateTeam`, `deleteTeam`, `updateRegistrationStatus`, `toggleTournamentRegistrations` ; dans `app/tournois/actions.ts`, `finishTournament`, `cancelTournament`, `unfinishTournament`, `saveTournamentResults`, `clearTournamentResults`, `parseNafReport`, `setCdfValidation` (valider ou retirer la validation des résultats CDF, modération seulement, notée au journal de modération).

## Les pièges

- Toute action qui modifie un tournoi vérifie que le coach est organisateur, commissaire ou modérateur (`isModerator`, qui inclut les admins). Depuis la carte 051, la même règle vaut partout : page `/results`, `updateTournament`, `saveTournamentResults`, `finishTournament`, `cancelTournament`, `unfinishTournament`, `clearTournamentResults`.
- `saveTournamentResults` efface puis réécrit tous les résultats et rondes du tournoi, dans une transaction. Pour un tournoi CDF, le serveur recalcule les points de chaque coach avec `calculateCdfPoints` (`common/utils/cdf.ts`) à partir de son rang, avec les mêmes paramètres que l'éditeur (carte 051) : les points envoyés par le navigateur sont ignorés. Pour un tournoi hors CDF, les points saisis à la main sont gardés.
- **Coupe de France (carte 162)** : seuls les modérateurs et les administrateurs (`isModerator`) déclarent un tournoi CDF. `createTopic` refuse la case envoyée par un autre membre ; `updateTournament` garde le statut CDF existant quand un autre membre enregistre (seul le type de classement CDF suit le format individuel ou par équipes), et retire la validation si un modérateur change la case. Un tournoi a deux champs de validation, `cdfValidatedAt` (date) et `cdfValidatedById` (le modérateur, vidé si son compte est supprimé). `saveTournamentResults` et `clearTournamentResults` les vident : des résultats modifiés doivent être revalidés. À la mise en place (migration `20261104150000_cdf_validation`), tous les tournois CDF déjà terminés sont passés en attente de validation.
- **Rang et rondes (carte 162)** : pour un tournoi CDF, `saveTournamentResults` refuse un coach sans rang (avant, un rang vide donnait les points du vainqueur). Le nombre de rondes du calcul des points est, dans l'ordre : celui annoncé dans la fiche du tournoi, sinon le nombre de rondes saisies avec les résultats, sinon 3 par jour (`cdfRoundsCount` dans `common/utils/cdf.ts`, utilisé aussi par l'éditeur).
- `/forum/edit-tournament/[id]` et `/results/view` ne vérifient pas l'accès par rôle du forum (`lib/forumAccess.ts`), contrairement au reste du forum.
- Un tournoi est toujours créé avec son sujet du forum, qui lui sert de fiche. Si ce sujet a été supprimé, les liens (liste `/tournois`, fiche d'une ligue, carte) mènent à la liste des tournois, faute de page dédiée. Avant la carte 051, ils menaient à `/tournois/[id]`, page inexistante.
- Dans les inscriptions (`RegistrationModule.tsx`) et les résultats (`TournamentResultWidget.tsx`, `/results/view`), un coach sans avatar est affiché avec l'avatar par défaut du site, le composant commun `MemberAvatarImage` (carte 065). Avant, ces écrans demandaient l'image `/default-avatar.png`, qui n'existe pas (erreur 404, image cassée).
- `app/tournois/page.tsx` et les actions utilisent encore des types `any`.
- Changer un filtre ramène à la première page des résultats ; la recherche par nom change l'adresse 400 millisecondes après la dernière touche (carte 089).
- Les régions et départements du filtre de `/tournois` sont lus dans les données de référence (`REGION_FRANCE`, `DEPARTEMENT_FRANCE`), comme dans le formulaire de tournoi : les noms comparés sont les mêmes, accents compris (« Île-de-France »). Avant la carte 129, le filtre avait sa propre liste sans accents et ne trouvait pas les tournois de ces régions. Une ancienne adresse écrite sans accents (`?region=Ile-de-France`) est renvoyée vers le nom accentué, et la recherche accepte les deux écritures en base. Si les données de référence sont vides, le filtre se rabat sur la liste de `lib/france.ts`.
- Le filtre « Places restantes min. » compte les places encore libres : places maximales moins places prises (carte 130). Les places prises sont les inscriptions, ou les équipes pour un tournoi par équipes, hors liste d'attente ; si le nombre importé de l'ancien site (`currentParticipants`) est plus grand, c'est lui qui compte. Un tournoi sans nombre maximal de places est considéré comme illimité et reste affiché. La base ne sachant pas faire ce calcul dans un filtre, la page lit d'abord les tournois qui passent les autres filtres, garde ceux qui ont assez de places, puis pagine parmi eux.
- La page de modification d'un tournoi transmet la ligue déjà rattachée au champ de recherche de ligue (`LigueSearch`), qui l'affiche choisie. Avant la carte 131, le champ s'affichait vide et le tournoi perdait sa ligue à l'enregistrement.
- L'affichage « x / y places » de la liste `/tournois` et des prochains tournois de l'accueil compte les places prises comme le filtre « Places restantes min. » : les deux utilisent la même fonction, `takenPlaces` de `apps/site/lib/tournamentPlaces.ts`, avec le comptage `TAKEN_PLACES_COUNT` à ajouter à la requête (carte 150). Avant, la liste affichait seulement le nombre importé de l'ancien site (`currentParticipants`), que les inscriptions faites sur le nouveau site ne mettent pas à jour : le compteur restait à zéro pour les tournois récents.
- **Données privées des inscriptions (carte 174)** : le module d'inscription (`RegistrationModule.tsx`) s'exécute dans le navigateur, donc tout ce qu'il reçoit est lisible dans le code de la page par n'importe quel visiteur. La page du sujet ne charge des inscriptions, des équipes et des mercenaires que les champs affichés à tous (`TOURNAMENT_REGISTRATION_PUBLIC_SELECT`, `TOURNAMENT_TEAM_PUBLIC_SELECT`, `TOURNAMENT_MERCENARY_PUBLIC_SELECT` dans `apps/site/lib/forumPostPrivacy.ts`) : le membre (identifiant, pseudo, avatar), le nom de l'équipe et le statut d'inscription. L'état de paiement est lu dans une requête à part et ajouté (`withPaymentStatus`) seulement quand le lecteur est l'organisateur ou un commissaire du tournoi. Depuis la carte 177, c'est aussi la règle de l'action `updateRegistrationStatus` pour le paiement : un modérateur du site ne voit ni ne modifie les paiements (il peut nommer un commissaire si l'organisateur est absent). Le module ne reçoit plus le tournoi entier, mais un objet réduit (type `RegistrationTournament`). Avant, l'état de paiement de chaque coach partait dans la page de tout visiteur. Un nouveau champ réservé aux gestionnaires ne doit jamais être ajouté à ces `select` publics.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Organisateur | Le coach qui a créé le tournoi (`organizerId`). |
| Commissaire | Coach désigné par l'organisateur pour l'aider à gérer le tournoi (inscriptions, résultats). |
| Pré-inscrit / inscrit / liste d'attente | Les trois états d'une inscription (`RegistrationStatus`). |
| Statut de paiement | Non payé, payé, paiement sur place, invité, dépannage (`PaymentStatus`). |
| Mercenaire | Coach seul qui se propose pour compléter une équipe dans un tournoi par équipes. |
| NAF | Fédération internationale des coachs de Blood Bowl ; un tournoi « homologué NAF » compte pour son classement. Son rapport XML peut être importé. |
| CDF | Coupe de France, circuit national ; un tournoi CDF rapporte des points au classement, une fois ses résultats validés par la modération. CGO, TGE, TSC sont des circuits régionaux. |
| Ronde | Un tour de matchs du tournoi. |

## État

- Marche : recherche, création, inscriptions individuelles et par équipes, saisie et affichage des résultats, import NAF.
- Marche aussi depuis la carte 051 : règles de droits identiques pour les résultats, points CDF recalculés par le serveur, page `/results` réservée aux membres non bannis (`getActiveSession()`) avec renvoi vers `/auth/login`.
- Marche aussi depuis la carte 162 : tournois CDF réservés à la modération et résultats CDF validés avant de compter, rang vide refusé.
- Manque : page dédiée `/tournois/[id]` pour un tournoi dont le sujet a été supprimé.
- Sur téléphone : filtres dans un panneau ouvert par le bouton « Filtres » (carte 089) ; écrans refaits vérifiés à 360 et 390 pixels.
- Cartes : 049 (audit mobile), 054 (filtres sur téléphone), 019 (images), 065 (avatar par défaut), 061 (lieu, format et prix en vue liste ; panneau de filtres mesuré par l'audit mobile), 089 (refonte des écrans, test d'inventaire `tests/e2e/inventaire/tournois.spec.ts`).
