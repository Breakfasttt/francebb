# Classement et statistiques

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Le classement national de la Coupe de France (CDF) est calculé à partir des résultats des tournois CDF saisis sur le site, selon le règlement officiel. Les années passées sont figées dans des archives, y compris celles récupérées de l'ancien site. La page de statistiques montre des compteurs de la communauté, et une console réservée aux administrateurs.

## Ce que voit le coach

- `/classement` : visible par tous. Onglets : l'année CDF en cours (ou une autre année au choix), « glissant » (les 12 derniers mois), « par roster » (le meilleur coach de chaque roster sur une année : par défaut celle choisie dans l'onglet de l'année, avec sa propre liste déroulante pour en choisir une autre, carte 142), « Hall of Fame » (le podium de chaque année) et « archives ». Chaque ligne déplie les meilleurs tournois du coach, avec un lien vers son profil (`/spy/[id]`) et vers le sujet du tournoi. Les modérateurs archivent une année ; seuls les admins suppriment une archive.
- `/classement/edit-archive` : réservé aux modérateurs. Créer ou corriger une archive à la main, ou importer le classement d'une année depuis l'ancien site teamfrancebb.fr. Depuis la carte 142, « Lancer l'import » ouvre directement l'éditeur (`?importYear=`), qui interroge l'ancien site une seule fois ; si l'import échoue, l'éditeur affiche le message d'erreur au-dessus d'une archive vide à remplir à la main (avant, l'ancien site était interrogé deux fois : par `/classement` pour vérifier, puis par l'éditeur).
- `/statistiques` : visible par tous. Compteurs : membres, ligues, articles, sujets, messages, vues, membres en ligne. Depuis la carte 175, ils ne comptent ni les sujets et messages supprimés (suppression douce, carte 165), ni les membres bannis, ni le compte fantôme. Pour un admin, une « console » en plus : courriels envoyés ce mois-ci, taille de la base, signalements et ressources en attente, quota de stockage.
- **Refonte (carte 097)** : `/classement` utilise les composants de `packages/ui`. En-tête compact avec le bouton « Comment sont calculés les points ? » (fenêtre d'aide) et, pour la modération, le menu « Gestion du classement » (archiver l'année, modifier ou supprimer l'archive, importer des archives, créer une archive ; panneau qui monte du bas sur téléphone). Les cinq vues sont des onglets ; une liste déroulante choisit une autre année calculée ou une autre archive. Chaque ligne du classement montre le rang, le coach et les points ; sur ordinateur, le numéro NAF et le nombre de tournois ont aussi leur colonne. Le bouton « Détails de … » (flèche, 44 pixels) déplie la ligne : numéro NAF, tournois joués, lien « Voir le profil » et les meilleurs tournois retenus (nom, place, points). Les confirmations passent par `ConfirmDialog`, y compris celle de l'import d'une année déjà présente (avant : la fenêtre `confirm()` du navigateur).
- **Sur téléphone** : une seule colonne, rien ne déborde ; la rangée d'onglets défile de côté si elle ne tient pas. `/classement/edit-archive` est un écran de saisie plein écran (`ComposeScreen`, sans la barre du bas, voir `isComposePath`) : un bloc « L'archive » (année, nom), un bloc « Classement » avec une carte par coach (nom, membre lié, NAF, points total, nombre de tournois, détail des 4 tournois retenus), et « Annuler » et « Enregistrer » collés en bas de l'écran. Sur ordinateur, une ligne par coach et une colonne « Publication » à droite. `/statistiques` (refait par la carte 090) : deux chiffres par ligne sur téléphone, trois sur ordinateur ; chaque chiffre est une carte avec son nom, sa valeur en grand et une courte explication.
- **À vérifier** : la saisie d'une archive au pouce sur un vrai téléphone (outil de modération, peu utilisé sur téléphone).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/classement/page.tsx` | Page client du classement (onglets, choix de l'année, actions de modération). |
| `apps/site/app/classement/component/RankingViews.tsx` | Affichages du classement : lignes dépliables des coachs, meilleur coach par roster, Hall of Fame. |
| `apps/site/app/classement/actions.ts` | Calcul du classement, Hall of Fame, archives, import depuis l'ancien site. |
| `apps/site/app/classement/edit-archive/page.tsx`, `ArchiveEditor.tsx` | Édition manuelle d'une archive. |
| `apps/site/common/utils/cdf.ts` | `calculateCdfPoints` : formule officielle des points CDF. |
| `apps/site/app/forum/tournament/[id]/results/TournamentResultsEditor.tsx` | Seul endroit qui appelle `calculateCdfPoints`, à la saisie des résultats d'un tournoi. |
| `apps/site/app/statistiques/page.tsx`, `actions.ts` | Page et calcul des statistiques. |
| `apps/site/app/statistiques/component/StatCard/StatCard.tsx` | Carte d'un compteur. |

Actions serveur : `app/classement/actions.ts` : `getRankingYears`, `getRanking(filter)`, `getHallOfFame`, `archiveYear`, `saveArchive`, `deleteArchive`, `fetchLegacyRanking`. `app/statistiques/actions.ts` : `getDashboardStats`.

## Les pièges

