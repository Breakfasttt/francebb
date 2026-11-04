"use server";

import { getActiveSession } from "@/lib/authGuard";
import { userSearchWhere, USER_SEARCH_MIN_LENGTH } from "@/lib/userSearch";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { markConversationNotificationsRead, notifyPrivateMessage } from "@/lib/notifications";
import { encrypt, decrypt } from "@/lib/crypto";
import { countUnreadByConversation } from "@/lib/unreadMessages";
import type { ActionResult } from "@/lib/actionResult";

const CONVERSATION_LIMIT = 50;

/**
 * Vrai si un blocage existe, dans un sens ou dans l'autre, entre `userId` et l'un des membres de `otherIds`.
 * Un membre bloqué ne peut ni recevoir de message de celui qui l'a bloqué, ni lui en envoyer (carte 050).
 */
async function hasBlockBetween(userId: string, otherIds: string[]) {
    if (otherIds.length === 0) return false;
    const count = await prisma.block.count({
        where: {
            OR: [
                { blockerId: userId, blockedId: { in: otherIds } },
                { blockerId: { in: otherIds }, blockedId: userId }
            ]
        }
    });
    return count > 0;
}
const CONVERSATIONS_PER_PAGE = 20;
const MESSAGES_PER_PAGE = 30;

/**
 * Récupère les conversations paginées pour l'utilisateur actuel.
 * Renvoie null si le visiteur n'est pas connecté (ou est banni).
 */
/**
 * Retire d'un groupe les membres qui l'ont quitté (participation marquée supprimée, champ `deletedAt`), pour qu'ils
 * ne soient plus affichés ni comptés parmi les participants (carte 136). Une conversation à deux garde ses deux
 * membres : son en-tête affiche le nom de l'autre membre, même si celui-ci l'a retirée de sa propre liste.
 * Ce tri ne change pas qui peut lire la conversation : ce droit est vérifié à part, sur la participation du lecteur.
 */
function withoutLeftMembers<T extends { isGroup: boolean; participants: { deletedAt: Date | null }[] }>(conversation: T): T {
  if (!conversation.isGroup) return conversation;
  return { ...conversation, participants: conversation.participants.filter((participant) => !participant.deletedAt) };
}

export async function getConversations(page = 1) {
  const session = await getActiveSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  const skip = (page - 1) * CONVERSATIONS_PER_PAGE;

  const participants = await prisma.conversationParticipant.findMany({
    where: {
      userId,
      deletedAt: null
    },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, image: true, role: true }
              }
            }
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
                author: { select: { name: true } }
            }
          }
        }
      }
    },
    orderBy: {
      conversation: {
        updatedAt: "desc"
      }
    },
    skip,
    take: CONVERSATIONS_PER_PAGE
  });

  // Non-lus propres à ce membre, calculés d'après sa date de lecture (carte 170). La liste les lit dans
  // `_count.messages`, la forme qu'avait l'ancien compteur.
  const unreadByConversation = await countUnreadByConversation(userId, participants.map(p => p.conversationId));

  const conversations = participants.map(p => {
    const conv = withoutLeftMembers(p.conversation);
    // Déchiffrer le dernier message
    if (conv.messages.length > 0) {
      conv.messages[0].content = decrypt(conv.messages[0].content);
    }
    return { ...conv, _count: { messages: unreadByConversation.get(p.conversationId) ?? 0 } };
  });

  const total = await prisma.conversationParticipant.count({
    where: {
      userId,
      deletedAt: null
    }
  });

  return {
    conversations,
    totalPages: Math.ceil(total / CONVERSATIONS_PER_PAGE),
    currentPage: page
  };
}

/**
 * Récupère les messages d'une conversation.
 * Renvoie null si le visiteur n'est pas connecté ou ne participe pas (ou plus) à cette conversation.
 */
export async function getConversationMessages(conversationId: string, page = 1) {
  const session = await getActiveSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  // Vérifier la participation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: { userId, conversationId }
    }
  });

  if (!participant || participant.deletedAt) {
    return null;
  }

  const skip = (page - 1) * MESSAGES_PER_PAGE;

  const messages = await prisma.privateMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    skip,
    take: MESSAGES_PER_PAGE,
    include: {
      author: { select: { id: true, name: true, image: true } }
    }
  });

  // Marquer comme lu, pour ce membre seulement : il avance sa propre date de lecture (carte 170). Les autres
  // participants gardent leurs non-lus.
  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() }
  });
  // La notification de cette conversation, sous la cloche, est lue aussi (carte 167)
  await markConversationNotificationsRead(userId, conversationId);

  // Récupérer les infos de la conversation pour le header
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true } }
        }
      }
    }
  });

  const total = await prisma.privateMessage.count({ where: { conversationId } });

  return {
    messages: messages.map(m => ({ ...m, content: decrypt(m.content) })),
    conversation: conversation ? withoutLeftMembers(conversation) : null,
    totalPages: Math.ceil(total / MESSAGES_PER_PAGE),
    currentPage: page
  };
}

