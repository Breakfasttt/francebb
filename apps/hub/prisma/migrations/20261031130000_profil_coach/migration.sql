-- AlterTable
ALTER TABLE "user" ADD COLUMN     "locale" TEXT,
ADD COLUMN     "naf" TEXT,
ADD COLUMN     "nameKey" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "timezone" TEXT;

-- CreateTable
CREATE TABLE "reservedName" (
    "id" TEXT NOT NULL,
    "nameHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservedName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservedName_nameHash_key" ON "reservedName"("nameHash");

-- Comptes existants : clé d'unicité du pseudo en minuscules, sauf pour les pseudos déjà en double (laissés vides,
-- ils seront rendus uniques au prochain changement de pseudo). Langue et fuseau horaire par défaut.
UPDATE "user" u SET "nameKey" = lower(trim(u."name"))
WHERE NOT EXISTS (SELECT 1 FROM "user" o WHERE o."id" <> u."id" AND lower(trim(o."name")) = lower(trim(u."name")));
UPDATE "user" SET "locale" = 'fr', "timezone" = 'Europe/Paris' WHERE "locale" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_nameKey_key" ON "user"("nameKey");

