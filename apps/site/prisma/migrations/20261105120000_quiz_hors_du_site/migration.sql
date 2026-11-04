-- Carte 180 (ADR-0008) : le quiz quitte la base du site pour celle de l'application BBQuizz (apps/bbquizz) : ses cinq
-- tables et les quatre colonnes de scores de la fiche des membres (reprises dans la table QuizPlayerStats de
-- l'application). En production, cette migration ne doit être appliquée qu'après la reprise des données du quiz dans la
-- base de l'application et la comparaison du nombre de lignes (voir DEPLOY.md).

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "QuizDailyWinner" DROP CONSTRAINT "QuizDailyWinner_userId_fkey";

-- DropForeignKey
ALTER TABLE "QuizGame" DROP CONSTRAINT "QuizGame_userId_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestionSuggestion" DROP CONSTRAINT "QuizQuestionSuggestion_authorId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "quizAttemptsCount",
DROP COLUMN "quizBestScore",
DROP COLUMN "quizStreak",
DROP COLUMN "quizTotalScore";

-- DropTable
DROP TABLE "QuizAttempt";

-- DropTable
DROP TABLE "QuizDailyWinner";

-- DropTable
DROP TABLE "QuizGame";

-- DropTable
DROP TABLE "QuizQuestion";

-- DropTable
DROP TABLE "QuizQuestionSuggestion";

