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
    "quizTotalScore" INTEGER NOT NULL DEFAULT 0,
    "quizBestScore" INTEGER NOT NULL DEFAULT 0,
    "quizStreak" INTEGER NOT NULL DEFAULT 0,
    "quizAttemptsCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "User_role_fkey" FOREIGN KEY ("role") REFERENCES "RoleConfig" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatarFrame", "banReason", "email", "emailVerified", "equipe", "id", "image", "isBanned", "ligueCustom", "nafNumber", "name", "region", "role", "signature", "theme") SELECT "avatarFrame", "banReason", "email", "emailVerified", "equipe", "id", "image", "isBanned", "ligueCustom", "nafNumber", "name", "region", "role", "signature", "theme" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
