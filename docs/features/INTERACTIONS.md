# Interactions entre fonctionnalités et droits par rôle

> Vue d'ensemble écrite par la carte 221, pour quelqu'un qui découvre le projet. Chaque fiche de `docs/features/<nom>/README.md` détaille ses propres liens dans sa section « Interactions ». Ce fichier donne la carte d'ensemble, le tableau des droits par rôle et les comptes de test.

## 1. Les rôles

| Rôle | Puissance | Ce qu'il peut faire de plus |
|---|---|---|
| Visiteur (pas connecté) | — | Lire ce qui est public : accueil, forums ouverts à tous, articles non masqués, tournois, ligues, classement, ressources approuvées. |
| Nouveau compte | 10 | Comme un coach, mais il est d'abord envoyé sur `/auth/onboarding` tant qu'il n'a pas fini son inscription. |
| Coach | 10 | Écrire, s'inscrire aux tournois, organiser un tournoi, créer une ligue, écrire un article, proposer une ressource, messagerie, signaler. |
| Rôle personnalisé (ex. « Arbitre ») | choisie, toujours < 70 | Droits d'un coach ; sa puissance ne compte que pour l'accès aux forums réservés (`lib/forumAccess.ts`). |
| Chef de ligue, RTC | 40, 50 | Droits d'un coach (aucun droit propre dans le code) ; accès aux forums réservés à leur rôle ou en dessous. |
| Modérateur | 70 | Modération du forum, des articles, des ligues, des ressources ; signalements ; bannir un membre de rang inférieur ; changer le rôle d'un membre de rang inférieur ; valider la CDF. |
| Admin | 90 | Administration (`/administration`) ; supprimer un compte de rang inférieur ; purger le journal ; supprimer une archive du classement. |
| Super Admin | 100 | Tout, y compris sur les autres admins ; personne ne change son propre rôle, ne se bannit ni ne supprime son propre compte. |
| Comptes techniques | — | « Système » (`system`) et « Coach Inconnu » (`ghost_coach`) : personne ne les bannit ni ne les supprime (`SYSTEM_ACCOUNT_IDS`, carte 221). |
| Banni | — | Rien : `getActiveSession()` renvoie « pas de session », il est envoyé sur `/banned`. Ses contenus restent en ligne. |

Où c'est écrit : `lib/roles.ts` (puissances, `isModerator`, `isAdmin`, `roleChangeRefusal`, `canBanMember`, `canDeleteMember`, `SYSTEM_ACCOUNT_IDS`), `lib/authGuard.ts` (`getActiveSession`), `lib/forumAccess.ts`, `lib/forumRights.ts`, `lib/tournamentRights.ts`. La page ne protège rien : **chaque action serveur vérifie elle-même la session et le rôle** (voir `docs/features/permissions/README.md`).

## 2. Qui peut faire quoi (actions serveur)

Abréviations : **V** visiteur, **C** coach (et nouveau, rôle personnalisé, RTC, chef de ligue), **B** banni, **M** modérateur, **A** admin, **S** Super Admin. « auteur » = seulement sur son propre contenu ; « orga » = organisateur ou commissaire du tournoi ; « créateur » = créateur de la ligue ; « < soi » = seulement sur un membre de rang strictement inférieur.

### Forum (`app/forum/actions.ts`, `topicSplitMergeActions.ts`)

| Action | V | C | B | M | A / S | Vérification serveur |
|---|---|---|---|---|---|---|
| Lire un forum réservé | non | selon rôle | non | selon rôle | oui | `forumAccessWhere`, `topicAccessWhere` |
| Créer un sujet, répondre, réagir | non | oui (sujet ouvert ; pas de réaction sur un message masqué) | non | oui (même fermé) | oui | `canReplyToTopic` ; `togglePostReaction` refuse un message masqué (carte 221) |
| Modifier un message | non | auteur, sujet ouvert, message ni supprimé ni masqué | non | oui, tracé `POST_EDITED_BY_MOD` | oui | `canSavePostEdit` (carte 221), appliqué aussi à l'ouverture de la page « Modifier » |
| Supprimer un message | non | auteur | non | oui, raison obligatoire | oui | `decidePostDeletion` |
| Renommer un sujet | non | auteur, sujet ouvert | non | oui, tracé `TOPIC_RENAMED` | oui | `updateTopicTitle` |
| Épingler, verrouiller, archiver, déplacer, supprimer, restaurer un sujet | non | non (sauf supprimer son sujet sans réponse) | non | oui, tracé | oui | `isModerator` + `topicAccessWhere` |
| Masquer / démasquer un message | non | non | non | oui, tracé | oui | `isModerator` |
| Scinder, fusionner | non | non | non | oui, tracé | oui | `isModerator` |
| Créer, supprimer un forum (écran du forum) | non | non | non | oui, tracé | oui | `lib/forumStructure.ts` |

