-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "imageUrl" TEXT,
    "options" TEXT NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "timesOption0" INTEGER NOT NULL DEFAULT 0,
    "timesOption1" INTEGER NOT NULL DEFAULT 0,
    "timesOption2" INTEGER NOT NULL DEFAULT 0,
    "timesOption3" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 20,
    "duration" INTEGER NOT NULL,
    "jokersUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "QuizDailyWinner" (
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "QuizDailyWinner_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "QuizQuestionSuggestion" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "imageUrl" TEXT,
    "options" TEXT NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT,
    "authorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestionSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizPlayerStats" (
    "userId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizPlayerStats_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE INDEX "QuizGame_userId_idx" ON "QuizGame"("userId");

