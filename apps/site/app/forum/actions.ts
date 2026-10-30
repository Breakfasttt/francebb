/**
 * Actions serveur pour le forum de BBFrance.
 * Regroupe la gestion des topics, posts, lectures, modération et création de tournois via le forum.
 */
"use server";

import { getActiveSession } from "@/lib/authGuard";
import { userSearchWhere, USER_SEARCH_MIN_LENGTH } from "@/lib/userSearch";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendMentionNotification, sendFollowNotification } from "@/lib/mail";
import { getUnreadState } from "@/app/forum/unreadState";
import { getForumAccess, forumAccessWhere, topicAccessWhere } from "@/lib/forumAccess";
import { logModerationAction } from "@/lib/moderationLog";
import type { ActionResult } from "@/lib/actionResult";

export async function getUnreadMessagesCount() {
  const session = await getActiveSession();
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

export async function getRandomPostUrl() {
  const { roles } = await getForumAccess();
  const where = { isArchived: false, ...topicAccessWhere(roles) };
  const count = await prisma.topic.count({ where });
  if (count === 0) return "/forum";

  const skip = Math.floor(Math.random() * count);
  const randomTopic = await prisma.topic.findFirst({
    where,
    skip: skip,
    select: { id: true }
  });

  return randomTopic ? `/forum/topic/${randomTopic.id}` : "/forum";
}

export async function markTopicAsRead(topicId: string) {
  // Increment views safely using RAW SQL to avoid triggering Prisma's @updatedAt (which makes topics 'unread')
  await prisma.$executeRaw`UPDATE "Topic" SET "views" = Coalesce("views", 0) + 1 WHERE "id" = ${topicId}`;

  const session = await getActiveSession();
  if (!session?.user?.id) return;

  // Sécurité : éviter crash sur session périmée après import/suppression de BDD
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true }
  });
  if (!userExists) return;

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
  // Pas de revalidatePath : appelée à chaque ouverture de topic, elle faisait re-rendre toute la page
  // (~40 requêtes). Les listes du forum sont rendues à chaque visite, le non-lu y est donc déjà à jour.
}

