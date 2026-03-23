"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getUnreadMessagesCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return await prisma.privateMessage.count({
    where: {
      conversation: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id }
        ]
      },
      authorId: {
        not: session.user.id
      },
      readAt: null
    }
  });
}

export async function getRecentPosts(limit: number = 3) {
  const session = await auth();
  const userId = session?.user?.id;

  const topics = await prisma.topic.findMany({
    take: limit,
    orderBy: {
      updatedAt: "desc"
    },
    where: {
      isArchived: false
    },
    include: {
      _count: {
        select: { posts: true }
      },
      topicViews: {
        where: { userId: userId || "" }
      },
      posts: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { author: true }
      }
    }
  });

  return topics
    .filter(t => t.posts.length > 0)
    .map(topic => {
      const lastPost = topic.posts[0];
      return {
        id: lastPost.id,
        createdAt: lastPost.createdAt,
        author: lastPost.author,
        topic: {
          id: topic.id,
          title: topic.title,
          updatedAt: topic.updatedAt,
          topicViews: topic.topicViews,
          _count: topic._count
        },
        isRead: topic.topicViews[0] ? topic.updatedAt <= topic.topicViews[0].lastViewedAt : false
      };
    });
}

export async function getRandomPostUrl() {
  const count = await prisma.topic.count({ where: { isArchived: false } });
  if (count === 0) return "/forum";

  const skip = Math.floor(Math.random() * count);
  const randomTopic = await prisma.topic.findFirst({
    where: { isArchived: false },
    skip: skip,
    select: { id: true }
  });

  return randomTopic ? `/forum/topic/${randomTopic.id}` : "/forum";
}

export async function markTopicAsRead(topicId: string) {
  // Increment views safely using RAW SQL to avoid triggering Prisma's @updatedAt (which makes topics 'unread')
  await prisma.$executeRaw`UPDATE "Topic" SET "views" = Coalesce("views", 0) + 1 WHERE "id" = ${topicId}`;

  const session = await auth();
  if (!session?.user?.id) return;

  // Find the latest post to store its ID and timestamp
  const latestPost = await prisma.post.findFirst({
    where: { topicId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
  });

  await prisma.topicView.upsert({
    where: {
      userId_topicId: {
        userId: session.user.id,
        topicId: topicId
      }
    },
    update: {
      lastViewedAt: new Date(),
      lastPostId: latestPost?.id || null
    },
    create: {
      userId: session.user.id,
      topicId: topicId,
      lastViewedAt: new Date(),
      lastPostId: latestPost?.id || null
    }
  });

  revalidatePath(`/forum/topic/${topicId}`);
}

export async function markTopicAsUnreadFrom(topicId: string, postId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const currentPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { createdAt: true, id: true }
  });

  if (!currentPost) return;

  // To mark from this post as unread, we need to set the "last read" pointer
  // to the post immediately preceding it.
  const previousPost = await prisma.post.findFirst({
    where: {
      topicId,
      OR: [
        { createdAt: { lt: currentPost.createdAt } },
        { 
          createdAt: currentPost.createdAt,
          id: { lt: currentPost.id }
        }
      ]
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
  });

  if (previousPost) {
    await prisma.topicView.upsert({
      where: { userId_topicId: { userId: session.user.id, topicId } },
      update: { 
        lastViewedAt: previousPost.createdAt, 
        lastPostId: previousPost.id 
      },
      create: { 
        userId: session.user.id, 
        topicId, 
        lastViewedAt: previousPost.createdAt, 
        lastPostId: previousPost.id 
      }
    });
  } else {
    // No preceding post -> marking from the very first post as unread
    await prisma.topicView.deleteMany({
      where: { userId: session.user.id, topicId }
    });
  }

  revalidatePath(`/forum/topic/${topicId}`);
  revalidatePath("/forum/unread");
  revalidatePath("/forum");
}

