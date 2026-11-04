# Modération : signalements et bannissement

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

N'importe quel membre peut signaler un message, un sujet, un coach, un article ou une ligue. Les modérateurs traitent ces signalements dans un tableau de bord, valident les ressources proposées par les coachs, peuvent bannir ou débannir un membre, et chaque action importante est gardée dans un journal d'audit consultable.

## Ce que voit le coach

- Partout sur le site : un bouton « Signaler » ouvre la fenêtre `ReportModal` (« Signaler un contenu ») avec cinq raisons au choix (spam, harcèlement, contenu inapproprié, bot, autre) et un champ de précisions. Membre connecté uniquement.
- `/moderation` (refaite par la carte 099, ADR 0006) : des onglets portant le nombre de cas en attente (pastille). Onglets : « Journal d'audit », « Utilisateurs » (lien vers `/membres`), « Messages / Sujets / Coachs / Articles / Ligues signalés », « Coachs bannis », « Ressources à valider ». Chaque onglet est un lien : l'onglet ouvert est gardé dans l'adresse (`?tab=reports_post`), et une valeur inconnue (ou `users`) ouvre le journal.
- Journal : 20 lignes par page (modérateur avec lien vers son profil, action, détails, élément visé avec « Voir l'élément », date) ; « Purger > 3 mois » pour les administrateurs, confirmé dans une fenêtre.
- Dans un onglet de signalements, une fiche par contenu visé, sur téléphone comme sur ordinateur (carte 168). Elle montre le type de contenu, le nombre de signalements, la raison, le premier membre qui a signalé et la date, puis le contenu lui-même : titre (sujet, article, ligue ou pseudo du coach), auteur et extrait de 200 caractères en texte brut (sans le BBCode, le code de mise en forme du forum). Boutons : « Voir dans le sujet » pour un message (ouvre la bonne page du sujet, directement sur le message, dans le même onglet ; « Voir » ou « Voir le profil » pour les autres types, dans le même onglet aussi), « Masquer » pour un message pas encore masqué (ouvre la fenêtre « Modérer le message » ; une fois le message masqué, ses signalements se ferment seuls), « Ignorer » (les signalements passent au statut « ignoré », `IGNORED`, avec la ligne « Signalement ignoré » au journal, pour un signalement abusif ou sans fondement), « Marquer comme traité » (rangé dans le menu « ⋯ » pour un message) et « Détails » (chaque signalement l'un après l'autre : auteur, date, raison, précision). « Ignorer » et « Marquer comme traité » demandent confirmation, avec un commentaire facultatif écrit au journal.
- Un contenu supprimé depuis son signalement s'affiche « Contenu déjà supprimé », avec le seul bouton « Fermer le signalement ». La plupart du temps, la fiche n'apparaît même pas : supprimer un message ou un sujet, ou masquer un message, ferme ses signalements en attente (fonction `closePendingReports`, carte 168). Restent les contenus supprimés avant cette carte, les articles et ligues effacés, et les messages d'un sujet supprimé.
- « Ressources à valider » : une fiche par ressource avec « Éditer », « Refuser » et « Approuver ».
- Bannir : depuis la fiche d'un coach (`/spy/[id]`, colonne de profil) ou depuis la liste `/membres`, avec une raison. Le banni est envoyé sur `/banned` et ne peut plus agir (voir `docs/features/auth/README.md`). Débannir : onglet « Coachs bannis », ou les mêmes boutons.
- **Dans le forum** (carte 165) : un modérateur peut supprimer un sujet (outils du sujet) ou le message d'un autre membre (menu « ⋯ », « Supprimer (modération) »), avec une raison obligatoire. Rien n'est effacé : le sujet supprimé reste visible des seuls modérateurs avec le bandeau « Sujet supprimé » et « Restaurer le sujet », et le message supprimé se restaure par « Restaurer le message supprimé ». Masquer un message (« Modérer ») reste possible quand on veut que son auteur continue à le lire. Le détail est dans `docs/features/forum/README.md`.
- **Scinder et fusionner des sujets** (carte 169), depuis les outils du sujet (groupe « Modération »), sauf pour un sujet de tournoi. « Scinder le sujet » fait apparaître une case « Déplacer » en tête de chaque message (sauf le premier, qui reste dans le sujet) ; le nombre de messages cochés et le bouton « Scinder… » sont dans une barre collée en bas sur téléphone, dans la colonne des outils sur ordinateur. La fenêtre qui suit demande le titre et le forum du nouveau sujet, puis l'ouvre. « Fusionner avec un autre sujet » cherche le sujet d'arrivée par son titre ou son identifiant : tous les messages le rejoignent, rangés à leur date, et le sujet vidé est supprimé avec la raison « Fusionné avec le sujet « … » ». Les deux opérations sont inscrites au journal (« Sujet scindé », « Sujets fusionnés »), sur les deux sujets concernés.
- Accès : modérateur et au-dessus. La vérification de la page se fait dans le navigateur ; la vraie protection est dans chaque action serveur.
- **Sur téléphone** (et tablette, jusqu'à 1024 pixels) : une seule colonne ; les onglets forment une rangée en haut de la page qui défile de côté et se place sur l'onglet ouvert (avant la carte 099, ils étaient rangés dans le panneau « Plus »). Sur ordinateur, ils forment une colonne à gauche. Mise en page commune avec l'administration : `StaffPageLayout`. Journal, signalements, bannis et ressources sont des listes de fiches (plus de tableau), avec des boutons de 44 pixels. Les fenêtres de confirmation (`ConfirmDialog`) montent du bas de l'écran. Une grande marge sous le contenu évite que les notifications empilées en bas de l'écran cachent les derniers boutons.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/moderation/page.tsx` | Page (composant navigateur) : contrôle `isModerator`, onglet actif, compteurs. |
| `apps/site/common/components/StaffPageLayout/StaffPageLayout.tsx` | Mise en page commune de la modération et de l'administration (titre, onglets, contenu). |
| `apps/site/lib/moderationReports.ts` | `closePendingReports` : ferme les signalements en attente d'un contenu quand la modération a déjà agi (message masqué, message ou sujet supprimé). **Interne au serveur**, appelée par `moderatePost`, `deletePost` et `deleteTopic` (`app/forum/actions.ts`). |
| `apps/site/lib/moderationLog.ts` | `logModerationAction` et le type `ModerationAction` : écriture au journal, **interne au serveur** (volontairement hors d'un fichier « use server »). |
| `apps/site/app/moderation/actions.ts` | Actions serveur : `createReportAction`, `getModerationLogs`, `getPendingReportsByType`, `resolveReportsAction`, `cleanupModerationLogs`, `getBannedUsers`, `unbanUserAction`, `getModerationSummaryCounts`.  |
| `apps/site/app/moderation/component/` | `LogsTab`, `ReportsTab`, `BannedUsersTab`, `ResourceModerationTab` (composants de `packages/ui` ; plus de fichier CSS depuis la carte 099). Dans le journal, « Voir l'élément » d'un message passe par son lien permanent `/forum/post/<message>` (carte 169). |
| `apps/site/app/forum/topicSplitMergeActions.ts`, `apps/site/app/forum/component/TopicSplitMerge.tsx` | Scinder et fusionner des sujets (carte 169) : actions serveur `splitTopic`, `mergeTopics`, `searchMergeTargets`, et leurs fenêtres. |
| `apps/site/common/components/ReportModal/ReportModal.tsx` | Fenêtre de signalement. Utilisée par `PostMoreMenu`, `TopicTools` (forum), `ProfileSidebar`, `ReportArticleButton`, `ReportLigueButton`. |
| `apps/site/app/membres/actions.ts` | `toggleBanUser` (seule version, utilisée par `/membres`, la fiche `/spy/[id]` et, via `unbanUserAction`, l'onglet « Coachs bannis » : contrôle de rang et entrée au journal) et `deleteUser`. |
| `apps/site/app/ressources/actions.ts` | `getPendingResources`, `moderateResource` (onglet « Ressources à valider »). |

`logModerationAction(action, targetId, targetType, details)` est appelée par les autres fonctionnalités (forum, articles, ligues, administration) pour remplir le journal. Depuis la carte 165, le forum écrit aussi `TOPIC_RESTORED` (« Sujet restauré »), `POST_DELETED` (« Message supprimé », par son auteur ou par la modération avec la raison) et `POST_RESTORED` (« Message restauré ») ; `POST_UNMODERATED` s'affiche désormais « Modération du message annulée ». Avant, la suppression d'un message par son auteur était écrite sous `POST_MODERATED` (« Message modéré »), ce qui faisait croire à une action de la modération.

## Les pièges

- Chaque action serveur passe par `getActiveSession()` puis `isModerator()` ; ne jamais s'appuyer sur le contrôle de la page.
- **Toute fonction exportée d'un fichier « use server » est appelable depuis le navigateur par n'importe qui.** `logModerationAction` l'était, ce qui permettait d'écrire de fausses entrées au journal : elle est désormais dans `lib/moderationLog.ts` (carte 050). Ne jamais remettre une fonction interne dans un fichier d'actions.
- Un seul `toggleBanUser` (`app/membres/actions.ts`) : contrôle de rang (un modérateur ne peut ni bannir ni débannir un membre de rang égal ou supérieur, sauf s'il est Super Admin) et entrée au journal (carte 050, testé). `unbanUserAction` (onglet « Coachs bannis ») se contente de l'appeler et de renvoyer son message d'erreur : ne jamais lui redonner sa propre écriture en base, sinon le contrôle de rang disparaîtrait (carte 060, testé).
- `cleanupModerationLogs` (purge automatique, lancée à chaque ouverture de la page 1 du journal) supprime les entrées de plus de 3 mois. Depuis la carte 144, elle n'écrit sa ligne « Nettoyage automatique… » au journal que si elle a réellement supprimé des entrées (avant, chaque ouverture du journal par un administrateur ajoutait une ligne « 0 entrées supprimées »). Jusqu'à la carte 051, elle calculait une date invalide et ne supprimait rien : au premier passage après la mise en ligne de la correction, toutes les entrées de plus de 3 mois disparaîtront d'un coup.
- `deleteUser` (un modérateur supprime un membre) passe par `anonymizeAndDeleteUser` (`lib/accountDeletion.ts`), comme la suppression de compte par le membre : ses contenus publics sont rattachés au compte fantôme, rien n'est effacé du forum (carte 051). L'action est tracée au journal (`USER_DELETED`).
- `createReportAction` ne contrôle ni le type visé, ni les doublons, ni la fréquence : un membre peut envoyer de nombreux signalements.
- `getBannedUsers` (corrigée par la carte 144) charge tous les bannis et leurs lignes « USER_BANNED » du journal en deux requêtes fixes, puis trie par date du bannissement (la plus récente d'abord) et par identifiant à date égale avant de découper la page : un banni apparaît sur une seule page. La date du bannissement n'étant pas une colonne du membre, la pagination se fait en mémoire, ce qui reste léger tant que les bannis se comptent en centaines. Elle renvoie toujours l'email des bannis aux modérateurs.
- `getPendingReportsByType` charge tous les signalements en attente puis pagine en mémoire. Elle charge ensuite le contenu visé des seules fiches de la page (au plus 10) ; pour un message, la page du sujet se calcule en comptant les messages placés avant lui, dans l'ordre de la page du sujet (date de création, puis identifiant), à 20 messages par page. Depuis la carte 169, ce calcul passe par `forumPostHrefFor` (`lib/forumPostLink.ts`), partagé avec la page du sujet, la recherche et les notifications : le nombre de messages par page (`TOPIC_POSTS_PER_PAGE`) n'est plus écrit qu'à cet endroit.
- La fermeture automatique n'écrit rien de plus au journal : l'action sur le contenu (« Message modéré », « Message supprimé », « Sujet supprimé ») y est déjà inscrite.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Signalement (*report*) | Alerte d'un membre sur un contenu ; statut `PENDING` (en attente), `RESOLVED` (traité) ou `IGNORED` (ignoré). Table `ModerationReport`. |
| Cible | Le contenu signalé, désigné par `targetId` et `targetType` (`POST`, `TOPIC`, `USER`, `ARTICLE`, `LIGUE`). |
| Journal d'audit | Liste datée des actions de modération (qui, quoi, sur quoi). Table `ModerationLog`. |
| Bannissement | Champ `isBanned` (et `banReason`) du membre : il garde son compte mais ne peut plus rien faire. |
| Ressource en attente | Contenu proposé par un coach, visible seulement après validation par un modérateur. |
| Scinder un sujet | Déplacer des messages choisis d'un sujet vers un nouveau sujet. |
| Fusionner deux sujets | Déplacer tous les messages d'un sujet dans un autre, puis supprimer le sujet vidé. |

## État

- Fonctionne : signalements sur cinq types de contenu, tableau de bord avec compteurs, ban et débannissement, journal, validation des ressources.
- Fonctionne aussi depuis la carte 051 : purge des journaux de plus de 3 mois. Depuis la carte 060, le débannissement depuis l'onglet « Coachs bannis » respecte le rang et reste tracé au journal.
- Manque : limite sur les signalements. Aucune carte ouverte ne la couvre. L'onglet « Coachs bannis » affiche le bouton « Débannir » même quand le rang l'interdit : le serveur refuse alors et un message l'explique.
- Hub : le ban global propagé à toutes les applications est prévu par la carte 037.
- Carte 169 : scinder et fusionner des sujets, vérifié par le test `tests/e2e/inventaire/forum-sujet.spec.ts` (ordinateur et téléphone).
- Téléphone : refait par la carte 099 ; vérifié par `tests/e2e/inventaire/moderation.spec.ts` (ordinateur et téléphone) et par l'audit mobile (journal, signalements, bannis, ressources).
