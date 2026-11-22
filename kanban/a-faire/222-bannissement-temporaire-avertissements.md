---
id: 222
title: Bannissement temporaire et avertissements
---

# 222 — Bannissement temporaire et avertissements

## Pourquoi
Relevé pendant la carte 221. Aujourd'hui la modération n'a qu'un outil contre un membre : le bannissement définitif (`toggleBanUser`, `app/membres/actions.ts`). Pour un premier écart, c'est trop fort ; les modérateurs n'ont donc rien entre « rien » et « banni ».

## À faire
- Avertissement : le modérateur écrit un motif, le membre reçoit une notification et le voit sur son profil (lui seul et la modération). Historique des avertissements sur la fiche du membre (`/spy`, `/profile`).
- Bannissement temporaire : durée au choix (1, 7, 30 jours), date de fin enregistrée (nouvelle colonne, migration), levée automatique à la première connexion après la date (`getActiveSession`, `lib/authGuard.ts`), page `/banned` qui affiche la date de fin.
- Journal de modération : `USER_WARNED`, `USER_TEMP_BANNED` (`lib/moderationLog.ts`, libellés dans `LogsTab.tsx`).
- Mêmes règles de hiérarchie que `canBanMember` (`lib/roles.ts`), tests unitaires et e2e.
- Fiches `moderation`, `permissions`, `docs/features/INTERACTIONS.md`.

## Résultat