export async function getUnreadTopicsCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  // This is a bit more complex in Prisma without raw SQL or multiple queries
  // We want topics where (TopicView doesn't exist OR topic.updatedAt > TopicView.lastViewedAt)

  const topics = await prisma.topic.findMany({
    where: { isArchived: false },
    include: {
      topicViews: {
        where: { userId: session.user.id }
      }
    }
  });

  const unreadCount = topics.filter(topic => {
    const view = topic.topicViews[0];
    if (!view) return true;
    return topic.updatedAt > view.lastViewedAt;
  }).length;

  return unreadCount;
}
export async function getUnreadTopics() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const topics = await prisma.topic.findMany({
    where: { isArchived: false },
    include: {
      author: true,
      forum: true,
      _count: { select: { posts: true } },
      topicViews: {
        where: { userId: session.user.id }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return topics.filter(topic => {
    const view = topic.topicViews[0];
    if (!view) return true;
    return topic.updatedAt > view.lastViewedAt;
  });
}

export async function getSubForumCount(parentForumId: string) {
  return await prisma.forum.count({
    where: { parentForumId }
  });
}

export async function createForum(formData: FormData) {
  const session = await auth();
  const userRole = session?.user?.role;

  if (!userRole || !isModerator(userRole)) {
    throw new Error("Seuls les modérateurs peuvent créer des forums.");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string || null;
  const parentForumId = formData.get("parentForumId") as string || null;
  const order = parseInt(formData.get("order") as string || "0");

  if (parentForumId) {
    const count = await prisma.forum.count({ where: { parentForumId } });
    if (count >= 5) {
      throw new Error("Le nombre maximum de sous-forums (5) a été atteint pour ce forum.");
    }
  }

  const forum = await prisma.forum.create({
    data: {
      name,
      description,
      categoryId: categoryId || undefined,
      parentForumId: parentForumId || undefined,
      order,
    }
  });

  revalidatePath("/forum");
  if (parentForumId) {
    revalidatePath(`/forum/${parentForumId}`);
  }

  redirect(parentForumId ? `/forum/${parentForumId}` : "/forum");
}

export async function getQuoteStatusMap(contents: string[]) {
  const quoteRegex = /\[quote=([a-zA-Z0-9_-]+)\|?([a-zA-Z0-9_-]*)\]/gi;
  const postIds = new Set<string>();
  
  for (const content of contents) {
    if (!content) continue;
    const matches = [...content.matchAll(quoteRegex)];
    for (const match of matches) {
      if (match[2]) postIds.add(match[2]);
    }
  }

  if (postIds.size === 0) return {};

  const posts = await prisma.post.findMany({
    where: { id: { in: Array.from(postIds) } },
    select: { id: true, isDeleted: true, isModerated: true }
  });

  const map: Record<string, { isDeleted: boolean, isModerated: boolean }> = {};
  for (const p of posts) {
    map[p.id] = { isDeleted: p.isDeleted, isModerated: p.isModerated };
  }
  return map;
}

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { order: "asc" }
  });
}

export async function getForums() {
  return await prisma.forum.findMany({
    where: { parentForumId: null },
    orderBy: { order: "asc" }
  });
}

export async function deleteForum(forumId: string, forumName: string) {
  const session = await auth();
  const userRole = session?.user?.role;

  if (!userRole || !isModerator(userRole)) {
    throw new Error("Seuls les modérateurs peuvent supprimer des forums.");
  }

  // Deleting a forum requires deleting all its content manually since we don't have cascade delete in schema
  // We need to handle sub-forums too
  const subForums = await prisma.forum.findMany({
    where: { parentForumId: forumId },
    select: { id: true }
  });

  const allForumIds = [forumId, ...subForums.map(sf => sf.id)];

  // 1. Delete all TopicViews for topics in these forums
  await prisma.topicView.deleteMany({
    where: {
      topic: {
        forumId: { in: allForumIds }
      }
    }
  });

  // 2. Delete all posts in these forums
  await prisma.post.deleteMany({
    where: {
      topic: {
        forumId: { in: allForumIds }
      }
    }
  });

  // 3. Delete all topics in these forums
  await prisma.topic.deleteMany({
    where: {
      forumId: { in: allForumIds }
    }
  });

  // 4. Delete sub-forums
  await prisma.forum.deleteMany({
    where: {
      parentForumId: forumId
    }
  });

  // 5. Delete the forum itself
  const deletedForum = await prisma.forum.delete({
    where: { id: forumId }
  });

  revalidatePath("/forum");
  if (deletedForum.parentForumId) {
    revalidatePath(`/forum/${deletedForum.parentForumId}`);
  }

  redirect(`/forum?deletedForum=${encodeURIComponent(forumName)}`);
}

export async function createTopic(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté pour créer un sujet.");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const forumId = formData.get("forumId") as string;
  const isSticky = formData.get("isSticky") === "on";
  const isLocked = formData.get("isLocked") === "on";

  if (!title || !content || !forumId) {
    throw new Error("Titre, contenu et forum sont obligatoires.");
  }

  // Create the topic AND the first post in a transaction
  const topic = await prisma.$transaction(async (tx) => {
    const newTopic = await tx.topic.create({
      data: {
        title,
        forumId,
        authorId: session.user.id,
        isSticky: isSticky && isModerator(session.user.role),
        isLocked: isLocked && isModerator(session.user.role),
      }
    });

    await tx.post.create({
      data: {
        content,
        topicId: newTopic.id,
        authorId: session.user.id,
      }
    });

    return newTopic;
  });

  revalidatePath(`/forum/${forumId}`);
  revalidatePath("/forum/unread");

  redirect(`/forum/topic/${topic.id}`);
}

export async function createPost(topicId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté pour répondre.");
  }

  const post = await prisma.post.create({
    data: {
      content,
      topicId,
      authorId: session.user.id,
    }
  });

  // Update topic timestamp to show it and bubble it up
  await prisma.topic.update({
    where: { id: topicId },
    data: { updatedAt: new Date() }
  });

  revalidatePath(`/forum/topic/${topicId}`);
  return post;
}

