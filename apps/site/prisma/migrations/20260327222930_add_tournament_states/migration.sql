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
    CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tournament" ("address", "coachsPerTeam", "currentParticipants", "date", "days", "departement", "description", "endDate", "fridayArrival", "gameEdition", "gmapsUrl", "id", "isCDF", "isCGO", "isNAF", "isTGE", "isTSC", "isTeam", "location", "lodgingAtVenue", "maxParticipants", "mealsIncluded", "name", "organizerId", "platform", "preRegistered", "price", "priceLodging", "priceMeals", "region", "regionNAF", "ruleset", "structure", "totalMatches", "ville") SELECT "address", "coachsPerTeam", "currentParticipants", "date", "days", "departement", "description", "endDate", "fridayArrival", "gameEdition", "gmapsUrl", "id", "isCDF", "isCGO", "isNAF", "isTGE", "isTSC", "isTeam", "location", "lodgingAtVenue", "maxParticipants", "mealsIncluded", "name", "organizerId", "platform", "preRegistered", "price", "priceLodging", "priceMeals", "region", "regionNAF", "ruleset", "structure", "totalMatches", "ville" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
