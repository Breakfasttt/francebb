# Tournois

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Les coachs trouvent les tournois de Blood Bowl en France, s'y inscrivent seuls ou en équipe, et consultent les résultats. Un tournoi n'a pas de page à lui : c'est un sujet du forum, créé dans un forum de tournoi, auquel sont attachées les informations du tournoi, les inscriptions et les résultats. Les résultats des tournois de la Coupe de France alimentent le classement (`docs/features/classement-statistiques/`).

## Ce que voit le coach

- `/tournois` : la recherche des tournois à venir, en grille (10 par page) ou en liste (20 par page), avec filtres (région, édition, durée, prix, logement, homologations NAF, CDF…) et tri. L'option « historique » montre aussi les tournois passés, terminés ou annulés. Une carte ouvre le sujet du forum du tournoi.
- `/forum/new-tournament?forumId=…` : créer un tournoi (formulaire `TournamentForm`, carte pour placer le lieu). Réservé aux membres connectés, dans un forum de tournoi auquel ils ont accès.
- `/forum/topic/[id]` : le sujet du tournoi, avec son résumé, le module d'inscription (inscription, désinscription, mercenaire, équipes) et le widget de résultats.
- `/forum/edit-tournament/[id]` : modifier le tournoi (organisateur, commissaire ou modérateur).
- `/forum/tournament/[id]/results` : saisir les résultats (classement et rondes), à la main ou par import d'un rapport NAF. Réservé à l'organisateur, aux commissaires et aux modérateurs.
- `/forum/tournament/[id]/results/view` : le classement final, visible par tous.
- **Sur téléphone** (`app/tournois/page-mobile.css`) : en dessous de 1024 pixels, la colonne de filtres est masquée et s'ouvre avec le bouton flottant de filtres en forme d'entonnoir (`MobileFilterWrapper`, carte 054). En haut du panneau, le choix grille/liste et le tri, envoyés par `ActiveFilters.tsx` dans l'emplacement `#tournois-mobile-sort-slot` ; en dessous, la recherche et tous les filtres. Chaque case à cocher est dans une ligne touchable de 44 pixels de haut ; les champs « nombre » et les listes déroulantes sont en 16 pixels (pas de zoom automatique sur iPhone). Jusqu'à 1024 pixels (seuil unique, carte 055), la croix qui retire un filtre actif mesure 44 pixels et la grille passe sur une colonne. En vue liste (sous 900 pixels), les colonnes lieu, format et prix sont masquées ; depuis la carte 061, leur contenu est repris sur une ligne sous le nom du tournoi (`list-mobile-details`), pour que rien ne disparaisse. Le formulaire de tournoi passe sur une colonne sous 1024 pixels. Le module d'inscription empile ses entrées sous 480 pixels. Dans l'éditeur de résultats, la liste des matchs défile dans son propre cadre (largeur minimale 600 pixels).
- **Problèmes possibles** : les cases à cocher elles-mêmes mesurent 22 pixels (c'est toute la ligne, de 44 pixels, qui réagit au toucher) : l'audit automatique les compte donc comme cibles trop petites dans le panneau ouvert. Chaque changement de filtre relance la recherche aussitôt. L'éditeur de résultats reste lourd à utiliser sur petit écran (à vérifier, carte 049).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/tournois/page.tsx` | Recherche des tournois (lecture des filtres dans l'adresse, requête paginée). |
| `apps/site/app/tournois/component/TournamentFilterSidebar.tsx`, `ActiveFilters.tsx` | Filtres, filtres actifs, vue et tri. |
| `apps/site/app/tournois/actions.ts` | Clôture, annulation, réouverture, sauvegarde et effacement des résultats, lecture d'un rapport NAF. |
| `apps/site/app/forum/new-tournament/page.tsx`, `apps/site/app/forum/edit-tournament/[id]/page.tsx` | Création et modification. |
| `apps/site/app/forum/component/TournamentForm.tsx`, `MapPicker.tsx` | Formulaire du tournoi et choix du lieu sur une carte. |
| `apps/site/app/forum/component/TournamentSummary.tsx`, `RegistrationModule.tsx`, `TournamentResultWidget.tsx` | Blocs affichés dans le sujet du tournoi. |
| `apps/site/app/forum/tournament/[id]/results/TournamentResultsEditor.tsx` | Saisie des résultats et calcul des points CDF. |