/**
 * Envoie un message
 */
export async function sendMessage(conversationId: string, content: string): Promise<ActionResult & { messageId?: string }> {
  const session = await getActiveSession();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Non autorisé" };

  const participant = await prisma.conversationParticipant.findUnique({
    where: { userId_conversationId: { userId, conversationId } }
  });

  if (!participant) return { success: false, error: "Accès refusé" };

  // Conversation privée (à deux) : pas d'envoi si l'un des deux a bloqué l'autre
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { isGroup: true, participants: { where: { userId: { not: userId } }, select: { userId: true } } }
  });
  // Un membre qui a quitté un groupe ne peut plus y écrire
  if (conversation?.isGroup && participant.deletedAt) return { success: false, error: "Accès refusé" };
  if (!conversation?.isGroup && await hasBlockBetween(userId, conversation?.participants.map(p => p.userId) ?? [])) {
    return { success: false, error: "Impossible d'envoyer un message à ce membre." };
  }

  const encryptedContent = encrypt(content);

  const message = await prisma.privateMessage.create({
    data: {
      conversationId,
      authorId: userId,
      content: encryptedContent
    }
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  // Conversation à deux : un nouveau message la fait réapparaître chez celui qui l'avait retirée de sa liste.
  // Dans un groupe, en revanche, un membre parti ne revient pas tout seul (carte 136) : il faut l'inviter à nouveau.
  if (!conversation?.isGroup) {
    await prisma.conversationParticipant.updateMany({
      where: { conversationId },
      data: { deletedAt: null }
    });
  }

  // Notification dans le site et e-mail aux autres participants encore présents (carte 167 ; e-mail seulement si le
  // membre l'accepte, et pour le premier message non lu). Un échec ici n'annule pas l'envoi du message.
  try {
    const others = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: userId },
        // Pas de notification aux membres qui ont quitté le groupe
        deletedAt: null
      },
      select: { userId: true, lastReadAt: true }
    });
    await notifyPrivateMessage({
      conversationId,
      author: { id: userId, name: session.user.name || "Un coach" },
      preview: content.substring(0, 100),
      recipients: others
    });
  } catch (error) {
    console.error("sendMessage notifications error:", error);
  }

  revalidatePath("/messagerie");
  return { success: true, messageId: message.id };
}

/**
 * Crée une conversation (1v1 ou Groupe)
 */
export async function startConversation(userIds: string[], name?: string): Promise<ActionResult & { conversationId?: string }> {
    const session = await getActiveSession();
    const myId = session?.user?.id;
    if (!myId) return { success: false, error: "Non autorisé" };

    const allParticipants = [...new Set([myId, ...userIds])];
    const isGroup = allParticipants.length > 2 || !!name;

    if (await hasBlockBetween(myId, allParticipants.filter(uid => uid !== myId))) {
        return { success: false, error: "Impossible de démarrer une conversation avec un membre qui vous a bloqué ou que vous avez bloqué." };
    }

    // Vérifier la limite de 50 conversations
    const myConvCount = await prisma.conversationParticipant.count({
        where: { userId: myId, deletedAt: null }
    });
    if (myConvCount >= CONVERSATION_LIMIT) {
        return { success: false, error: `Vous avez atteint la limite de ${CONVERSATION_LIMIT} conversations.` };
    }

    // Si c'est un 1v1, vérifier si elle existe déjà. Elle doit compter exactement ces deux membres : chacun des deux y
    // a sa participation, et personne d'autre (carte 170). Avant, une conversation où il ne restait qu'un seul des deux
    // (l'autre ayant supprimé son compte) était reprise : le destinataire n'y était jamais ajouté, et un tiers pouvait
    // recevoir l'identifiant de la conversation vide d'un autre membre. Une participation marquée « partie »
    // (`deletedAt`) compte encore : dans une conversation à deux, partir revient seulement à la retirer de sa liste.
    if (!isGroup && allParticipants.length === 2) {
        const existing = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                AND: allParticipants.map(uid => ({ participants: { some: { userId: uid } } })),
                participants: { none: { userId: { notIn: allParticipants } } }
            }
        });

        if (existing) {
            // Restaurer si supprimé
            await prisma.conversationParticipant.updateMany({
                where: { conversationId: existing.id, userId: { in: allParticipants } },
                data: { deletedAt: null }
            });
            return { success: true, conversationId: existing.id };
        }
    }

    // Créer la conversation
    const conversation = await prisma.conversation.create({
        data: {
            name: name || null,
            isGroup,
            participants: {
                create: allParticipants.map(uid => ({
                    userId: uid,
                    isAdmin: uid === myId,
                    // La conversation est neuve : rien à lire pour son créateur
                    lastReadAt: uid === myId ? new Date() : null
                }))
            }
        }
    });

    revalidatePath("/messagerie");
    return { success: true, conversationId: conversation.id };
}

/**
 * Quitte une conversation
 */
