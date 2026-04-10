/**
 * Server Actions pour le système de Quizz Blood Bowl
 */
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { questions } from "./data/questions";
import { revalidatePath } from "next/cache";

/**
 * Récupère 20 questions aléatoires pour une session de quizz
 */
export async function getRandomQuizQuestions() {
  const session = await auth();
  if (!session?.user) return null;

  // Mélanger et prendre 20
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
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
 * Assure l'unicité des utilisateurs par période
 */
export async function getQuizLeaderboard(type: "daily" | "weekly" | "alltime" = "alltime") {
  const now = new Date();
  
  // All-time : utilise les champs dénormalisés de l'utilisateur
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

  // Daily / Weekly : cherche dans les attempts récents
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
    take: 100, // On en prend plus pour filtrer par utilisateur
  });

  // Filtrer pour n'avoir qu'un exemplaire par utilisateur (le meilleur score)
  const uniqueUsers = new Map();
  for (const attempt of attempts) {
    if (!uniqueUsers.has(attempt.userId) || uniqueUsers.get(attempt.userId).score < attempt.score) {
      uniqueUsers.set(attempt.userId, attempt);
    }
  }

  // Retourner les 10 meilleurs
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
