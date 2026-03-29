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
      forum: true,
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
          _count: topic._count,
          forum: topic.forum,
          tournamentId: topic.tournamentId
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
export async function getUnreadTopics(page: number = 1, limit: number = 20) {
  const session = await auth();
  if (!session?.user?.id) return { topics: [], total: 0 };

  const userId = session.user.id;
  const skip = (page - 1) * limit;

  // Récupérer tous les sujets potentiels (non archivés)
  // On récupère uniquement le minimum pour le filtrage
  const allTopics = await prisma.topic.findMany({
    where: { isArchived: false },
    select: {
      id: true,
      updatedAt: true,
      topicViews: {
        where: { userId },
        select: { lastViewedAt: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  // Filtrer les IDs non lus
  const unreadIds = allTopics
    .filter(topic => {
      const view = topic.topicViews[0];
      if (!view) return true; // Jamais lu
      return topic.updatedAt > view.lastViewedAt; // Mis à jour depuis la dernière lecture
    })
    .map(t => t.id);

  const total = unreadIds.length;
  const paginatedIds = unreadIds.slice(skip, skip + limit);

  // Récupérer les données complètes pour les IDs de la page courante
  const topics = await prisma.topic.findMany({
    where: { id: { in: paginatedIds } },
    include: {
      author: true,
      forum: true,
      _count: { select: { posts: true } },
      topicViews: {
        where: { userId }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return { topics, total };
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
  const isTournamentForum = formData.get("isTournamentForum") === "on";
  const afterId = formData.get("afterId") as string;

  if (parentForumId) {
    const count = await prisma.forum.count({ where: { parentForumId } });
    if (count >= 5) {
      throw new Error("Le nombre maximum de sous-forums (5) a été atteint pour ce forum.");
    }
  }

  // Déterminer l'ordre
  let order = 0;
  if (afterId && afterId !== "START") {
    const prev = await prisma.forum.findUnique({ where: { id: afterId }, select: { order: true } });
    if (prev) order = prev.order + 1;
  }

  // Transaction pour garder la cohésion
  const forum = await prisma.$transaction(async (tx) => {
    // Décaler tout ce qui est après
    await tx.forum.updateMany({
      where: {
        categoryId: categoryId || undefined,
        parentForumId: parentForumId || undefined,
        order: { gte: order }
      },
      data: { order: { increment: 1 } }
    });

    return await tx.forum.create({
      data: {
        name,
        description,
        categoryId: categoryId || undefined,
        parentForumId: parentForumId || undefined,
        order,
        isTournamentForum,
      }
    });
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

export async function getSiblings(categoryId?: string | null, parentForumId?: string | null) {
  if (parentForumId) {
    return await prisma.forum.findMany({
      where: { parentForumId },
      orderBy: { order: 'asc' }
    });
  }
  if (categoryId) {
    return await prisma.forum.findMany({
      where: { categoryId, parentForumId: null },
      orderBy: { order: 'asc' }
    });
  }
  return [];
}

export async function getAllForums() {
  return await prisma.forum.findMany({
    orderBy: { order: 'asc' }
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

  // Vérifier si le forum est locké ou un forum de tournoi
  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    select: { isLocked: true, isTournamentForum: true }
  });

  if (forum?.isLocked && !isModerator(session.user.role)) {
    throw new Error("Ce forum est verrouillé. Vous ne pouvez pas y créer de nouveau sujet.");
  }

  // Données de tournoi si applicable
  let tournamentData: any = null;
  if (forum?.isTournamentForum) {
    const tDateStr = formData.get("tDate") as string;
    const tEndDateStr = formData.get("tEndDate") as string;
    if (!tDateStr) throw new Error("La date de début du tournoi est obligatoire.");
    
    const startDate = new Date(tDateStr);
    const endDate = tEndDateStr ? new Date(tEndDateStr) : startDate;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const commissaireIds = (formData.get("commissaireIds") as string || "").split(',').filter(id => id.length > 0);

    tournamentData = {
      name: title,
      date: startDate,
      endDate: endDate,
      location: formData.get("tAddress") as string || "Lieu non précisé",
      address: formData.get("tAddress") as string,
      gmapsUrl: formData.get("tGmapsUrl") as string,
      ville: formData.get("tVille") as string,
      departement: formData.get("tDept") as string,
      region: formData.get("tRegion") as string,
      regionNAF: formData.get("tRegionNAF") as string,
      maxParticipants: parseInt(formData.get("tMax") as string) || null,
      isTeam: formData.get("isTeam") === "on",
      coachsPerTeam: formData.get("isTeam") === "on" ? Math.max(2, parseInt(formData.get("tCoachsPerTeam") as string) || 2) : 1,
      price: parseFloat(formData.get("tPrice") as string) || null,
      priceMeals: parseFloat(formData.get("tPriceMeals") as string) || null,
      priceLodging: parseFloat(formData.get("tPriceLodging") as string) || null,
      days: calculatedDays.toString(),
      structure: formData.get("tStructure") as string,
      ruleset: formData.get("tRuleset") as string,
      gameEdition: formData.get("tGame") as string || "BB20",
      platform: formData.get("tPlatform") as string || "Tabletop",
      mealsIncluded: formData.get("tMeals") === "on",
      lodgingAtVenue: formData.get("tLodging") === "on",
      fridayArrival: formData.get("tFriday") === "on",
      isNAF: formData.get("isNAF") === "on",
      isCDF: formData.get("isCDF") === "on",
      isCGO: formData.get("isCGO") === "on",
      isTGE: formData.get("isTGE") === "on",
      isTSC: formData.get("isTSC") === "on",
      ligueId: formData.get("ligueId") as string || null,
      ligueCustom: formData.get("ligueCustom") as string || null,
      organizerId: session.user.id,
      commissaires: {
        connect: commissaireIds.map(id => ({ id }))
      }
    };
  }

  // Create the topic AND the first post (and optional tournament) in a transaction
  const topic = await prisma.$transaction(async (tx) => {
    let tournamentId = null;
    if (tournamentData) {
      const tournament = await tx.tournament.create({
        data: tournamentData
      });
      tournamentId = tournament.id;
    }

    const newTopic = await tx.topic.create({
      data: {
        title,
        forumId,
        authorId: session.user.id,
        isSticky: isSticky && isModerator(session.user.role),
        isLocked: isLocked && isModerator(session.user.role),
        tournamentId: tournamentId
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
  revalidatePath("/tournaments");

  redirect(`/forum/topic/${topic.id}`);
}

export async function createPost(topicId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté pour répondre.");
  }
  if (!content) throw new Error("Le contenu est obligatoire.");

  // Vérifier si le topic ou le forum est locké
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { forum: { select: { isLocked: true } } }
  });

  if (!topic) throw new Error("Sujet introuvable.");

  if ((topic.isLocked || topic.forum.isLocked) && !isModerator(session.user.role)) {
    throw new Error("Ce sujet est verrouillé. Vous ne pouvez plus y répondre.");
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
    const follow = await (prisma as any).topicFollow.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId
        }
      }
    });

    return !!follow;
  } catch {
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
      await (prisma as any).topicFollow.delete({
        where: {
          userId_topicId: {
            userId,
            topicId
          }
        }
      });
      revalidatePath(`/forum/topic/${topicId}`);
      return { success: true, isFollowing: false };
    }

    await (prisma as any).topicFollow.create({
      data: {
        userId,
        topicId
      }
    });
    revalidatePath(`/forum/topic/${topicId}`);
    return { success: true, isFollowing: true };
  } catch (error: any) {
    console.error("DEBUG - toggleFollowTopic Error:", error);
    return { success: false, error: "Erreur lors de la mise à jour du suivi.", isFollowing: false };
  }
}

/**
 * Récupérer la liste des topics suivis par l'utilisateur connecté.
 */
export async function getFollowedTopics(page: number = 1, limit: number = 20) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { topics: [], totalPages: 0 };

  const skip = (page - 1) * limit;

  try {
    // 1. Get total count
    const totalCount = await (prisma as any).topicFollow.count({
      where: { userId }
    });
    const totalPages = Math.ceil(totalCount / limit);

    // 2. Get paginated results with included Topic and TopicView
    const follows = await (prisma as any).topicFollow.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        topic: {
          include: {
            topicViews: {
              where: { userId }
            }
          }
        }
      },
      orderBy: {
        topic: {
           updatedAt: 'desc'
        }
      }
    });

    const topics = follows.map((f: any) => {
      const topic = f.topic;
      const view = topic.topicViews?.[0];
      
      const topicDate = new Date(topic.updatedAt);
      const viewDate = view ? new Date(view.lastViewedAt) : null;
      const isUnread = !viewDate || topicDate.getTime() > viewDate.getTime();
      
      return {
        id: topic.id,
        title: topic.title,
        updatedAt: topicDate,
        forumId: topic.forumId,
        isUnread: isUnread,
      };
    });

    return { topics, totalPages };
  } catch (error) {
    console.error("getFollowedTopics error:", error);
    return { topics: [], totalPages: 0 };
  }
}
export async function toggleForumLock(forumId: string) {
  const session = await auth();
  if (!isModerator(session?.user?.role)) {
    throw new Error("Action non autorisée.");
  }

  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    select: { isLocked: true }
  });

  if (!forum) throw new Error("Forum introuvable.");

  await prisma.forum.update({
    where: { id: forumId },
    data: { isLocked: !forum.isLocked }
  });

  revalidatePath("/forum");
  revalidatePath(`/forum/${forumId}`);
  return { success: true };
}

export async function toggleTopicLock(topicId: string) {
  const session = await auth();
  if (!isModerator(session?.user?.role)) {
    throw new Error("Action non autorisée.");
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { isLocked: true, forumId: true }
  });

  if (!topic) throw new Error("Sujet introuvable.");

  await prisma.topic.update({
    where: { id: topicId },
    data: { isLocked: !topic.isLocked }
  });

  revalidatePath(`/forum/topic/${topicId}`);
  revalidatePath(`/forum/${topic.forumId}`);
  return { success: true };
}

/**
 * Rechercher des utilisateurs par leur nom.
 */
export async function searchUsersAction(query: string) {
  const session = await auth();
  if (!session?.user?.id) return [];
  if (!query || query.length < 2) return [];

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { name: { contains: query.toLowerCase() } },
        { name: { contains: query.charAt(0).toUpperCase() + query.slice(1) } },
        { email: { contains: query.toLowerCase() } }
      ],
      isBanned: false,
      id: { not: session.user.id },
      // Exclure ceux qu'on a bloqué ou qui nous ont bloqué
      blockedBy: { none: { blockerId: session.user.id } },
      blocks: { none: { blockedId: session.user.id } }
    },
    select: {
      id: true,
      name: true,
      image: true,
      avatarFrame: true
    },
    take: 8
  });

  return users;
}