### Tournois (`app/forum/actions.ts`, `app/tournois/actions.ts`)

| Action | V | C | B | M | A / S | Vérification serveur |
|---|---|---|---|---|---|---|
| S'inscrire, mercenaire, créer une équipe | non | oui si ouvert | non | oui | oui | `registrationRefusal` (annulé, terminé, passé, fermé, sujet supprimé) |
| Modifier le tournoi, gérer les inscrits, clore, annuler, saisir les résultats | non | orga | non | oui | oui | `canManageTournament` |
| Changer l'état de paiement | non | orga | non | non | non (sauf orga) | `canManagePayments` |
| Valider la CDF | non | non | non | oui, tracé | oui | `isModerator` |

### Messagerie (`app/messagerie/actions.ts`, règles dans `lib/messageRules.ts`)

| Action | V | C | B | M | A / S | Vérification serveur |
|---|---|---|---|---|---|---|
| Lire, écrire dans une conversation | non | participant présent | non | participant | participant | participant + blocage + 500 caractères |
| Démarrer une conversation, inviter | non | oui, ni banni ni bloqué, 20 membres au plus | non | oui | oui | `unreachableMembers`, `hasBlockBetween` |
| Renommer un groupe | non | participant présent | non | participant présent | idem | `deletedAt: null` (carte 221) |

Personne, pas même la modération, ne lit les messages privés des autres. Ils sont chiffrés (`lib/crypto.ts`).

### Articles, ressources, ligues, classement

| Action | V | C | B | M | A / S | Vérification serveur |
|---|---|---|---|---|---|---|
| Écrire un article, proposer une ressource, créer une ligue | non | oui | non | oui | oui | session |
| Modifier / supprimer un article | non | auteur | non | oui | oui | `isModerator` ou auteur |
| Masquer un article | non | non | non | oui, tracé ; ferme ses signalements | oui | `isModerator` |
| Réagir à un article | non | oui, sauf article masqué | non | idem | idem | `toggleArticleReaction` (carte 221) |
| Valider, refuser, modifier une ressource | non | auteur (modifier) | non | oui, sauf outil système | oui | `isModerator` ; outil système : `isAdmin` |
| Modifier une ligue | non | créateur, commissaire | non | oui, tracé `LIGUE_UPDATED` | oui | créateur / commissaire / `isModerator` |
| Supprimer, transférer une ligue | non | créateur | non | oui, tracé ; supprimer ferme ses signalements | oui | créateur / `isModerator` |
| Archiver une année du classement | non | non | non | oui | oui | `isModerator` |
| Supprimer une archive | non | non | non | non | oui | `isAdmin` |

### Modération et membres (`app/moderation/actions.ts`, `app/membres/actions.ts`)

| Action | V | C | B | M | A / S | Vérification serveur |
|---|---|---|---|---|---|---|
| Signaler | non | oui, contenu visible, pas deux fois | non | oui | oui | `reportInputRefusal`, `canSeeReportTarget` |
| Voir et traiter les signalements, le journal | non | non | non | oui | oui | `isModerator` |
| Bannir / débannir | non | non | non | < soi, jamais soi-même ni un compte technique, tracé ; bannir ferme ses signalements | idem (S : tous sauf soi et comptes techniques) | `canBanMember` dans `toggleBanUser` (carte 221) |
| Changer un rôle | non | non | non | < soi, vers un rôle < soi, tracé | idem (S : tous sauf soi) | `roleChangeRefusal` |
| Supprimer un compte | non | non | non | **non** | < soi, tracé (S : tous sauf soi et comptes techniques) | `canDeleteMember` |
| Purger le journal | non | non | non | non | oui, plus de 3 mois seulement | `LOG_RETENTION_MONTHS` |

### Administration (`app/administration/actions.ts`, `actionsStructure.ts`)

Admin et Super Admin seulement, tout est tracé au journal depuis la carte 221 : rôles personnalisés (`ROLE_*`), données de référence (`REFERENCE_DATA_*`), réglages (`SITE_SETTING_UPDATED`, clés prévues seulement), annonce par e-mail (`MASS_MAIL_SENT` ; l'essai envoyé à soi-même par `sendTestAnnouncement` n'est pas tracé), catégories et ordre des forums (`CATEGORY_*`, `*_REORDERED`).

## 3. Carte des liens entre fonctionnalités