export async function updatePost(postId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté pour modifier un message.");
  }

  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, topicId: true }
  });

  if (!existingPost) throw new Error("Message introuvable.");
  if (existingPost.authorId !== session.user.id && !isModerator(session.user.role)) {
    throw new Error("Vous n'avez pas l'autorisation de modifier ce message.");
  }

  await prisma.post.update({
    where: { id: postId },
    data: { content, updatedAt: new Date() }
  });

  revalidatePath(`/forum/topic/${existingPost.topicId}`);
  return { topicId: existingPost.topicId };
}

export async function getPostById(postId: string) {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true, topic: true }
  });
}

export async function getTopicLatestPosts(topicId: string, limit: number = 3) {
  return await prisma.post.findMany({
    where: { topicId },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { author: true }
  });
}

export async function moderatePost(postId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    throw new Error("Seuls les modérateurs peuvent modérer des messages.");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!post) {
    throw new Error("Message introuvable.");
  }

  await prisma.post.update({
    where: { id: postId },
    data: { 
      isModerated: true,
      moderationReason: reason,
      moderatedBy: session.user.id,
      updatedAt: new Date()
    }
  });

  revalidatePath(`/forum/topic/${post.topicId}`);
}

export async function unmoderatePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    throw new Error("Seuls les modérateurs peuvent annuler une modération.");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!post) throw new Error("Message introuvable.");

  await prisma.post.update({
    where: { id: postId },
    data: { 
      isModerated: false,
      moderationReason: null,
      moderatedBy: null,
      updatedAt: new Date()
    }
  });

  revalidatePath(`/forum/topic/${post.topicId}`);
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté.");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { topic: { include: { posts: true } } }
  });

  if (!post) throw new Error("Message introuvable.");

  // Check if it's the author
  // NOTE: User said ONLY the creator can delete it. 
  // Modérateurs can moderate but not delete (based on requirement 6).
  if (post.authorId !== session.user.id) {
    throw new Error("Seul l'auteur peut supprimer son message.");
  }

  // Soft delete: just mark the post as isDeleted
  await prisma.post.update({
    where: { id: postId },
    data: { isDeleted: true }
  });



  revalidatePath(`/forum/topic/${post.topicId}`);
  revalidatePath(`/forum/${post.topic.forumId}`);
}

export async function markAllTopicsAsRead() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non autorisé" };

  try {
    const topics = await prisma.topic.findMany({
      select: {
        id: true,
        updatedAt: true,
        topicViews: {
          where: { userId: session.user.id },
          select: { lastViewedAt: true }
        }
      }
    });

    const now = new Date();
    const toUpdate = topics.filter(t => !t.topicViews[0] || t.topicViews[0].lastViewedAt < t.updatedAt);

    if (toUpdate.length > 0) {
      await prisma.$transaction(
        toUpdate.map(t => 
          prisma.topicView.upsert({
            where: {
              userId_topicId: {
                userId: session.user.id,
                topicId: t.id
              }
            },
            update: { lastViewedAt: now },
            create: { userId: session.user.id, topicId: t.id, lastViewedAt: now }
          })
        )
      );
    }

    revalidatePath("/forum");
    return { success: true };
  } catch (error) {
    console.error("markAllTopicsAsRead Error:", error);
    return { success: false, error: "Une erreur est survenue." };
  }
}

export async function togglePinTopic(topicId: string) {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    throw new Error("Seuls les modérateurs peuvent épingler des sujets.");
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { isSticky: true }
  });

  if (!topic) throw new Error("Sujet introuvable.");

  await prisma.topic.update({
    where: { id: topicId },
    data: { isSticky: !topic.isSticky }
  });

  revalidatePath(`/forum/topic/${topicId}`);
}