/**
 * Mettre à jour les informations d'un tournoi.
 * Seul le créateur, les commissaires ou la modération peuvent modifier.
 */
export async function updateTournament(tournamentId: string, topicId: string, firstPostId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé.");

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { commissaires: true }
  });

  if (!tournament) throw new Error("Tournoi introuvable.");

  const isOrganizer = tournament.organizerId === session.user.id;
  const isCommissaire = tournament.commissaires.some(c => c.id === session.user.id);
  const isMod = isModerator(session.user.role);

  if (!isOrganizer && !isCommissaire && !isMod) {
    throw new Error("Vous n'avez pas les droits pour modifier ce tournoi.");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tDateStr = formData.get("tDate") as string;
  const tEndDateStr = formData.get("tEndDate") as string;

  if (!title || !content || !tDateStr) {
    throw new Error("Titre, contenu et date de début sont obligatoires.");
  }

  const startDate = new Date(tDateStr);
  const endDate = tEndDateStr ? new Date(tEndDateStr) : startDate;
  
  // Validation des dates (fail-safe)
  if (endDate < startDate) {
    throw new Error("La date de fin ne peut pas être avant la date de début.");
  }
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Mise à jour du tournoi
  const updateData: any = {
    name: title,
    date: startDate,
    endDate: endDate,
    location: formData.get("tAddress") as string || "Lieu non précisé",
    address: formData.get("tAddress") as string,
    gmapsUrl: formData.get("tGmapsUrl") as string,
    ville: formData.get("tVille") as string,
    departement: formData.get("tDept") as string,
    region: formData.get("tRegion") as string,
    regionNAF: formData.get("tRegionNAF") as string,
    maxParticipants: parseInt(formData.get("tMax") as string) || null,
    isTeam: formData.get("isTeam") === "on",
    coachsPerTeam: formData.get("isTeam") === "on" ? Math.max(2, parseInt(formData.get("tCoachsPerTeam") as string) || 2) : 1,
    price: parseFloat(formData.get("tPrice") as string) || null,
    priceMeals: parseFloat(formData.get("tPriceMeals") as string) || null,
    priceLodging: parseFloat(formData.get("tPriceLodging") as string) || null,
    days: calculatedDays.toString(),
    structure: formData.get("tStructure") as string,
    ruleset: formData.get("tRuleset") as string,
    gameEdition: formData.get("tGame") as string,
    platform: formData.get("tPlatform") as string,
    mealsIncluded: formData.get("tMeals") === "on",
    lodgingAtVenue: formData.get("tLodging") === "on",
    fridayArrival: formData.get("tFriday") === "on",
    isNAF: formData.get("isNAF") === "on",
    isCDF: formData.get("isCDF") === "on",
    isCGO: formData.get("isCGO") === "on",
    isTGE: formData.get("isTGE") === "on",
    isTSC: formData.get("isTSC") === "on",
    ligueId: formData.get("ligueId") as string || null,
    ligueCustom: formData.get("ligueCustom") as string || null,
  };

  // Seul l'organisateur (ou modérateur) peut changer les commissaires
  if (isOrganizer || isMod) {
    const commissaireIds = (formData.get("commissaireIds") as string || "").split(',').filter(id => id.length > 0);
    updateData.commissaires = {
      set: commissaireIds.map(id => ({ id }))
    };
  }

  await prisma.$transaction([
    prisma.tournament.update({
      where: { id: tournamentId },
      data: updateData
    }),
    prisma.topic.update({
      where: { id: topicId },
      data: { title }
    }),
    prisma.post.update({
      where: { id: firstPostId },
      data: { content }
    })
  ]);

  revalidatePath(`/forum/topic/${topicId}`);
  // On récupère le forumId du topic si possible pour revalider la liste
  const topic = await prisma.topic.findUnique({ where: { id: topicId }, select: { forumId: true }});
  if (topic) revalidatePath(`/forum/${topic.forumId}`);
  
  redirect(`/forum/topic/${topicId}`);
}