- Les points ne sont **pas** calculés par le classement : ils sont calculés au moment de l'enregistrement des résultats, puis rangés dans `TournamentResult.points`. Depuis la carte 051, c'est le serveur (`saveTournamentResults`) qui les recalcule avec `cdf.ts` à partir du rang ; l'éditeur ne fait que les afficher. Changer la formule de `cdf.ts` ne recalcule pas les tournois déjà enregistrés.
- Seuls les tournois `isCDF`, terminés (`isFinished`), non annulés (`isCancelled`) et validés par un modérateur ou un administrateur (`cdfValidatedAt` rempli, carte 162) comptent, dans le classement comme dans la liste des années. La validation se fait depuis les résultats du tournoi (`docs/features/tournois/`). Un coach garde ses 4 meilleurs résultats (2 dans le classement par roster).
- **Reconnaître un coach (carte 163)** : les résultats d'un même coach sont regroupés par son compte du site s'il est lié, sinon par son numéro NAF, sinon par son nom (`rankingCoachKey`, `lib/rankingCoach.ts`, testé par `tests/unit/rankingCoach.test.mjs`). Avant, le numéro NAF passait d'abord et le compte n'était jamais utilisé : un coach saisi une fois avec son numéro et une fois sans apparaissait sur deux lignes. Un coach lié à son compte dans un tournoi et saisi par son seul numéro NAF dans un autre apparaît encore sur deux lignes.
- **Comptes supprimés (carte 163)** : quand un membre supprime son compte, ses résultats sont gardés mais rattachés au compte fantôme et renommés « Coach anonyme » suivi de 4 caractères de l'identifiant du résultat (`lib/accountDeletion.ts`). Ces résultats ne comptent plus au classement (`isAnonymizedResult`). Avant, tous s'appelaient « Coach anonyme » : ils étaient additionnés en un faux coach, et la base refusait la suppression du deuxième coach d'un même tournoi (deux résultats au même nom).
- Une année archivée est lue depuis l'archive (JSON dans `RankingArchive.data`), plus jamais recalculée. Une archive par année au plus.
- `getHallOfFame` recalcule le classement de chaque année l'une après l'autre : une série de requêtes par année, qui grandit avec le temps.
- `fetchLegacyRanking` lit les pages HTML de l'ancien site avec deux analyseurs (format 2012 et format 2016+) : si l'ancien site change ou disparaît, l'import casse.
- Après l'enregistrement d'une archive, l'éditeur revient au classement par un simple changement de page : la page du classement recharge ses données à l'ouverture. Avant la carte 097, l'appel supplémentaire `router.refresh()` empêchait ce retour.
- Dans l'éditeur, une ligne est modifiée par une fonction de mise à jour (`setEntries((prev) => …)`) : lier un membre change plusieurs champs d'un coup (membre, nom, numéro NAF). Avant la carte 097, ces changements s'écrasaient et le membre lié n'était jamais enregistré.
- `app/classement/actions.ts` redéfinit sa propre fonction `isAdmin` au lieu d'utiliser celle de `lib/roles.ts`.
- Statistiques : le compteur « En ligne » (appelé « Connectés » avant la carte 051) compte les membres qui ont lu un sujet du forum ces 15 dernières minutes (table `TopicView`). Il comptait la table `Session`, toujours vide parce que les sessions sont des jetons JWT rangés dans un cookie (`auth.ts`). Un membre qui navigue sans ouvrir de sujet n'est pas compté. « Taille BDD » est demandée à Postgres (`pg_database_size`) et écrite à la française, avec une virgule décimale (« 9,50 Mo », carte 132). Le quota de stockage (500 Mo) est écrit en dur. Il n'y a plus de quota de courriels (carte 175) : l'envoi passe par un serveur SMTP (`lib/mail.ts`), dont le plafond dépend du fournisseur choisi et n'est pas connu du site ; seul le nombre de courriels envoyés ce mois-ci est affiché.

## Les mots expliqués

| Mot | Sens |
|---|---|
| CDF | Coupe de France, le championnat national de Blood Bowl. Un tournoi CDF rapporte des points. |
| Points CDF | `R × (Nc − Pl) / (Nc + Pl − 2)`, où Nc est le nombre de participants, Pl la place, et R une valeur de référence ajustée selon le nombre de rondes et de participants. Le vainqueur reçoit exactement R. |
| Type de tournoi CDF | Individuel, équipe partielle ou équipe totale ; il change la valeur de référence R. |
| Compte fantôme | Le compte « Coach Inconnu » (identifiant `ghost_coach`), qui reçoit les sujets, messages et résultats des comptes supprimés pour que l'historique reste lisible. |
| Validation CDF | Contrôle des résultats d'un tournoi CDF par un modérateur ou un administrateur ; sans elle, les résultats ne comptent pas au classement. |
| Classement glissant | Classement sur les 12 derniers mois, quelle que soit l'année. |
| Roster | L'équipe (la race) jouée par le coach, par exemple Orques ou Elfes. |
| Archive | Classement d'une année figé et enregistré, qui ne bouge plus. |
| Hall of Fame | Le podium de chaque année. |

## État

- Marche : classement annuel, glissant, par roster, Hall of Fame, archives et import de l'ancien site, statistiques publiques.
- Marche aussi depuis la carte 051 : points recalculés côté serveur, compteur « En ligne » basé sur une vraie activité.
- Marche aussi depuis les cartes 162 et 163 : seuls les tournois CDF validés par la modération comptent ; un coach est reconnu par son compte, puis son numéro NAF, puis son nom ; les coachs supprimés ne sont plus fusionnés en un faux coach.
- Manque : taille de base fiable, Hall of Fame sans recalcul année par année.
- Cartes : 175 (compteurs sans éléments supprimés, bannis ni compte fantôme) ; 097 (refonte du classement et de l'éditeur d'archives, test `tests/e2e/inventaire/classement.spec.ts`) ; 049 (audit mobile) ; 046 et 047 (passage à Postgres) concernent la « Taille BDD ».
