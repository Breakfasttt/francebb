-- CreateTable
CREATE TABLE "ForumModerator" (
    "forumId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumModerator_pkey" PRIMARY KEY ("forumId","userId")
);

-- CreateIndex
CREATE INDEX "ForumModerator_userId_idx" ON "ForumModerator"("userId");

-- AddForeignKey
ALTER TABLE "ForumModerator" ADD CONSTRAINT "ForumModerator_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "Forum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumModerator" ADD CONSTRAINT "ForumModerator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

