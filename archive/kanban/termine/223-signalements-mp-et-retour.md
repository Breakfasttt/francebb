---
id: 223
title: Signaler un message privé, prévenir celui qui signale
---

# 223 — Signaler un message privé, prévenir celui qui signale

## Pourquoi
Relevé pendant la carte 221 :
- un membre harcelé en message privé ne peut que bloquer l'autre ; il ne peut pas le signaler à la modération. Le type `MESSAGE` existe déjà dans les signalements (`ReportsTab.tsx`) mais aucun écran de la messagerie ne l'utilise ;
- le membre qui signale n'apprend jamais si son signalement a été traité, ce qui décourage de signaler.

## À faire
- Messagerie : « Signaler » dans le menu d'un message reçu, via `ReportModal`. Les messages sont chiffrés (`lib/crypto.ts`) : décider avec le user ce que la modération peut lire (le seul message signalé, déchiffré à l'envoi du signalement) ; c'est une question de confidentialité.
- `createReportAction` et `canSeeReportTarget` (`app/moderation/actions.ts`, `lib/moderationReports.ts`) : accepter `MESSAGE` seulement pour un participant de la conversation.
- Nouveau type de notification `REPORT_HANDLED` : « Ton signalement a été traité », sans dire la sanction.
- Tests e2e, fiches `messagerie`, `moderation`, `notifications`.

## Résultat
- Décision du responsable (22/11/2026) : on signale la **conversation**, jamais un message. Un modérateur ou un admin ne peut en aucun cas lire la conversation, sauf si un participant l'y invite.
- Messagerie, menu « ⋯ » : « Signaler la conversation » (signalement `CONVERSATION`, réservé à un participant encore présent, sans aucun message) et « Inviter un modérateur » (liste des membres de pouvoir modérateur ou plus, non bannis ; confirmation obligatoire, car l'invitation ne se reprend pas). Après un signalement, la fenêtre d'invitation s'ouvre aussitôt. Le modérateur invité lit tout l'historique ; une conversation à deux devient un groupe, l'autre membre le voit arriver ; le modérateur reçoit la notification `MODERATOR_INVITED`.
- Modération : onglet « Conversations signalées » (participants, raison, précisions du membre qui signale, jamais de contenu). « Ouvrir la conversation » n'apparaît que pour un modérateur qui y a été invité.
- Retour à celui qui signale : `closeReports` (`lib/moderationReports.ts`) ferme les signalements et envoie `REPORT_HANDLED` (« La modération a traité ton signalement… », sans la décision) à chaque membre qui avait signalé, pour tous les types et aussi pour la fermeture automatique (masquage, suppression, bannissement). La notification mène au sujet ou à la conversation quand c'est possible.
- Aucun autre code ne lit les messages privés, sauf l'export de ses propres données par le membre.
- Tests : `reportRules.test.mjs` (type `CONVERSATION`) ; e2e dans `messagerie.spec.ts` (signalement sans contenu, modérateur qui ne peut pas lire, notification de traitement, invitation confirmée puis lecture). Relecture `critique-ui` appliquée (confirmation, enchaînement signalement puis invitation, erreur de chargement, textes).
- À essayer à la main : dans `TESTS-MANUELS.md`.
