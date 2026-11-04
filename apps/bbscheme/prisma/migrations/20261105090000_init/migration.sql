-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "BBSchemeState" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "creatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BBSchemeState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BBSchemeState_hash_key" ON "BBSchemeState"("hash");

