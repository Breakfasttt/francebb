-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 20,
    "duration" INTEGER NOT NULL,
    "jokersUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizDailyWinner" (
    "date" DATETIME NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "streak" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "QuizDailyWinner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