export async function deleteTopicPermanent(topicId: string, topicTitle: string) {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    throw new Error("Seuls les modérateurs peuvent supprimer des sujets.");
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });

  if (!topic) throw new Error("Sujet introuvable.");

  await prisma.$transaction([
    prisma.topicView.deleteMany({ where: { topicId } }),
    prisma.post.deleteMany({ where: { topicId } }),
    prisma.topic.delete({ where: { id: topicId } })
  ]);

  revalidatePath(`/forum/${topic.forumId}`);
  redirect(`/forum?deletedTopic=${encodeURIComponent(topicTitle)}`);
}

export async function moveTopic(topicId: string, newForumId: string) {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    throw new Error("Seuls les modérateurs peuvent déplacer des sujets.");
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });

  if (!topic) throw new Error("Sujet introuvable.");

  await prisma.topic.update({
    where: { id: topicId },
    data: { forumId: newForumId }
  });

  revalidatePath(`/forum/${topic.forumId}`);
  revalidatePath(`/forum/${newForumId}`);
  revalidatePath(`/forum/topic/${topicId}`);
}

export async function updateTopicTitle(topicId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté.");
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { authorId: true }
  });

  if (!topic) throw new Error("Sujet introuvable.");

  const sessionUser = session.user as { id: string; role: string };
  if (topic.authorId !== sessionUser.id && !isModerator(sessionUser.role)) {
    throw new Error("Vous n'avez pas l'autorisation de modifier ce sujet.");
  }

  await prisma.topic.update({
    where: { id: topicId },
    data: { title }
  });

  revalidatePath(`/forum/topic/${topicId}`);
}

export async function togglePostReaction(postId: string, emoji: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Vous devez être connecté.");

  const userId = session.user.id;

  const existing = await prisma.postReaction.findFirst({
    where: {
      postId,
      userId
    }
  });

  if (existing) {
    if (existing.emoji === emoji) {
      await prisma.postReaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.postReaction.update({
        where: { id: existing.id },
        data: { emoji }
      });
    }
  } else {
    await prisma.postReaction.create({
      data: {
        postId,
        userId,
        emoji
      }
    });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { topicId: true }
  });

  if (post) {
    revalidatePath(`/forum/topic/${post.topicId}`);
  }
}

export async function toggleArchiveTopic(topicId: string) {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    throw new Error("Seuls les modérateurs peuvent archiver des sujets.");
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { id: true, isArchived: true, forumId: true }
  });

  if (!topic) throw new Error("Sujet introuvable.");

  await prisma.topic.update({
    where: { id: topicId },
    data: { isArchived: !topic.isArchived }
  });

  revalidatePath(`/forum/${topic.forumId}`);
  revalidatePath(`/forum/topic/${topicId}`);
}

/**
 * Suivi d'un sujet (follow/unfollow).
 * NOTE: la table "TopicFollow" est créée via une migration dédiée.
 */
export async function isFollowingTopic(topicId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return false;

  try {
    const rows = await prisma.$queryRaw<Array<{ exists: number }>>`
      SELECT 1 as "exists"
      FROM "TopicFollow"
      WHERE "userId" = ${userId} AND "topicId" = ${topicId}
      LIMIT 1
    `;

    return rows.length > 0;
  } catch {
    // Si la migration n'a pas été appliquée, on considère "pas suivi".
    return false;
  }
}

/**
 * Basculer le suivi d'un sujet.
 */
export async function toggleFollowTopic(topicId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Non autorisé", isFollowing: false };

  try {
    const isAlreadyFollowing = await isFollowingTopic(topicId);

    if (isAlreadyFollowing) {
      await prisma.$executeRaw`
        DELETE FROM "TopicFollow"
        WHERE "userId" = ${userId} AND "topicId" = ${topicId}
      `;
      revalidatePath(`/forum/topic/${topicId}`);
      return { success: true, isFollowing: false };
    }

    await prisma.$executeRaw`
      INSERT INTO "TopicFollow" ("userId", "topicId")
      VALUES (${userId}, ${topicId})
    `;
    revalidatePath(`/forum/topic/${topicId}`);
    return { success: true, isFollowing: true };
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour du suivi.", isFollowing: false };
  }
}

/**
 * Récupérer la liste des topics suivis par l'utilisateur connecté.
 */
export async function getFollowedTopics() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  try {
    const rows = await prisma.$queryRaw<Array<{
      id: string;
      title: string;
      updatedAt: string | Date;
      forumId: string;
    }>>`
      SELECT
        t.id as id,
        t.title as title,
        t.updatedAt as "updatedAt",
        t.forumId as "forumId"
      FROM "TopicFollow" tf
      JOIN "Topic" t ON t.id = tf."topicId"
      WHERE tf."userId" = ${userId}
      ORDER BY t.updatedAt DESC
      LIMIT 20
    `;

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(0),
      forumId: r.forumId,
    }));
  } catch {
    return [];
  }
}
