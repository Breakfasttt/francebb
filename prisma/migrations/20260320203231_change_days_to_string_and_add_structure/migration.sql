-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "ville" TEXT,
    "departement" TEXT,
    "region" TEXT,
    "description" TEXT,
    "maxParticipants" INTEGER,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "preRegistered" INTEGER NOT NULL DEFAULT 0,
    "days" TEXT DEFAULT '1',
    "totalMatches" INTEGER,
    "price" REAL,
    "structure" TEXT,
    "lodgingAtVenue" BOOLEAN NOT NULL DEFAULT false,
    "ruleset" TEXT,
    "mealsIncluded" BOOLEAN NOT NULL DEFAULT false,
    "fridayArrival" BOOLEAN NOT NULL DEFAULT false,
    "gameEdition" TEXT,
    "organizerId" TEXT NOT NULL,
    CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tournament" ("currentParticipants", "date", "days", "departement", "description", "fridayArrival", "gameEdition", "id", "location", "lodgingAtVenue", "maxParticipants", "mealsIncluded", "name", "organizerId", "preRegistered", "price", "region", "ruleset", "totalMatches", "ville") SELECT "currentParticipants", "date", "days", "departement", "description", "fridayArrival", "gameEdition", "id", "location", "lodgingAtVenue", "maxParticipants", "mealsIncluded", "name", "organizerId", "preRegistered", "price", "region", "ruleset", "totalMatches", "ville" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
