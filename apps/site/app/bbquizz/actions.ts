/**
 * Actions serveur du BBQuizz.
 * Une partie est tenue par le serveur (table QuizGame, règles dans lib/quizGame.ts) : le navigateur reçoit une
 * question à la fois, sans la bonne réponse, et le score est calculé ici. Ainsi, impossible de lire les réponses
 * à l'avance ou d'envoyer un faux score.
 */
"use server";

import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isModerator } from "@/lib/roles";
import { translateCategory, QUIZ_LENGTH } from "./utils";
import {
  computeTimeLeft,
  correctAnswerPoints,
  loadQuizQuestion,
  pickQuizQuestionIds,
  shuffle,
  toPublicQuestion,
  WRONG_PENALTY,
  type PublicQuizQuestion,
} from "@/lib/quizGame";

/** Question envoyée au navigateur, avec sa position dans la partie. */
export interface QuizQuestionPayload {
  index: number;
  total: number;
  question: PublicQuizQuestion;
}

/** Bilan d'une partie terminée, enregistrée dans le classement. */
export interface QuizFinalResult {
  score: number;
  correct: number;
  total: number;
  duration: number; // en secondes
}

/** Résultat d'une réponse : la bonne réponse n'est révélée qu'ici, après coup. */
export interface QuizAnswerResult {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string | null;
  points: number;
  score: number;
  correct: number;
  finished: QuizFinalResult | null;
}

/** Erreur interne : la partie a changé entre la lecture et l'écriture (double clic, onglet en double…). */
class StaleGameError extends Error {}

/** Partie en cours du membre connecté, ou null. */
async function getOwnGame(gameId: string) {
  const session = await getActiveSession();
  if (!session?.user?.id) return null;
  return prisma.quizGame.findFirst({ where: { id: gameId, userId: session.user.id } });
}

type QuizGameRow = NonNullable<Awaited<ReturnType<typeof getOwnGame>>>;

/**
 * Passe à la question suivante (après une réponse ou le joker « passer ») en une seule opération :
 * la mise à jour n'a lieu que si la partie est encore à la question attendue, ce qui empêche de répondre
 * deux fois à la même question. Après la dernière question, enregistre la partie dans le classement.
 * Renvoie le bilan si la partie est finie, null sinon, ou "stale" si la partie avait déjà avancé.
 */
async function advanceGame(
  game: QuizGameRow,
  changes: { score?: number; correct?: number; skipUsed?: boolean }
): Promise<QuizFinalResult | null | "stale"> {
  const nextIndex = game.currentIndex + 1;
  const isLast = nextIndex >= game.questionIds.length;
  const score = changes.score ?? game.score;
  const correct = changes.correct ?? game.correct;
  const skipUsed = changes.skipUsed ?? game.skipUsed;

  try {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.quizGame.updateMany({
        where: { id: game.id, currentIndex: game.currentIndex, questionServedAt: game.questionServedAt },
        data: { currentIndex: nextIndex, questionServedAt: null, score, correct, skipUsed },
      });
      if (updated.count !== 1) throw new StaleGameError();
      if (!isLast) return null;

      // Dernière question : la partie devient un résultat du classement, puis la partie en cours disparaît
      const result: QuizFinalResult = {
        score,
        correct,
        total: game.questionIds.length,
        duration: Math.round((Date.now() - game.startedAt.getTime()) / 1000),
      };
      const jokersUsed = [game.fiftyUsed, game.communityUsed, skipUsed].filter(Boolean).length;
      await tx.quizAttempt.create({
        data: { userId: game.userId, score, correct, total: result.total, duration: result.duration, jokersUsed },
      });
      const user = await tx.user.findUnique({ where: { id: game.userId }, select: { quizBestScore: true } });
      await tx.user.update({
        where: { id: game.userId },
        data: {
          quizTotalScore: { increment: score },
          quizAttemptsCount: { increment: 1 },
          quizBestScore: Math.max(user?.quizBestScore ?? 0, score),
        },
      });
      await tx.quizGame.delete({ where: { id: game.id } });
      return result;
    });
  } catch (error) {
    if (error instanceof StaleGameError) return "stale";
    throw error;
  }
}

/**
 * Commence une nouvelle partie pour le membre connecté (une éventuelle partie inachevée est abandonnée).
 */
export async function startQuizGame(): Promise<{ gameId: string; total: number } | null> {
  const session = await getActiveSession();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const questionIds = await pickQuizQuestionIds(QUIZ_LENGTH);
  if (questionIds.length === 0) return null;

  const game = await prisma.$transaction(async (tx) => {
    await tx.quizGame.deleteMany({ where: { userId } });
    return tx.quizGame.create({ data: { userId, questionIds }, select: { id: true } });
  });
  return { gameId: game.id, total: questionIds.length };
}

/**
 * Envoie la question en cours, sans sa réponse, et note l'heure d'envoi : c'est elle qui sert
 * à mesurer le temps de réponse. Redemander la même question ne remet pas le chronomètre à zéro.
 */
export async function getQuizQuestion(gameId: string): Promise<QuizQuestionPayload | null> {
  let game = await getOwnGame(gameId);

  // Une question supprimée par la modération pendant la partie est sautée, sans points
  while (game && game.currentIndex < game.questionIds.length) {
    const question = await loadQuizQuestion(game.questionIds[game.currentIndex]);
    if (!question) {
      const advanced = await advanceGame(game, {});
      if (advanced !== null) return null;
      game = await getOwnGame(gameId);
      continue;
    }

    if (!game.questionServedAt) {
      await prisma.quizGame.updateMany({
        where: { id: game.id, currentIndex: game.currentIndex, questionServedAt: null },
        data: { questionServedAt: new Date() },
      });
    }
    return { index: game.currentIndex, total: game.questionIds.length, question: toPublicQuestion(question) };
  }
  return null;
}

