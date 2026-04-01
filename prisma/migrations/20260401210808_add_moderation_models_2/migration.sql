-- AlterTable
ALTER TABLE "Ligue" ADD COLUMN "lat" REAL;
ALTER TABLE "Ligue" ADD COLUMN "lng" REAL;

-- CreateTable
CREATE TABLE "Block" (
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("blockerId", "blockedId"),
    CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModerationReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reporterId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedById" TEXT,
    "resolvedAt" DATETIME,
    CONSTRAINT "ModerationReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModerationReport_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModerationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "moderatorId" TEXT NOT NULL,
    "targetId" TEXT,
    "targetType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ModerationLog_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "moderationReason" TEXT,
    "moderatedBy" TEXT,
    "ligueId" TEXT,
    "ligueCustom" TEXT,
    CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Article_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_ligueId_fkey" FOREIGN KEY ("ligueId") REFERENCES "Ligue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("authorId", "content", "createdAt", "id", "isModerated", "ligueCustom", "ligueId", "moderatedBy", "moderationReason", "title", "updatedAt") SELECT "authorId", "content", "createdAt", "id", "isModerated", "ligueCustom", "ligueId", "moderatedBy", "moderationReason", "title", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
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
    "lat" REAL,
    "lng" REAL,
    "registrationsLocked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tournament_ligueId_fkey" FOREIGN KEY ("ligueId") REFERENCES "Ligue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tournament" ("address", "coachsPerTeam", "currentParticipants", "date", "days", "departement", "description", "endDate", "fridayArrival", "gameEdition", "gmapsUrl", "id", "isCDF", "isCGO", "isCancelled", "isFinished", "isNAF", "isTGE", "isTSC", "isTeam", "ligueCustom", "ligueId", "location", "lodgingAtVenue", "maxParticipants", "mealsIncluded", "name", "organizerId", "platform", "preRegistered", "price", "priceLodging", "priceMeals", "region", "regionNAF", "ruleset", "structure", "totalMatches", "ville") SELECT "address", "coachsPerTeam", "currentParticipants", "date", "days", "departement", "description", "endDate", "fridayArrival", "gameEdition", "gmapsUrl", "id", "isCDF", "isCGO", "isCancelled", "isFinished", "isNAF", "isTGE", "isTSC", "isTeam", "ligueCustom", "ligueId", "location", "lodgingAtVenue", "maxParticipants", "mealsIncluded", "name", "organizerId", "platform", "preRegistered", "price", "priceLodging", "priceMeals", "region", "regionNAF", "ruleset", "structure", "totalMatches", "ville" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ModerationReport_targetId_targetType_idx" ON "ModerationReport"("targetId", "targetType");
