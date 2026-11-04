-- Carte 170 : chaque participant d'une conversation a sa propre date de lecture.
-- Avant, un seul champ « readAt » par message servait pour tout le monde : dans un groupe, le premier qui lisait
-- un message le marquait lu pour tous les autres.
-- 1. Nouvelle colonne facultative « lastReadAt » sur la participation : les messages des autres écrits après cette
--    date sont les non-lus de ce participant.
-- 2. Initialisation, pour qu'aucun ancien message n'apparaisse soudain comme non lu :
--    - s'il reste des messages des autres jamais lus (« readAt » vide), la date est placée juste avant le plus
--      ancien d'entre eux (une milliseconde avant), ce qui garde les mêmes non-lus qu'avant ;
--    - sinon, tout était lu : la date est celle de la migration.
-- Aucune ligne ni colonne n'est supprimée : l'ancien champ « readAt » reste en base, il n'est simplement plus utilisé.
-- Pour revenir en arrière : ALTER TABLE "ConversationParticipant" DROP COLUMN "lastReadAt";
ALTER TABLE "ConversationParticipant" ADD COLUMN "lastReadAt" TIMESTAMP(3);

UPDATE "ConversationParticipant" AS p
SET "lastReadAt" = COALESCE(
  (
    SELECT MIN(m."createdAt") - INTERVAL '1 millisecond'
    FROM "PrivateMessage" AS m
    WHERE m."conversationId" = p."conversationId"
      AND m."authorId" <> p."userId"
      AND m."readAt" IS NULL
  ),
  NOW()
);
