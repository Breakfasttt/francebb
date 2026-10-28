-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PRE_REGISTERED', 'REGISTERED', 'WAITING_LIST');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOT_PAID', 'PAID', 'AT_TOURNAMENT', 'GUEST', 'DEPANNAGE');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
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

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("blockerId","blockedId")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "address" TEXT,
    "gmapsUrl" TEXT,
    "ville" TEXT,
    "departement" TEXT,
    "region" TEXT,
    "regionNAF" TEXT,
    "description" TEXT,
    "maxParticipants" INTEGER,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "preRegistered" INTEGER NOT NULL DEFAULT 0,
    "isTeam" BOOLEAN NOT NULL DEFAULT false,
    "coachsPerTeam" INTEGER NOT NULL DEFAULT 1,
    "days" TEXT DEFAULT '1',
    "totalMatches" INTEGER,
    "price" DOUBLE PRECISION,
    "priceMeals" DOUBLE PRECISION,
    "priceLodging" DOUBLE PRECISION,
    "structure" TEXT,
    "lodgingAtVenue" BOOLEAN NOT NULL DEFAULT false,
    "ruleset" TEXT,
    "mealsIncluded" BOOLEAN NOT NULL DEFAULT false,
    "fridayArrival" BOOLEAN NOT NULL DEFAULT false,
    "gameEdition" TEXT,
    "platform" TEXT DEFAULT 'Tabletop',
    "isNAF" BOOLEAN NOT NULL DEFAULT false,
    "isCDF" BOOLEAN NOT NULL DEFAULT false,
    "isCGO" BOOLEAN NOT NULL DEFAULT false,
    "isTGE" BOOLEAN NOT NULL DEFAULT false,
    "isTSC" BOOLEAN NOT NULL DEFAULT false,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "organizerId" TEXT NOT NULL,
    "ligueId" TEXT,
    "ligueCustom" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "registrationsLocked" BOOLEAN NOT NULL DEFAULT false,
    "typeCDF" TEXT DEFAULT 'INDIVIDUEL',
    "tournamentType" TEXT DEFAULT 'SWISS',

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "allowedRoles" TEXT NOT NULL DEFAULT 'ALL',
    "legacyId" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "allowedRoles" TEXT NOT NULL DEFAULT 'ALL',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isTournamentForum" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "parentForumId" TEXT,
    "legacyId" TEXT,

    CONSTRAINT "Forum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isSticky" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "forumId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "tournamentId" TEXT,
    "legacyId" TEXT,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "moderationReason" TEXT,
    "moderatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "legacyId" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user1Id" TEXT,
    "user2Id" TEXT,
    "user1DeletedAt" TIMESTAMP(3),
    "user2DeletedAt" TIMESTAMP(3),

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "PrivateMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicView" (
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPostId" TEXT,

    CONSTRAINT "TopicView_pkey" PRIMARY KEY ("userId","topicId")
);

