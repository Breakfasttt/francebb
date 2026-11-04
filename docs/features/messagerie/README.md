# Messagerie

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

La messagerie permet aux coachs de s'écrire en privé, à deux ou en groupe, sans passer par le forum. Les messages sont chiffrés dans la base de données. Un nouveau message s'affiche sous la cloche du site (carte 167, voir `docs/features/notifications/`), et un email peut aussi prévenir le destinataire.

## Ce que voit le coach

- `/messagerie` : la liste de ses 20 conversations les plus récentes (l'action sait paginer, mais la page ne montre pas de pagination), avec l'heure (ou la date) du dernier message, son début et la pastille du nombre de messages non lus. Le bouton « Nouvelle conversation » ouvre la fenêtre « Nouvelle discussion » : note sur le chiffrement, titre facultatif (avec un titre, la discussion devient un groupe) et recherche de coachs.
- `/messagerie?id=…` : une conversation. Le coach lit les 30 derniers messages en bulles (les siens à droite), écrit avec l'éditeur BBCode et « Envoyer ». Le bouton « Participants » ouvre la liste des participants, avec un lien vers leur profil. Le menu « ⋯ » (« Actions de la conversation ») propose, dans un groupe, « Ajouter des participants » et « Renommer le groupe », et partout « Quitter la conversation », avec confirmation. La conversation se rafraîchit toute seule toutes les 10 secondes.
- `/messagerie?userId=…` : ouvre directement une conversation avec un coach (lien depuis la liste des membres ou un profil). Si une conversation à deux existe déjà entre ces deux coachs, et eux seuls, elle est reprise ; sinon une nouvelle est créée.
- Accès : membres connectés uniquement. Un visiteur non connecté voit seulement « Aucune conversation pour le moment » (l'erreur est cachée), sans être invité à se connecter.
- **Sur ordinateur** (refonte, carte 093) : deux colonnes de la hauteur de l'écran, la liste à gauche (la conversation ouverte y est mise en valeur) et la conversation à droite. Sans conversation ouverte, la colonne de droite invite à en choisir une et rappelle la note sur le chiffrement.
- **Sur téléphone et tablette** (jusqu'à 1024 pixels) : comme une application de messagerie. La liste seule, puis la conversation en plein écran : en-tête avec la flèche de retour à la liste, messages au milieu, zone de saisie collée en bas. La barre de navigation du bas est retirée pendant la conversation, et le cadre suit la partie visible de l'écran : quand le clavier s'ouvre, la zone de saisie remonte au-dessus de lui. Les fenêtres (nouvelle discussion, ajout, renommage, participants, confirmation) sont des panneaux qui montent du bas.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/messagerie/page.tsx` | Page client : les deux colonnes, l'ouverture par `?userId=`. |
| `apps/site/app/messagerie/component/ConversationList.tsx` | Liste des conversations et pastille des non-lus. |
| `apps/site/app/messagerie/component/ConversationView.tsx` | En-tête, fil de messages, saisie, rafraîchissement automatique, participants, départ ; plein écran sur téléphone. |
| `apps/site/app/messagerie/component/ChatBubble.tsx` | Une bulle de message. |
| `apps/site/app/messagerie/component/conversationText.ts` | Nom affiché d'une conversation, aperçu du dernier message sans balises BBCode. |
| `apps/site/app/messagerie/component/MemberPicker.tsx` | Recherche et choix de coachs, partagé par la création et l'ajout de participants. |
| `apps/site/app/messagerie/component/NewConversationModal.tsx`, `InviteParticipantModal.tsx`, `RenameConversationModal.tsx` | Fenêtres de création (avec la note sur le chiffrement), d'invitation et de renommage. |
| `apps/site/tests/e2e/inventaire/messagerie.spec.ts` | Test d'inventaire de la refonte (section 8 de `docs/refonte/inventaire.md`). |
| `apps/site/app/messagerie/actions.ts` | Actions serveur. |
| `apps/site/lib/crypto.ts` | `encrypt` / `decrypt` : chiffrement des messages. |
| `apps/site/lib/unreadMessages.ts` | `countUnreadMessages` (pastille de la barre) et `countUnreadByConversation` (pastilles de la liste) : calcul des non-lus d'après la date de lecture de chaque participant. |
| `apps/site/lib/userSearch.ts` | `userSearchWhere` : filtre commun de recherche de coachs. |
| `apps/site/lib/mail.ts` | `sendPmNotification` : email de nouveau message (pseudo et extrait neutralisés par `escapeHtml`). |
| `apps/site/lib/notifications.ts` | `notifyPrivateMessage` : notification sous la cloche et email, appelée par `sendMessage` ; `markConversationNotificationsRead`, appelée par `getConversationMessages`. |

Actions serveur (`app/messagerie/actions.ts`) : `getConversations`, `getConversationMessages` (marque aussi la conversation comme lue pour le coach qui la lit), `sendMessage`, `startConversation`, `leaveConversation`, `searchUsers`, `inviteToGroup`, `renameConversation`. `startConversation` est aussi appelée par le profil public (`app/spy/[id]/page.tsx`).

## Les pièges

- Chaque action vérifie que le coach participe à la conversation avant de lire ou d'écrire.
- Les messages sont chiffrés avec la clé `ENCRYPTION_KEY`. Perdre ou changer cette clé rend tous les anciens messages illisibles.
- La recherche de coachs passe par `userSearchWhere` : recherche par pseudo seulement (jamais par email), sans les bannis ni les coachs bloqués dans un sens ou dans l'autre. Le blocage est aussi vérifié à la création d'une conversation, à l'invitation dans un groupe et à l'envoi dans une conversation à deux (`hasBlockBetween`, carte 050). Dans un groupe, un membre bloqué peut encore voir vos messages.
- `inviteToGroup` vérifie que l'auteur de l'invitation fait partie du groupe (avant la carte 050, n'importe quel membre pouvait s'ajouter à un groupe et en lire les messages).
- Un coach qui a quitté un groupe n'est plus affiché ni compté parmi les participants, ni dans la conversation ni dans la liste (carte 136). Il ne reçoit plus de mail, ne peut plus écrire dans le groupe, et un nouveau message ne le fait plus revenir : il faut l'inviter de nouveau (« Ajouter des participants »), ce qui le remet dans le groupe. Dans une conversation à deux, un nouveau message fait toujours réapparaître la conversation chez les deux coachs.
- Quitter une conversation (`leaveConversation`) marque seulement le départ du coach : elle disparaît de sa liste et reste intacte pour les autres. La conversation et tous ses messages ne sont supprimés que lorsque plus aucun participant n'y est présent (carte 170 ; avant, quitter une conversation à deux l'effaçait aussi chez l'autre).
- Reprise d'une conversation à deux (`startConversation`) : elle doit compter exactement les deux coachs, chacun avec sa participation, et personne d'autre. Une participation « partie » compte encore. Avant la carte 170, une conversation où il ne restait qu'un des deux (l'autre ayant supprimé son compte) était reprise : le destinataire n'y était jamais ajouté.
- **Non-lus par participant** (carte 170) : chaque participant a sa propre date de lecture (`ConversationParticipant.lastReadAt`). Ouvrir une conversation avance seulement la sienne. Ses non-lus sont les messages des autres écrits après cette date. Prisma ne sait pas comparer une date d'une table à une date d'une autre table : les compteurs passent par une requête SQL écrite à la main (`lib/unreadMessages.ts`). Le créateur d'une conversation et un coach invité dans un groupe partent de la date de création ou d'invitation : l'historique déjà échangé ne leur est pas signalé comme non lu.
- L'ancien champ `PrivateMessage.readAt` (une seule date de lecture par message, commune à tous : dans un groupe, le premier lecteur marquait le message lu pour tous) a été retiré de la base par la carte 171, avec l'accord du responsable du projet.
- Un coach ne peut pas avoir plus de 50 conversations (`CONVERSATION_LIMIT`).
- L'email de notification n'est envoyé qu'au premier message non lu du destinataire (d'après sa propre date de lecture), et seulement s'il l'a activé (`notifPm`). Il part avec `after()` de Next.js, qui laisse le serveur finir l'envoi après avoir répondu (carte 167 ; avant, il était lancé sans attendre et pouvait se perdre).
- La notification sous la cloche est créée pour chaque autre participant encore présent, une seule par conversation tant qu'elle n'est pas lue. Ouvrir la conversation la marque lue.
- Le rafraîchissement toutes les 10 secondes refait une requête complète (et avance la date de lecture du coach) : à surveiller pour la charge.
- Les actions d'écriture renvoient `{ success, error }` et les erreurs s'affichent en notification (carte 052). Les lectures `getConversations` et `getConversationMessages` renvoient `null` si le visiteur n'est pas connecté ou ne participe pas à la conversation ; `searchUsers` renvoie alors une liste vide.
- Un coach sans avatar est affiché avec l'avatar par défaut du site (silhouette aux couleurs du thème actif) grâce au composant commun `MemberAvatarImage` (carte 065). Avant, les composants de la messagerie demandaient l'image `/images/default-avatar.png`, qui n'existe pas : le serveur répondait « introuvable » (erreur 404) et le navigateur affichait une image cassée.
- Plein écran sur téléphone : la conversation n'a pas sa propre adresse (paramètre `?id=`), la coquille ne peut donc pas la reconnaître par son adresse comme les écrans de rédaction du forum (`isComposePath`). C'est la conversation qui pose l'attribut `data-fullscreen` ; `AppShell.css` retire alors la barre du bas et bloque le défilement de la page restée derrière. Le cadre recopie la position et la hauteur de `window.visualViewport` dans les variables `--chat-top` et `--chat-height`.
- Le fil est affiché en `flex-col-reverse` : les messages arrivent du plus récent au plus ancien, le plus récent est en bas, et le navigateur garde le fil calé en bas sans calcul de défilement.
- « Ajouter des participants » et « Renommer le groupe » ne sont proposés que dans un groupe (avant la carte 093, l'ajout était proposé partout, mais l'action le refusait dans une conversation à deux).
- Dette : les champs `user1Id` / `user2Id` de `Conversation` sont un ancien modèle, remplacé par `ConversationParticipant`.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Conversation | Échange privé entre deux coachs ou plus. |
| Groupe | Conversation à plus de deux, ou à laquelle on a donné un nom ; seule une conversation de groupe accepte invitations et renommage. |
| Participant | Coach membre d'une conversation (table `ConversationParticipant`). Quitter la conversation le marque comme parti (`deletedAt`). |
| Date de lecture | Moment jusqu'auquel un participant a lu une conversation (`lastReadAt`). Les messages des autres écrits ensuite sont ses non-lus. |
| Chiffrement (AES-256-GCM) | Le texte est rendu illisible dans la base ; seul le serveur, avec la clé, peut le relire. |
| Rafraîchissement automatique (*polling*) | La page redemande les messages au serveur à intervalle régulier, faute de notification en temps réel. |
| Blocage | Un coach peut en bloquer un autre depuis son profil (voir `docs/features/profil-membres/`). |

## État

- Marche : conversations à deux et en groupe, chiffrement, compteur de non-lus propre à chaque participant, notification sous la cloche et email de notification (carte 167).
- Manque : affichage des messages plus anciens que les 30 derniers, pagination de la liste au-delà de 20 conversations, redirection vers la connexion pour un visiteur, temps réel.
- Cartes : 049 (audit mobile), 065 (avatar par défaut), 093 (refonte : deux colonnes sur ordinateur, plein écran sur téléphone), 136 (départ d'un groupe), 170 (conversations orphelines, départ, lecture par participant), 171 (suppression de l'ancien champ `PrivateMessage.readAt` et de la fonction `getUnreadMessagesCount`, qui n'était plus appelée).
