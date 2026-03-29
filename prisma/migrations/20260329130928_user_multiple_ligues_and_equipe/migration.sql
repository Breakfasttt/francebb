/*
  Warnings:

  - You are about to drop the column `ligueId` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_LigueMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LigueMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Ligue" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LigueMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'COACH',
    "nafNumber" TEXT,
    "region" TEXT,
    "signature" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "avatarFrame" TEXT DEFAULT 'auto',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "equipe" TEXT,
    "ligueCustom" TEXT,
    CONSTRAINT "User_role_fkey" FOREIGN KEY ("role") REFERENCES "RoleConfig" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatarFrame", "banReason", "email", "emailVerified", "id", "image", "isBanned", "ligueCustom", "nafNumber", "name", "region", "role", "signature", "theme") SELECT "avatarFrame", "banReason", "email", "emailVerified", "id", "image", "isBanned", "ligueCustom", "nafNumber", "name", "region", "role", "signature", "theme" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_LigueMembers_AB_unique" ON "_LigueMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_LigueMembers_B_index" ON "_LigueMembers"("B");