| Quand… | …cela change |
|---|---|
| Un membre est **banni** | Il ne voit plus que `/banned` (sans navigation, avec « Me déconnecter ») ; il ne peut plus rien faire ni se faire écrire en messagerie (sa fiche grise « Message privé ») ; ses signalements en attente se ferment ; ses messages et articles restent ; ses inscriptions aux tournois restent, avec un badge « Banni » chez l'organisateur ; le hub peut aussi bannir (`lib/hub/hubEvents.ts`). |
| Un **rôle** change | Accès aux forums réservés (immédiat, relu à chaque page), droits de modération, entrée au journal. |
| Un **sujet est supprimé** | Il disparaît des listes, de la recherche, des non-lus ; ses signalements se ferment ; si c'est un sujet de tournoi, plus aucune inscription n'est acceptée. |
| Un **message est masqué ou supprimé** | Les citations affichent un encart à la place du texte (« supprimé par son auteur », « supprimé par la modération » ou « masqué ») ; son auteur ne peut plus le modifier ; un message masqué ne reçoit plus de réaction ; ses signalements se ferment. |
| Un **article est masqué** | Il répond « introuvable » à tout autre que son auteur et la modération ; plus de réaction ; ses signalements se ferment. |
| Une **ligue est supprimée** | Ses tournois et articles restent sans lien vers elle ; ses signalements se ferment. |
| Un **sujet est archivé** | Il est fermé, sort des non-lus et se range dans le groupe replié « Sujets archivés » en bas de son forum ; la recherche le trouve encore (badge « Archivé »). |
| Un message contient une **mention** ou répond à un **sujet suivi** | Notification sous la cloche, e-mail si le membre l'accepte (`lib/notifications.ts`). |
| Un **message privé** arrive | Compteur de la messagerie, notification, e-mail si accepté. |
| Un **tournoi** est créé | Un sujet dans « Les tournois », une ligne dans `/tournois` et sur la carte ; terminé et validé CDF, il compte au classement. |
| Une **ligue** est créée | Elle apparaît dans `/ligues`, sur la carte, et peut être liée à un article ou à un tournoi. |
| Un membre **bloque** un autre | Plus de conversation ni d'invitation entre eux ; on ne peut pas bloquer l'équipe du site. |
| Un compte est **supprimé** | Ses contenus publics passent au compte fantôme « Coach Inconnu » (`lib/accountDeletion.ts`), rien n'est effacé du forum. |
| La **structure du forum** change | `/forum` est rafraîchi tout de suite (`refreshForumStructure`). |

## 4. Comptes de test (profil de base « exemple »)

`pnpm dev exemple` remplit la base locale avec `apps/site/prisma/seedScript/exampleData.ts`. Tous ces comptes sont cliquables dans « Mode Développement » sur `/auth/login` et dans le widget de la barre, du rôle le plus fort au plus faible.

| Compte | Rôle | Sert à tester |
|---|---|---|
| `exemple-superadmin` | Super Admin | Tout ; actions sur les admins |
| `exemple-admin`, `exemple-admin-2` | Admin | Administration ; un admin face à un autre admin |
| `exemple-modo`, `exemple-modo-2` | Modérateur | Modération ; un modérateur face à un autre |
| `exemple-rtc`, `exemple-chef-ligue` | RTC, Chef de ligue | Commissaire de tournoi et de ligue |
| `exemple-coach-1` à `-4` | Coach | Forum, tournois (capitaine, inscrit, liste d'attente), messagerie, blocage (coach-4 a bloqué coach-2) |
| `exemple-coach-role-perso` | Arbitre (rôle personnalisé) | Rôle personnalisé, message masqué, mercenaire |
| `exemple-nouveau` | Coach, inscription pas finie | Premier passage, envoi vers `/auth/onboarding` |
| `exemple-banni`, `exemple-banni-inscrit` | Bannis | Page `/banned` ; banni encore inscrit à un tournoi, dans une conversation, créateur d'une ligue |
| (pas de compte) | Visiteur | Se déconnecter |

Contenus prêts à l'emploi : sujet « Vitrine BBCode » (toutes les balises), sujets épinglé, verrouillé, archivé, supprimé, à fusionner (« Cherche une ligue vers Lyon » ×2), à scinder (26 messages), messages masqué et supprimé cités ; forums réservés aux modérateurs et aux admins, forum verrouillé, sous-forum ; tournois par équipes, complet avec liste d'attente, fermé, annulé, NAF, à valider CDF, au sujet supprimé ; tous les états de paiement ; groupe de messagerie avec un membre parti ; un signalement de chaque type ; journal de modération rempli. Ce qu'il faut essayer avec chaque compte : `TESTS-MANUELS.md`, section « Rôles ».
