/**
 * Règles d'une partie de BBQuizz, appliquées côté serveur (carte 051) : tirage des questions, lecture d'une question,
 * calcul du temps restant et des points. Le navigateur ne reçoit jamais la bonne réponse avant d'avoir répondu.
 * Fichier volontairement PAS « use server » : fonctions internes, appelées par les actions de app/bbquizz/actions.ts,
 * qui vérifient elles-mêmes le membre connecté.
 */
import { prisma } from "@/lib/prisma";
import { questions as staticQuestions } from "@/app/bbquizz/data/questions";
import { QUIZ_ANSWER_TIME, QUIZ_READ_TIME, translateCategory } from "@/app/bbquizz/utils";

/** Préfixe des questions de départ (fichier data/questions.ts), utilisées seulement si la base n'en contient aucune. */
const STATIC_PREFIX = "static-";

/** Marge accordée au temps de trajet des messages entre le navigateur et le serveur (secondes). */
const NETWORK_GRACE = 3;

/** Points gagnés par une bonne réponse, avant le bonus de rapidité. */
const CORRECT_POINTS = 100;

/** Points perdus par une mauvaise réponse (le score ne descend jamais sous zéro). */
export const WRONG_PENALTY = 25;

export interface FullQuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  isStatic: boolean;
}

/** Ce que le navigateur a le droit de voir d'une question : ni la bonne réponse, ni l'explication. */
export interface PublicQuizQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
}

/** Mélange une liste au hasard (méthode de Fisher-Yates : chaque ordre a la même chance). */
export function shuffle<T>(list: T[]): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Tire `count` questions en piochant à tour de rôle dans chaque catégorie (pioche équilibrée),
 * pour ne pas avoir toute une partie sur le même thème. Renvoie seulement leurs identifiants.
 */
export async function pickQuizQuestionIds(count: number): Promise<string[]> {
  const dbQuestions = await prisma.quizQuestion.findMany({ select: { id: true, category: true } });
  const pool = dbQuestions.length > 0
    ? dbQuestions.map((q) => ({ id: q.id, category: translateCategory(q.category) }))
    : staticQuestions.map((q, index) => ({ id: `${STATIC_PREFIX}${index}`, category: translateCategory(q.category) }));

  const byCategory = new Map<string, string[]>();
  for (const question of pool) {
    const list = byCategory.get(question.category) ?? [];
    list.push(question.id);
    byCategory.set(question.category, list);
  }
  const lists = [...byCategory.values()].map((ids) => shuffle(ids));

  const picked: string[] = [];
  const total = Math.min(count, pool.length);
  for (let round = 0; picked.length < total; round++) {
    for (const list of lists) {
      if (picked.length < total && round < list.length) picked.push(list[round]);
    }
  }
  return shuffle(picked);
}

/** Lit une question complète (bonne réponse comprise), ou null si elle a été supprimée entre-temps. */
export async function loadQuizQuestion(id: string): Promise<FullQuizQuestion | null> {
  if (id.startsWith(STATIC_PREFIX)) {
    const data = staticQuestions[Number(id.slice(STATIC_PREFIX.length))];
    if (!data) return null;
    return {
      id,
      category: translateCategory(data.category),
      question: data.question,
      options: data.options,
      correctIndex: data.correctIndex,
      explanation: data.explanation ?? null,
      isStatic: true,
    };
  }

  const question = await prisma.quizQuestion.findUnique({ where: { id } });
  if (!question) return null;
  return {
    id: question.id,
    category: translateCategory(question.category),
    question: question.question,
    options: JSON.parse(question.options) as string[],
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    isStatic: false,
  };
}

export function toPublicQuestion(question: FullQuizQuestion): PublicQuizQuestion {
  return { id: question.id, category: question.category, question: question.question, options: question.options };
}

/**
 * Secondes restantes pour répondre, mesurées par le serveur depuis l'envoi de la question
 * (lecture puis réponse). Renvoie null si la réponse arrive trop tard : elle compte alors comme fausse.
 */
export function computeTimeLeft(servedAt: Date, now: Date): number | null {
  const answeringSeconds = (now.getTime() - servedAt.getTime()) / 1000 - QUIZ_READ_TIME;
  if (answeringSeconds > QUIZ_ANSWER_TIME + NETWORK_GRACE) return null;
  return Math.min(QUIZ_ANSWER_TIME, Math.max(0, QUIZ_ANSWER_TIME - Math.floor(Math.max(0, answeringSeconds))));
}

/** Points d'une réponse juste : 100, plus une seconde de bonus par seconde restante. */
export function correctAnswerPoints(timeLeft: number): number {
  return CORRECT_POINTS + timeLeft;
}
