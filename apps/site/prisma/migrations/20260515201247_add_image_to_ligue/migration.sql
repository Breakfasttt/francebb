-- AlterTable
ALTER TABLE "Ligue" ADD COLUMN "image" TEXT;

-- CreateTable
CREATE TABLE "MailLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "type" TEXT
);
