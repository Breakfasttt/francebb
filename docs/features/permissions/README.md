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
- **Modérateur** : masque, supprime, restaure, épingle, verrouille, archive, déplace, renomme, scinde et fusionne ; traite les signalements ; bannit et débannit ; change le rôle d'un membre placé sous lui ; valide les ressources et les résultats CDF ; crée et supprime un forum.
- **Admin** : en plus, l'administration (rôles personnalisés, structure du forum, données de référence, réglages, annonces par e-mail), la purge du journal et la suppression d'un compte (carte 221).
- **Super Admin** : passe outre les contrôles de rang (il peut agir sur un autre Super Admin), sauf pour changer son propre rôle.
- **Banni** : il est envoyé sur `/banned`. Toute action serveur le refuse. Ses messages du forum sont masqués derrière un bouton qui permet de les afficher (`PostItem.tsx`). Ses inscriptions aux tournois restent, avec un badge « Banni » chez l'organisateur (carte 221). Personne ne peut plus démarrer une conversation avec lui ni lui écrire à deux (carte 221).
- **Sur téléphone** : rien de propre à cette fiche ; chaque écran suit sa propre fiche.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/lib/roles.ts` | Puissances (`ROLE_POWER`), `getRolePower`, `isModerator`, `isAdmin`, `canEditTargetRole`, `roleChangeRefusal` et `canDeleteMember` (carte 221). Testé par `tests/unit/roles.test.mjs`. |
| `apps/site/lib/memberRole.ts` | `changeMemberRole` : seul chemin pour changer un rôle (liste des membres et administration), avec le journal (carte 221). |
| `apps/site/lib/authGuard.ts` | `getActiveSession()` : renvoie rien pour un visiteur ou un banni. `getSession()` : session brute, bannis compris (seulement mise en page, `/banned`, connexion). |
| `apps/site/auth.ts` | Relit le rôle et le bannissement dans la base à chaque lecture de la session. |
| `apps/site/lib/forumAccess.ts` | Qui voit quel forum (`allowedRoles` : « ce rôle et au-dessus », ou `ALL`). |
| `apps/site/lib/forumRights.ts` | `canReplyToTopic`, `canEditPost`, `canSavePostEdit` (carte 221). |
| `apps/site/lib/tournamentRights.ts` | `canManageTournament` (organisateur, commissaire ou modérateur), `canManagePayments` (équipe d'organisation). |
| `apps/site/lib/moderationLog.ts` | Journal de toutes les actions de l'équipe. |

## Les pièges

- **Chaque action serveur vérifie elle-même la session et le droit.** Une action serveur est une porte publique : n'importe qui peut l'appeler avec n'importe quels arguments. Le contrôle des pages `/administration` et `/moderation` se fait dans le navigateur et ne protège rien.
- **`proxy.ts` ne protège aucune adresse par rôle.** Il rafraîchit la session et pose la politique de sécurité du contenu. Il renvoie seulement les comptes neufs vers l'inscription.
- Un rôle personnalisé compte comme un coach pour les droits (`getRolePower`), mais `lib/forumAccess.ts` lit sa vraie puissance pour l'accès aux forums. Les deux restent cohérents tant qu'un rôle personnalisé reste sous Modérateur.
- Un changement de rôle passe par `roleChangeRefusal` : le rôle doit exister dans `RoleConfig`, on ne change pas son propre rôle, et sauf Super Admin la cible et le nouveau rôle sont sous son rang. Avant la carte 221, deux actions avaient chacune leur règle, et une seule écrivait au journal.
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

- Carte 221 : une seule règle de changement de rôle, suppression d'un compte réservée aux admins, journal complet, messagerie fermée aux bannis, tests `tests/e2e/permissions.spec.ts` (chaque faille appelée directement avec chaque rôle).
- Manque, en cartes à créer : bannissement temporaire, avertissements, modérateurs par forum, limite du nombre d'actions par minute.
