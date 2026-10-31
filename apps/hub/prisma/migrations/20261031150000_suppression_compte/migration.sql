-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deletionEventId" TEXT,
ADD COLUMN     "deletionReminderSentAt" TIMESTAMP(3),
ADD COLUMN     "deletionScheduledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "bannedEmail" (
    "id" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bannedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bannedEmail_emailHash_key" ON "bannedEmail"("emailHash");