/**
 * Enregistre la réponse à la question en cours (`optionIndex` = -1 quand le temps est écoulé),
 * calcule les points avec le chronomètre du serveur, puis révèle la bonne réponse.
 */
export async function answerQuizQuestion(gameId: string, optionIndex: number): Promise<QuizAnswerResult | null> {
  const game = await getOwnGame(gameId);
  if (!game?.questionServedAt || game.currentIndex >= game.questionIds.length) return null;

  const question = await loadQuizQuestion(game.questionIds[game.currentIndex]);
  if (!question) return null;

  const timeLeft = computeTimeLeft(game.questionServedAt, new Date());
  const isCorrect = timeLeft !== null && optionIndex === question.correctIndex;
  const points = isCorrect ? correctAnswerPoints(timeLeft) : -WRONG_PENALTY;
  const score = isCorrect ? game.score + points : Math.max(0, game.score - WRONG_PENALTY);
  const correct = game.correct + (isCorrect ? 1 : 0);

  const finished = await advanceGame(game, { score, correct });
  if (finished === "stale") return null;

  // Compteurs du joker « appel à la communauté » (questions de la base seulement)
  if (!question.isStatic && Number.isInteger(optionIndex) && optionIndex >= 0 && optionIndex <= 3) {
    await prisma.quizQuestion.update({
      where: { id: question.id },
      data: { [`timesOption${optionIndex}`]: { increment: 1 }, ...(isCorrect ? { timesCorrect: { increment: 1 } } : {}) },
    }).catch(() => null);
  }

  if (finished) revalidatePath("/bbquizz");
  return { isCorrect, correctIndex: question.correctIndex, explanation: question.explanation, points, score, correct, finished };
}

/** Joker « passer » : une fois par partie, sur une question affichée et pas encore répondue. */
export async function skipQuizQuestion(gameId: string): Promise<{ finished: QuizFinalResult | null } | null> {
  const game = await getOwnGame(gameId);
  if (!game?.questionServedAt || game.skipUsed) return null;

  const finished = await advanceGame(game, { skipUsed: true });
  if (finished === "stale") return null;
  if (finished) revalidatePath("/bbquizz");
  return { finished };
}

/** Marque un joker comme utilisé sur la question en cours ; false s'il l'était déjà. */
async function consumeJoker(game: QuizGameRow, joker: "fiftyUsed" | "communityUsed"): Promise<boolean> {
  if (!game.questionServedAt || game[joker]) return false;
  const updated = await prisma.quizGame.updateMany({
    where: { id: game.id, currentIndex: game.currentIndex, [joker]: false },
    data: { [joker]: true },
  });
  return updated.count === 1;
}

/** Joker « 50/50 » : renvoie deux mauvaises réponses à cacher (jamais la bonne). */
export async function applyQuizFiftyFifty(gameId: string): Promise<number[] | null> {
  const game = await getOwnGame(gameId);
  if (!game || game.currentIndex >= game.questionIds.length) return null;
  const question = await loadQuizQuestion(game.questionIds[game.currentIndex]);
  if (!question || !(await consumeJoker(game, "fiftyUsed"))) return null;

  const wrongIndexes = question.options.map((_, index) => index).filter((index) => index !== question.correctIndex);
  return shuffle(wrongIndexes).slice(0, 2);
}

/** Joker « appel à la communauté » : pourcentage des réponses déjà données à la question en cours. */
export async function applyQuizCommunity(gameId: string): Promise<number[] | null> {
  const game = await getOwnGame(gameId);
  if (!game || game.currentIndex >= game.questionIds.length) return null;
  const question = await loadQuizQuestion(game.questionIds[game.currentIndex]);
  if (!question || !(await consumeJoker(game, "communityUsed"))) return null;

  const counters = question.isStatic
    ? null
    : await prisma.quizQuestion.findUnique({
        where: { id: question.id },
        select: { timesOption0: true, timesOption1: true, timesOption2: true, timesOption3: true },
      });
  const counts = counters
    ? [counters.timesOption0, counters.timesOption1, counters.timesOption2, counters.timesOption3]
    : [0, 0, 0, 0];
  const total = counts.reduce((sum, count) => sum + count, 0);
  // Personne n'a encore répondu : part égale entre les réponses plutôt que des chiffres inventés
  if (total === 0) return counts.map(() => 25);
  return counts.map((count) => Math.round((count / total) * 100));
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
  const session = await getActiveSession();
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
  const session = await getActiveSession();
  if (!isModerator(session?.user?.role)) return [];

  const suggestions = await prisma.quizQuestionSuggestion.findMany({
    where: { status: "PENDING" },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return suggestions.map(s => ({
    ...s,
    category: translateCategory(s.category)
  }));
}

/**
 * Valide ou rejette une suggestion
 */
export async function handleQuizSuggestion(id: string, approve: boolean) {
  const session = await getActiveSession();
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
  const session = await getActiveSession();
  if (!isModerator(session?.user?.role)) return [];

  const questions = await prisma.quizQuestion.findMany({
    orderBy: { createdAt: "desc" }
  });

  return questions.map(q => ({
    ...q,
    category: translateCategory(q.category)
  }));
}

/**
 * Met à jour une question existante
 */
export async function updateQuizQuestion(id: string, data: any) {
  const session = await getActiveSession();
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
  const session = await getActiveSession();
  if (!isModerator(session?.user?.role)) return null;

  await prisma.quizQuestion.delete({ where: { id } });
  revalidatePath("/bbquizz");
  return { success: true };
}