export async function markTopicAsUnreadFrom(topicId: string, postId: string) {
  const session = await getActiveSession();
  if (!session?.user?.id) return;

  // Sécurité : éviter crash sur session périmée après import/suppression de BDD
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true }
  });
  if (!userExists) return;

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
  const session = await getActiveSession();
  if (!session?.user?.id) return 0;

  // Requête partagée (mémoïsée par rendu) avec l'accueil du forum
  const { count } = await getUnreadState(session.user.id);
  return count;
}
export async function getUnreadTopics(page: number = 1, limit: number = 20) {
  const session = await getActiveSession();
  if (!session?.user?.id) return { topics: [], total: 0 };

  const userId = session.user.id;
  const skip = (page - 1) * limit;

  // Récupérer tous les sujets potentiels (non archivés)
  // On récupère uniquement le minimum pour le filtrage
  const { roles } = await getForumAccess();
  const allTopics = await prisma.topic.findMany({
    where: { isArchived: false, ...topicAccessWhere(roles) },
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

/**
 * Crée un forum (modérateurs seulement). En cas de refus, renvoie `{ success: false, error }` que le formulaire
 * affiche dans une notification ; en cas de réussite, redirige vers le forum parent ou la liste des forums.
 */
export async function createForum(formData: FormData): Promise<ActionResult> {
  const session = await getActiveSession();
  const userRole = session?.user?.role;

  if (!userRole || !isModerator(userRole)) {
    return { success: false, error: "Seuls les modérateurs peuvent créer des forums." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string || null;
  const parentForumId = formData.get("parentForumId") as string || null;
  const afterId = formData.get("afterId") as string;

  if (!name?.trim()) {
    return { success: false, error: "Le nom du forum est obligatoire." };
  }
  // Deux forums ne peuvent pas porter le même nom (contrainte de la base) : on le dit clairement au modérateur
  const sameName = await prisma.forum.findUnique({ where: { name }, select: { id: true } });
  if (sameName) {
    return { success: false, error: `Un forum porte déjà le nom « ${name} ».` };
  }

  if (parentForumId) {
    const count = await prisma.forum.count({ where: { parentForumId } });
    if (count >= 5) {
      return { success: false, error: "Le nombre maximum de sous-forums (5) a été atteint pour ce forum." };
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
        isTournamentForum: false,
      }
    });
  });

  await logModerationAction(
    "FORUM_CREATED",
    forum.id,
    "FORUM",
    `Création du forum : ${name}`
  );

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

// Listes de structure : server actions appelables par tous, donc filtrées par rôle (lib/forumAccess.ts)
export async function getCategories() {
  const { roles } = await getForumAccess();
  return await prisma.category.findMany({
    where: { allowedRoles: { in: roles } },
    orderBy: { order: "asc" }
  });
}

export async function getAllForums() {
  const { roles } = await getForumAccess();
  return await prisma.forum.findMany({
    where: forumAccessWhere(roles),
    orderBy: { order: 'asc' }
  });
}

export async function deleteForum(forumId: string, forumName: string): Promise<ActionResult> {
  const session = await getActiveSession();
  const userRole = session?.user?.role;

  if (!userRole || !isModerator(userRole)) {
    return { success: false, error: "Seuls les modérateurs peuvent supprimer des forums." };
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

  await logModerationAction(
    "FORUM_DELETED",
    forumId,
    "FORUM",
    `Suppression du forum : ${forumName}`
  );

  revalidatePath("/forum");
  if (deletedForum.parentForumId) {
    revalidatePath(`/forum/${deletedForum.parentForumId}`);
  }

  redirect(`/forum?deletedForum=${encodeURIComponent(forumName)}`);
}

/**
 * Crée un sujet et son premier message (et le tournoi, dans un forum de tournois). En cas de refus, renvoie
 * `{ success: false, error }` que le formulaire affiche dans une notification ; en cas de réussite, redirige
 * vers le nouveau sujet.
 */
export async function createTopic(formData: FormData): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return { success: false, error: "Vous devez être connecté pour créer un sujet." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const forumId = formData.get("forumId") as string;
  const isSticky = formData.get("isSticky") === "on";
  const isLocked = formData.get("isLocked") === "on";

  if (!title || !content || !forumId) {
    return { success: false, error: "Le titre et le message du sujet sont obligatoires." };
  }

  // Vérifier l'accès (rôle), si le forum est locké ou un forum de tournoi
  const { roles } = await getForumAccess();
  const forum = await prisma.forum.findFirst({
    where: { id: forumId, ...forumAccessWhere(roles) },
    select: { isLocked: true, isTournamentForum: true }
  });
  if (!forum) return { success: false, error: "Forum introuvable." };

  if (forum?.isLocked && !isModerator(session.user.role)) {
    return { success: false, error: "Ce forum est verrouillé. Vous ne pouvez pas y créer de nouveau sujet." };
  }

  // Données de tournoi si applicable
  let tournamentData: any = null;
  if (forum?.isTournamentForum) {
    const tDateStr = formData.get("tDate") as string;
    const tEndDateStr = formData.get("tEndDate") as string;
    if (!tDateStr) return { success: false, error: "La date de début du tournoi est obligatoire." };
    
    const startDate = new Date(tDateStr);
    const endDate = tEndDateStr ? new Date(tEndDateStr) : startDate;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const commissaireIds = (formData.get("commissaireIds") as string || "").split(',').filter(id => id.length > 0);

    // Géocodage
    const tAddress = formData.get("tAddress") as string;
    const tVille = formData.get("tVille") as string;
    const tLatForm = formData.get("tLat") as string;
    const tLngForm = formData.get("tLng") as string;
    
    let lat = tLatForm ? parseFloat(tLatForm) : null;
    let lng = tLngForm ? parseFloat(tLngForm) : null;

    // Si on n'a pas de coordonnées du formulaire, on tente un géocodage serveur
    if (lat === null || lng === null) {
      try {
        const gRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${tAddress || ""} ${tVille || ""}`.trim())}&format=json&limit=1`, {
          headers: { "User-Agent": "BBFrance-App" }
        });
        const gData = await gRes.json();
        if (gData && gData.length > 0) {
          lat = parseFloat(gData[0].lat);
          lng = parseFloat(gData[0].lon);
        }
      } catch (e) {
        console.error("Tournament geocoding error:", e);
      }
    }

    tournamentData = {
      name: title,
      date: startDate,
      endDate: endDate,
      location: tAddress || "Lieu non précisé",
      address: tAddress,
      gmapsUrl: null, // Plus utilisé
      ville: tVille,
      departement: formData.get("tDept") as string,
      region: formData.get("tRegion") as string,
      regionNAF: formData.get("tRegionNAF") as string,
      lat,
      lng,
      maxParticipants: parseInt(formData.get("tMax") as string) || null,
      isTeam: formData.get("isTeam") === "on",
      coachsPerTeam: formData.get("isTeam") === "on" ? Math.max(2, parseInt(formData.get("tCoachsPerTeam") as string) || 2) : 1,
      price: parseFloat(formData.get("tPrice") as string) || null,
      priceMeals: parseFloat(formData.get("tPriceMeals") as string) || null,
      priceLodging: parseFloat(formData.get("tPriceLodging") as string) || null,
      days: calculatedDays.toString(),
      totalMatches: parseInt(formData.get("tTotalMatches") as string) || null,
      structure: formData.get("tStructure") as string,
      ruleset: formData.get("tRuleset") as string,
      gameEdition: formData.get("tGame") as string || "BB2025",
      platform: formData.get("tPlatform") as string || "Tabletop",
      tournamentType: formData.get("tournamentType") as string || "SWISS",
      mealsIncluded: formData.get("tMeals") === "on",
      lodgingAtVenue: formData.get("tLodging") === "on",
      fridayArrival: formData.get("tFriday") === "on",
      isNAF: formData.get("isNAF") === "on",
      isCDF: formData.get("isCDF") === "on",
      typeCDF: formData.get("isCDF") === "on" ? (formData.get("typeCDF") as string || "INDIVIDUEL") : "INDIVIDUEL",
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
  revalidatePath("/tournois");

  redirect(`/forum/topic/${topic.id}`);
}

export async function createPost(topicId: string, content: string): Promise<ActionResult & { postId?: string }> {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return { success: false, error: "Vous devez être connecté pour répondre." };
  }
  if (!content) return { success: false, error: "Le contenu est obligatoire." };

  // Vérifier l'accès (rôle) et si le topic ou le forum est locké
  const { roles } = await getForumAccess();
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, ...topicAccessWhere(roles) },
    include: { forum: { select: { isLocked: true } } }
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  if ((topic.isLocked || topic.forum.isLocked) && !isModerator(session.user.role)) {
    return { success: false, error: "Ce sujet est verrouillé. Vous ne pouvez plus y répondre." };
  }

  const post = await prisma.post.create({
    data: {
      content,
      topicId,
      authorId: session.user.id,
    }
  });

  // 1. Détection des mentions via Regex
  const mentionRegex = /\[mention=([a-zA-Z0-9_-]+)\]/gi;
  const mentionedIds = new Set<string>();
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    if (match[1] !== session.user.id) {
      mentionedIds.add(match[1]);
    }
  }

  // 2. Tâches asynchrones parallélisées (Notifications et Updates)
  const taskPromises = [];

  // Mentions
  if (mentionedIds.size > 0) {
    taskPromises.push((async () => {
      const mentionedUsers = await prisma.user.findMany({
        where: { id: { in: Array.from(mentionedIds) } },
        select: { id: true, email: true, notifMention: true }
      });

      // Une requête par lot (post neuf : pas de doublon possible sur @@unique([postId, mentionedUserId]))
      const [, followerRows] = await Promise.all([
        prisma.mention.createMany({
          data: mentionedUsers.map((mUser) => ({
            postId: post.id,
            mentionedUserId: mUser.id,
            mentionerId: session.user.id
          }))
        }).catch(() => null),
        prisma.topicFollow.findMany({
          where: { topicId, userId: { in: mentionedUsers.map((mUser) => mUser.id) } },
          select: { userId: true }
        })
      ]);
      const followerIds = new Set(followerRows.map((row) => row.userId));

      for (const mUser of mentionedUsers) {
        // Les abonnés reçoivent déjà la notification de suivi
        if (mUser.email && mUser.notifMention && !followerIds.has(mUser.id)) {
          sendMentionNotification(mUser.email, session.user.name || "Un coach", topic.title, topicId);
        }
      }
    })());
  }

  // Suivis de sujet
  taskPromises.push((async () => {
    const followers = await prisma.topicFollow.findMany({
      where: { 
        topicId,
        userId: { not: session.user.id }
      },
      include: {
        user: { select: { email: true, notifFollowedTopic: true } }
      }
    });

    const notified = followers.filter((follow) => follow.user.email && follow.user.notifFollowedTopic);
    const views = notified.length > 0
      ? await prisma.topicView.findMany({
          where: { topicId, userId: { in: notified.map((follow) => follow.userId) } },
          select: { userId: true, lastViewedAt: true }
        })
      : [];
    const lastViewByUser = new Map(views.map((view) => [view.userId, view.lastViewedAt]));

    for (const follow of notified) {
      if (follow.user.email) {
        const lastViewedAt = lastViewByUser.get(follow.userId);
        if (!lastViewedAt || lastViewedAt >= topic.updatedAt) {
          sendFollowNotification(follow.user.email, session.user.name || "Un coach", topic.title, topicId);
        }
      }
    }
  })());

  // Mise à jour du topic (bubble up)
  taskPromises.push(prisma.topic.update({
    where: { id: topicId },
    data: { updatedAt: new Date() }
  }));

  // Attendre toutes les opérations DB/Notifications avant de répondre
  await Promise.all(taskPromises);

  revalidatePath(`/forum/topic/${topicId}`);
  return { success: true, postId: post.id };
}

export async function updatePost(postId: string, content: string): Promise<ActionResult & { topicId?: string; page?: number }> {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return { success: false, error: "Vous devez être connecté pour modifier un message." };
  }

  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, topicId: true, createdAt: true }
  });

  if (!existingPost) return { success: false, error: "Message introuvable." };
  if (existingPost.authorId !== session.user.id && !isModerator(session.user.role)) {
    return { success: false, error: "Vous n'avez pas l'autorisation de modifier ce message." };
  }

  await prisma.post.update({
    where: { id: postId },
    data: { content, updatedAt: new Date() }
  });

  // Calcul de la page pour le retour
  const countBefore = await prisma.post.count({
    where: {
      topicId: existingPost.topicId,
      OR: [
        { createdAt: { lt: existingPost.createdAt } },
        {
          createdAt: existingPost.createdAt,
          id: { lt: existingPost.id }
        }
      ]
    }
  });
  const POSTS_PER_PAGE = 20;
  const page = Math.floor(countBefore / POSTS_PER_PAGE) + 1;

  revalidatePath(`/forum/topic/${existingPost.topicId}`);
  return { success: true, topicId: existingPost.topicId, page };
}

