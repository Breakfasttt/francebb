"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getUnreadMessagesCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return await prisma.pm.count({
    where: {
      receiverId: session.user.id,
      readAt: null
    }
  });
}

export async function getRecentPosts(limit: number = 3) {
  return await prisma.post.findMany({
    take: limit,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      topic: true,
      author: true
    }
  });
}

export async function getRandomPostUrl() {
  const count = await prisma.topic.count();
  if (count === 0) return "/forum";

  const skip = Math.floor(Math.random() * count);
  const randomTopic = await prisma.topic.findFirst({
    skip: skip,
    select: { id: true }
  });

  return randomTopic ? `/forum/topic/${randomTopic.id}` : "/forum";
}

export async function markTopicAsRead(topicId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.topicView.upsert({
    where: {
      userId_topicId: {
        userId: session.user.id,
        topicId: topicId
      }
    },
    update: {
      lastViewedAt: new Date()
    },
    create: {
      userId: session.user.id,
      topicId: topicId,
      lastViewedAt: new Date()
    }
  });

  revalidatePath(`/forum/topic/${topicId}`);
}

export async function getUnreadTopicsCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  // This is a bit more complex in Prisma without raw SQL or multiple queries
  // We want topics where (TopicView doesn't exist OR topic.updatedAt > TopicView.lastViewedAt)

  const topics = await prisma.topic.findMany({
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

export async function deleteForum(forumId: string) {
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

  redirect("/forum");
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
