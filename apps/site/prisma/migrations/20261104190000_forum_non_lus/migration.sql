-- Carte 166 : non-lus du forum fiables et index de la base.

-- AlterTable
-- Dernier message visible de chaque sujet : sa date, son identifiant et son auteur.
ALTER TABLE "Topic" ADD COLUMN     "lastPostAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastPostAuthorId" TEXT,
ADD COLUMN     "lastPostId" TEXT;

-- Remplissage à partir des messages existants : le plus récent des messages non supprimés de chaque sujet
-- (même ordre que la page du sujet : date de création, puis identifiant). Un sujet sans message visible garde
-- sa date de création.
UPDATE "Topic" AS t
SET "lastPostAt" = COALESCE(lp."createdAt", t."createdAt"),
    "lastPostId" = lp."id",
    "lastPostAuthorId" = lp."authorId"
FROM "Topic" AS t2
LEFT JOIN LATERAL (
  SELECT p."id", p."createdAt", p."authorId"
  FROM "Post" AS p
  WHERE p."topicId" = t2."id" AND p."isDeleted" = false
  ORDER BY p."createdAt" DESC, p."id" DESC
  LIMIT 1
) AS lp ON true
WHERE t."id" = t2."id";

-- AlterTable
-- Position de lecture d'un membre dans un sujet. Avant cette carte, tout ce qui précédait la date de la dernière
-- visite comptait comme lu : la position de départ est donc cette date.
ALTER TABLE "TopicView" ADD COLUMN     "lastReadPostAt" TIMESTAMP(3);
UPDATE "TopicView" SET "lastReadPostAt" = "lastViewedAt";
ALTER TABLE "TopicView" ALTER COLUMN "lastReadPostAt" SET NOT NULL;

-- AlterTable
-- Date avant laquelle tout le forum compte comme lu. Pour les membres existants, c'est la date de cette migration
-- (valeur par défaut) : les sujets jamais ouverts deviennent lus, les sujets déjà ouverts gardent leur état.
ALTER TABLE "User" ADD COLUMN     "forumReadAllAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "ModerationLog_targetId_idx" ON "ModerationLog"("targetId");

-- CreateIndex
CREATE INDEX "ModerationLog_createdAt_idx" ON "ModerationLog"("createdAt");

-- CreateIndex
CREATE INDEX "Post_topicId_createdAt_id_idx" ON "Post"("topicId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Topic_forumId_isArchived_isSticky_lastPostAt_idx" ON "Topic"("forumId", "isArchived", "isSticky", "lastPostAt");

-- CreateIndex
CREATE INDEX "TopicFollow_topicId_idx" ON "TopicFollow"("topicId");

-- CreateIndex
CREATE INDEX "TopicView_topicId_idx" ON "TopicView"("topicId");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_lastPostAuthorId_fkey" FOREIGN KEY ("lastPostAuthorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
