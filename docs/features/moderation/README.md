# Modération : signalements et bannissement

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

N'importe quel membre peut signaler un message, un sujet, un coach, un article ou une ligue. Les modérateurs traitent ces signalements dans un tableau de bord, valident les ressources proposées par les coachs, peuvent bannir ou débannir un membre, et chaque action importante est gardée dans un journal d'audit consultable.

## Ce que voit le coach

- Partout sur le site : un bouton « Signaler » ouvre la fenêtre `ReportModal` (« Signaler un contenu ») avec cinq raisons au choix (spam, harcèlement, contenu inapproprié, bot, autre) et un champ de précisions. Membre connecté uniquement.
- `/moderation` (refaite par la carte 099, ADR 0006) : des onglets portant le nombre de cas en attente (pastille). Onglets : « Journal d'audit », « Utilisateurs » (lien vers `/membres`), « Messages / Sujets / Coachs / Articles / Ligues signalés », « Coachs bannis », « Ressources à valider ». Chaque onglet est un lien : l'onglet ouvert est gardé dans l'adresse (`?tab=reports_post`), et une valeur inconnue (ou `users`) ouvre le journal.
- Journal : 20 lignes par page (modérateur avec lien vers son profil, action, détails, élément visé avec « Voir l'élément », date) ; « Purger > 3 mois » pour les administrateurs, confirmé dans une fenêtre.
- Dans un onglet de signalements, une fiche par contenu visé (raison, nombre de signalements, date) avec « Voir », « Détails » (chaque signalement l'un après l'autre : auteur, date, raison, précision) et « Marquer comme traité », confirmé avec un commentaire facultatif écrit au journal. L'action serveur sait aussi « ignorer » un signalement, mais l'écran n'a jamais proposé ce bouton (ni avant ni après la refonte).
- « Ressources à valider » : une fiche par ressource avec « Éditer », « Refuser » et « Approuver ».
- Bannir : depuis la fiche d'un coach (`/spy/[id]`, colonne de profil) ou depuis la liste `/membres`, avec une raison. Le banni est envoyé sur `/banned` et ne peut plus agir (voir `docs/features/auth/README.md`). Débannir : onglet « Coachs bannis », ou les mêmes boutons.
- Accès : modérateur et au-dessus. La vérification de la page se fait dans le navigateur ; la vraie protection est dans chaque action serveur.
- **Sur téléphone** (et tablette, jusqu'à 1024 pixels) : une seule colonne ; les onglets forment une rangée en haut de la page qui défile de côté et se place sur l'onglet ouvert (avant la carte 099, ils étaient rangés dans le panneau « Plus »). Sur ordinateur, ils forment une colonne à gauche. Mise en page commune avec l'administration : `StaffPageLayout`. Journal, signalements, bannis et ressources sont des listes de fiches (plus de tableau), avec des boutons de 44 pixels. Les fenêtres de confirmation (`ConfirmDialog`) montent du bas de l'écran. Une grande marge sous le contenu évite que les notifications empilées en bas de l'écran cachent les derniers boutons.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/moderation/page.tsx` | Page (composant navigateur) : contrôle `isModerator`, onglet actif, compteurs. |
| `apps/site/common/components/StaffPageLayout/StaffPageLayout.tsx` | Mise en page commune de la modération et de l'administration (titre, onglets, contenu). |
| `apps/site/lib/moderationLog.ts` | `logModerationAction` et le type `ModerationAction` : écriture au journal, **interne au serveur** (volontairement hors d'un fichier « use server »). |
| `apps/site/app/moderation/actions.ts` | Actions serveur : `createReportAction`, `getModerationLogs`, `getPendingReportsByType`, `resolveReportsAction`, `cleanupModerationLogs`, `getBannedUsers`, `unbanUserAction`, `getModerationSummaryCounts`.  |
| `apps/site/app/moderation/component/` | `LogsTab`, `ReportsTab`, `BannedUsersTab`, `ResourceModerationTab` (composants de `packages/ui` ; plus de fichier CSS depuis la carte 099). |
| `apps/site/common/components/ReportModal/ReportModal.tsx` | Fenêtre de signalement. Utilisée par `PostMoreMenu`, `TopicTools` (forum), `ProfileSidebar`, `ReportArticleButton`, `ReportLigueButton`. |
| `apps/site/app/membres/actions.ts` | `toggleBanUser` (seule version, utilisée par `/membres`, la fiche `/spy/[id]` et, via `unbanUserAction`, l'onglet « Coachs bannis » : contrôle de rang et entrée au journal) et `deleteUser`. |
| `apps/site/app/ressources/actions.ts` | `getPendingResources`, `moderateResource` (onglet « Ressources à valider »). |

`logModerationAction(action, targetId, targetType, details)` est appelée par les autres fonctionnalités (forum, articles, ligues, administration) pour remplir le journal.

## Les pièges

- Chaque action serveur passe par `getActiveSession()` puis `isModerator()` ; ne jamais s'appuyer sur le contrôle de la page.
- **Toute fonction exportée d'un fichier « use server » est appelable depuis le navigateur par n'importe qui.** `logModerationAction` l'était, ce qui permettait d'écrire de fausses entrées au journal : elle est désormais dans `lib/moderationLog.ts` (carte 050). Ne jamais remettre une fonction interne dans un fichier d'actions.
- Un seul `toggleBanUser` (`app/membres/actions.ts`) : contrôle de rang (un modérateur ne peut ni bannir ni débannir un membre de rang égal ou supérieur, sauf s'il est Super Admin) et entrée au journal (carte 050, testé). `unbanUserAction` (onglet « Coachs bannis ») se contente de l'appeler et de renvoyer son message d'erreur : ne jamais lui redonner sa propre écriture en base, sinon le contrôle de rang disparaîtrait (carte 060, testé).
- `cleanupModerationLogs` (purge automatique, lancée à chaque ouverture de la page 1 du journal) supprime les entrées de plus de 3 mois. Jusqu'à la carte 051, elle calculait une date invalide et ne supprimait rien : au premier passage après la mise en ligne de la correction, toutes les entrées de plus de 3 mois disparaîtront d'un coup.
- `deleteUser` (un modérateur supprime un membre) passe par `anonymizeAndDeleteUser` (`lib/accountDeletion.ts`), comme la suppression de compte par le membre : ses contenus publics sont rattachés au compte fantôme, rien n'est effacé du forum (carte 051). L'action est tracée au journal (`USER_DELETED`).
- `createReportAction` ne contrôle ni le type visé, ni les doublons, ni la fréquence : un membre peut envoyer de nombreux signalements.
- `getBannedUsers` lit le dernier journal de ban membre par membre (une requête par banni, défaut N+1) et renvoie l'email des bannis aux modérateurs.
- `getPendingReportsByType` charge tous les signalements en attente puis pagine en mémoire.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Signalement (*report*) | Alerte d'un membre sur un contenu ; statut `PENDING` (en attente), `RESOLVED` (traité) ou `IGNORED` (ignoré). Table `ModerationReport`. |
| Cible | Le contenu signalé, désigné par `targetId` et `targetType` (`POST`, `TOPIC`, `USER`, `ARTICLE`, `LIGUE`). |
| Journal d'audit | Liste datée des actions de modération (qui, quoi, sur quoi). Table `ModerationLog`. |
| Bannissement | Champ `isBanned` (et `banReason`) du membre : il garde son compte mais ne peut plus rien faire. |
| Ressource en attente | Contenu proposé par un coach, visible seulement après validation par un modérateur. |

## État

- Fonctionne : signalements sur cinq types de contenu, tableau de bord avec compteurs, ban et débannissement, journal, validation des ressources.
- Fonctionne aussi depuis la carte 051 : purge des journaux de plus de 3 mois. Depuis la carte 060, le débannissement depuis l'onglet « Coachs bannis » respecte le rang et reste tracé au journal.
- Manque : limite sur les signalements. Aucune carte ouverte ne la couvre. L'onglet « Coachs bannis » affiche le bouton « Débannir » même quand le rang l'interdit : le serveur refuse alors et un message l'explique.
- Hub : le ban global propagé à toutes les applications est prévu par la carte 037.
- Téléphone : refait par la carte 099 ; vérifié par `tests/e2e/inventaire/moderation.spec.ts` (ordinateur et téléphone) et par l'audit mobile (journal, signalements, bannis, ressources).