export async function leaveConversation(conversationId: string): Promise<ActionResult> {
    const session = await getActiveSession();
    const userId = session?.user?.id;
    if (!userId) return { success: false, error: "Non autorisé" };

    // Quitter marque seulement le départ (`deletedAt`), comme pour les groupes (carte 136) : la conversation
    // disparaît de la liste de ce membre, mais reste intacte pour les autres.
    const left = await prisma.conversationParticipant.updateMany({
        where: { userId, conversationId },
        data: { deletedAt: new Date() }
    });
    if (left.count === 0) return { success: false, error: "Accès refusé" };

    // La conversation et ses messages ne sont supprimés que lorsque plus personne n'y est présent (carte 170). Avant,
    // elle l'était dès qu'il ne restait qu'un participant : quitter une conversation à deux l'effaçait aussi chez l'autre.
    const remainingCount = await prisma.conversationParticipant.count({
        where: { conversationId, deletedAt: null }
    });

    if (remainingCount === 0) {
        await prisma.conversation.delete({ where: { id: conversationId } });
    }

    revalidatePath("/messagerie");
    return { success: true };
}

/**
 * Recherche des utilisateurs
 */
export async function searchUsers(query: string) {
    const session = await getActiveSession();
    if (!session?.user) return [];

    if (query.trim().length < USER_SEARCH_MIN_LENGTH) return [];

    const users = await prisma.user.findMany({
        where: userSearchWhere(query, session.user.id),
        take: 10,
        select: {
            id: true,
            name: true,
            image: true,
            _count: {
                select: {
                    conversationParticipants: {
                        where: { deletedAt: null }
                    }
                }
            }
        }
    });

    return users.map(u => ({
        id: u.id,
        name: u.name,
        image: u.image,
        isFull: u._count.conversationParticipants >= CONVERSATION_LIMIT
    }));
}

/**
 * Ajoute des participants à un groupe existant
 */
export async function inviteToGroup(conversationId: string, userIds: string[]): Promise<ActionResult> {
    const session = await getActiveSession();
    const myId = session?.user?.id;
    if (!myId) return { success: false, error: "Non autorisé" };

    // Vérifier si la conversation est un groupe
    const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { isGroup: true }
    });

    if (!conv?.isGroup) return { success: false, error: "Ce n'est pas un groupe" };

    // Seul un membre du groupe peut y inviter quelqu'un (sinon n'importe qui pouvait s'ajouter et lire les messages)
    const inviter = await prisma.conversationParticipant.findUnique({
        where: { userId_conversationId: { userId: myId, conversationId } },
        select: { deletedAt: true }
    });
    if (!inviter || inviter.deletedAt) return { success: false, error: "Accès refusé" };

    if (await hasBlockBetween(myId, userIds.filter(uid => uid !== myId))) {
        return { success: false, error: "Impossible d'inviter un membre qui vous a bloqué ou que vous avez bloqué." };
    }

    // Filtrer pour ne pas ajouter des personnes déjà présentes
    const existing = await prisma.conversationParticipant.findMany({
        where: { conversationId, userId: { in: userIds } },
        select: { userId: true, deletedAt: true }
    });
    const existingIds = new Set(existing.map(e => e.userId));

    // Un membre qui avait quitté le groupe et qu'on invite à nouveau y revient (carte 136 : les membres partis ne sont
    // plus affichés, la fenêtre d'invitation les propose donc de nouveau)
    const leftIds = existing.filter(e => e.deletedAt).map(e => e.userId);
    // Le membre invité de nouveau, comme le nouveau venu ci-dessous, part de l'invitation pour ses non-lus : les
    // messages déjà échangés ne lui sont pas signalés comme non lus (carte 170).
    const now = new Date();
    if (leftIds.length > 0) {
        await prisma.conversationParticipant.updateMany({
            where: { conversationId, userId: { in: leftIds } },
            data: { deletedAt: null, lastReadAt: now }
        });
    }
    const toAdd = [...new Set(userIds.filter(uid => !existingIds.has(uid)))];

    if (toAdd.length > 0) {
        await prisma.conversationParticipant.createMany({
            data: toAdd.map(uid => ({
                userId: uid,
                conversationId,
                isAdmin: false,
                lastReadAt: now
            }))
        });
    }

    revalidatePath("/messagerie");
    return { success: true };
}

/**
 * Renomme une conversation de groupe
 */
export async function renameConversation(conversationId: string, name: string): Promise<ActionResult> {
    const session = await getActiveSession();
    const myId = session?.user?.id;
    if (!myId) return { success: false, error: "Non autorisé" };

    // Vérifier si la conversation est un groupe et si l'utilisateur participe
    const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: { where: { userId: myId } } }
    });

    if (!conv) return { success: false, error: "Conversation introuvable" };
    if (!conv.isGroup) return { success: false, error: "Seules les conversations de groupe peuvent être renommées" };
    if (conv.participants.length === 0) return { success: false, error: "Vous ne participez pas à cette conversation" };

    await prisma.conversation.update({
        where: { id: conversationId },
        data: { name: name.trim() || null }
    });

    revalidatePath("/messagerie");
    return { success: true };
}

