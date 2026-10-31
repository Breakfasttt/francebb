---
id: 136
title: "Participants partis toujours affichés"
epic: E01
app: site
depends_on: [102]
adr: 
verify: un coach qui a quitté un groupe de la messagerie n'apparaît plus dans la liste ni dans le nombre des participants ; test e2e qui le vérifie
---

# 136 — Participants partis toujours affichés

## Pourquoi

Bug trouvé pendant la refonte (carte 093). Quand un coach quitte un groupe de la messagerie, sa participation est marquée comme supprimée (champ `deletedAt`), mais les fonctions `getConversationMessages` et `getConversations` (`apps/site/app/messagerie/actions.ts`) ne tiennent pas compte de ce champ. Le coach parti reste donc affiché dans la liste des participants et compté dans leur nombre.

Au passage : la variable `otherId`, déclarée sans être utilisée dans `startConversation`, peut être retirée.

Cette carte est à traiter une fois la refonte (épic E08) terminée.

## Action

- Filtrer les participations supprimées (`deletedAt: null`) dans les deux fonctions, sans changer qui a le droit de lire la conversation.
- Retirer la variable inutile.
- Compléter le test `apps/site/tests/e2e/inventaire/messagerie.spec.ts`.
