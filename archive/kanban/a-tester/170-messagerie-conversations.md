---
id: 170
title: "Messagerie : conversations orphelines, départ et lecture par participant"
epic: E10
app: site
depends_on: []
verify: "écrire à un membre ne retombe jamais dans une conversation où il n'est pas ; quitter une conversation à deux ne l'efface pas chez l'autre ; dans un groupe, chaque participant a ses propres non-lus"
---

# 170 — Messagerie : conversations orphelines, départ et lecture par participant

## Pourquoi

Audit, section 4.2 : une nouvelle conversation peut atterrir dans une conversation orpheline (et même renvoyer l'identifiant de celle d'un autre membre), quitter une conversation à deux l'efface chez l'autre, et dans un groupe le premier lecteur marque tout lu pour tout le monde.

## Action

1. La recherche d'une conversation existante exige exactement les deux participants, tous deux présents.
2. Quitter ne supprime la conversation que s'il n'y reste plus personne.
3. Une date « lu jusqu'à » par participant remplace le champ unique `readAt` pour le calcul des non-lus.

## Résultat

**Conversation à deux reprise à tort.** Dans `apps/site/app/messagerie/actions.ts`, `startConversation` ne reprend plus une conversation à deux que si elle contient exactement les deux coachs : chacun y a sa participation, et aucun autre membre n'y figure. Une participation marquée « partie » compte encore, car dans une conversation à deux partir revient seulement à la retirer de sa liste. Une conversation où il ne reste qu'un des deux (après la suppression d'un compte) n'est donc plus jamais reprise : une nouvelle conversation est créée et le destinataire en fait bien partie.

**Quitter une conversation.** `leaveConversation` marque seulement le départ du coach, comme pour les groupes depuis la carte 136. La conversation et ses messages ne sont supprimés que lorsque plus aucun participant n'y est présent. Quitter une conversation à deux ne l'efface donc plus chez l'autre.

**Lecture par participant.** La table `ConversationParticipant` reçoit une colonne `lastReadAt`, la date jusqu'à laquelle ce participant a lu la conversation. Ouvrir une conversation avance seulement sa propre date. Ses non-lus sont les messages des autres écrits après cette date. Le calcul est regroupé dans le nouveau fichier `apps/site/lib/unreadMessages.ts`, utilisé par la liste des conversations et par la pastille de la barre de navigation (`common/components/AppShell/navCounts.ts`). L'e-mail « premier message non lu » s'appuie aussi sur la date de lecture du destinataire. Le créateur d'une conversation et un coach invité dans un groupe partent de la date de création ou d'invitation, pour que l'historique ne leur soit pas signalé comme non lu.

**Migration** `20261104120000_messagerie_lecture_par_participant`. Elle ajoute la colonne, puis la remplit pour qu'aucun ancien message ne devienne non lu : s'il restait des messages des autres jamais lus, la date est placée juste avant le plus ancien d'entre eux ; sinon, elle vaut la date de la migration. Elle ne contient aucune suppression. La commande `pnpm db:migrate` a échoué sur le poste, non à cause d'une dérive du schéma, mais parce que la base « fantôme » temporaire que crée Prisma est copiée de `template1`, qui est aussi la base de développement et contient déjà les tables. La migration a donc été écrite à partir de `prisma migrate diff` (qui ne montrait que la nouvelle colonne), puis appliquée avec `prisma migrate deploy`, qui n'efface rien. Le numéro de version du client Prisma gardé en mémoire par le serveur de développement (`lib/prisma.ts`) passe de v19 à v20, pour que ce serveur reconnaisse la nouvelle colonne sans redémarrage.

**Vérifications.** `pnpm check` passe. Un script temporaire a vérifié sur la base locale, avec des données créées puis supprimées, que l'ancienne recherche reprenait bien une conversation orpheline et que la nouvelle ne la reprend plus, qu'une conversation à deux dont un des coachs est parti est toujours reprise, qu'après un départ il reste un participant présent, et que dans un groupe chacun a ses propres non-lus. Après la migration, aucune participation existante n'est restée sans date de lecture. Les données de départ du test d'inventaire `tests/e2e/inventaire/messagerie.spec.ts` utilisent maintenant la date de lecture ; ce test n'a pas été relancé.

**Reste à faire.**
- L'ancien champ `PrivateMessage.readAt` n'est plus utilisé mais reste en base : le supprimer demande une migration avec `DROP COLUMN`, donc l'accord du responsable du projet. Le test `tests/e2e/bugs/tournois-ligues.spec.ts` le remplit encore, sans effet.
- La fonction `getUnreadMessagesCount` de `apps/site/app/forum/actions.ts` lit encore `readAt` et l'ancien modèle de conversation (`user1Id`, `user2Id`), mais aucun code ne l'appelle : elle n'a pas été touchée, car une autre carte modifie ce fichier. Elle peut être supprimée plus tard.
- Les conversations déjà orphelines en base (un seul participant restant) ne sont pas nettoyées : elles restent visibles pour leur dernier membre, qui peut la quitter pour la supprimer.
- Le parcours à l'écran (`test:parcours`) reste à lancer au moment de `/ship`.

Correction après coup : le parcours de fin de carte a montré que le compteur de la barre de navigation échouait à chaque page (`invalid input syntax for type boolean`). `lib/unreadMessages.ts` utilisait des morceaux de requête `Prisma.sql` et `Prisma.join` importés du client généré, qui ne sont pas reconnus par le client réel : ils partaient vers la base comme une simple valeur. La condition est maintenant écrite en entier dans chaque requête, et la liste des conversations passe par `= ANY(...)`. Le parcours de fin de carte passe sans erreur.