export async function getPostById(postId: string) {
  const { roles } = await getForumAccess();
  return await prisma.post.findFirst({
    where: { id: postId, topic: topicAccessWhere(roles) },
    include: { author: true, topic: true }
  });
}

export async function getTopicLatestPosts(topicId: string, limit: number = 3) {
  const { roles } = await getForumAccess();
  return await prisma.post.findMany({
    where: { topicId, topic: topicAccessWhere(roles) },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { author: true }
  });
}

export async function moderatePost(postId: string, reason: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    return { success: false, error: "Seuls les modérateurs peuvent modérer des messages." };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!post) {
    return { success: false, error: "Message introuvable." };
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

  await logModerationAction(
    "POST_MODERATED",
    postId,
    "POST",
    `Message modéré. Raison : ${reason}`
  );

  revalidatePath(`/forum/topic/${post.topicId}`);
  return { success: true };
}

export async function unmoderatePost(postId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    return { success: false, error: "Seuls les modérateurs peuvent annuler une modération." };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!post) return { success: false, error: "Message introuvable." };

  await prisma.post.update({
    where: { id: postId },
    data: { 
      isModerated: false,
      moderationReason: null,
      moderatedBy: null,
      updatedAt: new Date()
    }
  });

  await logModerationAction(
    "POST_UNMODERATED",
    postId,
    "POST",
    `Modération annulée sur le message`
  );

  revalidatePath(`/forum/topic/${post.topicId}`);
  return { success: true };
}

