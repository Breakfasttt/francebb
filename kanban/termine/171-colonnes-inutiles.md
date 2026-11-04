---
id: 171
title: "Supprimer les colonnes devenues inutiles"
epic: E10
app: site
depends_on: [167, 170]
verify: "les colonnes PrivateMessage.readAt et User.notifMention n'existent plus ; aucune ligne de code ne les lit ; pnpm check et le parcours de fin de carte passent"
---

# 171 — Supprimer les colonnes devenues inutiles

## Pourquoi

Deux colonnes de la base ne servent plus à rien depuis les cartes 167 et 170 :
- `PrivateMessage.readAt` : la lecture des messages privés est maintenant suivie par participant (`ConversationParticipant.lastReadAt`) ;
- `User.notifMention` : les mentions ne déclenchent plus d'e-mail, elles restent dans le site.

Les garder entretient la confusion (un développeur pourrait croire qu'elles sont lues). Le responsable a donné son accord pour les supprimer (4 novembre 2026), ce qui demande une migration avec `DROP COLUMN`.

## Action

1. Lister avec une recherche tout ce qui lit ou écrit ces colonnes (code, tests, export des données du membre, suppression de compte) et le retirer, ainsi que la fonction `getUnreadMessagesCount` de `app/forum/actions.ts`, qui n'est plus appelée.
2. Retirer les deux colonnes de `prisma/schema.prisma` et créer la migration.
3. Mettre à jour les fiches messagerie et profil.

## Résultat

Les deux colonnes ont été supprimées de la base locale par la migration `apps/site/prisma/migrations/20261105090000_colonnes_inutiles/migration.sql`, qui ne contient que les deux instructions `DROP COLUMN` attendues. Le client Prisma a été régénéré et sa version de cache (`CLIENT_VERSION` dans `apps/site/lib/prisma.ts`) est passée de v24 à v25, pour que le serveur de développement recharge le nouveau client.

Le code ne lit plus ces colonnes. La fiche d'un membre renvoyée par `app/api/users/[id]/route.ts` et l'export des données du membre (`lib/hub/memberExport.ts`) ne demandent plus `notifMention`. Le test `tests/e2e/bugs/tournois-ligues.spec.ts` ne remplit plus `readAt` en créant un message privé. La fonction `getUnreadMessagesCount` de `app/forum/actions.ts`, appelée nulle part, a été retirée. La suppression de compte (`lib/accountDeletion.ts`) ne touchait à aucune des deux colonnes. Les commentaires du profil qui annonçaient que `notifMention` restait en base ont été corrigés, ainsi que les fiches messagerie, profil des membres et notifications. Le registre RGPD ne citait pas ces colonnes et n'a pas été modifié.

Les champs `readAt` encore présents dans le code appartiennent tous à la table `Notification` et sont toujours utilisés.
