/**
 * Suppression d'un compte membre avec anonymisation : les contenus publics (sujets, messages du forum,
 * articles, ligues, résultats de tournoi…) sont rattachés au compte fantôme « Coach Inconnu » (`ghost_coach`)
 * au lieu d'être effacés ; les données privées (messages privés, réactions, inscriptions…) sont supprimées.
 * Utilisée par deleteAccount (le membre supprime son compte), deleteUser (un modérateur supprime un membre) et, en mode
 * hub, par l'événement user.deleted du passeport (lib/hub/hubEvents.ts, carte 124).
 * Résultats de tournoi : l'historique sportif est gardé (intérêt légitime), mais le nom et le numéro NAF sont remplacés
 * par un pseudonyme. Aucune ligne du site ne garde ensuite l'email, le pseudo ni le NAF du membre.
 * Fichier volontairement PAS « use server » : fonction interne, l'appelant vérifie les droits.
 */
import { prisma, prismaWithEmail } from "@/lib/prisma";
// Identifiant du compte fantôme et nom anonyme d'un coach supprimé : définis avec les règles du classement, qui
// doit reconnaître et écarter ces résultats (carte 163)
import { ANONYMOUS_COACH_NAME, GHOST_USER_ID, anonymousCoachName } from "@/lib/rankingCoach";

/**
 * Anonymise puis supprime le membre `userId`. Si `keepUserRecord` vaut true (Super Admin qui supprime
 * son propre compte), la fiche du membre est gardée mais vidée de ses informations de profil.
 * Renvoie true si tout s'est bien passé, false sinon (transaction annulée).
 */
export async function anonymizeAndDeleteUser(userId: string, keepUserRecord: boolean): Promise<boolean> {
  // Le compte fantôme lui-même ne se supprime jamais : il porte les contenus des comptes supprimés
  if (userId === GHOST_USER_ID) return false;

  // Email, NAF et identifiant de l'ancien forum : le client `prisma` par défaut ne renvoie jamais l'email
  const identity = await prismaWithEmail.user.findUnique({ where: { id: userId }, select: { email: true, nafNumber: true, legacyId: true } });

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
      // Auteur du dernier message d'un sujet (« Dernier : … » des listes du forum, carte 166)
      await tx.topic.updateMany({
        where: { lastPostAuthorId: userId },
        data: { lastPostAuthorId: ghostId }
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

      // Résultats et matchs de tournoi : historique gardé, nom et NAF remplacés par un pseudonyme (carte 124).
      // Les résultats importés sans lien vers le compte sont retrouvés par le numéro NAF.
      // Chaque résultat reçoit son propre nom anonyme (« Coach anonyme 7f3a », carte 163) : la base interdit deux
      // résultats au même nom dans un tournoi, et un nom commun faisait échouer la suppression du deuxième coach
      // d'un même tournoi (ou d'un coach présent deux fois dans un tournoi).
      const anonymizedResults = await tx.tournamentResult.findMany({
        where: { OR: [{ userId }, ...(identity?.nafNumber ? [{ nafNumber: identity.nafNumber }] : [])] },
        select: { id: true, tournamentId: true }
      });
      // Nom anonyme du coach dans chaque tournoi, repris dans ses matchs pour que les deux listes concordent
      const anonymousNameByTournament = new Map<string, string>();
      for (const result of anonymizedResults) {
        const name = anonymousCoachName(result.id);
        if (!anonymousNameByTournament.has(result.tournamentId)) anonymousNameByTournament.set(result.tournamentId, name);
        await tx.tournamentResult.update({ where: { id: result.id }, data: { coachName: name, nafNumber: null } });
      }
      const matches = await tx.tournamentMatch.findMany({
        where: { OR: [{ coach1UserId: userId }, { coach2UserId: userId }] },
        select: { id: true, coach1UserId: true, coach2UserId: true, round: { select: { tournamentId: true } } }
      });
      for (const match of matches) {
        const name = anonymousNameByTournament.get(match.round.tournamentId) ?? ANONYMOUS_COACH_NAME;
        await tx.tournamentMatch.update({
          where: { id: match.id },
          data: {
            ...(match.coach1UserId === userId ? { coach1Name: name } : {}),
            ...(match.coach2UserId === userId ? { coach2Name: name } : {})
          }
        });
      }

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

      // Schémas BBScheme : gardés, sans créateur
      await tx.bBSchemeState.updateMany({ where: { creatorId: userId }, data: { creatorId: null } });
      // Traces de l'email : journal des mails envoyés et fiche de l'ancien forum
      if (identity?.email) {
        await tx.mailLog.deleteMany({ where: { to: identity.email } });
        await tx.legacyMember.deleteMany({ where: { email: identity.email.toLowerCase() } });
      }
      if (identity?.legacyId) await tx.legacyMember.deleteMany({ where: { id: identity.legacyId } });

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
            avatarFrame: "auto",
            // Plus aucune donnée personnelle sur la fiche gardée (carte 124)
            name: "Compte supprimé",
            email: null,
            emailVerified: null,
            equipe: null,
            forumactifName: null,
            legacyId: null,
            quizTotalScore: 0,
            quizBestScore: 0,
            quizStreak: 0,
            quizAttemptsCount: 0
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