export async function deletePost(postId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { topic: { include: { posts: true } } }
  });

  if (!post) return { success: false, error: "Message introuvable." };

  // Check if it's the author
  // NOTE: User said ONLY the creator can delete it. 
  // Modérateurs can moderate but not delete (based on requirement 6).
  if (post.authorId !== session.user.id) {
    return { success: false, error: "Seul l'auteur peut supprimer son message." };
  }

  // Soft delete: just mark the post as isDeleted
  await prisma.post.update({
    where: { id: postId },
    data: { isDeleted: true }
  });

  // Log de la suppression (même si c'est par l'auteur, c'est utile à l'historique)
  await logModerationAction(
    "POST_MODERATED", // On réutilise ce type pour charger le log si on n'en a pas de spécifique, mais on précise dans les détails
    postId,
    "POST",
    `Suppression du message par l'auteur`
  );

  revalidatePath(`/forum/topic/${post.topicId}`);
  revalidatePath(`/forum/${post.topic.forumId}`);
  return { success: true };
}

export async function markAllTopicsAsRead() {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non autorisé" };

  // Sécurité : éviter crash sur session périmée après import/suppression de BDD
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true }
  });
  if (!userExists) return { success: false, error: "Utilisateur introuvable" };

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

export async function togglePinTopic(topicId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    return { success: false, error: "Seuls les modérateurs peuvent épingler des sujets." };
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { isSticky: true }
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  await prisma.topic.update({
    where: { id: topicId },
    data: { isSticky: !topic.isSticky }
  });

  await logModerationAction(
    topic.isSticky ? "TOPIC_UNPINNED" : "TOPIC_PINNED",
    topicId,
    "TOPIC",
    `${topic.isSticky ? "Désépinglage" : "Épinglage"} du sujet`
  );

  revalidatePath(`/forum/topic/${topicId}`);
  return { success: true };
}

