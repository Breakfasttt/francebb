---
id: 060
title: Débannissement : contrôle du rang
epic: E03
app: site
depends_on: []
adr:
verify: un modérateur ne peut pas débannir un membre de rang égal ou supérieur (test e2e) ; l'action est tracée au journal
---

# 060 — Débannissement : contrôle du rang

## Pourquoi

Repéré pendant la carte 051. `toggleBanUser` (`app/membres/actions.ts`) vérifie qu'un modérateur ne bannit pas un membre de rang égal ou supérieur, mais `unbanUserAction` (`app/moderation/actions.ts`) ne fait pas ce contrôle : un modérateur peut donc lever le bannissement d'un membre que seul un administrateur aurait dû pouvoir gérer. C'est une faille de droits.

## Action

- Faire passer `unbanUserAction` par le même contrôle de rang que `toggleBanUser` (réutiliser la fonction existante plutôt que la recopier).
- Tracer le débannissement au journal de modération s'il ne l'est pas déjà.
- Ajouter un test e2e qui vérifie le refus.
- Mettre à jour la fiche `docs/features/moderation/README.md`.

## Résultat

- `unbanUserAction` (`apps/site/app/moderation/actions.ts`) n'écrit plus elle-même en base : elle appelle `toggleBanUser(userId, false)` (`apps/site/app/membres/actions.ts`), la seule action de bannissement. Le débannissement passe donc par le même contrôle de rang (un modérateur ne peut agir que sur un rang strictement inférieur au sien, sauf Super Admin) et par la même entrée `USER_UNBANNED` au journal de modération. En cas de refus, le message d'erreur du serveur est renvoyé à l'onglet « Coachs bannis », qui l'affiche.
- Le message de refus de `toggleBanUser` dit maintenant « débannir » ou « bannir » selon l'action demandée.
- Nouveau test e2e dans `apps/site/tests/e2e/security.spec.ts` : depuis l'onglet « Coachs bannis », le modérateur de test essaie de débannir un modérateur banni (même rang) et reçoit un refus, le membre reste banni et rien n'est écrit au journal ; il débannit ensuite un coach, ce qui réussit et laisse une entrée `USER_UNBANNED` à son nom.
- Vérifications : `npx tsc --noEmit` sans erreur, `node scripts/lint-ratchet.mjs` à 551 erreurs pour un plafond de 551, `pnpm test:e2e` avec 52 tests réussis et 1 ignoré (l'audit mobile, ignoré volontairement). Aucune interface modifiée, donc pas de contrôle mobile supplémentaire.
