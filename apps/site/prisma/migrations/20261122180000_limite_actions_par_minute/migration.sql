-- CreateTable
CREATE TABLE "ActionCounter" (
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ActionCounter_pkey" PRIMARY KEY ("userId","action","windowStart")
);

-- CreateIndex
CREATE INDEX "ActionCounter_windowStart_idx" ON "ActionCounter"("windowStart");

-- AddForeignKey
ALTER TABLE "ActionCounter" ADD CONSTRAINT "ActionCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