/**
 * Inscription individuelle à un tournoi
 */
export async function joinTournament(tournamentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };
  const userId = session.user.id;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      registrations: true,
      topic: true
    }
  });

  if (!tournament) return { success: false, error: "Tournoi introuvable" };

  // Vérifier si déjà inscrit
  const existing = await prisma.tournamentRegistration.findUnique({
    where: { tournamentId_userId: { tournamentId, userId } }
  });
  if (existing) return { success: false, error: "Déjà inscrit" };

  // Déterminer le statut (pré-inscrit ou liste d'attente)
  const currentTotal = tournament.registrations.length;
  const max = tournament.maxParticipants || 9999;
  const status = currentTotal >= max ? "WAITING_LIST" : "PRE_REGISTERED";

  try {
    await prisma.tournamentRegistration.create({
      data: {
        tournamentId,
        userId,
        status: status as any,
        paymentStatus: "NOT_PAID"
      }
    });

    if (tournament.topic) revalidatePath(`/forum/topic/${tournament.topic.id}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erreur lors de l'inscription" };
  }
}

/**
 * Désinscription individuelle
 */
export async function leaveTournament(tournamentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };
  const userId = session.user.id;

  try {
    const reg = await prisma.tournamentRegistration.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
      include: { tournament: { include: { topic: true } } }
    });

    if (!reg) return { success: false, error: "Inscription introuvable" };

    await prisma.tournamentRegistration.delete({
      where: { id: reg.id }
    });

    if (reg.tournament.topic) revalidatePath(`/forum/topic/${reg.tournament.topic.id}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Désinscription impossible" };
  }
}

