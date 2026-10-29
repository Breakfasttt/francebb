-- CreateTable
CREATE TABLE "QuizGame" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionIds" TEXT[],
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "questionServedAt" TIMESTAMP(3),
    "score" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "fiftyUsed" BOOLEAN NOT NULL DEFAULT false,
    "communityUsed" BOOLEAN NOT NULL DEFAULT false,
    "skipUsed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizGame_userId_idx" ON "QuizGame"("userId");

-- AddForeignKey
ALTER TABLE "QuizGame" ADD CONSTRAINT "QuizGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

