-- CreateTable
CREATE TABLE "clientHook" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "eventsUrl" TEXT,
    "exportUrl" TEXT,
    "secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientHook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outboundEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "outboundEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientHook_clientId_key" ON "clientHook"("clientId");

-- CreateIndex
CREATE INDEX "outboundEvent_eventId_idx" ON "outboundEvent"("eventId");

-- CreateIndex
CREATE INDEX "outboundEvent_clientId_idx" ON "outboundEvent"("clientId");

-- CreateIndex
CREATE INDEX "outboundEvent_status_idx" ON "outboundEvent"("status");

