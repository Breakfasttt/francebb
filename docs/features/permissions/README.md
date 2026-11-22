# Rôles, droits et bannissement

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour en fin de gros chantier (commande `/ship`) ou quand le comportement visible change. Environ 80 lignes au plus.

## À quoi ça sert

Chaque membre a un rôle, qui dit ce qu'il peut faire sur le site. Un membre banni garde son compte mais ne peut plus rien faire. Cette fiche rassemble les règles qui traversent tout le site (carte 221). Le détail par action est dans le tableau rôle × action de [../INTERACTIONS.md](../INTERACTIONS.md).

## Ce que voit le coach

- **Les rôles**, du plus fort au plus faible, avec leur puissance : Super Admin (100), Admin (90), Modérateur (70), RTC (50), Chef de ligue (40), Coach (10). Les rôles personnalisés (créés dans l'administration, comme « Arbitre ») restent sous Modérateur.
- **Visiteur** : pas de compte ou pas connecté. Il lit les forums publics, les articles, les tournois, les ligues, le classement. Il n'écrit rien.
- **Nouveau compte** : tant que l'inscription n'est pas finie, il est renvoyé vers `/auth/onboarding`.
- **Coach** : écrit dans le forum, s'inscrit aux tournois, publie articles et ressources, crée une ligue, écrit en privé, signale un contenu.
- **RTC et Chef de ligue** : aujourd'hui, les mêmes droits qu'un coach. Leur rôle est surtout un titre. Les droits sur une ligue ou un tournoi viennent du fait d'en être créateur, organisateur ou commissaire.
- **Modérateur** : masque, supprime, restaure, épingle, verrouille, archive, déplace, renomme, scinde et fusionne ; traite les signalements ; bannit et débannit un membre placé sous lui (jamais lui-même ni un compte technique) ; change le rôle d'un membre placé sous lui ; valide les ressources et les résultats CDF ; crée et supprime un forum.
- **Admin** : en plus, l'administration (rôles personnalisés, structure du forum, données de référence, réglages, annonces par e-mail), la purge du journal et la suppression d'un compte (carte 221).
- **Super Admin** : passe outre les contrôles de rang (il peut agir sur un autre Super Admin), sauf pour changer son propre rôle, se bannir ou se supprimer (carte 221).
- **Comptes techniques** (`SYSTEM_ACCOUNT_IDS` : `system`, auteur des ressources officielles, et `ghost_coach`, « Coach Inconnu » des comptes supprimés) : personne ne les bannit ni ne les supprime. L'annuaire `/membres` ne propose pas de leur écrire en privé (la fiche `/spy` et le serveur de la messagerie ne le bloquent pas encore).
- **Averti** (carte 222) : un avertissement de la modération ne retire aucun droit. Le membre le voit sur son profil, seul avec la modération.
- **Banni** : il est envoyé sur `/banned` (sans navigation, avec « Me déconnecter »). Un bannissement temporaire (1, 7 ou 30 jours, carte 222) est levé tout seul à sa première visite après la date de fin. Toute action serveur le refuse. Ses messages du forum sont masqués derrière un bouton qui permet de les afficher (`PostItem.tsx`). Ses inscriptions aux tournois restent, avec un badge « Banni » chez l'organisateur (carte 221). Personne ne peut plus démarrer une conversation avec lui ni lui écrire à deux (carte 221).
- **Sur téléphone** : rien de propre à cette fiche ; chaque écran suit sa propre fiche.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/lib/roles.ts` | Puissances (`ROLE_POWER`), `getRolePower`, `isModerator`, `isAdmin`, `canEditTargetRole`, `roleChangeRefusal`, `canDeleteMember`, `canBanMember` et `SYSTEM_ACCOUNT_IDS` (carte 221). Testé par `tests/unit/roles.test.mjs`. |
| `apps/site/lib/memberRole.ts` | `changeMemberRole` : seul chemin pour changer un rôle (liste des membres et administration), avec le journal (carte 221). |
| `apps/site/lib/authGuard.ts` | `getActiveSession()` : renvoie rien pour un visiteur ou un banni. `getSession()` : session brute, bannis compris (seulement mise en page, `/banned`, connexion). |
| `apps/site/auth.ts` | Relit le rôle et le bannissement dans la base à chaque lecture de la session ; lève un bannissement temporaire échu (`liftExpiredBan`, carte 222). |
| `apps/site/lib/forumAccess.ts` | Qui voit quel forum (`allowedRoles` : « ce rôle et au-dessus », ou `ALL`). |
| `apps/site/lib/forumRights.ts` | `canReplyToTopic`, `canEditPost`, `canSavePostEdit` (carte 221). |
| `apps/site/lib/tournamentRights.ts` | `canManageTournament` (organisateur, commissaire ou modérateur), `canManagePayments` (équipe d'organisation). |
| `apps/site/lib/moderationLog.ts` | Journal de toutes les actions de l'équipe. |

## Les pièges

- **Limite d'actions par minute** (carte 224) : un membre fait au plus 3 nouveaux sujets, 10 réponses, 20 messages privés (démarrer une conversation compte), 5 signalements, 30 réactions (messages et articles) et 20 recherches du forum par minute. Au-delà : « Doucement : attends une minute avant de recommencer. ». Le compte est tenu dans la table `ActionCounter` (une ligne par membre, action et minute, incrémentée en une requête ; les minutes de plus de dix minutes sont effacées au passage), parce que le site tourne sans serveur permanent. La modération n'est pas limitée ; un visiteur non connecté n'est pas compté sur la recherche. Seuils : `lib/rateLimitRules.ts` ; compteur : `rateLimitRefusal` de `lib/rateLimit.ts`, appelé par chaque action après ses contrôles et avant toute écriture.

- **Chaque action serveur vérifie elle-même la session et le droit.** Une action serveur est une porte publique : n'importe qui peut l'appeler avec n'importe quels arguments. Le contrôle des pages `/administration` et `/moderation` se fait dans le navigateur et ne protège rien.
- **`proxy.ts` ne protège aucune adresse par rôle.** Il rafraîchit la session et pose la politique de sécurité du contenu. Il renvoie seulement les comptes neufs vers l'inscription.
- Un rôle personnalisé compte comme un coach pour les droits (`getRolePower`), mais `lib/forumAccess.ts` lit sa vraie puissance pour l'accès aux forums. Les deux restent cohérents tant qu'un rôle personnalisé reste sous Modérateur.
- Un changement de rôle passe par `roleChangeRefusal` : le rôle doit exister dans `RoleConfig`, on ne change pas son propre rôle, et sauf Super Admin la cible et le nouveau rôle sont sous son rang. Avant la carte 221, deux actions avaient chacune leur règle, et une seule écrivait au journal.
- **Bannir et supprimer suivent une règle partagée** : `canBanMember` (modérateur ou plus) et `canDeleteMember` (admin ou plus) refusent soi-même, un compte technique et, sauf Super Admin, un rang égal ou supérieur. L'écran (`/membres`, `/spy/[id]`) et le serveur (`toggleBanUser`, `deleteUser`) appellent la même fonction : ne pas réécrire la règle dans un composant.
- La modération est globale : pas de modérateur propre à un forum. Un modérateur agit aussi sur les contenus d'un admin, s'il voit le forum.
- Le bannissement est un simple drapeau (`User.isBanned`) : pas de date de fin. La connexion n'est pas bloquée ; c'est `getActiveSession()` qui refuse tout ensuite.
- Le hub peut bannir et débannir (`lib/hub/hubEvents.ts`, événements `user.banned`).

## Les mots expliqués

| Mot | Sens |
|---|---|
| Puissance (*power*) | Nombre qui classe les rôles. On n'agit que sur un rang plus faible que le sien. |
| Action serveur | Fonction du serveur appelée par une page ; appelable par n'importe qui. |
| Commissaire | Membre qui aide à gérer une ligue ou un tournoi. |

## Interactions

**Elle agit sur**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Forum | `lib/forumAccess.ts`, `lib/forumRights.ts` | Forums visibles, droit d'écrire, outils de modération. |
| Messagerie | `app/messagerie/actions.ts` | Un banni ne reçoit plus de nouvelle conversation. |
| Tournois | `lib/tournamentRights.ts`, liste des inscrits | Gestion par l'organisateur ; badge « Banni ». |
| Administration, modération | Toutes leurs actions | Réservées aux admins et aux modérateurs. |
| Notifications | `lib/notifications.ts` | Personne n'est prévenu d'un sujet qu'il ne peut pas lire. |

**Elle dépend de**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Administration | Onglets « Gestion des rôles » et « Membres & accès » | Création des rôles personnalisés, changement de rôle. |
| Hub | `api/hub/events` | Bannissement, profil et suppression venus du hub. |

Vue d'ensemble : [../INTERACTIONS.md](../INTERACTIONS.md).

## État

- Carte 221 : une seule règle de changement de rôle, une seule règle de bannissement (`canBanMember`), suppression d'un compte réservée aux admins, journal complet, messagerie fermée aux bannis, tests `tests/e2e/permissions.spec.ts` (chaque faille appelée directement avec chaque rôle).
- Fait depuis : bannissement temporaire et avertissements (carte 222), limite d'actions par minute (carte 224). Manque encore : modérateurs par forum (carte 225).
