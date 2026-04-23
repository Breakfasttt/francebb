"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendPmNotification } from "@/lib/mail";
import { encrypt, decrypt } from "@/lib/crypto";

const CONVERSATION_LIMIT = 50;
const CONVERSATIONS_PER_PAGE = 20;
const MESSAGES_PER_PAGE = 30;

/**
 * Récupère les conversations paginées pour l'utilisateur actuel
 */
export async function getConversations(page = 1) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Non autorisé");

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
          },
          _count: {
            select: {
              messages: {
                where: {
                  authorId: { not: userId },
                  readAt: null
                }
              }
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

  const conversations = participants.map(p => {
    const conv = p.conversation;
    // Déchiffrer le dernier message
    if (conv.messages.length > 0) {
      conv.messages[0].content = decrypt(conv.messages[0].content);
    }
    return conv;
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
 * Récupère les messages d'une conversation
 */
export async function getConversationMessages(conversationId: string, page = 1) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Non autorisé");

  // Vérifier la participation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      userId_conversationId: { userId, conversationId }
    }
  });

  if (!participant || participant.deletedAt) {
    throw new Error("Accès refusé");
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

  // Marquer comme lu
  await prisma.privateMessage.updateMany({
    where: {
      conversationId,
      authorId: { not: userId },
      readAt: null
    },
    data: { readAt: new Date() }
  });

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
    conversation,
    totalPages: Math.ceil(total / MESSAGES_PER_PAGE),
    currentPage: page
  };
}

/**
 * Envoie un message
 */
export async function sendMessage(conversationId: string, content: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Non autorisé");

  const participant = await prisma.conversationParticipant.findUnique({
    where: { userId_conversationId: { userId, conversationId } }
  });

  if (!participant) throw new Error("Accès refusé");

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

  // Restaurer pour tout le monde (optionnel, selon choix UX, ici on restaure si nouveau message)
  await prisma.conversationParticipant.updateMany({
    where: { conversationId },
    data: { deletedAt: null }
  });

  // Notification par mail aux autres participants (si notif active)
  const others = await prisma.conversationParticipant.findMany({
    where: { 
        conversationId, 
        userId: { not: userId } 
    },
    include: { user: { select: { email: true, notifPm: true, name: true } } }
  });

  const senderName = session.user.name || "Un coach";

  for (const p of others) {
    if (p.user.email && p.user.notifPm) {
      // Uniquement si pas de messages non lus (pour éviter spam)
      const unreadCount = await prisma.privateMessage.count({
        where: { conversationId, authorId: userId, readAt: null }
      });
      if (unreadCount === 1) {
        sendPmNotification(p.user.email, senderName, content.substring(0, 100));
      }
    }
  }

  revalidatePath("/messagerie");
  return { success: true, messageId: message.id };
}

/**
 * Crée une conversation (1v1 ou Groupe)
 */
export async function startConversation(userIds: string[], name?: string) {
    const session = await auth();
    const myId = session?.user?.id;
    if (!myId) throw new Error("Non autorisé");

    const allParticipants = [...new Set([myId, ...userIds])];
    const isGroup = allParticipants.length > 2 || !!name;

    // Vérifier la limite de 50 conversations
    const myConvCount = await prisma.conversationParticipant.count({
        where: { userId: myId, deletedAt: null }
    });
    if (myConvCount >= CONVERSATION_LIMIT) {
        throw new Error(`Vous avez atteint la limite de ${CONVERSATION_LIMIT} conversations.`);
    }

    // Si c'est un 1v1, vérifier si elle existe déjà
    if (!isGroup && allParticipants.length === 2) {
        const otherId = userIds[0];
        const existing = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                participants: { every: { userId: { in: allParticipants } } }
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
                    isAdmin: uid === myId
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
export async function leaveConversation(conversationId: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Non autorisé");

    await prisma.conversationParticipant.update({
        where: { userId_conversationId: { userId, conversationId } },
        data: { deletedAt: new Date() }
    });

    // Vérifier combien de participants restent (non "deleted")
    const remainingCount = await prisma.conversationParticipant.count({
        where: { conversationId, deletedAt: null }
    });

    if (remainingCount <= 1) {
        // Suppression automatique si 1 ou 0 membre
        await prisma.conversation.delete({ where: { id: conversationId } });
    }

    revalidatePath("/messagerie");
    return { success: true };
}

/**
 * Recherche des utilisateurs
 */
export async function searchUsers(query: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Non autorisé");

    if (query.length < 2) return [];

    const users = await prisma.user.findMany({
        where: {
            name: { contains: query },
            id: { not: session.user.id },
            blockedBy: { none: { blockerId: session.user.id } },
            blocks: { none: { blockedId: session.user.id } }
        },
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
export async function inviteToGroup(conversationId: string, userIds: string[]) {
    const session = await auth();
    const myId = session?.user?.id;
    if (!myId) throw new Error("Non autorisé");

    // Vérifier si la conversation est un groupe
    const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { isGroup: true }
    });

    if (!conv?.isGroup) throw new Error("Ce n'est pas un groupe");

    // Filtrer pour ne pas ajouter des personnes déjà présentes
    const existing = await prisma.conversationParticipant.findMany({
        where: { conversationId, userId: { in: userIds } },
        select: { userId: true }
    });
    const existingIds = new Set(existing.map(e => e.userId));
    const toAdd = [...new Set(userIds.filter(uid => !existingIds.has(uid)))];

    if (toAdd.length > 0) {
        await prisma.conversationParticipant.createMany({
            data: toAdd.map(uid => ({
                userId: uid,
                conversationId,
                isAdmin: false
            }))
        });
    }

    revalidatePath("/messagerie");
    return { success: true };
}
