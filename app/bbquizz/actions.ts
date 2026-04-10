/**
 * Server Actions pour le système de Quizz Blood Bowl
 */
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { questions as staticQuestions } from "./data/questions";
import { revalidatePath } from "next/cache";
import { isModerator } from "@/lib/roles";

/**
 * Récupère 20 questions pour une session de quizz.
 * Combine les questions statiques et celles de la base de données.
 */
export async function getRandomQuizQuestions() {
  const session = await auth();
  if (!session?.user) return null;

  // Récupérer les questions en DB
  const dbQuestions = await prisma.quizQuestion.findMany();
  const allQuestions = [...staticQuestions, ...dbQuestions.map(q => ({
    ...q,
    options: JSON.parse(q.options)
  }))];

  // Mélanger et prendre 20
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 20);
}

/**
 * Enregistre une tentative de quizz et met à jour les scores
 */
export async function submitQuizAttempt(data: {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  duration: number; // en secondes
  jokersUsed: string[];
}) {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return null;

  try {
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        score: data.score,
        correct: data.correctAnswers,
        total: data.totalQuestions,
        duration: data.duration,
      },
    });

    // Mettre à jour les statistiques de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        quizTotalScore: { increment: data.score },
        quizAttemptsCount: { increment: 1 },
        quizBestScore: {
          set: Math.max(user.quizBestScore || 0, data.score),
        },
      },
    });

    revalidatePath("/bbquizz");
    return { success: true, attemptId: attempt.id };
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    return null;
  }
}

/**
 * Récupère le classement (Leaderboard)
 */
export async function getQuizLeaderboard(type: "daily" | "weekly" | "alltime" = "alltime") {
  const now = new Date();
  
  if (type === "alltime") {
    return prisma.user.findMany({
      where: { quizAttemptsCount: { gt: 0 } },
      select: {
        id: true,
        name: true,
        image: true,
        quizBestScore: true,
        quizTotalScore: true,
        quizStreak: true,
      },
      orderBy: { quizBestScore: "desc" },
      take: 10,
    });
  }

  let where = {};
  if (type === "daily") {
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    where = { createdAt: { gte: startOfDay } };
  } else if (type === "weekly") {
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    where = { createdAt: { gte: startOfWeek } };
  }

  const attempts = await prisma.quizAttempt.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          quizStreak: true,
        },
      },
    },
    orderBy: { score: "desc" },
    take: 100,
  });

  const uniqueUsers = new Map();
  for (const attempt of attempts) {
    if (!uniqueUsers.has(attempt.userId) || uniqueUsers.get(attempt.userId).score < attempt.score) {
      uniqueUsers.set(attempt.userId, attempt);
    }
  }

  return Array.from(uniqueUsers.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

/**
 * Action pour le joker 'Appel à la communauté'
 */
export async function getCommunityStats(questionText: string) {
  const question = await prisma.quizQuestion.findFirst({
    where: { question: questionText }
  });

  if (!question) {
    return [45, 20, 15, 20];
  }

  const total = (question.timesOption0 + question.timesOption1 + question.timesOption2 + question.timesOption3) || 1;
  return [
    Math.round((question.timesOption0 / total) * 100),
    Math.round((question.timesOption1 / total) * 100),
    Math.round((question.timesOption2 / total) * 100),
    Math.round((question.timesOption3 / total) * 100),
  ];
}

// --- Nouvelles fonctionnalités de gestion ---

/**
 * Propose une nouvelle question
 */
export async function suggestQuizQuestion(data: {
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.quizQuestionSuggestion.create({
    data: {
      category: data.category,
      question: data.question,
      options: JSON.stringify(data.options),
      correctIndex: data.correctIndex,
      explanation: data.explanation,
      authorId: session.user.id,
    }
  });
}

/**
 * Récupère les suggestions en attente (Moderator+)
 */
export async function getQuizSuggestions() {
  const session = await auth();
  if (!isModerator(session?.user?.role)) return [];

  return prisma.quizQuestionSuggestion.findMany({
    where: { status: "PENDING" },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Valide ou rejette une suggestion
 */
export async function handleQuizSuggestion(id: string, approve: boolean) {
  const session = await auth();
  if (!isModerator(session?.user?.role)) return null;

  if (approve) {
    const suggestion = await prisma.quizQuestionSuggestion.findUnique({ where: { id } });
    if (!suggestion) return null;

    // Créer la question réelle
    await prisma.quizQuestion.create({
      data: {
        category: suggestion.category,
        question: suggestion.question,
        options: suggestion.options,
        correctIndex: suggestion.correctIndex,
        explanation: suggestion.explanation,
      }
    });

    await prisma.quizQuestionSuggestion.update({
      where: { id },
      data: { status: "APPROVED" }
    });
  } else {
    await prisma.quizQuestionSuggestion.update({
      where: { id },
      data: { status: "REJECTED" }
    });
  }

  revalidatePath("/bbquizz");
  return { success: true };
}

/**
 * Récupère toutes les questions éditables (Moderator+)
 */
export async function getAllQuizQuestions() {
  const session = await auth();
  if (!isModerator(session?.user?.role)) return [];

  return prisma.quizQuestion.findMany({
    orderBy: { createdAt: "desc" }
  });
}

/**
 * Met à jour une question existante
 */
export async function updateQuizQuestion(id: string, data: any) {
  const session = await auth();
  if (!isModerator(session?.user?.role)) return null;

  await prisma.quizQuestion.update({
    where: { id },
    data: {
      ...data,
      options: JSON.stringify(data.options)
    }
  });

  revalidatePath("/bbquizz");
  return { success: true };
}

/**
 * Supprime une question
 */
export async function deleteQuizQuestion(id: string) {
  const session = await auth();
  if (!isModerator(session?.user?.role)) return null;

  await prisma.quizQuestion.delete({ where: { id } });
  revalidatePath("/bbquizz");
  return { success: true };
}
