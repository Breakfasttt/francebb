/*
  Warnings:

  - You are about to drop the column `league` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Ligue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "geographicalZone" TEXT,
    "gmapsUrl" TEXT,
    "region" TEXT,
    "departement" TEXT,
    "ville" TEXT,
    "address" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "Ligue_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_LigueCommissaires" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LigueCommissaires_A_fkey" FOREIGN KEY ("A") REFERENCES "Ligue" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LigueCommissaires_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "endDate" DATETIME,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "gmapsUrl" TEXT,
    "ville" TEXT,
    "departement" TEXT,
    "region" TEXT,
    "regionNAF" TEXT,
    "description" TEXT,
    "maxParticipants" INTEGER,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "preRegistered" INTEGER NOT NULL DEFAULT 0,
    "isTeam" BOOLEAN NOT NULL DEFAULT false,
    "coachsPerTeam" INTEGER NOT NULL DEFAULT 1,
    "days" TEXT DEFAULT '1',
    "totalMatches" INTEGER,
    "price" REAL,
    "priceMeals" REAL,
    "priceLodging" REAL,
    "structure" TEXT,
    "lodgingAtVenue" BOOLEAN NOT NULL DEFAULT false,
    "ruleset" TEXT,
    "mealsIncluded" BOOLEAN NOT NULL DEFAULT false,
    "fridayArrival" BOOLEAN NOT NULL DEFAULT false,
    "gameEdition" TEXT,
    "platform" TEXT DEFAULT 'Tabletop',
    "isNAF" BOOLEAN NOT NULL DEFAULT false,
    "isCDF" BOOLEAN NOT NULL DEFAULT false,
    "isCGO" BOOLEAN NOT NULL DEFAULT false,
    "isTGE" BOOLEAN NOT NULL DEFAULT false,
    "isTSC" BOOLEAN NOT NULL DEFAULT false,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "organizerId" TEXT NOT NULL,
    "ligueId" TEXT,
    "ligueCustom" TEXT,
    CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tournament_ligueId_fkey" FOREIGN KEY ("ligueId") REFERENCES "Ligue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tournament" ("address", "coachsPerTeam", "currentParticipants", "date", "days", "departement", "description", "endDate", "fridayArrival", "gameEdition", "gmapsUrl", "id", "isCDF", "isCGO", "isCancelled", "isFinished", "isNAF", "isTGE", "isTSC", "isTeam", "location", "lodgingAtVenue", "maxParticipants", "mealsIncluded", "name", "organizerId", "platform", "preRegistered", "price", "priceLodging", "priceMeals", "region", "regionNAF", "ruleset", "structure", "totalMatches", "ville") SELECT "address", "coachsPerTeam", "currentParticipants", "date", "days", "departement", "description", "endDate", "fridayArrival", "gameEdition", "gmapsUrl", "id", "isCDF", "isCGO", "isCancelled", "isFinished", "isNAF", "isTGE", "isTSC", "isTeam", "location", "lodgingAtVenue", "maxParticipants", "mealsIncluded", "name", "organizerId", "platform", "preRegistered", "price", "priceLodging", "priceMeals", "region", "regionNAF", "ruleset", "structure", "totalMatches", "ville" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
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
    "ligueId" TEXT,
    "ligueCustom" TEXT,
    CONSTRAINT "User_role_fkey" FOREIGN KEY ("role") REFERENCES "RoleConfig" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_ligueId_fkey" FOREIGN KEY ("ligueId") REFERENCES "Ligue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatarFrame", "banReason", "email", "emailVerified", "id", "image", "isBanned", "nafNumber", "name", "region", "role", "signature", "theme") SELECT "avatarFrame", "banReason", "email", "emailVerified", "id", "image", "isBanned", "nafNumber", "name", "region", "role", "signature", "theme" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_LigueCommissaires_AB_unique" ON "_LigueCommissaires"("A", "B");

-- CreateIndex
CREATE INDEX "_LigueCommissaires_B_index" ON "_LigueCommissaires"("B");