export async function deleteTopicPermanent(topicId: string, topicTitle: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non connecté." };

  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  const isAuthor = topic.authorId === session.user.id;
  const isMod = isModerator(session.user.role);

  if (!isAuthor && !isMod) {
    return { success: false, error: "Action non autorisée." };
  }

  // Si le sujet est lié à un tournoi, on doit aussi supprimer le tournoi
  // ce qui supprimera par cascade les résultats, inscriptions, etc. (Action Critique)
  await prisma.$transaction(async (tx) => {
    await tx.topicView.deleteMany({ where: { topicId } });
    await tx.post.deleteMany({ where: { topicId } });
    await tx.topic.delete({ where: { id: topicId } });

    if (topic.tournamentId) {
      await tx.tournament.delete({ where: { id: topic.tournamentId } });
    }
  });

  await logModerationAction(
    "TOPIC_DELETED",
    topicId,
    "TOPIC",
    `Suppression définitive du sujet${topic.tournamentId ? " et de son tournoi" : ""} : ${topicTitle}`
  );

  revalidatePath(`/forum/${topic.forumId}`);
  revalidatePath("/tournois");
  revalidatePath("/classement");
  redirect(`/forum?deletedTopic=${encodeURIComponent(topicTitle)}`);
}

export async function moveTopic(topicId: string, newForumId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    return { success: false, error: "Seuls les modérateurs peuvent déplacer des sujets." };
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId }
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  await prisma.topic.update({
    where: { id: topicId },
    data: { forumId: newForumId }
  });

  await logModerationAction(
    "TOPIC_MOVED",
    topicId,
    "TOPIC",
    `Sujet déplacé vers le forum ${newForumId}`
  );

  revalidatePath(`/forum/${topic.forumId}`);
  revalidatePath(`/forum/${newForumId}`);
  revalidatePath(`/forum/topic/${topicId}`);
  return { success: true };
}