-- CreateTable
CREATE TABLE "Mention" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "mentionerId" TEXT NOT NULL,
    "mentionedUserId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostReaction" (
    "id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleConfig" (
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#888888',
    "power" INTEGER NOT NULL,
    "isBaseRole" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleConfig_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "TopicFollow" (
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "TopicFollow_pkey" PRIMARY KEY ("userId","topicId")
);

-- CreateTable
CREATE TABLE "RankingArchive" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedById" TEXT NOT NULL,

    CONSTRAINT "RankingArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceData" (
    "id" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReferenceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentRegistration" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PRE_REGISTERED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_PAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "captainId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PRE_REGISTERED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOT_PAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TournamentTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentMercenary" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentMercenary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "moderationReason" TEXT,
    "moderatedBy" TEXT,
    "ligueId" TEXT,
    "ligueCustom" TEXT,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ArticleTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleReaction" (
    "id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ArticleReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ligue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "geographicalZone" TEXT,
    "gmapsUrl" TEXT,
    "region" TEXT,
    "departement" TEXT,
    "ville" TEXT,
    "address" TEXT,
    "description" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,

    CONSTRAINT "Ligue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationReport" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reporterId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ModerationReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "moderatorId" TEXT NOT NULL,
    "targetId" TEXT,
    "targetType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "link" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ResourceTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentResult" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "coachName" TEXT NOT NULL,
    "userId" TEXT,
    "roster" TEXT,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "casualties" INTEGER NOT NULL DEFAULT 0,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "autoCalculate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nafNumber" TEXT,

    CONSTRAINT "TournamentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentRound" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,

    CONSTRAINT "TournamentRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentMatch" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "tableNumber" INTEGER,
    "coach1Name" TEXT NOT NULL,
    "coach1UserId" TEXT,
    "coach2Name" TEXT NOT NULL,
    "coach2UserId" TEXT,
    "coach1TD" INTEGER NOT NULL DEFAULT 0,
    "coach1Casualties" INTEGER NOT NULL DEFAULT 0,
    "coach2TD" INTEGER NOT NULL DEFAULT 0,
    "coach2Casualties" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentMatch_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "LegacyMember" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "forumactifName" TEXT NOT NULL,
    "nafNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegacyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BBSchemeState" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "creatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BBSchemeState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailLog" (
    "id" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "type" TEXT,

    CONSTRAINT "MailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TournamentCommissaires" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TournamentCommissaires_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ArticleToArticleTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArticleToArticleTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LigueCommissaires" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LigueCommissaires_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LigueMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LigueMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ResourceToResourceTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ResourceToResourceTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_legacyId_key" ON "User"("legacyId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Tournament_organizerId_idx" ON "Tournament"("organizerId");

-- CreateIndex
CREATE INDEX "Tournament_ligueId_idx" ON "Tournament"("ligueId");

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
CREATE UNIQUE INDEX "Topic_tournamentId_key" ON "Topic"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_legacyId_key" ON "Topic"("legacyId");

-- CreateIndex
CREATE INDEX "Topic_forumId_idx" ON "Topic"("forumId");

-- CreateIndex
CREATE INDEX "Topic_authorId_idx" ON "Topic"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_legacyId_key" ON "Post"("legacyId");

-- CreateIndex
CREATE INDEX "Post_topicId_idx" ON "Post"("topicId");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Conversation_user1Id_idx" ON "Conversation"("user1Id");

-- CreateIndex
CREATE INDEX "Conversation_user2Id_idx" ON "Conversation"("user2Id");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE INDEX "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_userId_conversationId_key" ON "ConversationParticipant"("userId", "conversationId");

-- CreateIndex
CREATE INDEX "PrivateMessage_conversationId_idx" ON "PrivateMessage"("conversationId");

-- CreateIndex
CREATE INDEX "PrivateMessage_authorId_idx" ON "PrivateMessage"("authorId");

-- CreateIndex
CREATE INDEX "Mention_mentionedUserId_idx" ON "Mention"("mentionedUserId");

-- CreateIndex
CREATE INDEX "Mention_mentionerId_idx" ON "Mention"("mentionerId");

-- CreateIndex
CREATE INDEX "Mention_postId_idx" ON "Mention"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "Mention_postId_mentionedUserId_key" ON "Mention"("postId", "mentionedUserId");

-- CreateIndex
CREATE INDEX "PostReaction_postId_idx" ON "PostReaction"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_postId_userId_emoji_key" ON "PostReaction"("postId", "userId", "emoji");

-- CreateIndex
CREATE UNIQUE INDEX "RankingArchive_year_key" ON "RankingArchive"("year");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceData_group_key_key" ON "ReferenceData"("group", "key");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentRegistration_tournamentId_userId_key" ON "TournamentRegistration"("tournamentId", "userId");

-- CreateIndex
CREATE INDEX "TournamentTeam_tournamentId_idx" ON "TournamentTeam"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentTeam_captainId_idx" ON "TournamentTeam"("captainId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTeam_tournamentId_name_key" ON "TournamentTeam"("tournamentId", "name");

-- CreateIndex
CREATE INDEX "TournamentTeamMember_teamId_idx" ON "TournamentTeamMember"("teamId");

-- CreateIndex
CREATE INDEX "TournamentTeamMember_userId_idx" ON "TournamentTeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTeamMember_teamId_userId_key" ON "TournamentTeamMember"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentMercenary_tournamentId_userId_key" ON "TournamentMercenary"("tournamentId", "userId");

-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "Article"("authorId");

-- CreateIndex
CREATE INDEX "Article_ligueId_idx" ON "Article"("ligueId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleTag_name_key" ON "ArticleTag"("name");

-- CreateIndex
CREATE INDEX "ArticleReaction_articleId_idx" ON "ArticleReaction"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleReaction_articleId_userId_emoji_key" ON "ArticleReaction"("articleId", "userId", "emoji");

-- CreateIndex
CREATE INDEX "Ligue_creatorId_idx" ON "Ligue"("creatorId");

-- CreateIndex
CREATE INDEX "ModerationReport_targetId_targetType_idx" ON "ModerationReport"("targetId", "targetType");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceTag_name_key" ON "ResourceTag"("name");

-- CreateIndex
CREATE INDEX "TournamentResult_tournamentId_idx" ON "TournamentResult"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentResult_userId_idx" ON "TournamentResult"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentResult_tournamentId_coachName_key" ON "TournamentResult"("tournamentId", "coachName");

-- CreateIndex
CREATE INDEX "TournamentRound_tournamentId_idx" ON "TournamentRound"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentRound_tournamentId_roundNumber_key" ON "TournamentRound"("tournamentId", "roundNumber");

-- CreateIndex
CREATE INDEX "TournamentMatch_roundId_idx" ON "TournamentMatch"("roundId");

-- CreateIndex
CREATE INDEX "TournamentMatch_coach1UserId_idx" ON "TournamentMatch"("coach1UserId");

-- CreateIndex
CREATE INDEX "TournamentMatch_coach2UserId_idx" ON "TournamentMatch"("coach2UserId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_idx" ON "QuizAttempt"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LegacyMember_email_key" ON "LegacyMember"("email");

-- CreateIndex
CREATE INDEX "LegacyMember_email_idx" ON "LegacyMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BBSchemeState_hash_key" ON "BBSchemeState"("hash");

-- CreateIndex
CREATE INDEX "_TournamentCommissaires_B_index" ON "_TournamentCommissaires"("B");

-- CreateIndex
CREATE INDEX "_ArticleToArticleTag_B_index" ON "_ArticleToArticleTag"("B");

-- CreateIndex
CREATE INDEX "_LigueCommissaires_B_index" ON "_LigueCommissaires"("B");

-- CreateIndex
CREATE INDEX "_LigueMembers_B_index" ON "_LigueMembers"("B");

-- CreateIndex
CREATE INDEX "_ResourceToResourceTag_B_index" ON "_ResourceToResourceTag"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_fkey" FOREIGN KEY ("role") REFERENCES "RoleConfig"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_ligueId_fkey" FOREIGN KEY ("ligueId") REFERENCES "Ligue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forum" ADD CONSTRAINT "Forum_parentForumId_fkey" FOREIGN KEY ("parentForumId") REFERENCES "Forum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forum" ADD CONSTRAINT "Forum_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "Forum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateMessage" ADD CONSTRAINT "PrivateMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateMessage" ADD CONSTRAINT "PrivateMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicView" ADD CONSTRAINT "TopicView_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicView" ADD CONSTRAINT "TopicView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_mentionedUserId_fkey" FOREIGN KEY ("mentionedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_mentionerId_fkey" FOREIGN KEY ("mentionerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReaction" ADD CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicFollow" ADD CONSTRAINT "TopicFollow_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicFollow" ADD CONSTRAINT "TopicFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingArchive" ADD CONSTRAINT "RankingArchive_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentRegistration" ADD CONSTRAINT "TournamentRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentRegistration" ADD CONSTRAINT "TournamentRegistration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeamMember" ADD CONSTRAINT "TournamentTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeamMember" ADD CONSTRAINT "TournamentTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TournamentTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMercenary" ADD CONSTRAINT "TournamentMercenary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMercenary" ADD CONSTRAINT "TournamentMercenary_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_ligueId_fkey" FOREIGN KEY ("ligueId") REFERENCES "Ligue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleReaction" ADD CONSTRAINT "ArticleReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleReaction" ADD CONSTRAINT "ArticleReaction_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ligue" ADD CONSTRAINT "Ligue_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReport" ADD CONSTRAINT "ModerationReport_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReport" ADD CONSTRAINT "ModerationReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentResult" ADD CONSTRAINT "TournamentResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentResult" ADD CONSTRAINT "TournamentResult_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentRound" ADD CONSTRAINT "TournamentRound_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_coach2UserId_fkey" FOREIGN KEY ("coach2UserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_coach1UserId_fkey" FOREIGN KEY ("coach1UserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "TournamentRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizDailyWinner" ADD CONSTRAINT "QuizDailyWinner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionSuggestion" ADD CONSTRAINT "QuizQuestionSuggestion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BBSchemeState" ADD CONSTRAINT "BBSchemeState_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TournamentCommissaires" ADD CONSTRAINT "_TournamentCommissaires_A_fkey" FOREIGN KEY ("A") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TournamentCommissaires" ADD CONSTRAINT "_TournamentCommissaires_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToArticleTag" ADD CONSTRAINT "_ArticleToArticleTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToArticleTag" ADD CONSTRAINT "_ArticleToArticleTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ArticleTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LigueCommissaires" ADD CONSTRAINT "_LigueCommissaires_A_fkey" FOREIGN KEY ("A") REFERENCES "Ligue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LigueCommissaires" ADD CONSTRAINT "_LigueCommissaires_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LigueMembers" ADD CONSTRAINT "_LigueMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Ligue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LigueMembers" ADD CONSTRAINT "_LigueMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceToResourceTag" ADD CONSTRAINT "_ResourceToResourceTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceToResourceTag" ADD CONSTRAINT "_ResourceToResourceTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ResourceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

