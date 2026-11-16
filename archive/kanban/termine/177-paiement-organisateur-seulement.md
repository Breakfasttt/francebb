---
id: 177
title: "Paiement des inscrits réservé à l'organisateur et aux commissaires"
epic: E10
app: site
depends_on: [174]
verify: "un modérateur qui n'est ni organisateur ni commissaire ne reçoit plus l'état de paiement dans la page d'un tournoi, et le serveur refuse qu'il le modifie ; l'organisateur et les commissaires le voient et le modifient toujours"
---

# 177 — Paiement des inscrits réservé à l'organisateur et aux commissaires

## Pourquoi

La carte 174 a relevé une incohérence : l'écran ne montrait les réglages de paiement qu'à l'organisateur et aux commissaires du tournoi, mais l'action serveur qui enregistre la modification (`updateRegistrationStatus`) acceptait aussi un modérateur du site. Décision du responsable (4 novembre 2026) : le paiement est l'affaire de l'organisateur et des commissaires ; un modérateur peut nommer un commissaire si l'organisateur est absent.

## Action

Dans `updateRegistrationStatus`, refuser un changement de paiement venant de quelqu'un qui n'est ni organisateur ni commissaire. Dans la page d'un sujet de tournoi, ne charger l'état de paiement que pour l'organisateur et les commissaires.

## Résultat

`app/forum/actions.ts` : `updateRegistrationStatus` refuse désormais, avec un message clair, un changement de paiement envoyé par un modérateur qui n'est ni organisateur ni commissaire (le changement de statut d'inscription reste possible comme avant). `app/forum/topic/[id]/page.tsx` : nouvelle condition `canManagePayments` (organisateur ou commissaire), qui remplace `canEditTournament` pour le chargement de l'état de paiement. Fiche `docs/features/tournois/README.md` mise à jour. `pnpm check` et le parcours de fin de carte passent.