/**
 * Inscription / Désinscription mercenaire
 */
export async function toggleMercenary(tournamentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };
  const userId = session.user.id;

  try {
    const existing = await prisma.tournamentMercenary.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } }
    });

    const tournament = await prisma.tournament.findUnique({ 
      where: { id: tournamentId },
      include: { topic: true }
    });

    if (existing) {
      await prisma.tournamentMercenary.delete({
        where: { id: existing.id }
      });
    } else {
      await prisma.tournamentMercenary.create({
        data: { tournamentId, userId }
      });
    }

    if (tournament?.topic) revalidatePath(`/forum/topic/${tournament.topic.id}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Action impossible" };
  }
}

/**
 * Création d'équipe
 */
export async function createTeam(tournamentId: string, name: string, memberIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };
  const userId = session.user.id;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { teams: true, topic: true }
  });

  if (!tournament) return { success: false, error: "Tournoi introuvable" };

  // Status
  const currentTotal = tournament.teams.length;
  const max = tournament.maxParticipants || 9999;
  const status = currentTotal >= max ? "WAITING_LIST" : "PRE_REGISTERED";

  try {
    const team = await prisma.tournamentTeam.create({
      data: {
        name,
        tournamentId,
        captainId: userId,
        status: status as any,
        paymentStatus: "NOT_PAID",
        members: {
          create: memberIds.map(id => ({ userId: id }))
        }
      }
    });

    // Retrait des mercenaires
    await prisma.tournamentMercenary.deleteMany({
      where: { tournamentId, userId: { in: [userId, ...memberIds] } }
    });

    if (tournament.topic) revalidatePath(`/forum/topic/${tournament.topic.id}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erreur lors de la création" };
  }
}

