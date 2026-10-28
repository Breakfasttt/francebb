-- Idempotent migration: the Mention table already exists in dev.db,
-- but the Prisma migration directory was missing migration.sql, which breaks deploy.

CREATE TABLE IF NOT EXISTS "Mention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "mentionerId" TEXT NOT NULL,
    "mentionedUserId" TEXT NOT NULL,
    "readAt" DATETIME,
    CONSTRAINT "Mention_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mention_mentionerId_fkey" FOREIGN KEY ("mentionerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mention_mentionedUserId_fkey" FOREIGN KEY ("mentionedUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Mention_mentionedUserId_idx" ON "Mention"("mentionedUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "Mention_postId_mentionedUserId_key" ON "Mention"("postId", "mentionedUserId");

