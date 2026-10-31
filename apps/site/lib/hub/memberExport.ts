/**
 * Données d'un membre que le site fournit au passeport pour l'export RGPD (carte 125) : profil, contributions
 * (sujets, messages du forum, articles), messages privés envoyés, inscriptions aux tournois, résultats et quiz.
 * Les données des autres membres (messages reçus, réponses) ne sont pas incluses.
 * Fichier volontairement PAS « use server » : appelé seulement par app/api/hub/export/route.ts, après vérification.
 */
import { prisma, prismaWithEmail } from "@/lib/prisma";

export async function exportMember(userId: string) {
  // Lectures l'une après l'autre : la base locale de développement ne sert qu'une requête à la fois
  const profile = await prismaWithEmail.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, image: true, role: true, nafNumber: true, region: true, equipe: true, ligueCustom: true,
      signature: true, theme: true, avatarFrame: true, forumactifName: true, notifPm: true, notifMention: true,
      notifFollowedTopic: true, notifNewsletter: true, quizTotalScore: true, quizBestScore: true, quizStreak: true,
      quizAttemptsCount: true, ligues: { select: { name: true } },
    },
  });
  if (!profile) return null;
  const topics = await prisma.topic.findMany({ where: { authorId: userId }, select: { title: true, createdAt: true } });
  const posts = await prisma.post.findMany({ where: { authorId: userId }, select: { content: true, createdAt: true } });
  const articles = await prisma.article.findMany({ where: { authorId: userId }, select: { title: true, content: true, createdAt: true } });
  const privateMessagesSent = await prisma.privateMessage.findMany({ where: { authorId: userId }, select: { content: true, createdAt: true } });
  const tournamentRegistrations = await prisma.tournamentRegistration.findMany({
    where: { userId },
    select: { createdAt: true, tournament: { select: { name: true } } },
  });
  const tournamentResults = await prisma.tournamentResult.findMany({ where: { userId } });
  const quizAttempts = await prisma.quizAttempt.findMany({ where: { userId }, select: { score: true, createdAt: true } });
  return { site: "BBFrance", profile, topics, posts, articles, privateMessagesSent, tournamentRegistrations, tournamentResults, quizAttempts };
}
