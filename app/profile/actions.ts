"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/crypto";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté");

  const name = formData.get("name") as string;
  const image = formData.get("image") as string;
  const nafNumber = formData.get("nafNumber") as string;
  const region = formData.get("region") as string;
  const league = formData.get("league") as string;
  const signature = formData.get("signature") as string;
  const avatarFrame = formData.get("avatarFrame") as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name || undefined,
      image: image || undefined,
      nafNumber: nafNumber || null,
      region: region || null,
      league: league || null,
      signature: signature || null,
      avatarFrame: avatarFrame || "auto",
    }
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function toggleBanUser(userId: string) {
  const session = await auth();
  if (!isModerator(session?.user?.role)) throw new Error("Action non autorisée");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true }
  });

  if (!user) throw new Error("Utilisateur introuvable");

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: !user.isBanned }
  });

  revalidatePath(`/spy/${userId}`);
  return { success: true };
}

export async function getUserStats(userId: string) {
  const postCount = await prisma.post.count({
    where: { authorId: userId, isDeleted: false }
  });

  return { postCount };
}

export async function getUserActivity(userId: string, limit: number = 5) {
  // Return last posts/topics
  const posts = await prisma.post.findMany({
    where: { authorId: userId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      topic: true
    }
  });

  return posts;
}

export async function reportUser(userId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté");

  // For now, we just log it or simulate a report
  console.log(`REPORT: User ${session.user.id} reported User ${userId} for: ${reason}`);
  
  // Future: create a Report model or send a PM to moderators
  return { success: true };
}

// --- PRIVATE MESSAGES ACTIONS (Merged from pmActions.ts) ---

const CONVERSATION_LIMIT = 200;
const CONVERSATIONS_PER_PAGE = 10;
const MESSAGES_PER_PAGE = 20;

/**
 * Get paginated conversations for the current user
 */
export async function getConversations(page = 1) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Non autorisé");

  const skip = (page - 1) * CONVERSATIONS_PER_PAGE;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { user1Id: userId, user1DeletedAt: null },
        { user2Id: userId, user2DeletedAt: null }
      ]
    },
    orderBy: { updatedAt: "desc" },
    skip,
    take: CONVERSATIONS_PER_PAGE,
    include: {
      user1: { select: { id: true, name: true, image: true } },
      user2: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
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
  });

  const total = await prisma.conversation.count({
    where: {
      OR: [
        { user1Id: userId, user1DeletedAt: null },
        { user2Id: userId, user2DeletedAt: null }
      ]
    }
  });

  const decryptedConversations = conversations.map(c => {
    if (c.messages.length > 0) {
      c.messages[0].content = decrypt(c.messages[0].content);
    }
    return c;
  });

  return {
    conversations: decryptedConversations,
    totalPages: Math.ceil(total / CONVERSATIONS_PER_PAGE),
    currentPage: page
  };
}

/**
 * Get paginated messages for a conversation (Most recent first as requested)
 */
export async function getConversationMessages(conversationId: string, page = 1) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Non autorisé");

  // Verify membership and get participants
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      user1: { select: { id: true, name: true, image: true } },
      user2: { select: { id: true, name: true, image: true } }
    }
  });

  if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
    throw new Error("Conversation introuvable ou accès refusé");
  }

  const recipient = conversation.user1Id === userId ? conversation.user2 : conversation.user1;

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

  // Mark unread messages as read
  await prisma.privateMessage.updateMany({
    where: {
      conversationId,
      authorId: { not: userId },
      readAt: null
    },
    data: { readAt: new Date() }
  });

  const total = await prisma.privateMessage.count({ where: { conversationId } });

  const decryptedMessages = messages.map(msg => ({
    ...msg,
    content: decrypt(msg.content)
  }));

  return {
    messages: decryptedMessages,
    totalPages: Math.ceil(total / MESSAGES_PER_PAGE),
    currentPage: page,
    recipient
  };
}

/**
 * Start or retrieve a conversation with another user
 */
