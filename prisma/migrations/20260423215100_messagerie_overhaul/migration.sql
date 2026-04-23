-- AlterTable
ALTER TABLE "Category" ADD COLUMN "legacyId" TEXT;

-- AlterTable
ALTER TABLE "Forum" ADD COLUMN "legacyId" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN "legacyId" TEXT;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN "legacyId" TEXT;

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LegacyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "forumactifName" TEXT NOT NULL,
    "nafNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BBSchemeState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "creatorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BBSchemeState_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "user1Id" TEXT,
    "user2Id" TEXT,
    "user1DeletedAt" DATETIME,
    "user2DeletedAt" DATETIME,
    CONSTRAINT "Conversation_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Conversation_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Conversation" ("createdAt", "id", "updatedAt", "user1DeletedAt", "user1Id", "user2DeletedAt", "user2Id") SELECT "createdAt", "id", "updatedAt", "user1DeletedAt", "user1Id", "user2DeletedAt", "user2Id" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE INDEX "Conversation_user1Id_idx" ON "Conversation"("user1Id");
CREATE INDEX "Conversation_user2Id_idx" ON "Conversation"("user2Id");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'COACH',
    "nafNumber" TEXT,
    "region" TEXT,
    "signature" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "avatarFrame" TEXT DEFAULT 'auto',
    "theme" TEXT NOT NULL DEFAULT 'saison3',
    "equipe" TEXT,
    "ligueCustom" TEXT,
    "quizTotalScore" INTEGER NOT NULL DEFAULT 0,
    "quizBestScore" INTEGER NOT NULL DEFAULT 0,
    "quizStreak" INTEGER NOT NULL DEFAULT 0,
    "quizAttemptsCount" INTEGER NOT NULL DEFAULT 0,
    "legacyId" TEXT,
    "forumactifName" TEXT,
    "hasFinishedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "notifPm" BOOLEAN NOT NULL DEFAULT true,
    "notifMention" BOOLEAN NOT NULL DEFAULT true,
    "notifFollowedTopic" BOOLEAN NOT NULL DEFAULT true,
    "notifNewsletter" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "User_role_fkey" FOREIGN KEY ("role") REFERENCES "RoleConfig" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatarFrame", "banReason", "email", "emailVerified", "equipe", "id", "image", "isBanned", "ligueCustom", "nafNumber", "name", "quizAttemptsCount", "quizBestScore", "quizStreak", "quizTotalScore", "region", "role", "signature", "theme") SELECT "avatarFrame", "banReason", "email", "emailVerified", "equipe", "id", "image", "isBanned", "ligueCustom", "nafNumber", "name", "quizAttemptsCount", "quizBestScore", "quizStreak", "quizTotalScore", "region", "role", "signature", "theme" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_legacyId_key" ON "User"("legacyId");
CREATE INDEX "User_role_idx" ON "User"("role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_userId_conversationId_key" ON "ConversationParticipant"("userId", "conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "LegacyMember_email_key" ON "LegacyMember"("email");

-- CreateIndex
CREATE INDEX "LegacyMember_email_idx" ON "LegacyMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BBSchemeState_hash_key" ON "BBSchemeState"("hash");

-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- CreateIndex
CREATE INDEX "Article_ligueId_idx" ON "Article"("ligueId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_legacyId_key" ON "Category"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "Forum_name_key" ON "Forum"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Forum_legacyId_key" ON "Forum"("legacyId");

-- CreateIndex
CREATE INDEX "Forum_categoryId_idx" ON "Forum"("categoryId");

-- CreateIndex
CREATE INDEX "Forum_parentForumId_idx" ON "Forum"("parentForumId");

-- CreateIndex
CREATE INDEX "Ligue_creatorId_idx" ON "Ligue"("creatorId");

-- CreateIndex
CREATE INDEX "Mention_mentionerId_idx" ON "Mention"("mentionerId");

-- CreateIndex
CREATE INDEX "Mention_postId_idx" ON "Mention"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_legacyId_key" ON "Post"("legacyId");

-- CreateIndex
CREATE INDEX "Post_topicId_idx" ON "Post"("topicId");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "PrivateMessage_conversationId_idx" ON "PrivateMessage"("conversationId");

-- CreateIndex
CREATE INDEX "PrivateMessage_authorId_idx" ON "PrivateMessage"("authorId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_legacyId_key" ON "Topic"("legacyId");

-- CreateIndex
CREATE INDEX "Topic_forumId_idx" ON "Topic"("forumId");

-- CreateIndex
CREATE INDEX "Topic_authorId_idx" ON "Topic"("authorId");

-- CreateIndex
CREATE INDEX "Tournament_organizerId_idx" ON "Tournament"("organizerId");

-- CreateIndex
CREATE INDEX "Tournament_ligueId_idx" ON "Tournament"("ligueId");

-- CreateIndex
CREATE INDEX "TournamentMatch_roundId_idx" ON "TournamentMatch"("roundId");

-- CreateIndex
CREATE INDEX "TournamentMatch_coach1UserId_idx" ON "TournamentMatch"("coach1UserId");

-- CreateIndex
CREATE INDEX "TournamentMatch_coach2UserId_idx" ON "TournamentMatch"("coach2UserId");

-- CreateIndex
CREATE INDEX "TournamentResult_tournamentId_idx" ON "TournamentResult"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentResult_userId_idx" ON "TournamentResult"("userId");

-- CreateIndex
CREATE INDEX "TournamentRound_tournamentId_idx" ON "TournamentRound"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentTeam_tournamentId_idx" ON "TournamentTeam"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentTeam_captainId_idx" ON "TournamentTeam"("captainId");

-- CreateIndex
CREATE INDEX "TournamentTeamMember_teamId_idx" ON "TournamentTeamMember"("teamId");

-- CreateIndex
CREATE INDEX "TournamentTeamMember_userId_idx" ON "TournamentTeamMember"("userId");

