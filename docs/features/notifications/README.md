# Notifications du site

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`).

## À quoi ça sert

Une cloche dans la barre du site prévient le coach de ce qui le concerne : un membre l'a mentionné dans un message, quelqu'un a répondu dans un sujet qu'il suit, ou il a reçu un message privé. Avant la carte 167, ces événements n'étaient signalés que par e-mail, et ces e-mails se perdaient parfois. Les mentions ne passent plus du tout par e-mail : elles s'affichent seulement dans le site.

## Ce que voit le coach

- **La cloche**, dans la barre du haut, sur ordinateur (à gauche de l'enveloppe de la messagerie) comme sur téléphone (à droite du logo, pour ne pas ajouter un sixième onglet à la barre basse). Sa pastille compte les notifications non lues. Réservée au membre connecté.
- **`/notifications`** : la liste, de la plus récente à la plus ancienne, 30 par page. Une notification non lue a un fond coloré et un point. « Tout marquer comme lu » est en tête de page. Chaque ligne mène au bon endroit : la bonne page du sujet, directement sur le message concerné, ou la conversation de la messagerie.
- Une notification devient lue quand on l'ouvre depuis la liste, quand on lit le sujet jusqu'au message concerné, ou quand on ouvre la conversation.
- **Préférences** (profil, onglet « Gérer mon compte », bloc « Notifications ») : e-mail pour les messages privés, e-mail pour les sujets suivis, e-mails d'annonces, et « Suivre automatiquement mes sujets ». Les notifications du site elles-mêmes ne se désactivent pas.
- **Sur téléphone** : cloche de 44 pixels dans la barre du haut ; la page est une seule colonne, chaque ligne fait au moins 64 pixels de haut.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/lib/notifications.ts` | Création des notifications et envoi des e-mails restants : `notifyMentions`, `notifyFollowers`, `notifyPrivateMessage`, `followTopicAutomatically` ; lecture : `visibleNotificationsWhere`, `countUnreadNotifications`, `markTopicNotificationsRead`, `markConversationNotificationsRead`. |
| `apps/site/lib/mentionRules.ts` | `extractMentionIds` : lit les mentions d'un message (sans doublon, sans l'auteur, 10 au plus). Testé par `tests/unit/mentionRules.test.mjs`. |
| `apps/site/lib/htmlEscape.ts` | `escapeHtml` : neutralise un texte avant de l'insérer dans un e-mail. Testé par `tests/unit/htmlEscape.test.mjs`. |
| `apps/site/lib/forumPostLink.ts` | `forumPostHref` : adresse de la bonne page d'un sujet pour un message donné. |
| `apps/site/app/notifications/page.tsx` | La page `/notifications`. |
| `apps/site/app/notifications/[id]/route.ts` | Ouvre une notification : la marque lue et redirige vers le message ou la conversation. |
| `apps/site/app/notifications/actions.ts` | `getNotifications`, `markAllNotificationsRead`. |
| `apps/site/common/components/AppShell/AppShell.tsx`, `navCounts.ts` | La cloche et le compteur de sa pastille. |
| `apps/site/prisma/schema.prisma` | Table `Notification`, colonne `User.autoFollowTopics`. Migration `20261104210000_notifications`. |

Les actions du forum (`createTopic`, `createPost`, `updatePost`) et de la messagerie (`sendMessage`) appellent `lib/notifications.ts`.

## Les pièges

- **Qui est prévenu** : jamais l'auteur lui-même, ni un membre banni, ni un membre qui n'a pas accès au forum du sujet (rôles calculés par `accessibleRolesFor` de `lib/forumAccess.ts`), ni un membre qui a bloqué l'auteur ou que l'auteur a bloqué. Au plus 10 mentions par message : un message avec 500 mentions ne prévient que les 10 premiers.
- **Ce qui s'affiche** : toute lecture passe par `visibleNotificationsWhere`, qui cache les notifications d'un sujet supprimé ou devenu inaccessible (forum réservé, sujet déplacé).
- **Regroupement** : une seule notification non lue par sujet suivi et par conversation. Tant qu'elle n'est pas lue, les réponses et les messages suivants n'en créent pas d'autre.
- **E-mails** : ils partent avec `after()` de Next.js, qui laisse le serveur finir l'envoi après avoir répondu au membre. Un e-mail lancé sans attendre peut être coupé par l'hébergeur. Toute valeur insérée dans un e-mail passe par `escapeHtml`.
- **Base locale** : les requêtes de ces fonctions se suivent, sans `Promise.all`, car la base de développement ne sait pas traiter plusieurs requêtes à la fois (erreur « bind message supplies … parameters »).
- La colonne `User.notifMention` n'a plus d'effet ; elle reste en base en attendant l'accord du responsable pour la supprimer.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Notification | Ligne de la table `Notification` : un événement à signaler à un membre, lu ou non (`readAt`). |
| Abonnement automatique | Le membre suit tout seul un sujet qu'il crée ou auquel il répond (`User.autoFollowTopics`). |
| `after()` | Outil de Next.js qui exécute un travail après la réponse envoyée au navigateur, en gardant le serveur en vie jusqu'à la fin. |

## État

- Carte 167 : cloche, page `/notifications`, mentions lues à la création d'un sujet, d'une réponse et à la modification d'un message, abonnement automatique, e-mails fiables et neutralisés, annonces filtrées sur la préférence « Newsletter et annonces ». Test `tests/e2e/inventaire/notifications.spec.ts` ; la page est aussi visitée par le parcours de fin de carte.
- Manque : notification en temps réel (la pastille se met à jour au chargement d'une page), suppression des vieilles notifications lues, notification des réactions.