export async function startConversation(recipientId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Non autorisé");
  if (userId === recipientId) throw new Error("Vous ne pouvez pas démarrer une conversation avec vous-même");

  // Sort participant IDs to match @@unique([user1Id, user2Id])
  const [u1, u2] = [userId, recipientId].sort();

  // Check if conversation exists
  const existing = await prisma.conversation.findUnique({
    where: {
      user1Id_user2Id: { user1Id: u1, user2Id: u2 }
    }
  });

  if (existing) {
    // Si la conversation existait mais était masquée pour l'un des deux, on la restaure
    await prisma.conversation.update({
      where: { id: existing.id },
      data: {
        user1DeletedAt: existing.user1Id === userId ? null : undefined,
        user2DeletedAt: existing.user2Id === userId ? null : undefined,
      }
    });
    return { success: true, conversationId: existing.id };
  }

  // Check limits for both users
  const user1Count = await prisma.conversation.count({
    where: { OR: [{ user1Id: u1 }, { user2Id: u1 }] }
  });
  if (user1Count >= CONVERSATION_LIMIT) {
    throw new Error("Vous avez atteint votre limite de 200 conversations.");
  }

  const user2Count = await prisma.conversation.count({
    where: { OR: [{ user1Id: u2 }, { user2Id: u2 }] }
  });
  if (user2Count >= CONVERSATION_LIMIT) {
    throw new Error("La boîte de réception du destinataire est pleine.");
  }

  const conversation = await prisma.conversation.create({
    data: {
      user1Id: u1,
      user2Id: u2
    }
  });

  revalidatePath("/profile");
  return { success: true, conversationId: conversation.id };
}

/**
 * Send a private message
 */
export async function sendPrivateMessage(conversationId: string, content: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Non autorisé");

  // Verify membership
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
    throw new Error("Conversation introuvable");
  }

    const encryptedContent = encrypt(content);
  
  const message = await prisma.privateMessage.create({
    data: {
      conversationId,
      authorId: userId,
      content: encryptedContent
    }
  });

  // Update conversation timestamp for sorting AND restore for both if deleted
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { 
      updatedAt: new Date(),
      user1DeletedAt: null,
      user2DeletedAt: null
    }
  });

  revalidatePath("/profile");
  return { success: true, messageId: message.id };
}

/**
 * Delete a conversation (Irreversible)
 */
export async function deleteConversation(conversationId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Non autorisé");

  // Verify membership
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
    throw new Error("Conversation introuvable");
  }

  // Soft delete for the current user only
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      [conversation.user1Id === userId ? "user1DeletedAt" : "user2DeletedAt"]: new Date()
    }
  });

  revalidatePath("/profile");
  return { success: true };
}

/**
 * Search users for PM with limit check
 */
export async function searchUsersForPm(query: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");

  if (query.length < 2) return [];

  const users = await prisma.user.findMany({
    where: {
      name: { contains: query },
      id: { not: session.user.id }
    },
    take: 10,
    select: {
      id: true,
      name: true,
      image: true,
      _count: {
        select: {
          user1Conversations: true,
          user2Conversations: true
        }
      }
    }
  });

  return users.map(u => ({
    id: u.id,
    name: u.name,
    image: u.image,
    isFull: (u._count.user1Conversations + u._count.user2Conversations) >= CONVERSATION_LIMIT
  }));
}
export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecté");

  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Supprimer les données privées et sensibles
      await tx.account.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.topicView.deleteMany({ where: { userId } });
      await tx.postReaction.deleteMany({ where: { userId } });
      await tx.mention.deleteMany({ where: { OR: [{ mentionerId: userId }, { mentionedUserId: userId }] } });
      
      // 2. Supprimer les messages privés et conversations associées
      await tx.privateMessage.deleteMany({ where: { authorId: userId } });
      await tx.conversation.deleteMany({ where: { OR: [{ user1Id: userId }, { user2Id: userId }] } });

      // 3. Anonymiser l'activité publique pour ne pas casser la structure du forum
      // On vérifie si l'utilisateur "Ghost" existe, sinon on le crée
      const ghostId = "ghost_coach";
      let ghost = await tx.user.findUnique({ where: { id: ghostId } });
      if (!ghost) {
        ghost = await tx.user.create({
          data: {
            id: ghostId,
            name: "Coach Inconnu",
            email: "ghost@breakfasttt.fr",
            role: "COACH",
            isBanned: true // Pour éviter toute connexion
          }
        });
      }

      await tx.topic.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId }
      });

      await tx.post.updateMany({
        where: { authorId: userId },
        data: { authorId: ghostId, content: "[Ce message a été supprimé suite à la clôture du compte]" }
      });

      // 4. Supprimer l'utilisateur lui-même (sauf si SUPERADMIN)
      if (session.user.role === "SUPERADMIN") {
        await tx.user.update({
          where: { id: userId },
          data: {
            image: null,
            signature: null,
            nafNumber: null,
            region: null,
            league: null,
            avatarFrame: "auto"
          }
        });
      } else {
        await tx.user.delete({ where: { id: userId } });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    return { success: false, error: "Une erreur est survenue lors de la suppression." };
  }
}

export async function getReferenceDataAction(group: string) {
  return await prisma.referenceData.findMany({
    where: { group, isActive: true },
    orderBy: { order: "asc" },
    select: { key: true, label: true }
  });
}
