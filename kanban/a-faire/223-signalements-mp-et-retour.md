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
