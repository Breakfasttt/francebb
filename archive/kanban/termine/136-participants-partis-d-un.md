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

## Résultat

- `getConversations` et `getConversationMessages` retirent des groupes les participations marquées supprimées (`deletedAt`), par une petite fonction `withoutLeftMembers`. Une conversation à deux garde ses deux membres, pour que son en-tête affiche toujours le nom de l'autre. Le droit de lire n'a pas changé : il reste vérifié sur la participation du lecteur.
- La variable inutile `otherId` de `startConversation` est retirée.
- Corrections liées, sans lesquelles le coach parti revenait aussitôt : `sendMessage` ne remet plus les membres partis d'un groupe (seulement ceux d'une conversation à deux), refuse un message d'un membre qui a quitté le groupe et n'envoie plus de mail aux membres partis ; `inviteToGroup` remet dans le groupe un membre parti qu'on invite de nouveau (la fenêtre d'invitation le propose maintenant, puisqu'il n'est plus dans la liste).
- `ConversationList.tsx` : un groupe réduit à deux membres reste affiché comme un groupe (avant, seul le nombre de participants décidait).
- Fichiers : `apps/site/app/messagerie/actions.ts`, `apps/site/app/messagerie/component/ConversationList.tsx`, fiche `docs/features/messagerie/README.md`.
- Test écrit, non lancé : `apps/site/tests/e2e/bugs/tournois-ligues.spec.ts`, test « 136 » (et non dans `inventaire/messagerie.spec.ts`, pour ne pas toucher aux fichiers de test des autres lots).
- À essayer à la main : dans un groupe de trois, un membre quitte ; les deux autres voient « 2 participants » ; un nouveau message ne le fait pas revenir.