/**
 * Mise à jour d'équipe
 */
export async function updateTeam(teamId: string, name: string, memberIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };

  try {
    const team = await prisma.tournamentTeam.findUnique({
      where: { id: teamId },
      include: { tournament: { include: { topic: true } } }
    });

    if (!team) return { success: false, error: "Équipe introuvable" };
    if (team.captainId !== session.user.id) return { success: false, error: "Action interdite" };

    await prisma.$transaction([
      prisma.tournamentTeamMember.deleteMany({ where: { teamId } }),
      prisma.tournamentTeam.update({
        where: { id: teamId },
        data: {
          name,
          members: {
            create: memberIds.map(id => ({ userId: id }))
          }
        }
      })
    ]);

    // Retrait des mercenaires
    await prisma.tournamentMercenary.deleteMany({
      where: { tournamentId: team.tournamentId, userId: { in: memberIds } }
    });

    if (team.tournament.topic) revalidatePath(`/forum/topic/${team.tournament.topic.id}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

/**
 * Suppression d'équipe
 */
export async function deleteTeam(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };

  try {
    const team = await prisma.tournamentTeam.findUnique({
      where: { id: teamId },
      include: { tournament: { include: { topic: true } } }
    });

    if (!team) return { success: false, error: "Équipe introuvable" };
    if (team.captainId !== session.user.id) return { success: false, error: "Action interdite" };

    await prisma.tournamentTeam.delete({ where: { id: teamId } });

    if (team.tournament.topic) revalidatePath(`/forum/topic/${team.tournament.topic.id}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Action impossible" };
  }
}

/**
 * Mise à jour du statut d'inscription (Admin/Comm)
 */
export async function updateRegistrationStatus(params: {
  type: "PLAYER" | "TEAM",
  id: string,
  status: string,
  paymentStatus?: string
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };

  // TODO: Check if moderator or commissioner (maybe in the caller or here)
  
  try {
    let topicId: string | undefined;

    if (params.type === "PLAYER") {
      const reg = await prisma.tournamentRegistration.update({
        where: { id: params.id },
        data: {
          status: params.status as any,
          paymentStatus: params.paymentStatus as any
        },
        include: { tournament: { include: { topic: true } } }
      });
      topicId = reg.tournament.topic?.id;
    } else {
      const team = await prisma.tournamentTeam.update({
        where: { id: params.id },
        data: {
          status: params.status as any,
          paymentStatus: params.paymentStatus as any
        },
        include: { tournament: { include: { topic: true } } }
      });
      topicId = team.tournament.topic?.id;
    }

    if (topicId) revalidatePath(`/forum/topic/${topicId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Mise à jour impossible" };
  }
}

/**
 * Recherche d'utilisateurs pour l'inscription d'équipe
 */
export async function findUsersSearch(query: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  if (query.length < 2) return [];

  return await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } }
      ]
    },
    take: 5,
    select: { id: true, name: true, image: true }
  });
}