export async function updateTopicTitle(topicId: string, title: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { authorId: true }
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  const sessionUser = session.user as { id: string; role: string };
  if (topic.authorId !== sessionUser.id && !isModerator(sessionUser.role)) {
    return { success: false, error: "Vous n'avez pas l'autorisation de modifier ce sujet." };
  }

  await prisma.topic.update({
    where: { id: topicId },
    data: { title }
  });

  revalidatePath(`/forum/topic/${topicId}`);
  return { success: true };
}

export async function togglePostReaction(postId: string, emoji: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Vous devez être connecté." };

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
  return { success: true };
}

export async function toggleArchiveTopic(topicId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    return { success: false, error: "Seuls les modérateurs peuvent archiver des sujets." };
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { id: true, isArchived: true, forumId: true }
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  await prisma.topic.update({
    where: { id: topicId },
    data: { isArchived: !topic.isArchived }
  });

  await logModerationAction(
    topic.isArchived ? "TOPIC_UNARCHIVED" : "TOPIC_ARCHIVED",
    topicId,
    "TOPIC",
    `${topic.isArchived ? "Désarchivage" : "Archivage"} du sujet`
  );

  revalidatePath(`/forum/${topic.forumId}`);
  revalidatePath(`/forum/topic/${topicId}`);
  return { success: true };
}

/**
 * Suivi d'un sujet (follow/unfollow).
 * NOTE: la table "TopicFollow" est créée via une migration dédiée.
 */
