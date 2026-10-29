/**
 * Suppression d'un compte membre avec anonymisation : les contenus publics (sujets, messages du forum,
 * articles, ligues, résultats de tournoi…) sont rattachés au compte fantôme « Coach Inconnu » (`ghost_coach`)
 * au lieu d'être effacés ; les données privées (messages privés, réactions, inscriptions…) sont supprimées.
 * Utilisée par deleteAccount (le membre supprime son compte) et deleteUser (un modérateur supprime un membre).
 * Fichier volontairement PAS « use server » : fonction interne, l'appelant vérifie les droits.
 */
import { prisma } from "@/lib/prisma";

const GHOST_USER_ID = "ghost_coach";

/**
 * Anonymise puis supprime le membre `userId`. Si `keepUserRecord` vaut true (Super Admin qui supprime
 * son propre compte), la fiche du membre est gardée mais vidée de ses informations de profil.
 * Renvoie true si tout s'est bien passé, false sinon (transaction annulée).
 */
export async function anonymizeAndDeleteUser(userId: string, keepUserRecord: boolean): Promise<boolean> {
  // Le compte fantôme lui-même ne se supprime jamais : il porte les contenus des comptes supprimés
  if (userId === GHOST_USER_ID) return false;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Définir l'utilisateur de secours (Ghost) pour l'anonymisation
      const ghostId = GHOST_USER_ID;
      let ghost = await tx.user.findUnique({ where: { id: ghostId } });
      if (!ghost) {
        ghost = await tx.user.create({
          data: {
            id: ghostId,
            name: "Coach Inconnu",
            email: "ghost@breakfasttt.fr",
            role: "COACH",
            isBanned: true
          }
        });
      }

      // 2. Supprimer les données privées, éphémères ou sensibles
      await tx.account.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.topicView.deleteMany({ where: { userId } });
      await tx.postReaction.deleteMany({ where: { userId } });
      await tx.articleReaction.deleteMany({ where: { userId } });
      await tx.mention.deleteMany({ where: { OR: [{ mentionerId: userId }, { mentionedUserId: userId }] } });
      await tx.tournamentRegistration.deleteMany({ where: { userId } });
      await tx.tournamentMercenary.deleteMany({ where: { userId } });
      await tx.tournamentTeamMember.deleteMany({ where: { userId } });
      await tx.quizAttempt.deleteMany({ where: { userId } });

      // 3. Supprimer les messages privés et participations aux conversations
      await tx.privateMessage.deleteMany({ where: { authorId: userId } });
      await tx.conversationParticipant.deleteMany({ where: { userId } });

      // 4. Anonymiser l'activité publique (Forum, Articles, Ligues, Tournois, Quiz)
      await tx.topic.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId }
      });

      await tx.post.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId, content: "[Ce message a été supprimé suite à la clôture du compte]" }
      });

      await tx.article.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId }
      });

      await tx.ligue.updateMany({
        where: { creatorId: userId },
        data: { creatorId: ghostId }
      });

      await tx.tournamentTeam.updateMany({
        where: { captainId: userId },
        data: { captainId: ghostId }
      });

      await tx.quizQuestionSuggestion.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId }
      });

      await tx.tournamentResult.updateMany({
        where: { userId },
        data: { userId: ghostId }
      });

      await tx.tournamentMatch.updateMany({
        where: { coach1UserId: userId },
        data: { coach1UserId: ghostId }
      });

      await tx.tournamentMatch.updateMany({
        where: { coach2UserId: userId },
        data: { coach2UserId: ghostId }
      });

      await tx.rankingArchive.updateMany({
        where: { archivedById: userId },
        data: { archivedById: ghostId }
      });

      await tx.resource.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId }
      });

      // Tournois organisés, gagnants du jour au BBQuizz, signalements envoyés et journal de modération :
      // ces lignes exigent un auteur (la base refuserait de supprimer le membre), on garde l'historique.
      await tx.tournament.updateMany({
        where: { organizerId: userId },
        data: { organizerId: ghostId }
      });

      await tx.quizDailyWinner.updateMany({
        where: { userId },
        data: { userId: ghostId }
      });

      await tx.moderationReport.updateMany({
        where: { reporterId: userId },
        data: { reporterId: ghostId }
      });

      await tx.moderationLog.updateMany({
        where: { moderatorId: userId },
        data: { moderatorId: ghostId }
      });

      // 5. Supprimer l'utilisateur lui-même (ou seulement vider son profil si keepUserRecord)
      if (keepUserRecord) {
        await tx.user.update({
          where: { id: userId },
          data: {
            image: null,
            signature: null,
            nafNumber: null,
            region: null,
            ligues: { set: [] },
            ownedLigues: { set: [] },
            commissaireLigues: { set: [] },
            ligueCustom: null,
            avatarFrame: "auto"
          }
        });
      } else {
        await tx.user.delete({ where: { id: userId } });
      }
    });

    return true;
  } catch (error) {
    console.error("[ANONYMIZE_DELETE_USER] Error:", error);
    return false;
  }
}
