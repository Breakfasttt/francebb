# Messagerie

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

La messagerie permet aux coachs de s'écrire en privé, à deux ou en groupe, sans passer par le forum. Les messages sont chiffrés dans la base de données, et un email peut prévenir le destinataire d'un nouveau message.

## Ce que voit le coach

- `/messagerie` : la liste de ses 20 conversations les plus récentes (l'action sait paginer, mais la page ne montre pas de pagination), avec le dernier message et le nombre de messages non lus. Le bouton « Nouvelle conversation » ouvre une fenêtre de recherche de coachs.
- `/messagerie?id=…` : une conversation. Le coach lit les 30 derniers messages, écrit avec l'éditeur BBCode, et peut, dans un groupe, inviter d'autres coachs, renommer la conversation ou la quitter. La conversation se rafraîchit toute seule toutes les 10 secondes.
- `/messagerie?userId=…` : ouvre directement une conversation avec un coach (lien depuis la liste des membres ou un profil). Si une conversation à deux existe déjà, elle est reprise.
- Accès : membres connectés uniquement. Un visiteur non connecté voit seulement « Aucune conversation pour le moment » (l'erreur est cachée), sans être invité à se connecter.
- **Sur téléphone** (et tablette : `@media (max-width: 1024px)` à la fin de `app/messagerie/page.css`, seuil unique de la carte 055, pas de fichier `page-mobile.css`) : la page prend toute la largeur avec une marge de 1rem et un espace de 8rem en bas ; les bulles de message prennent jusqu'à 90 % de la largeur ; la zone des messages fait 500 pixels de haut, au plus 70 % de l'écran. Le bouton retour du `PageHeader` ramène à la liste. Quelques règles de la messagerie sont aussi dans `app/profile/page-mobile.css` (`.conversation-card`, `.conv-view-header`…), ce qui est déroutant.
- **À vérifier** : le comportement de l'éditeur BBCode quand le clavier du téléphone s'ouvre (la zone de saisie reste-t-elle visible ?), et la taille des boutons des fenêtres d'invitation et de renommage.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/messagerie/page.tsx` | Page client : affiche la liste ou la conversation selon l'adresse. |
| `apps/site/app/messagerie/component/ConversationList.tsx` | Liste des conversations et compteur de non-lus. |
| `apps/site/app/messagerie/component/ConversationView.tsx` | Fil de messages, saisie, rafraîchissement automatique. |
| `apps/site/app/messagerie/component/ChatBubble.tsx` | Une bulle de message. |
| `apps/site/app/messagerie/component/NewConversationModal.tsx`, `InviteParticipantModal.tsx`, `RenameConversationModal.tsx` | Fenêtres de création, d'invitation et de renommage. |
| `apps/site/app/messagerie/actions.ts` | Actions serveur. |
| `apps/site/lib/crypto.ts` | `encrypt` / `decrypt` : chiffrement des messages. |
| `apps/site/lib/userSearch.ts` | `userSearchWhere` : filtre commun de recherche de coachs. |
| `apps/site/lib/mail.ts` | `sendPmNotification` : email de nouveau message. |

Actions serveur (`app/messagerie/actions.ts`) : `getConversations`, `getConversationMessages` (marque aussi les messages comme lus), `sendMessage`, `startConversation`, `leaveConversation`, `searchUsers`, `inviteToGroup`, `renameConversation`. `startConversation` est aussi appelée par le profil public (`app/spy/[id]/page.tsx`).

## Les pièges

- Chaque action vérifie que le coach participe à la conversation avant de lire ou d'écrire.
- Les messages sont chiffrés avec la clé `ENCRYPTION_KEY`. Perdre ou changer cette clé rend tous les anciens messages illisibles.
- La recherche de coachs passe par `userSearchWhere` : recherche par pseudo seulement (jamais par email), sans les bannis ni les coachs bloqués dans un sens ou dans l'autre. Le blocage est aussi vérifié à la création d'une conversation, à l'invitation dans un groupe et à l'envoi dans une conversation à deux (`hasBlockBetween`, carte 050). Dans un groupe, un membre bloqué peut encore voir vos messages.
- `inviteToGroup` vérifie que l'auteur de l'invitation fait partie du groupe (avant la carte 050, n'importe quel membre pouvait s'ajouter à un groupe et en lire les messages).
- Quitter une conversation où il ne reste alors qu'un participant **supprime la conversation et tous ses messages**, aussi pour l'autre coach (`leaveConversation`). C'est une suppression de données à garder en tête.
- Un coach ne peut pas avoir plus de 50 conversations (`CONVERSATION_LIMIT`).
- L'email de notification n'est envoyé qu'au premier message non lu, et seulement si le destinataire l'a activé (`notifPm`).
- Le rafraîchissement toutes les 10 secondes refait une requête complète (et marque les messages lus) : à surveiller pour la charge.
- Les actions d'écriture renvoient `{ success, error }` et les erreurs s'affichent en notification (carte 052). Les lectures `getConversations` et `getConversationMessages` renvoient `null` si le visiteur n'est pas connecté ou ne participe pas à la conversation ; `searchUsers` renvoie alors une liste vide.
- Un coach sans avatar est affiché avec l'avatar par défaut du site (silhouette aux couleurs du thème actif) grâce au composant commun `MemberAvatarImage` (carte 065). Avant, les composants de la messagerie demandaient l'image `/images/default-avatar.png`, qui n'existe pas : le serveur répondait « introuvable » (erreur 404) et le navigateur affichait une image cassée.
- Dette : la page utilise des types `any`. Les champs `user1Id` / `user2Id` de `Conversation` sont un ancien modèle, remplacé par `ConversationParticipant`.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Conversation | Échange privé entre deux coachs ou plus. |
| Groupe | Conversation à plus de deux, ou à laquelle on a donné un nom ; seule une conversation de groupe accepte invitations et renommage. |
| Participant | Coach membre d'une conversation (table `ConversationParticipant`). Quitter la conversation le marque comme parti (`deletedAt`). |
| Chiffrement (AES-256-GCM) | Le texte est rendu illisible dans la base ; seul le serveur, avec la clé, peut le relire. |
| Rafraîchissement automatique (*polling*) | La page redemande les messages au serveur à intervalle régulier, faute de notification en temps réel. |
| Blocage | Un coach peut en bloquer un autre depuis son profil (voir `docs/features/profil-membres/`). |

## État

- Marche : conversations à deux et en groupe, chiffrement, compteur de non-lus, email de notification.
- Manque : affichage des messages plus anciens que les 30 derniers, pagination de la liste au-delà de 20 conversations, redirection vers la connexion pour un visiteur, temps réel.
- Cartes : 049 (audit mobile), 065 (avatar par défaut).