export async function isFollowingTopic(topicId: string) {
  const session = await getActiveSession();
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
  const session = await getActiveSession();
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
  const session = await getActiveSession();
  const userId = session?.user?.id;
  if (!userId) return { topics: [], totalPages: 0 };

  const skip = (page - 1) * limit;

  try {
    // Sujets suivis encore accessibles au rôle actuel
    const { roles } = await getForumAccess();
    const followWhere = { userId, topic: topicAccessWhere(roles) };

    // 1. Get total count
    const totalCount = await (prisma as any).topicFollow.count({
      where: followWhere
    });
    const totalPages = Math.ceil(totalCount / limit);

    // 2. Get paginated results with included Topic and TopicView
    const follows = await (prisma as any).topicFollow.findMany({
      where: followWhere,
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
export async function toggleForumLock(forumId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!isModerator(session?.user?.role)) {
    return { success: false, error: "Action non autorisée." };
  }

  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
    select: { isLocked: true }
  });

  if (!forum) return { success: false, error: "Forum introuvable." };

  await prisma.forum.update({
    where: { id: forumId },
    data: { isLocked: !forum.isLocked }
  });

  await logModerationAction(
    forum.isLocked ? "FORUM_UNLOCKED" : "FORUM_LOCKED",
    forumId,
    "FORUM",
    `${forum.isLocked ? "Déverrouillage" : "Verrouillage"} du forum`
  );

  revalidatePath("/forum");
  revalidatePath(`/forum/${forumId}`);
  return { success: true };
}

export async function toggleTopicLock(topicId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!isModerator(session?.user?.role)) {
    return { success: false, error: "Action non autorisée." };
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { isLocked: true, forumId: true }
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  await prisma.topic.update({
    where: { id: topicId },
    data: { isLocked: !topic.isLocked }
  });

  await logModerationAction(
    topic.isLocked ? "TOPIC_UNLOCKED" : "TOPIC_LOCKED",
    topicId,
    "TOPIC",
    `${topic.isLocked ? "Déverrouillage" : "Verrouillage"} du sujet`
  );

  revalidatePath(`/forum/topic/${topicId}`);
  revalidatePath(`/forum/${topic.forumId}`);
  return { success: true };
}

/**
 * Rechercher des utilisateurs par leur nom.
 */
export async function searchUsersAction(query: string) {
  const session = await getActiveSession();
  if (!session?.user?.id) return [];
  if (!query || query.trim().length < USER_SEARCH_MIN_LENGTH) return [];

  const users = await prisma.user.findMany({
    where: userSearchWhere(query, session.user.id),
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
export async function updateTournament(tournamentId: string, topicId: string, firstPostId: string, formData: FormData): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non autorisé." };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { commissaires: true }
  });

  if (!tournament) return { success: false, error: "Tournoi introuvable." };

  const isOrganizer = tournament.organizerId === session.user.id;
  const isCommissaire = tournament.commissaires.some(c => c.id === session.user.id);
  const isMod = isModerator(session.user.role);

  if (!isOrganizer && !isCommissaire && !isMod) {
    return { success: false, error: "Vous n'avez pas les droits pour modifier ce tournoi." };
  }

  // Le sujet et son premier message arrivent du navigateur : on vérifie qu'ils appartiennent bien à ce tournoi,
  // sinon un organisateur pourrait réécrire le titre ou le message d'un autre sujet (carte 052).
  const firstPost = await prisma.post.findFirst({
    where: { topicId, topic: { tournamentId } },
    orderBy: { createdAt: "asc" },
    select: { id: true }
  });
  if (!firstPost || firstPost.id !== firstPostId) {
    return { success: false, error: "Ce sujet ne correspond pas à ce tournoi." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tDateStr = formData.get("tDate") as string;
  const tEndDateStr = formData.get("tEndDate") as string;

  if (!title || !content || !tDateStr) {
    return { success: false, error: "Titre, contenu et date de début sont obligatoires." };
  }

  const startDate = new Date(tDateStr);
  const endDate = tEndDateStr ? new Date(tEndDateStr) : startDate;
  
  // Validation des dates (fail-safe)
  if (endDate < startDate) {
    return { success: false, error: "La date de fin ne peut pas être avant la date de début." };
  }
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const tLatForm = formData.get("tLat") as string;
  const tLngForm = formData.get("tLng") as string;
  let lat = tLatForm ? parseFloat(tLatForm) : null;
  let lng = tLngForm ? parseFloat(tLngForm) : null;

  // Mise à jour du tournoi
  const updateData: any = {
    name: title,
    date: startDate,
    endDate: endDate,
    location: formData.get("tAddress") as string || "Lieu non précisé",
    address: formData.get("tAddress") as string,
    gmapsUrl: null, // Plus utilisé
    ville: formData.get("tVille") as string,
    departement: formData.get("tDept") as string,
    region: formData.get("tRegion") as string,
    regionNAF: formData.get("tRegionNAF") as string,
    lat,
    lng,
    maxParticipants: parseInt(formData.get("tMax") as string) || null,
    isTeam: formData.get("isTeam") === "on",
    coachsPerTeam: formData.get("isTeam") === "on" ? Math.max(2, parseInt(formData.get("tCoachsPerTeam") as string) || 2) : 1,
    price: parseFloat(formData.get("tPrice") as string) || null,
    priceMeals: parseFloat(formData.get("tPriceMeals") as string) || null,
    priceLodging: parseFloat(formData.get("tPriceLodging") as string) || null,
    days: calculatedDays.toString(),
    totalMatches: parseInt(formData.get("tTotalMatches") as string) || null,
    structure: formData.get("tStructure") as string,
    ruleset: formData.get("tRuleset") as string,
    gameEdition: formData.get("tGame") as string,
    platform: formData.get("tPlatform") as string,
    tournamentType: formData.get("tournamentType") as string || "SWISS",
    mealsIncluded: formData.get("tMeals") === "on",
    lodgingAtVenue: formData.get("tLodging") === "on",
    fridayArrival: formData.get("tFriday") === "on",
    isNAF: formData.get("isNAF") === "on",
    isCDF: formData.get("isCDF") === "on",
    typeCDF: formData.get("isCDF") === "on" ? (formData.get("typeCDF") as string || "INDIVIDUEL") : "INDIVIDUEL",
    isCGO: formData.get("isCGO") === "on",
    isTGE: formData.get("isTGE") === "on",
    isTSC: formData.get("isTSC") === "on",
    ligueId: formData.get("ligueId") as string || null,
    ligueCustom: formData.get("ligueCustom") as string || null,
  };

  const isTeamNew = formData.get("isTeam") === "on";
  const hasFormatChanged = isTeamNew !== tournament.isTeam;

  // Seul l'organisateur (ou modérateur) peut changer les commissaires
  if (isOrganizer || isMod) {
    const commissaireIds = (formData.get("commissaireIds") as string || "").split(',').filter(id => id.length > 0);
    updateData.commissaires = {
      set: commissaireIds.map(id => ({ id }))
    };
  }

  await prisma.$transaction(async (tx) => {
    // Si le format a changé, on vide les inscriptions pour éviter les incohérences
    if (hasFormatChanged) {
      await tx.tournamentRegistration.deleteMany({ where: { tournamentId } });
      await tx.tournamentTeamMember.deleteMany({ where: { team: { tournamentId } } });
      await tx.tournamentTeam.deleteMany({ where: { tournamentId } });
    }

    await tx.tournament.update({
      where: { id: tournamentId },
      data: updateData
    });

    await tx.topic.update({
      where: { id: topicId },
      data: { title }
    });

    await tx.post.update({
      where: { id: firstPostId },
      data: { content }
    });
  });

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
  const session = await getActiveSession();
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
  if (tournament.registrationsLocked) return { success: false, error: "Les inscriptions sont fermées pour ce tournoi." };

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
  const session = await getActiveSession();
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
  const session = await getActiveSession();
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

    if (!tournament) return { success: false, error: "Tournoi introuvable" };
    if (tournament.registrationsLocked && !existing) {
      return { success: false, error: "Les inscriptions mercenaires sont fermées." };
    }

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
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };
  const userId = session.user.id;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { teams: true, topic: true }
  });

  if (!tournament) return { success: false, error: "Tournoi introuvable" };
  if (tournament.registrationsLocked) return { success: false, error: "Les inscriptions sont fermées pour ce tournoi." };

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
  const session = await getActiveSession();
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
  const session = await getActiveSession();
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
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };

  // Vérification des permissions
  try {
    let tournament;
    if (params.type === "PLAYER") {
      const reg = await prisma.tournamentRegistration.findUnique({
        where: { id: params.id },
        include: { tournament: { include: { commissaires: true } } }
      });
      tournament = reg?.tournament;
    } else {
      const team = await prisma.tournamentTeam.findUnique({
        where: { id: params.id },
        include: { tournament: { include: { commissaires: true } } }
      });
      tournament = team?.tournament;
    }

    if (!tournament) return { success: false, error: "Tournoi ou inscription introuvable" };

    const isOrganizer = tournament.organizerId === session.user.id;
    const isCommissaire = tournament.commissaires.some(c => c.id === session.user.id);
    const isMod = isModerator(session.user.role);

    if (!isOrganizer && !isCommissaire && !isMod) {
      return { success: false, error: "Vous n'avez pas l'autorisation de modifier cette inscription." };
    }
  } catch (e) {
    return { success: false, error: "Erreur lors de la vérification des droits." };
  }
  
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
 * Verrouiller / Déverrouiller les inscriptions d'un tournoi
 */
export async function toggleTournamentRegistrations(tournamentId: string) {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { commissaires: true, topic: true }
    });

    if (!tournament) return { success: false, error: "Tournoi introuvable" };

    const isOrganizer = tournament.organizerId === session.user.id;
    const isCommissaire = tournament.commissaires.some(c => c.id === session.user.id);
    const isLogMod = isModerator(session.user.role);

    if (!isOrganizer && !isCommissaire && !isLogMod) {
      return { success: false, error: "Action non autorisée" };
    }

    const updated = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { registrationsLocked: !tournament.registrationsLocked }
    });

    if (tournament.topic) revalidatePath(`/forum/topic/${tournament.topic.id}`);
    
    return { 
      success: true, 
      locked: updated.registrationsLocked 
    };
  } catch (e) {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}
