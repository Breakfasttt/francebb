# Classement et statistiques

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Le classement national de la Coupe de France (CDF) est calculé à partir des résultats des tournois CDF saisis sur le site, selon le règlement officiel. Les années passées sont figées dans des archives, y compris celles récupérées de l'ancien site. La page de statistiques montre des compteurs de la communauté, et une console réservée aux administrateurs.

## Ce que voit le coach

- `/classement` : visible par tous. Onglets : l'année CDF en cours (ou une autre année au choix), « glissant » (les 12 derniers mois), « par roster » (le meilleur coach de chaque roster sur l'année), « Hall of Fame » (le podium de chaque année) et « archives ». Chaque ligne déplie les meilleurs tournois du coach, avec un lien vers son profil (`/spy/[id]`) et vers le sujet du tournoi. Les modérateurs archivent une année ; seuls les admins suppriment une archive.
- `/classement/edit-archive` : réservé aux modérateurs. Créer ou corriger une archive à la main, ou importer le classement d'une année depuis l'ancien site teamfrancebb.fr.
- `/statistiques` : visible par tous. Compteurs : membres, ligues, articles, sujets, vues, membres en ligne. Pour un admin, une « console » en plus : emails envoyés ce mois-ci, quota d'emails restant, taille de la base, signalements et ressources en attente.
- **Sur téléphone** (`app/classement/page-mobile.css`) : jusqu'à 1024 pixels (seuil unique, carte 055), les onglets et la barre d'actions s'empilent sur une colonne (onglets de 48 pixels de haut depuis la carte 061 : ils mesuraient 43,8 pixels), les boutons d'admin se rangent en grille de deux ; sous 850 et 640 pixels, les détails des tournois et le résumé du score passent sur une colonne. L'éditeur d'archives passe sur une colonne sous 1024 pixels et son tableau défile dans son cadre (`overflow-x: auto`). `/statistiques` réduit ses marges et ses titres (`app/statistiques/page-mobile.css`, `StatCard.css`).
- **À vérifier** : la lisibilité du tableau de l'éditeur d'archives au pouce (outil de modération, peu utilisé sur téléphone).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/classement/page.tsx` | Page client du classement (onglets, choix de l'année, actions de modération). |
| `apps/site/app/classement/actions.ts` | Calcul du classement, Hall of Fame, archives, import depuis l'ancien site. |
| `apps/site/app/classement/edit-archive/page.tsx`, `ArchiveEditor.tsx` | Édition manuelle d'une archive. |
| `apps/site/common/utils/cdf.ts` | `calculateCdfPoints` : formule officielle des points CDF. |
| `apps/site/app/forum/tournament/[id]/results/TournamentResultsEditor.tsx` | Seul endroit qui appelle `calculateCdfPoints`, à la saisie des résultats d'un tournoi. |
| `apps/site/app/statistiques/page.tsx`, `actions.ts` | Page et calcul des statistiques. |
| `apps/site/app/statistiques/component/StatCard/StatCard.tsx` | Carte d'un compteur. |

Actions serveur : `app/classement/actions.ts` : `getRankingYears`, `getRanking(filter)`, `getHallOfFame`, `archiveYear`, `saveArchive`, `deleteArchive`, `fetchLegacyRanking`. `app/statistiques/actions.ts` : `getDashboardStats`.

## Les pièges

- Les points ne sont **pas** calculés par le classement : ils sont calculés au moment de l'enregistrement des résultats, puis rangés dans `TournamentResult.points`. Depuis la carte 051, c'est le serveur (`saveTournamentResults`) qui les recalcule avec `cdf.ts` à partir du rang ; l'éditeur ne fait que les afficher. Changer la formule de `cdf.ts` ne recalcule pas les tournois déjà enregistrés.
- Seuls les tournois `isCDF` et terminés (`isFinished`) comptent. Un coach garde ses 4 meilleurs résultats (2 dans le classement par roster).
- Une année archivée est lue depuis l'archive (JSON dans `RankingArchive.data`), plus jamais recalculée. Une archive par année au plus.
- `getHallOfFame` recalcule le classement de chaque année l'une après l'autre : une série de requêtes par année, qui grandit avec le temps.
- `fetchLegacyRanking` lit les pages HTML de l'ancien site avec deux analyseurs (format 2012 et format 2016+) : si l'ancien site change ou disparaît, l'import casse.
- `app/classement/actions.ts` redéfinit sa propre fonction `isAdmin` au lieu d'utiliser celle de `lib/roles.ts`.
- Statistiques : le compteur « En ligne » (appelé « Connectés » avant la carte 051) compte les membres qui ont lu un sujet du forum ces 15 dernières minutes (table `TopicView`). Il comptait la table `Session`, toujours vide parce que les sessions sont des jetons JWT rangés dans un cookie (`auth.ts`). Un membre qui navigue sans ouvrir de sujet n'est pas compté. « Taille BDD » est demandée à Postgres (`pg_database_size`). Le quota d'emails (3000) et de stockage (500 Mo) sont écrits en dur.

## Les mots expliqués

| Mot | Sens |
|---|---|
| CDF | Coupe de France, le championnat national de Blood Bowl. Un tournoi CDF rapporte des points. |
| Points CDF | `R × (Nc − Pl) / (Nc + Pl − 2)`, où Nc est le nombre de participants, Pl la place, et R une valeur de référence ajustée selon le nombre de rondes et de participants. Le vainqueur reçoit exactement R. |
| Type de tournoi CDF | Individuel, équipe partielle ou équipe totale ; il change la valeur de référence R. |
| Classement glissant | Classement sur les 12 derniers mois, quelle que soit l'année. |
| Roster | L'équipe (la race) jouée par le coach, par exemple Orques ou Elfes. |
| Archive | Classement d'une année figé et enregistré, qui ne bouge plus. |
| Hall of Fame | Le podium de chaque année. |

## État

- Marche : classement annuel, glissant, par roster, Hall of Fame, archives et import de l'ancien site, statistiques publiques.
- Marche aussi depuis la carte 051 : points recalculés côté serveur, compteur « En ligne » basé sur une vraie activité.
- Manque : taille de base fiable, Hall of Fame sans recalcul année par année.
- Cartes : 049 (audit mobile) ; 046 et 047 (passage à Postgres) concernent la « Taille BDD ».
