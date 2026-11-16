---
id: 167
title: "Notifications dans le site (mentions, sujets suivis, messages)"
epic: E10
app: site
depends_on: [166]
verify: "une cloche dans la barre du site affiche les notifications non lues (mentions, réponses dans les sujets suivis, messages privés) ; les mentions n'envoient plus d'e-mail ; les e-mails restants (messages privés, sujets suivis, modération et administration) partent de façon fiable et leurs textes sont neutralisés ; un membre sans accès au forum n'est jamais notifié"
---

# 167 — Notifications dans le site

## Pourquoi

Aujourd'hui, les mentions et les sujets suivis ne préviennent que par e-mail. Ces e-mails se perdent au hasard (ils sont envoyés sans attendre leur fin), insèrent le titre du sujet sans précaution, et préviennent des membres qui n'ont pas accès au forum (audit, sections 2.6 et 3.1).

Décision du responsable (4 novembre 2026) : un système de notifications interne au site. Les e-mails sont réservés à la messagerie privée, aux sujets suivis et aux e-mails de modération et d'administration ; les mentions restent internes au site.

## Action

1. Modèle `Notification` : destinataire, type, sujet ou conversation, message, auteur, lu ou non, date.
2. Création des notifications : mention (dans un nouveau sujet, une réponse ou une modification), réponse dans un sujet suivi, message privé. Les destinataires sont filtrés selon leurs droits sur le forum et les blocages ; au plus 10 mentions par message.
3. Une cloche dans la barre du site (téléphone et ordinateur) avec une pastille, et une page `/notifications` (tout marquer lu, lien vers le bon message).
4. E-mails : plus d'e-mail de mention ; les e-mails restants sont envoyés avec `after()` de Next.js, pour que le serveur attende leur fin ; le titre, le nom et l'extrait sont neutralisés avant d'être insérés dans le HTML ; les annonces respectent la préférence « Newsletter et annonces ».
5. Abonnement automatique à un sujet que l'on crée ou auquel on répond (désactivable dans le profil).

## Résultat

Le site a maintenant ses propres notifications. Une nouvelle table `Notification` (migration `20261104210000_notifications`, sans aucune suppression de données) garde, pour chaque membre, les mentions, les réponses dans les sujets suivis et les messages privés, avec leur date de lecture. Les réponses d'un même sujet et les messages d'une même conversation sont regroupés : une seule notification non lue à la fois. Le code est rangé dans `apps/site/lib/notifications.ts`, et la fiche `docs/features/notifications/README.md` explique son fonctionnement.

Une cloche avec une pastille est affichée dans la barre du haut, sur ordinateur et sur téléphone (à droite du logo, la barre basse garde ses cinq onglets). Elle mène à la page `/notifications` : la liste des 30 dernières notifications, « Tout marquer comme lu », et un lien par ligne qui marque la notification lue et ouvre la bonne page du sujet, sur le bon message, ou la conversation. Les notifications d'un sujet supprimé ou devenu inaccessible ne s'affichent pas et ne sont pas comptées. Lire un sujet ou ouvrir une conversation marque aussi ses notifications comme lues.

Les mentions sont lues à la création d'un sujet, dans une réponse et à la modification d'un message, avec 10 mentions au plus par message. Un membre n'est jamais prévenu s'il n'a pas accès au forum, s'il est banni, ou s'il y a un blocage entre lui et l'auteur ; on ne peut plus suivre un sujet inaccessible. Les mentions n'envoient plus d'e-mail. Les e-mails des sujets suivis et des messages privés partent avec `after()` de Next.js, et chaque valeur insérée dans un e-mail passe par `escapeHtml` (`lib/htmlEscape.ts`). Les annonces de l'administration ne partent plus qu'aux membres qui acceptent « Newsletter et annonces », et un envoi qui échoue n'est plus compté comme réussi.

Le membre suit automatiquement les sujets qu'il crée et ceux auxquels il répond. Une nouvelle préférence, « Suivre automatiquement mes sujets » (colonne `User.autoFollowTopics`, activée par défaut), permet de l'arrêter dans le bloc « Notifications » du profil. L'interrupteur « Mentions » a été retiré de cet écran ; la colonne `User.notifMention` reste en base sans effet, car la supprimer demande l'accord du responsable.

Vérifications : `corepack pnpm check` passe ; deux nouveaux fichiers de tests unitaires (`htmlEscape.test.mjs`, `mentionRules.test.mjs`) ; le nouveau test `tests/e2e/inventaire/notifications.spec.ts`, lancé seul, passe (mention, filtre d'un forum réservé, abonnement automatique, cloche de 44 pixels sur téléphone, lien vers le bon message, « Tout marquer comme lu ») ; le parcours de fin de carte passe, page `/notifications` comprise, sans erreur serveur. Le test d'inventaire du profil a été adapté sans être lancé.

Reste à faire, à proposer en cartes : supprimer la colonne `notifMention` (accord du responsable), faire passer le calcul de la page d'un message de la page d'un sujet, de la recherche et de `updatePost` par `forumPostHref`, effacer les vieilles notifications lues, et mettre la pastille à jour sans recharger la page.
