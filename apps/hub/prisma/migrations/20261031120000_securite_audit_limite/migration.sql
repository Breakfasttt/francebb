-- CreateTable
CREATE TABLE "auditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userHash" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,

    CONSTRAINT "rateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditLog_userHash_idx" ON "auditLog"("userHash");

-- CreateIndex
CREATE INDEX "auditLog_createdAt_idx" ON "auditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "rateLimit_key_key" ON "rateLimit"("key");

