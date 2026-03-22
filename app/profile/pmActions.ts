"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
        { user1Id: userId },
        { user2Id: userId }
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
        { user1Id: userId },
        { user2Id: userId }
      ]
    }
  });

  return {
    conversations,
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

  // Verify membership
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { user1Id: true, user2Id: true }
  });

  if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
    throw new Error("Conversation introuvable ou accès refusé");
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

  return {
    messages,
    totalPages: Math.ceil(total / MESSAGES_PER_PAGE),
    currentPage: page
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

  if (existing) return { success: true, conversationId: existing.id };

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

  const message = await prisma.privateMessage.create({
    data: {
      conversationId,
      authorId: userId,
      content
    }
  });

  // Update conversation timestamp for sorting
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
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

  await prisma.conversation.delete({
    where: { id: conversationId }
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
