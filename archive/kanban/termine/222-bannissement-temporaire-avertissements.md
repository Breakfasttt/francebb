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
- Base : colonne `User.bannedUntil` et table `UserWarning` (migration `20261122140000_avertissements_bannissement_temporaire`, ajouts seulement).
- Bannissement temporaire : `BanUserDialog` demande une durée, obligatoire (1, 7 ou 30 jours, ou définitif). `toggleBanUser` l'enregistre et écrit `USER_TEMP_BANNED` au journal, avec la durée et la date de fin. La levée se fait dans le callback `jwt` d'`auth.ts` plutôt que dans `getActiveSession` : c'est lui qui relit le compte à chaque demande. Il appelle `liftExpiredBan` (`lib/banLift.ts`), dont la requête ne lève jamais un bannissement définitif posé entre-temps. `/banned` affiche « Compte suspendu » et la date de fin ; la fiche du membre et l'onglet « Coachs bannis » aussi. Cet onglet retrouve désormais aussi les bannissements temporaires (il ne lisait que `USER_BANNED`).
- Avertissement : bouton « Avertir » sur la fiche `/spy/[id]`, mêmes règles que le bannissement (`canBanMember`), motif obligatoire. Le membre reçoit une notification `USER_WARNED` qui ne nomme pas le modérateur et lit le motif en tête de son profil (`/profile#avertissements`). La modération voit tous ses avertissements, avec leur auteur, en tête de la colonne de contenu de la fiche. Journal : `USER_WARNED`.
- Tests : unitaires `tests/unit/banDuration.test.mjs` ; e2e dans `profil.spec.ts` (durée obligatoire, 7 jours, avertissement et notification, page `/banned` puis levée à l'échéance) ; tests existants adaptés au choix de la durée. Relecture `critique-ui` appliquée (liste à filets en pleine largeur, icône distincte pour « Avertir », boutons collés en bas de la fenêtre « Bannir » sur téléphone, textes).
- Au passage : le test « supprime définitivement un membre » attend la notification de réussite et relit la base avec patience (il échouait par moments sur la base locale).
- Limite connue : la levée automatique est écrite au journal au nom du compte `system`, créé par `firstSetup`. Il n'existe pas dans la base des tests e2e : l'écriture y échoue sans gêner la levée.
- À essayer à la main : dans `TESTS-MANUELS.md`.