Actions serveur : dans `app/forum/actions.ts`, `createTopic` (crée le tournoi quand le forum est un forum de tournoi), `updateTournament`, `joinTournament`, `leaveTournament`, `toggleMercenary`, `createTeam`, `updateTeam`, `deleteTeam`, `updateRegistrationStatus`, `toggleTournamentRegistrations` ; dans `app/tournois/actions.ts`, `finishTournament`, `cancelTournament`, `unfinishTournament`, `saveTournamentResults`, `clearTournamentResults`, `parseNafReport`.

## Les pièges

- Toute action qui modifie un tournoi vérifie que le coach est organisateur, commissaire ou modérateur (`isModerator`, qui inclut les admins). Depuis la carte 051, la même règle vaut partout : page `/results`, `updateTournament`, `saveTournamentResults`, `finishTournament`, `cancelTournament`, `unfinishTournament`, `clearTournamentResults`.
- `saveTournamentResults` efface puis réécrit tous les résultats et rondes du tournoi, dans une transaction. Pour un tournoi CDF, le serveur recalcule les points de chaque coach avec `calculateCdfPoints` (`common/utils/cdf.ts`) à partir de son rang, avec les mêmes paramètres que l'éditeur (carte 051) : les points envoyés par le navigateur sont ignorés. Pour un tournoi hors CDF, les points saisis à la main sont gardés.
- `/forum/edit-tournament/[id]` et `/results/view` ne vérifient pas l'accès par rôle du forum (`lib/forumAccess.ts`), contrairement au reste du forum.
- Un tournoi est toujours créé avec son sujet du forum, qui lui sert de fiche. Si ce sujet a été supprimé, les liens (liste `/tournois`, fiche d'une ligue, carte) mènent à la liste des tournois, faute de page dédiée. Avant la carte 051, ils menaient à `/tournois/[id]`, page inexistante.
- Dans les inscriptions (`RegistrationModule.tsx`) et les résultats (`TournamentResultWidget.tsx`, `/results/view`), un coach sans avatar est affiché avec l'avatar par défaut du site, le composant commun `MemberAvatarImage` (carte 065). Avant, ces écrans demandaient l'image `/default-avatar.png`, qui n'existe pas (erreur 404, image cassée).
- `app/tournois/page.tsx` et les actions utilisent encore des types `any`.
- Sur téléphone, le tri et l'affichage (`ActiveFilters.tsx`) sont envoyés par `GlobalPortal` dans l'emplacement `#tournois-mobile-sort-slot`, créé par `TournamentFilterSidebar.tsx` à l'intérieur du panneau de filtres. Depuis la carte 055, ce portail n'existe qu'en mode téléphone : à chaque passage sous 1024 pixels (fenêtre rétrécie, tablette tournée), il est recréé et retrouve l'emplacement. Avant, si l'on agrandissait puis rétrécissait la fenêtre, le tri disparaissait du panneau jusqu'au rechargement.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Organisateur | Le coach qui a créé le tournoi (`organizerId`). |
| Commissaire | Coach désigné par l'organisateur pour l'aider à gérer le tournoi (inscriptions, résultats). |
| Pré-inscrit / inscrit / liste d'attente | Les trois états d'une inscription (`RegistrationStatus`). |
| Statut de paiement | Non payé, payé, paiement sur place, invité, dépannage (`PaymentStatus`). |
| Mercenaire | Coach seul qui se propose pour compléter une équipe dans un tournoi par équipes. |
| NAF | Fédération internationale des coachs de Blood Bowl ; un tournoi « homologué NAF » compte pour son classement. Son rapport XML peut être importé. |
| CDF | Coupe de France, circuit national ; un tournoi CDF rapporte des points au classement. CGO, TGE, TSC sont des circuits régionaux. |
| Ronde | Un tour de matchs du tournoi. |

## État

- Marche : recherche, création, inscriptions individuelles et par équipes, saisie et affichage des résultats, import NAF.
- Marche aussi depuis la carte 051 : règles de droits identiques pour les résultats, points CDF recalculés par le serveur, page `/results` réservée aux membres non bannis (`getActiveSession()`) avec renvoi vers `/auth/login`.
- Manque : page dédiée `/tournois/[id]` pour un tournoi dont le sujet a été supprimé.
- Sur téléphone : filtres, tri et affichage derrière le bouton flottant ; aucun contenu coupé sur `/tournois` à 360, 390 et 430 pixels (carte 054).
- Cartes : 049 (audit mobile), 054 (filtres sur téléphone), 019 (images), 065 (avatar par défaut), 061 (lieu, format et prix en vue liste ; panneau de filtres mesuré par l'audit mobile).
