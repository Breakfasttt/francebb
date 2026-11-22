/**
 * Actions serveur pour le forum de FranceBB.
 * Regroupe la gestion des topics, posts, lectures, modération et création de tournois via le forum.
 */
"use server";

import { getActiveSession } from "@/lib/authGuard";
import { rateLimitRefusal } from "@/lib/rateLimit";
import { userSearchWhere, USER_SEARCH_MIN_LENGTH } from "@/lib/userSearch";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { canModerateForum, canModeratePost, canModerateTopic } from "@/lib/forumModerators";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  NOTIFICATION_TYPE,
  followTopicAutomatically,
  markTopicNotificationsRead,
  notifyFollowers,
  notifyMentions,
  notifyTournamentMembers
} from "@/lib/notifications";
import { getUnreadState } from "@/app/forum/unreadState";
import { getForumAccess, forumAccessWhere, topicAccessWhere, FORUM_ACCESS_SELECT } from "@/lib/forumAccess";
import { logModerationAction } from "@/lib/moderationLog";
import { createForumRecord, deleteForumRecord } from "@/lib/forumStructure";
import { closePendingReports } from "@/lib/moderationReports";
import { hidePostContent, PUBLIC_MEMBER_SELECT } from "@/lib/forumPostPrivacy";
import { canRestorePost, decidePostDeletion, postDeletedBy, topicDeletionRefusal } from "@/lib/forumDeletion";
import { advanceReadPosition, isTopicUnread, shouldCountTopicView, type ReadPosition } from "@/lib/forumReadPosition";
import { refreshTopicLastPost } from "@/lib/forumTopicLastPost";
import { refreshForumStructure, refreshTopic, refreshTournament } from "@/lib/pageRefresh";
import { forumPostPage } from "@/lib/forumPostLink";
import { closedTopicMessage, isAllowedReaction, isTopicClosedFor, postContentError, topicTitleError } from "@/lib/forumWriteRules";
import { canReplyToTopic, canSavePostEdit } from "@/lib/forumRights";
import { canManagePayments, canManageTournament } from "@/lib/tournamentRights";
import type { QuoteStatusMap } from "@/lib/bbcode";
import type { ActionResult } from "@/lib/actionResult";
import type { Prisma } from "@/prisma/generated-client";
import { isTournamentOver } from "@/lib/tournamentDates";
import { readTournamentForm, withCoordinates } from "@/lib/tournamentForm";
import {
  cleanTeamMemberIds,
  formatChangeLossCount,
  formatChangeLossText,
  registrationRefusal,
  teamCompositionError
} from "@/lib/tournamentRegistrationRules";
import { lockTournamentRegistrations, nextRegistrationStatus, promoteFromWaitingList } from "@/lib/tournamentRegistrations";

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

/**
 * Retrouve un message seulement si son sujet est accessible au rôle du visiteur, avec l'état de verrouillage
 * du sujet et du forum. Sert de garde commune aux actions sur un message existant (modifier, supprimer, réagir).
 */
async function findAccessiblePost(postId: string) {
  const { roles } = await getForumAccess();
  return prisma.post.findFirst({
    where: { id: postId, topic: topicAccessWhere(roles) },
    select: {
      id: true,
      authorId: true,
      topicId: true,
      createdAt: true,
      isDeleted: true,
      isModerated: true,
      deletedById: true,
      topic: { select: { forumId: true, title: true, tournamentId: true, isLocked: true, isArchived: true, forum: { select: { isLocked: true } } } },
    },
  });
}

/** État d'écriture d'un sujet lu avec son forum, tel que l'attendent les règles de lib/forumWriteRules.ts. */
function writeState(topic: { isLocked: boolean; isArchived: boolean; forum: { isLocked: boolean } }) {
  return { isLocked: topic.isLocked, isArchived: topic.isArchived, forumIsLocked: topic.forum.isLocked };
}

/**
 * Vrai si le sujet est fermé pour ce membre : verrouillé, archivé (carte 169) ou rangé dans un forum verrouillé. Les
 * modérateurs passent outre.
 */
function isLockedFor(post: { topic: { isLocked: boolean; isArchived: boolean; forum: { isLocked: boolean } } }, viewerCanModerate: boolean) {
  return isTopicClosedFor(writeState(post.topic), viewerCanModerate);
}

/** Ajoute une vue au compteur du sujet, en SQL direct pour ne pas changer sa date de dernière modification (`updatedAt`). */
async function countTopicView(topicId: string) {
  await prisma.$executeRaw`UPDATE "Topic" SET "views" = Coalesce("views", 0) + 1 WHERE "id" = ${topicId}`;
}

/**
 * Enregistre la lecture d'un sujet (carte 166). `shownPostId` est le dernier message affiché sur la page : la position
 * de lecture avance jusqu'à lui, jamais plus loin (lire la page 1 d'un long sujet ne marque pas la suite comme lue) et
 * jamais en arrière (revenir sur une page déjà lue ne fait pas perdre la suite). Sans `shownPostId` (bouton « Marquer
 * comme lu » de la page des non-lus), tout le sujet est marqué lu, jusqu'à son dernier message.
 * Compte aussi une vue du sujet, mais une seule par visite (règle `shouldCountTopicView`, carte 169). `firstViewInTab`
 * vaut vrai quand l'onglet du visiteur n'avait pas encore ouvert ce sujet ; il ne sert que pour les visiteurs.
 */
export async function markTopicAsRead(topicId: string, shownPostId?: string, firstViewInTab = false) {
  // Un sujet inexistant ou réservé à un autre rôle n'est ni compté ni marqué comme lu
  const { roles } = await getForumAccess();
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, ...topicAccessWhere(roles) },
    select: { id: true, lastPostAt: true, lastPostId: true },
  });
  if (!topic) return;

  const session = await getActiveSession();
  if (!session?.user?.id) {
    // Un visiteur compte une vue la première fois qu'il ouvre le sujet dans cet onglet (mémoire de l'onglet, voir
    // MarkAsRead) : feuilleter les pages ou recharger ne compte plus (carte 169)
    if (firstViewInTab) await countTopicView(topicId);
    return;
  }
  const userId = session.user.id;

  // Le message affiché doit appartenir à ce sujet ; sinon, rien n'est enregistré
  let shown: ReadPosition;
  if (shownPostId) {
    const post = await prisma.post.findFirst({ where: { id: shownPostId, topicId }, select: { id: true, createdAt: true } });
    if (!post) return;
    shown = { at: post.createdAt, postId: post.id };
  } else {
    shown = { at: topic.lastPostAt, postId: topic.lastPostId };
  }

  // La lecture existante (s'il y en a une) et l'existence du membre (session périmée après une remise à zéro de la base)
  const [user, view] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    prisma.topicView.findUnique({ where: { userId_topicId: { userId, topicId } }, select: { lastReadPostAt: true, lastPostId: true, lastViewedAt: true } }),
  ]);
  if (!user) return;

  const next = advanceReadPosition(view && { at: view.lastReadPostAt, postId: view.lastPostId }, shown);
  const now = new Date();
  // Une vue par membre et par visite où il lit du nouveau (carte 169), au lieu d'une vue par page affichée
  if (shouldCountTopicView(view?.lastViewedAt ?? null, next !== null, now)) await countTopicView(topicId);
  await prisma.topicView.upsert({
    where: { userId_topicId: { userId, topicId } },
    // La date de visite change toujours ; la position seulement si elle avance
    update: next ? { lastViewedAt: now, lastReadPostAt: next.at, lastPostId: next.postId } : { lastViewedAt: now },
    create: { userId, topicId, lastViewedAt: now, lastReadPostAt: shown.at, lastPostId: shown.postId },
  });
  // Les notifications de ce sujet (mention, réponse suivie) dont le message est sur la page affichée, ou avant, sont
  // lues (carte 167)
  await markTopicNotificationsRead(userId, topicId, shown.at);
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

  const currentPost = await prisma.post.findFirst({
    where: { id: postId, topicId },
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

  // Seul cas où la position de lecture recule (carte 166). Sans message précédent, la position est ramenée avant le
  // tout premier message (date zéro) : supprimer la ligne ne suffirait plus, car le sujet suivrait alors la date
  // « tout est lu avant le… » du membre et pourrait rester lu.
  const position = previousPost
    ? { lastReadPostAt: previousPost.createdAt, lastPostId: previousPost.id }
    : { lastReadPostAt: new Date(0), lastPostId: null };
  await prisma.topicView.upsert({
    where: { userId_topicId: { userId: session.user.id, topicId } },
    update: position,
    create: { userId: session.user.id, topicId, ...position }
  });

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
/**
 * Sujets non lus du membre, page par page, du plus récent au plus ancien dernier message. La liste des sujets non lus
 * vient de `getUnreadState` (une requête, partagée avec le reste de la page) ; seuls les sujets de la page sont lus en
 * détail.
 */
export async function getUnreadTopics(page: number = 1, limit: number = 20) {
  const session = await getActiveSession();
  if (!session?.user?.id) return { topics: [], total: 0 };

  const { topicIds } = await getUnreadState(session.user.id);
  const pageIds = topicIds.slice((page - 1) * limit, page * limit);

  const rows = pageIds.length === 0 ? [] : await prisma.topic.findMany({
    where: { id: { in: pageIds } },
    select: {
      id: true,
      title: true,
      tournamentId: true,
      lastPostAt: true,
      author: { select: PUBLIC_MEMBER_SELECT },
      lastPostAuthor: { select: { name: true } },
      forum: { select: { name: true } },
      _count: { select: { posts: true } },
    },
  });
  // Même ordre que la liste des non-lus
  const byId = new Map(rows.map((topic) => [topic.id, topic]));
  const topics = pageIds.flatMap((id) => byId.get(id) ?? []);

  return { topics, total: topicIds.length };
}

export async function getSubForumCount(parentForumId: string) {
  // Filtré par rôle (carte 221) : ne révèle pas les sous-forums d'un forum réservé.
  const { roles } = await getForumAccess();
  return await prisma.forum.count({
    where: { parentForumId, parentForum: forumAccessWhere(roles), ...forumAccessWhere(roles) }
  });
}

/**
 * Crée un forum (modérateurs seulement). Les règles (nom unique, 5 sous-forums au plus, place du forum, journal,
 * rafraîchissement) sont dans `lib/forumStructure.ts`, partagé avec l'administration (carte 199). En cas de refus,
 * renvoie `{ success: false, error }` que le formulaire affiche dans une notification ; en cas de réussite, redirige
 * vers le forum parent ou la liste des forums.
 */
export async function createForum(formData: FormData): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session || !isModerator(session.user.role)) {
    return { success: false, error: "Seuls les modérateurs peuvent créer des forums." };
  }

  const parentForumId = (formData.get("parentForumId") as string) || null;
  const result = await createForumRecord(session.user.id, {
    name: (formData.get("name") as string) ?? "",
    description: formData.get("description") as string,
    categoryId: (formData.get("categoryId") as string) || null,
    parentForumId,
    afterId: (formData.get("afterId") as string) || "START",
  });
  if (!result.success) return result;

  redirect(parentForumId ? `/forum/${parentForumId}` : "/forum");
}

/**
 * Indique, pour chaque message cité dans les textes donnés, s'il a été supprimé ou modéré, afin que la citation
 * soit remplacée par un encart (voir parseBBCode dans lib/bbcode.ts). Deux formes de balise existent :
 * la forme courte [quote=membre|message] et la forme en trois parties [quote=membre|message|nom], celle que
 * crée le bouton « Citer ». L'expression reconnaît les deux, avec la même règle que parseBBCode, pour qu'une
 * citation d'un message modéré ne laisse jamais voir son texte.
 */
export async function getQuoteStatusMap(contents: string[]) {
  const quoteRegex = /\[quote=([^|\]]+)\|([a-zA-Z0-9_-]*)(?:\|[^\]]*)?\]/gi;
  const postIds = new Set<string>();
  
  for (const content of contents) {
    if (!content) continue;
    const matches = [...content.matchAll(quoteRegex)];
    for (const match of matches) {
      if (match[2]) postIds.add(match[2]);
    }
  }

  if (postIds.size === 0) return {};

  // Seulement les messages des forums accessibles (carte 221) : sinon n'importe qui pouvait demander l'auteur et
  // l'état d'un message d'un forum réservé. Une citation d'un message inaccessible reste affichée telle qu'écrite.
  const { roles } = await getForumAccess();
  const posts = await prisma.post.findMany({
    where: { id: { in: Array.from(postIds).slice(0, 200) }, topic: { forum: forumAccessWhere(roles) } },
    select: { id: true, isDeleted: true, isModerated: true, authorId: true, deletedById: true, author: { select: { name: true } } }
  });

  // L'auteur réel du message cité (carte 169) : parseBBCode n'affiche « Par @… » que si la balise désigne bien cet
  // auteur, et avec son vrai pseudo. Une citation écrite à la main et attribuée à un autre membre perd donc cet onglet.
  const map: QuoteStatusMap = {};
  for (const p of posts) {
    // Supprimé par la modération ou par son auteur (même règle que postDeletedBy, lib/forumDeletion.ts) : seul ce
    // booléen part dans la page, jamais l'identifiant de celui qui a supprimé
    map[p.id] = {
      isDeleted: p.isDeleted,
      isModerated: p.isModerated,
      deletedByModeration: postDeletedBy(p) === "moderation",
      authorId: p.authorId,
      authorName: p.author.name,
    };
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

/**
 * Supprime un forum vide (modérateurs). Les règles sont dans `lib/forumStructure.ts`, partagé avec l'administration
 * (carte 199) : le forum « Les tournois » et le dernier forum ouvert à tous ne peuvent pas être supprimés, et un forum
 * qui contient des sous-forums ou des sujets (supprimés compris, car restaurables) est refusé avec un message clair.
 * Avant la carte 199, cet écran supprimait aussi les sous-forums vides avec leur parent, et ne protégeait ni le
 * forum « Les tournois » ni le dernier forum public.
 */
export async function deleteForum(forumId: string, forumName: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session || !isModerator(session.user.role)) {
    return { success: false, error: "Seuls les modérateurs peuvent supprimer des forums." };
  }

  // Un modérateur ne touche qu'aux forums qu'il peut voir (un forum réservé aux administrateurs lui reste fermé)
  const { roles } = await getForumAccess();
  const visible = await prisma.forum.findFirst({ where: { id: forumId, ...forumAccessWhere(roles) }, select: { id: true } });
  if (!visible) return { success: false, error: "Forum introuvable." };

  const result = await deleteForumRecord(session.user.id, forumId);
  if (!result.success) return result;

  redirect(`/forum?deletedForum=${encodeURIComponent(result.name ?? forumName)}`);
}

/**
 * Crée un sujet et son premier message (et le tournoi, dans un forum de tournois). En cas de refus, renvoie
 * `{ success: false, error }` que le formulaire affiche dans une notification ; en cas de réussite, redirige
 * vers le nouveau sujet.
 */
export async function createTopic(formData: FormData): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return { success: false, error: "Tu dois être connecté pour créer un sujet." };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const forumId = formData.get("forumId") as string;
  const isSticky = formData.get("isSticky") === "on";
  const isLocked = formData.get("isLocked") === "on";

  if (!title || !content || !forumId) {
    return { success: false, error: "Le titre et le message du sujet sont obligatoires." };
  }
  // Titre de 3 à 150 caractères, message non vide et de 30 000 caractères au plus (carte 169)
  const textError = topicTitleError(title) ?? postContentError(content);
  if (textError) return { success: false, error: textError };
  // Limite d'actions par minute (carte 224)
  const tooFast = await rateLimitRefusal(session.user.id, session.user.role, "TOPIC");
  if (tooFast) return { success: false, error: tooFast };

  // Vérifier l'accès (rôle), si le forum est locké ou un forum de tournoi
  const { roles } = await getForumAccess();
  const forum = await prisma.forum.findFirst({
    where: { id: forumId, ...forumAccessWhere(roles) },
    select: { isLocked: true, isTournamentForum: true, ...FORUM_ACCESS_SELECT }
  });
  if (!forum) return { success: false, error: "Forum introuvable." };

  // Modération du site ou de ce forum (carte 225)
  const canModerateHere = await canModerateForum(session.user.id, session.user.role, forumId);
  if (forum?.isLocked && !canModerateHere) {
    return { success: false, error: "Ce forum est verrouillé. Tu ne peux pas y créer de nouveau sujet." };
  }

  // Données de tournoi si applicable : formulaire lu par la même fonction qu'à la modification (carte 201)
  let tournamentData: Prisma.TournamentUncheckedCreateInput | null = null;
  if (forum?.isTournamentForum) {
    const form = readTournamentForm(formData);
    if ("error" in form) return { success: false, error: form.error };

    // Seuls les modérateurs et les administrateurs accréditent un tournoi du Championnat de France (carte 162) : la case
    // n'est pas affichée aux autres, et le serveur refuse la demande si elle arrive quand même.
    const { wantsCdf, typeCDF, commissaireIds } = form.requests;
    if (wantsCdf && !isModerator(session.user.role)) {
      return { success: false, error: "Seuls les modérateurs et les administrateurs peuvent déclarer un tournoi du Championnat de France (CDF)." };
    }

    // Sans coordonnées venues du formulaire, l'adresse est cherchée par le serveur
    const fields = await withCoordinates(form.fields);
    tournamentData = {
      ...fields,
      name: title,
      isCDF: wantsCdf,
      typeCDF: wantsCdf ? typeCDF || "INDIVIDUEL" : "INDIVIDUEL",
      organizerId: session.user.id,
      commissaires: { connect: commissaireIds.map((id) => ({ id })) },
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
        title: title.trim(),
        forumId,
        authorId: session.user.id,
        isSticky: isSticky && canModerateHere,
        isLocked: isLocked && canModerateHere,
        tournamentId: tournamentId
      }
    });

    const firstPost = await tx.post.create({
      data: {
        content,
        topicId: newTopic.id,
        authorId: session.user.id,
      }
    });

    // Dernier message du sujet (carte 166), et position de lecture de l'auteur : son sujet n'est pas non lu pour lui
    await tx.topic.update({
      where: { id: newTopic.id },
      data: { lastPostAt: firstPost.createdAt, lastPostId: firstPost.id, lastPostAuthorId: session.user.id }
    });
    await tx.topicView.create({
      data: { userId: session.user.id, topicId: newTopic.id, lastReadPostAt: firstPost.createdAt, lastPostId: firstPost.id }
    });

    return { ...newTopic, firstPostId: firstPost.id };
  });

  // Mentions du premier message et abonnement automatique de l'auteur (carte 167). Un échec ici n'annule pas le sujet.
  try {
    await notifyMentions({ postId: topic.firstPostId, topicId: topic.id, forum, authorId: session.user.id, content });
    await followTopicAutomatically(session.user.id, topic.id);
  } catch (error) {
    console.error("createTopic notifications error:", error);
  }

  refreshTopic({ id: topic.id, forumIds: [forumId], isTournament: !!tournamentData });

  redirect(`/forum/topic/${topic.id}`);
}

export async function createPost(topicId: string, content: string): Promise<ActionResult & { postId?: string }> {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return { success: false, error: "Tu dois être connecté pour répondre." };
  }
  // Message non vide et de 30 000 caractères au plus (carte 169)
  const contentError = postContentError(content);
  if (contentError) return { success: false, error: contentError };
  // Limite d'actions par minute (carte 224)
  const tooFast = await rateLimitRefusal(session.user.id, session.user.role, "POST");
  if (tooFast) return { success: false, error: tooFast };

  // Vérifier l'accès (rôle) et si le sujet est verrouillé ou archivé, ou son forum verrouillé
  const { roles } = await getForumAccess();
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, ...topicAccessWhere(roles) },
    include: { forum: { select: { isLocked: true, ...FORUM_ACCESS_SELECT } } }
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  // Un sujet archivé est fermé comme un sujet verrouillé (carte 169) : avant, il acceptait des réponses invisibles
  // Même règle que l'outil « Répondre » de la page du sujet (lib/forumRights.ts, carte 200)
  if (!canReplyToTopic({ id: session.user.id, isModerator: await canModerateForum(session.user.id, session.user.role, topic.forumId) }, { ...writeState(topic), isDeleted: topic.isDeleted })) {
    return { success: false, error: closedTopicMessage(writeState(topic)) };
  }

  const post = await prisma.post.create({
    data: {
      content,
      topicId,
      authorId: session.user.id,
    }
  });

  // Dernier message du sujet (carte 166) : sert au tri des listes, au non-lu et à « Dernier : … »
  // (sans effet si un message plus récent, envoyé au même moment, est déjà enregistré)
  await prisma.topic.updateMany({
    where: { id: topicId, lastPostAt: { lte: post.createdAt } },
    data: { lastPostAt: post.createdAt, lastPostId: post.id, lastPostAuthorId: session.user.id }
  });

  // Position de lecture de l'auteur : sa propre réponse ne rend pas le sujet non lu pour lui
  const authorPosition = { lastReadPostAt: post.createdAt, lastPostId: post.id };
  await prisma.topicView.upsert({
    where: { userId_topicId: { userId: session.user.id, topicId } },
    update: authorPosition,
    create: { userId: session.user.id, topicId, ...authorPosition }
  });

  // Notifications (carte 167) : mentions de la réponse, puis abonnés du sujet (un membre mentionné ne reçoit pas en plus
  // la notification de suivi). Les droits sur le forum et les blocages sont vérifiés pour chaque destinataire, et les
  // e-mails partent après la réponse au membre, avec after(). Les requêtes se suivent au lieu d'être lancées ensemble :
  // la base locale de développement ne sait pas traiter plusieurs requêtes à la fois. Un échec ici n'annule pas la
  // réponse.
  try {
    const mentioned = await notifyMentions({ postId: post.id, topicId, forum: topic.forum, authorId: session.user.id, content });
    await notifyFollowers({
      postId: post.id,
      topic: { id: topicId, title: topic.title, previousLastPostAt: topic.lastPostAt },
      forum: topic.forum,
      author: { id: session.user.id, name: session.user.name || "Un coach" },
      skipUserIds: mentioned,
    });
    // Abonnement automatique de l'auteur, après le calcul des abonnés (il n'est jamais prévenu de sa propre réponse)
    await followTopicAutomatically(session.user.id, topicId);
  } catch (error) {
    console.error("createPost notifications error:", error);
  }

  refreshTopic({ id: topicId, forumIds: [topic.forumId] });
  return { success: true, postId: post.id };
}

export async function updatePost(postId: string, content: string): Promise<ActionResult & { topicId?: string; page?: number }> {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return { success: false, error: "Tu dois être connecté pour modifier un message." };
  }

  const contentError = postContentError(content);
  if (contentError) return { success: false, error: contentError };

  const existingPost = await findAccessiblePost(postId);

  if (!existingPost) return { success: false, error: "Message introuvable." };
  // Même règle que le menu « ⋯ » du message (lib/forumRights.ts, carte 200)
  const viewer = { id: session.user.id, isModerator: await canModeratePost(session.user.id, session.user.role, postId) };
  if (!canSavePostEdit(viewer, isTopicClosedFor(writeState(existingPost.topic), false), existingPost)) {
    return {
      success: false,
      error: existingPost.authorId !== session.user.id && !viewer.isModerator
        ? "Tu n'as pas l'autorisation de modifier ce message."
        : existingPost.isDeleted || existingPost.isModerated
          ? "Ce message a été supprimé ou masqué : tu ne peux plus le modifier."
          : "Ce sujet est verrouillé ou archivé. Tu ne peux plus modifier ce message.",
    };
  }

  await prisma.post.update({
    where: { id: postId },
    data: { content, updatedAt: new Date() }
  });
  // Un modérateur qui modifie le message d'un autre membre laisse une trace (carte 221).
  if (existingPost.authorId !== session.user.id) {
    await logModerationAction(session.user.id, "POST_EDITED_BY_MOD", postId, "POST", `Sujet « ${existingPost.topic.title} »`);
  }

  // Une mention ajoutée en modifiant le message prévient le membre mentionné (carte 167) ; les membres déjà mentionnés
  // dans ce message ne sont pas prévenus une deuxième fois. La mention est attribuée à l'auteur du message.
  try {
    const forum = await prisma.forum.findUnique({ where: { id: existingPost.topic.forumId }, select: FORUM_ACCESS_SELECT });
    if (forum) {
      await notifyMentions({ postId, topicId: existingPost.topicId, forum, authorId: existingPost.authorId, content });
    }
  } catch (error) {
    console.error("updatePost notifications error:", error);
  }

  // Page du sujet où revenir après l'enregistrement
  const page = await forumPostPage(existingPost.topicId, existingPost);

  revalidatePath(`/forum/topic/${existingPost.topicId}`);
  return { success: true, topicId: existingPost.topicId, page };
}

/**
 * Un message du forum, pour la citation de la page Répondre. Comme toute action serveur, elle peut être appelée
 * directement depuis le navigateur : le texte d'un message supprimé, ou masqué pour un lecteur qui n'est ni son auteur
 * ni modérateur, est donc vidé ici, et l'auteur se réduit à son identifiant, son pseudo et son avatar (carte 164).
 */
export async function getPostById(postId: string) {
  const [{ roles }, session] = await Promise.all([getForumAccess(), getActiveSession()]);
  const post = await prisma.post.findFirst({
    where: { id: postId, topic: topicAccessWhere(roles) },
    include: { author: { select: PUBLIC_MEMBER_SELECT } }
  });
  return post ? hidePostContent(post, { id: session?.user?.id, isModerator: await canModeratePost(session?.user?.id, session?.user?.role, postId) }) : null;
}

/**
 * Les derniers messages d'un sujet, pour le rappel sous l'éditeur. Même protection que `getPostById` : texte vidé
 * pour un message supprimé ou masqué, auteur réduit au pseudo et à l'avatar.
 */
export async function getTopicLatestPosts(topicId: string, limit: number = 3) {
  const [{ roles }, session] = await Promise.all([getForumAccess(), getActiveSession()]);
  const posts = await prisma.post.findMany({
    where: { topicId, topic: topicAccessWhere(roles) },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { author: { select: PUBLIC_MEMBER_SELECT } }
  });
  const viewer = { id: session?.user?.id, isModerator: await canModerateTopic(session?.user?.id, session?.user?.role, topicId) };
  return posts.map(post => hidePostContent(post, viewer));
}

export async function moderatePost(postId: string, reason: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !(await canModeratePost(session.user.id, session.user.role, postId))) {
    return { success: false, error: "Seuls les modérateurs peuvent modérer des messages." };
  }

  // Seulement dans un forum que le modérateur peut voir (carte 200 : avant, un forum réservé aux administrateurs
  // restait modifiable en appelant l'action directement)
  const { roles } = await getForumAccess();
  const post = await prisma.post.findFirst({
    where: { id: postId, topic: { forum: forumAccessWhere(roles) } }
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
    session.user.id,
    "POST_MODERATED",
    postId,
    "POST",
    `Message modéré. Raison : ${reason}`
  );
  // Le message masqué n'a plus besoin d'être traité : ses signalements en attente se ferment (carte 168)
  await closePendingReports("POST", [postId], session.user.id);

  revalidatePath(`/forum/topic/${post.topicId}`);
  return { success: true };
}

export async function unmoderatePost(postId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !(await canModeratePost(session.user.id, session.user.role, postId))) {
    return { success: false, error: "Seuls les modérateurs peuvent annuler une modération." };
  }

  // Seulement dans un forum que le modérateur peut voir (carte 200 : avant, un forum réservé aux administrateurs
  // restait modifiable en appelant l'action directement)
  const { roles } = await getForumAccess();
  const post = await prisma.post.findFirst({
    where: { id: postId, topic: { forum: forumAccessWhere(roles) } }
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
    session.user.id,
    "POST_UNMODERATED",
    postId,
    "POST",
    `Modération annulée sur le message`
  );

  revalidatePath(`/forum/topic/${post.topicId}`);
  return { success: true };
}

/**
 * Supprime un message, en suppression douce (carte 165) : le message reste en base, marqué supprimé avec la date,
 * le membre qui l'a supprimé et, pour la modération, la raison. Son texte n'est plus montré à personne.
 * - L'auteur supprime son message sans raison. S'il s'agit du premier message d'un sujet resté sans réponse, c'est
 *   le sujet entier qui est supprimé ; s'il y a des réponses, c'est refusé.
 * - Un modérateur supprime le message d'un autre membre (un spam, par exemple) avec une raison obligatoire, et peut
 *   ensuite le restaurer (`restorePost`).
 * Les règles elles-mêmes sont dans lib/forumDeletion.ts.
 */
export async function deletePost(postId: string, reason?: string): Promise<ActionResult & { topicDeleted?: boolean; topicTitle?: string }> {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return { success: false, error: "Tu dois être connecté." };
  }
  const userId = session.user.id;

  const post = await findAccessiblePost(postId);

  if (!post) return { success: false, error: "Message introuvable." };
  const viewerCanModerate = await canModeratePost(userId, session.user.role, postId);
  if (isLockedFor(post, viewerCanModerate)) {
    return { success: false, error: "Ce sujet est verrouillé ou archivé. Tu ne peux plus supprimer ce message." };
  }

  // Le premier message du sujet (même ordre que la page du sujet) et le nombre de réponses encore visibles
  const [firstPost, otherVisiblePosts] = await Promise.all([
    prisma.post.findFirst({ where: { topicId: post.topicId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], select: { id: true } }),
    prisma.post.count({ where: { topicId: post.topicId, isDeleted: false, id: { not: postId } } }),
  ]);

  const decision = decidePostDeletion({
    viewerId: userId,
    viewerIsModerator: viewerCanModerate,
    post,
    isFirstPost: firstPost?.id === postId,
    otherVisiblePosts,
    topicHasTournament: !!post.topic.tournamentId,
    reason,
  });
  if (decision.kind === "refuse") return { success: false, error: decision.error };

  if (decision.kind === "deleteTopic") {
    // Premier message d'un sujet sans réponse : le sujet entier disparaît (suppression douce, restaurable)
    await markTopicDeleted(post.topicId, userId, null);
    await logModerationAction(
      session.user.id,
      "TOPIC_DELETED",
      post.topicId,
      "TOPIC",
      `Sujet supprimé par son auteur (premier message supprimé, aucune réponse) : ${post.topic.title}`
    );
    // Le sujet et son premier message ont disparu : leurs signalements en attente se ferment (carte 168)
    await closePendingReports("TOPIC", [post.topicId], userId);
    await closePendingReports("POST", [postId], userId);
    refreshTopic({ id: post.topicId, forumIds: [post.topic.forumId], isTournament: true });
    return { success: true, topicDeleted: true, topicTitle: post.topic.title };
  }

  const cleanReason = decision.byModeration ? (reason ?? "").trim() : null;
  await prisma.post.update({
    where: { id: postId },
    data: { isDeleted: true, deletedAt: new Date(), deletedById: userId, deletionReason: cleanReason }
  });
  // Le message supprimé était peut-être le dernier du sujet
  await refreshTopicLastPost(post.topicId);

  // Trace au journal de modération, aussi quand c'est l'auteur qui supprime : utile pour l'historique
  await logModerationAction(
    session.user.id,
    "POST_DELETED",
    postId,
    "POST",
    decision.byModeration ? `Message supprimé par la modération. Raison : ${cleanReason}` : "Message supprimé par son auteur"
  );
  // Le message supprimé n'a plus besoin d'être traité : ses signalements en attente se ferment (carte 168)
  await closePendingReports("POST", [postId], userId);

  refreshTopic({ id: post.topicId, forumIds: [post.topic.forumId] });
  return { success: true };
}

/**
 * Restaure un message supprimé par la modération (carte 165). Réservé aux modérateurs. Un message que son auteur a
 * lui-même supprimé n'est pas restaurable : c'était sa décision.
 */
export async function restorePost(postId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !(await canModeratePost(session.user.id, session.user.role, postId))) {
    return { success: false, error: "Seuls les modérateurs peuvent restaurer un message." };
  }

  const post = await findAccessiblePost(postId);
  if (!post) return { success: false, error: "Message introuvable." };
  if (!canRestorePost(post, true)) {
    return { success: false, error: "Seul un message supprimé par la modération peut être restauré." };
  }

  await prisma.post.update({
    where: { id: postId },
    data: { isDeleted: false, deletedAt: null, deletedById: null, deletionReason: null }
  });
  // Le message restauré redevient peut-être le dernier du sujet
  await refreshTopicLastPost(post.topicId);

  await logModerationAction(session.user.id, "POST_RESTORED", postId, "POST", "Message supprimé par la modération restauré");

  revalidatePath(`/forum/topic/${post.topicId}`);
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
    // Carte 166 : au lieu d'une ligne par sujet, une date « tout est lu avant le… » pour le membre, et la position de
    // lecture des sujets déjà ouverts amenée à la même date (sinon ils suivraient encore leur ancienne position)
    const now = new Date();
    await prisma.$transaction([
      prisma.user.update({ where: { id: session.user.id }, data: { forumReadAllAt: now } }),
      prisma.topicView.updateMany({
        where: { userId: session.user.id, lastReadPostAt: { lt: now } },
        data: { lastReadPostAt: now, lastPostId: null }
      }),
    ]);

    revalidatePath("/forum");
    return { success: true };
  } catch (error) {
    console.error("markAllTopicsAsRead Error:", error);
    return { success: false, error: "Impossible de tout marquer comme lu pour le moment. Réessaie dans un instant." };
  }
}

export async function togglePinTopic(topicId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !(await canModerateTopic(session.user.id, session.user.role, topicId))) {
    return { success: false, error: "Seuls les modérateurs peuvent épingler des sujets." };
  }

  // Seulement dans un forum que le modérateur peut voir (carte 200 : avant, un forum réservé aux administrateurs
  // restait modifiable en appelant l'action directement)
  const { roles } = await getForumAccess();
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, forum: forumAccessWhere(roles) },
    select: { isSticky: true }
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  await prisma.topic.update({
    where: { id: topicId },
    data: { isSticky: !topic.isSticky }
  });

  await logModerationAction(
    session.user.id,
    topic.isSticky ? "TOPIC_UNPINNED" : "TOPIC_PINNED",
    topicId,
    "TOPIC",
    `${topic.isSticky ? "Désépinglage" : "Épinglage"} du sujet`
  );

  revalidatePath(`/forum/topic/${topicId}`);
  return { success: true };
}

/**
 * Marque un sujet supprimé, ou le restaure (carte 165). La mise à jour passe par une requête SQL directe, comme le
 * compteur de vues de `markTopicAsRead` : la date de dernière modification du sujet (`updatedAt`) ne bouge pas. Depuis
 * la carte 166, le non-lu et le tri des listes suivent le dernier message (`lastPostAt`), que la suppression d'un sujet
 * ne change pas (ses messages restent en place) : le sujet restauré ne redevient pas « non lu » et ne remonte pas.
 */
async function markTopicDeleted(topicId: string, deletedById: string, reason: string | null) {
  await prisma.$executeRaw`UPDATE "Topic" SET "isDeleted" = true, "deletedAt" = NOW(), "deletedById" = ${deletedById}, "deletionReason" = ${reason} WHERE "id" = ${topicId}`;
}

async function markTopicRestored(topicId: string) {
  await prisma.$executeRaw`UPDATE "Topic" SET "isDeleted" = false, "deletedAt" = NULL, "deletedById" = NULL, "deletionReason" = NULL WHERE "id" = ${topicId}`;
}


/**
 * Supprime un sujet, en suppression douce (carte 165) : réservé aux modérateurs, avec une raison, inscrit au journal
 * et restaurable (`restoreTopic`). Rien n'est effacé : les messages, le tournoi et ses inscriptions restent en base.
 * Le sujet disparaît des listes, des non-lus, de la recherche et du profil ; un membre qui l'ouvre tombe sur une page
 * introuvable, un modérateur le voit avec un bandeau « Sujet supprimé ».
 * Un sujet qui porte un tournoi ayant des résultats publiés est refusé : il faut d'abord annuler le tournoi.
 */
export async function deleteTopic(topicId: string, reason: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non connecté." };

  const { roles } = await getForumAccess();
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, ...topicAccessWhere(roles) },
    select: {
      title: true,
      forumId: true,
      isDeleted: true,
      tournament: { select: { isCancelled: true, _count: { select: { results: true } } } },
    },
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  const refusal = topicDeletionRefusal({
    viewerIsModerator: await canModerateTopic(session.user.id, session.user.role, topicId),
    isDeleted: topic.isDeleted,
    tournament: topic.tournament ? { isCancelled: topic.tournament.isCancelled, resultCount: topic.tournament._count.results } : null,
  });
  if (refusal) return { success: false, error: refusal };
  const cleanReason = reason?.trim();
  if (!cleanReason) return { success: false, error: "Indique la raison de la suppression." };

  await markTopicDeleted(topicId, session.user.id, cleanReason);

  await logModerationAction(
    session.user.id,
    "TOPIC_DELETED",
    topicId,
    "TOPIC",
    `Sujet supprimé${topic.tournament ? " (son tournoi n'est plus affiché)" : ""} : ${topic.title}. Raison : ${cleanReason}`
  );
  // Le sujet supprimé n'a plus besoin d'être traité : ses signalements en attente se ferment (carte 168). Ceux de ses
  // messages restent ouverts ; l'écran de modération les montre comme « contenu déjà supprimé », avec « Fermer ».
  await closePendingReports("TOPIC", [topicId], session.user.id);

  refreshTopic({ id: topicId, forumIds: [topic.forumId], isTournament: true });
  redirect(`/forum?deletedTopic=${encodeURIComponent(topic.title)}`);
}

/** Restaure un sujet supprimé (carte 165), avec tous ses messages. Réservé aux modérateurs. */
export async function restoreTopic(topicId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !(await canModerateTopic(session.user.id, session.user.role, topicId))) {
    return { success: false, error: "Seuls les modérateurs peuvent restaurer un sujet." };
  }

  // Un sujet supprimé n'est pas trouvé par topicAccessWhere : seul l'accès au forum est vérifié ici
  const { roles } = await getForumAccess();
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, isDeleted: true, forum: forumAccessWhere(roles) },
    select: { title: true, forumId: true },
  });
  if (!topic) return { success: false, error: "Sujet supprimé introuvable." };
  // Un sujet fusionné dans un autre (carte 169) n'a plus de messages : le restaurer donnerait un sujet vide
  const postCount = await prisma.post.count({ where: { topicId } });
  if (postCount === 0) {
    return { success: false, error: "Ce sujet a été fusionné dans un autre : ses messages n'y sont plus, il ne peut pas être restauré." };
  }

  await markTopicRestored(topicId);
  await logModerationAction(session.user.id, "TOPIC_RESTORED", topicId, "TOPIC", `Sujet restauré : ${topic.title}`);

  refreshTopic({ id: topicId, forumIds: [topic.forumId], isTournament: true });
  return { success: true };
}

export async function moveTopic(topicId: string, newForumId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !(await canModerateTopic(session.user.id, session.user.role, topicId))) {
    return { success: false, error: "Seuls les modérateurs peuvent déplacer des sujets." };
  }

  // Le sujet et le forum de destination doivent tous deux être accessibles au rôle du modérateur
  // Un modérateur de forum ne déplace que vers un forum qu'il modère aussi (carte 225)
  if (!(await canModerateForum(session.user.id, session.user.role, newForumId))) {
    return { success: false, error: "Tu ne modères pas le forum de destination." };
  }
  const { roles } = await getForumAccess();
  const [topic, destination] = await Promise.all([
    prisma.topic.findFirst({ where: { id: topicId, ...topicAccessWhere(roles) } }),
    prisma.forum.findFirst({ where: { id: newForumId, ...forumAccessWhere(roles) }, select: { id: true } }),
  ]);

  if (!topic) return { success: false, error: "Sujet introuvable." };
  if (!destination) return { success: false, error: "Forum de destination introuvable." };

  await prisma.topic.update({
    where: { id: topicId },
    data: { forumId: newForumId }
  });

  await logModerationAction(
    session.user.id,
    "TOPIC_MOVED",
    topicId,
    "TOPIC",
    `Sujet déplacé vers le forum ${newForumId}`
  );

  refreshTopic({ id: topicId, forumIds: [topic.forumId, newForumId] });
  return { success: true };
}

/**
 * Renomme un sujet : son auteur ou un modérateur. Depuis la carte 169, le titre doit compter de 3 à 150 caractères
 * (avant, un titre vide était accepté), et un sujet verrouillé ou archivé, ou rangé dans un forum verrouillé, ne peut
 * plus être renommé que par un modérateur.
 */
export async function updateTopicTitle(topicId: string, title: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return { success: false, error: "Tu dois être connecté." };
  }

  const titleError = topicTitleError(title);
  if (titleError) return { success: false, error: titleError };

  const { roles } = await getForumAccess();
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, ...topicAccessWhere(roles) },
    select: { authorId: true, title: true, isLocked: true, isArchived: true, forum: { select: { isLocked: true } } }
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  const sessionUser = session.user as { id: string; role: string };
  const viewerIsModerator = await canModerateTopic(sessionUser.id, sessionUser.role, topicId);
  if (topic.authorId !== sessionUser.id && !viewerIsModerator) {
    return { success: false, error: "Tu n'as pas l'autorisation de modifier ce sujet." };
  }
  if (isTopicClosedFor(writeState(topic), viewerIsModerator)) {
    return { success: false, error: "Ce sujet est verrouillé ou archivé : seul un modérateur peut encore le renommer." };
  }

  const previous = await prisma.topic.update({
    where: { id: topicId },
    data: { title: title.trim() },
    select: { id: true },
  });
  if (topic.authorId !== sessionUser.id) {
    await logModerationAction(sessionUser.id, "TOPIC_RENAMED", previous.id, "TOPIC", `« ${topic.title} » → « ${title.trim()} »`);
  }

  revalidatePath(`/forum/topic/${topicId}`);
  return { success: true };
}

/**
 * Ajoute, remplace ou retire la réaction du membre sur un message : un membre n'a qu'une réaction par message. Depuis
 * la carte 169 :
 * - l'émoji doit être l'un de ceux proposés à l'écran (`REACTION_EMOJIS`) ; retirer une ancienne réaction reste possible ;
 * - un sujet archivé refuse les réactions, comme un sujet verrouillé ;
 * - les appels d'un même membre sur un même message passent l'un après l'autre (verrou de la base, voir plus bas) :
 *   un double appui ne crée plus deux réactions.
 */
export async function togglePostReaction(postId: string, emoji: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Tu dois être connecté." };

  const userId = session.user.id;

  const target = await findAccessiblePost(postId);
  if (!target || target.isDeleted) return { success: false, error: "Message introuvable." };
  // Un message masqué par la modération ne reçoit plus de réaction (carte 221 : l'écran ne la propose plus)
  if (target.isModerated) return { success: false, error: "Ce message a été masqué : il ne reçoit plus de réaction." };
  // Limite d'actions par minute (carte 224)
  const tooFast = await rateLimitRefusal(userId, session.user.role, "REACTION");
  if (tooFast) return { success: false, error: tooFast };
  if (isLockedFor(target, await canModeratePost(userId, session.user.role, postId))) {
    return { success: false, error: closedTopicMessage(writeState(target.topic)) };
  }

  const lockKey = `reaction:${postId}:${userId}`;
  const outcome = await prisma.$transaction(async (tx) => {
    // Verrou de la base propre à ce membre et à ce message, rendu à la fin de la transaction : un second appel lancé
    // au même moment (double appui) attend que le premier soit enregistré, puis voit sa réaction
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))::text AS locked`;
    const existing = await tx.postReaction.findMany({ where: { postId, userId }, select: { id: true, emoji: true } });

    if (existing.some((reaction) => reaction.emoji === emoji)) {
      // Même émoji : la réaction est retirée (et un éventuel doublon ancien avec elle)
      await tx.postReaction.deleteMany({ where: { postId, userId } });
      return "removed";
    }
    if (!isAllowedReaction(emoji)) return "refused";
    await tx.postReaction.deleteMany({ where: { postId, userId } });
    await tx.postReaction.create({ data: { postId, userId, emoji } });
    return "set";
  });
  if (outcome === "refused") return { success: false, error: "Cette réaction n'est pas proposée." };

  revalidatePath(`/forum/topic/${target.topicId}`);
  return { success: true };
}

export async function toggleArchiveTopic(topicId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !(await canModerateTopic(session.user.id, session.user.role, topicId))) {
    return { success: false, error: "Seuls les modérateurs peuvent archiver des sujets." };
  }

  // Seulement dans un forum que le modérateur peut voir (carte 200 : avant, un forum réservé aux administrateurs
  // restait modifiable en appelant l'action directement)
  const { roles } = await getForumAccess();
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, forum: forumAccessWhere(roles) },
    select: { id: true, isArchived: true, forumId: true }
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  await prisma.topic.update({
    where: { id: topicId },
    data: { isArchived: !topic.isArchived }
  });

  await logModerationAction(
    session.user.id,
    topic.isArchived ? "TOPIC_UNARCHIVED" : "TOPIC_ARCHIVED",
    topicId,
    "TOPIC",
    `${topic.isArchived ? "Désarchivage" : "Archivage"} du sujet`
  );

  refreshTopic({ id: topicId, forumIds: [topic.forumId] });
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
 * Basculer le suivi d'un sujet. On ne peut suivre qu'un sujet accessible à son rôle et non supprimé (carte 167) ;
 * arrêter de suivre reste toujours possible.
 */
export async function toggleFollowTopic(topicId: string) {
  const session = await getActiveSession();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Non autorisé", isFollowing: false };

  try {
    const { roles } = await getForumAccess();
    const accessible = await prisma.topic.findFirst({ where: { id: topicId, ...topicAccessWhere(roles) }, select: { id: true } });
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

    if (!accessible) return { success: false, error: "Sujet introuvable.", isFollowing: false };
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

    const [totalCount, follows, user] = await Promise.all([
      prisma.topicFollow.count({ where: followWhere }),
      prisma.topicFollow.findMany({
        where: followWhere,
        skip,
        take: limit,
        select: {
          topic: {
            select: {
              id: true,
              title: true,
              forumId: true,
              lastPostAt: true,
              topicViews: { where: { userId }, select: { lastReadPostAt: true, lastPostId: true } },
            },
          },
        },
        // Du plus récent au plus ancien dernier message (carte 166)
        orderBy: { topic: { lastPostAt: "desc" } },
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { forumReadAllAt: true } }),
    ]);
    const totalPages = Math.ceil(totalCount / limit);
    const readAllAt = user?.forumReadAllAt ?? new Date(0);

    const topics = follows.map(({ topic }) => {
      const view = topic.topicViews[0];
      return {
        id: topic.id,
        title: topic.title,
        lastPostAt: topic.lastPostAt,
        forumId: topic.forumId,
        isUnread: isTopicUnread(topic.lastPostAt, view ? { at: view.lastReadPostAt, postId: view.lastPostId } : null, readAllAt),
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
  if (!session || !isModerator(session.user.role)) {
    return { success: false, error: "Action non autorisée." };
  }

  // Seulement dans un forum que le modérateur peut voir (carte 200 : avant, un forum réservé aux administrateurs
  // restait modifiable en appelant l'action directement)
  const { roles } = await getForumAccess();
  const forum = await prisma.forum.findFirst({
    where: { id: forumId, ...forumAccessWhere(roles) },
    select: { isLocked: true }
  });

  if (!forum) return { success: false, error: "Forum introuvable." };

  await prisma.forum.update({
    where: { id: forumId },
    data: { isLocked: !forum.isLocked }
  });

  await logModerationAction(
    session.user.id,
    forum.isLocked ? "FORUM_UNLOCKED" : "FORUM_LOCKED",
    forumId,
    "FORUM",
    `${forum.isLocked ? "Déverrouillage" : "Verrouillage"} du forum`
  );

  refreshForumStructure(forumId);
  return { success: true };
}

export async function toggleTopicLock(topicId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id || !(await canModerateTopic(session.user.id, session.user.role, topicId))) {
    return { success: false, error: "Action non autorisée." };
  }

  // Seulement dans un forum que le modérateur peut voir (carte 200 : avant, un forum réservé aux administrateurs
  // restait modifiable en appelant l'action directement)
  const { roles } = await getForumAccess();
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, forum: forumAccessWhere(roles) },
    select: { isLocked: true, forumId: true }
  });

  if (!topic) return { success: false, error: "Sujet introuvable." };

  await prisma.topic.update({
    where: { id: topicId },
    data: { isLocked: !topic.isLocked }
  });

  await logModerationAction(
    session.user.id,
    topic.isLocked ? "TOPIC_UNLOCKED" : "TOPIC_LOCKED",
    topicId,
    "TOPIC",
    `${topic.isLocked ? "Déverrouillage" : "Verrouillage"} du sujet`
  );

  refreshTopic({ id: topicId, forumIds: [topic.forumId] });
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

  // Organisateur, commissaire ou modérateur : règle écrite une seule fois (lib/tournamentRights.ts, carte 201)
  const viewer = { id: session.user.id, isModerator: isModerator(session.user.role) };
  if (!canManageTournament(viewer, tournament)) {
    return { success: false, error: "Tu n'as pas les droits pour modifier ce tournoi." };
  }
  // L'organisateur (ou un modérateur) est seul à pouvoir changer les commissaires
  const isOrganizer = tournament.organizerId === session.user.id;
  const isMod = viewer.isModerator;

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

  if (!title || !content) {
    return { success: false, error: "Titre, contenu et date de début sont obligatoires." };
  }
  // Mêmes limites que pour un sujet ordinaire (carte 169)
  const textError = topicTitleError(title) ?? postContentError(content);
  if (textError) return { success: false, error: textError };

  // Formulaire lu par la même fonction qu'à la création (carte 201) : mêmes valeurs par défaut, et l'adresse est
  // aussi cherchée par le serveur quand le formulaire ne donne pas de coordonnées
  const form = readTournamentForm(formData);
  if ("error" in form) return { success: false, error: form.error };
  const fields = await withCoordinates(form.fields);

  // Case « CDF » : seuls les modérateurs et les administrateurs la changent (carte 162). Pour les autres, le tournoi
  // garde son statut CDF ; seul le type de classement CDF suit le format (individuel ou par équipes) choisi dans le
  // formulaire. Retirer ou remettre la case annule une éventuelle validation des résultats par la modération.
  const { wantsCdf } = form.requests;
  if (wantsCdf && !tournament.isCDF && !isMod) {
    return { success: false, error: "Seuls les modérateurs et les administrateurs peuvent déclarer un tournoi du Championnat de France (CDF)." };
  }
  const isCdfNew = isMod ? wantsCdf : tournament.isCDF;
  const cdfUpdate = {
    isCDF: isCdfNew,
    typeCDF: isCdfNew ? (form.requests.typeCDF || tournament.typeCDF || "INDIVIDUEL") : "INDIVIDUEL",
    ...(isCdfNew !== tournament.isCDF ? { cdfValidatedAt: null, cdfValidatedById: null } : {})
  };

  // Mise à jour du tournoi
  const updateData: Prisma.TournamentUncheckedUpdateInput = {
    ...fields,
    name: title,
    ...cdfUpdate,
  };

  const isTeamNew = formData.get("isTeam") === "on";
  const hasFormatChanged = isTeamNew !== tournament.isTeam;

  // Changer le format (individuel ou par équipes) supprime toutes les inscriptions (carte 186) : le formulaire demande
  // une confirmation qui annonce combien, et le serveur refuse le changement sans elle. Les inscrits sont prévenus.
  let formatChangeRecipients: string[] = [];
  if (hasFormatChanged) {
    const registrations = await prisma.tournamentRegistration.findMany({ where: { tournamentId }, select: { userId: true } });
    const teams = await prisma.tournamentTeam.findMany({
      where: { tournamentId },
      select: { captainId: true, members: { select: { userId: true } } }
    });
    const mercenaries = await prisma.tournamentMercenary.findMany({ where: { tournamentId }, select: { userId: true } });
    const losses = { registrations: registrations.length, teams: teams.length, mercenaries: mercenaries.length };
    if (formatChangeLossCount(losses) > 0 && formData.get("confirmFormatChange") !== "yes") {
      return {
        success: false,
        error: `Changer le format du tournoi supprimera ${formatChangeLossText(losses)} : confirme ce changement.`
      };
    }
    formatChangeRecipients = [
      ...registrations.map((registration) => registration.userId),
      ...teams.flatMap((team) => [team.captainId, ...team.members.map((member) => member.userId)]),
      ...mercenaries.map((mercenary) => mercenary.userId)
    ];
  }

  // Seul l'organisateur (ou modérateur) peut changer les commissaires
  if (isOrganizer || isMod) {
    const commissaireIds = (formData.get("commissaireIds") as string || "").split(',').filter(id => id.length > 0);
    updateData.commissaires = {
      set: commissaireIds.map(id => ({ id }))
    };
  }

  const promoted = await prisma.$transaction(async (tx) => {
    await lockTournamentRegistrations(tx, tournamentId);
    // Si le format a changé, on vide les inscriptions (et les mercenaires) pour éviter les incohérences
    if (hasFormatChanged) {
      await tx.tournamentRegistration.deleteMany({ where: { tournamentId } });
      await tx.tournamentTeamMember.deleteMany({ where: { team: { tournamentId } } });
      await tx.tournamentTeam.deleteMany({ where: { tournamentId } });
      await tx.tournamentMercenary.deleteMany({ where: { tournamentId } });
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

    // Places ajoutées (nombre maximal augmenté) : les plus anciens de la liste d'attente montent (carte 186)
    return hasFormatChanged ? [] : promoteFromWaitingList(tx, tournamentId);
  });

  // Notifications dans le site (carte 186). Un échec ici n'annule pas la modification du tournoi.
  try {
    if (formatChangeRecipients.length > 0) {
      await notifyTournamentMembers({
        userIds: formatChangeRecipients,
        topicId,
        type: NOTIFICATION_TYPE.TOURNAMENT_FORMAT_CHANGED,
        actorId: session.user.id
      });
    }
    if (promoted.length > 0) {
      await notifyTournamentMembers({ userIds: promoted, topicId, type: NOTIFICATION_TYPE.TOURNAMENT_PROMOTED });
    }
  } catch (error) {
    console.error("updateTournament notifications error:", error);
  }

  // Le sujet, sa liste, les pages des tournois et l'accueil (lib/pageRefresh.ts, carte 202)
  refreshTournament({ id: tournamentId, topicId });
  const topic = await prisma.topic.findUnique({ where: { id: topicId }, select: { forumId: true }});
  if (topic) refreshTopic({ id: topicId, forumIds: [topic.forumId] });
  
  redirect(`/forum/topic/${topicId}`);
}

/**
 * Tournoi lu pour une inscription (carte 186) : format, état et sujet du forum. Les règles d'ouverture sont dans
 * lib/tournamentRegistrationRules.ts, la règle des dates dans lib/tournamentDates.ts.
 */
async function loadTournamentForRegistration(tournamentId: string) {
  return prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: {
      id: true,
      isTeam: true,
      coachsPerTeam: true,
      isCancelled: true,
      isFinished: true,
      registrationsLocked: true,
      date: true,
      endDate: true,
      topic: { select: { id: true, isDeleted: true } }
    }
  });
}

/** Raison du refus d'une nouvelle inscription : tournoi annulé, terminé, passé ou inscriptions fermées. */
function newRegistrationRefusal(tournament: {
  isCancelled: boolean;
  isFinished: boolean;
  registrationsLocked: boolean;
  date: Date;
  endDate: Date | null;
  topic?: { isDeleted: boolean } | null;
}) {
  return registrationRefusal({ ...tournament, isOver: isTournamentOver(tournament), topicDeleted: !!tournament.topic?.isDeleted });
}

/**
 * Prévient les coachs sortis de la liste d'attente (notification dans le site, sans e-mail). Un échec ici n'annule
 * pas la désinscription qui a libéré la place.
 */
async function notifyPromotedMembers(userIds: string[], topicId: string | null | undefined) {
  if (userIds.length === 0) return;
  try {
    await notifyTournamentMembers({ userIds, topicId, type: NOTIFICATION_TYPE.TOURNAMENT_PROMOTED });
  } catch (error) {
    console.error("notifyPromotedMembers error:", error);
  }
}

/**
 * Inscription individuelle à un tournoi. Refusée pour un tournoi par équipes, annulé, terminé, passé ou fermé
 * (carte 186). Le statut (pré-inscrit ou liste d'attente) suit le même calcul de places que l'affichage, sous un verrou
 * propre au tournoi : deux inscriptions envoyées au même moment ne prennent pas la même dernière place.
 */
export async function joinTournament(tournamentId: string) {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };
  const userId = session.user.id;

  const tournament = await loadTournamentForRegistration(tournamentId);
  if (!tournament) return { success: false, error: "Tournoi introuvable" };
  if (tournament.isTeam) {
    return { success: false, error: "Ce tournoi se joue par équipes : inscris une équipe ou propose-toi comme mercenaire." };
  }
  const refusal = newRegistrationRefusal(tournament);
  if (refusal) return { success: false, error: refusal };

  try {
    const status = await prisma.$transaction(async (tx) => {
      await lockTournamentRegistrations(tx, tournamentId);
      const existing = await tx.tournamentRegistration.findUnique({
        where: { tournamentId_userId: { tournamentId, userId } },
        select: { id: true }
      });
      if (existing) return null;
      const nextStatus = await nextRegistrationStatus(tx, tournamentId);
      await tx.tournamentRegistration.create({
        data: { tournamentId, userId, status: nextStatus, paymentStatus: "NOT_PAID" }
      });
      return nextStatus;
    });
    if (!status) return { success: false, error: "Déjà inscrit" };

    refreshTournament({ id: tournamentId, topicId: tournament.topic?.id });
    return { success: true, waitingList: status === "WAITING_LIST" };
  } catch (e) {
    return { success: false, error: "Erreur lors de l'inscription" };
  }
}

/**
 * Désinscription individuelle. La place libérée fait monter le plus ancien de la liste d'attente, qui est prévenu
 * (carte 186).
 */
export async function leaveTournament(tournamentId: string) {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };
  const userId = session.user.id;

  try {
    const reg = await prisma.tournamentRegistration.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
      select: { id: true, status: true, tournament: { select: { topic: { select: { id: true } } } } }
    });

    if (!reg) return { success: false, error: "Inscription introuvable" };

    const promoted = await prisma.$transaction(async (tx) => {
      await lockTournamentRegistrations(tx, tournamentId);
      await tx.tournamentRegistration.delete({ where: { id: reg.id } });
      // Une inscription en liste d'attente ne prenait pas de place : rien ne se libère
      return reg.status === "WAITING_LIST" ? [] : promoteFromWaitingList(tx, tournamentId);
    });
    await notifyPromotedMembers(promoted, reg.tournament.topic?.id);

    refreshTournament({ id: tournamentId, topicId: reg.tournament.topic?.id });
    return { success: true };
  } catch (e) {
    return { success: false, error: "Désinscription impossible" };
  }
}

/**
 * Inscription ou désinscription comme mercenaire (coach seul qui se propose pour compléter une équipe). Se proposer
 * est refusé pour un tournoi individuel, annulé, terminé, passé ou fermé, et pour un coach qui a déjà une équipe dans
 * ce tournoi (carte 186). Se retirer reste toujours possible.
 */
export async function toggleMercenary(tournamentId: string) {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };
  const userId = session.user.id;

  try {
    const tournament = await loadTournamentForRegistration(tournamentId);
    if (!tournament) return { success: false, error: "Tournoi introuvable" };

    // Sous le verrou des inscriptions (carte 201), comme createTeam qui lit les mercenaires : avant, la vérification
    // « déjà dans une équipe » et l'écriture se faisaient hors du verrou, et une équipe créée au même moment pouvait
    // compter ce coach à la fois comme membre et comme mercenaire.
    const refusal = await prisma.$transaction(async (tx) => {
      await lockTournamentRegistrations(tx, tournamentId);
      const existing = await tx.tournamentMercenary.findUnique({
        where: { tournamentId_userId: { tournamentId, userId } }
      });
      if (existing) {
        await tx.tournamentMercenary.delete({ where: { id: existing.id } });
        return null;
      }
      if (!tournament.isTeam) return "Les mercenaires n'existent que dans un tournoi par équipes.";
      const registrationRefusal = newRegistrationRefusal(tournament);
      if (registrationRefusal) return registrationRefusal;
      const team = await tx.tournamentTeam.findFirst({
        where: { tournamentId, OR: [{ captainId: userId }, { members: { some: { userId } } }] },
        select: { id: true }
      });
      if (team) return "Tu fais déjà partie d'une équipe de ce tournoi.";
      await tx.tournamentMercenary.create({ data: { tournamentId, userId } });
      return null;
    });
    if (refusal) return { success: false, error: refusal };

    refreshTournament({ id: tournamentId, topicId: tournament.topic?.id });
    return { success: true };
  } catch (e) {
    return { success: false, error: "Action impossible" };
  }
}

/** Capitaines et membres des équipes d'un tournoi, sauf l'équipe `exceptTeamId` (modification de cette équipe). */
async function teamCoachIds(tx: Prisma.TransactionClient, tournamentId: string, exceptTeamId?: string) {
  const teams = await tx.tournamentTeam.findMany({
    where: { tournamentId, ...(exceptTeamId ? { id: { not: exceptTeamId } } : {}) },
    select: { captainId: true, members: { select: { userId: true } } }
  });
  return teams.flatMap((team) => [team.captainId, ...team.members.map((member) => member.userId)]);
}

/** Coachs inscrits comme mercenaires dans un tournoi. */
async function mercenaryIds(tx: Prisma.TransactionClient, tournamentId: string) {
  const mercenaries = await tx.tournamentMercenary.findMany({ where: { tournamentId }, select: { userId: true } });
  return mercenaries.map((mercenary) => mercenary.userId);
}

/**
 * Création d'une équipe par son capitaine (carte 186) : tournoi par équipes ouvert aux inscriptions, au plus
 * `coachsPerTeam` coachs capitaine compris, aucun coach déjà dans une autre équipe du tournoi (donc une seule équipe
 * par capitaine), et des coéquipiers volontaires seulement, c'est-à-dire inscrits comme mercenaires. Le statut suit le
 * même calcul de places que l'affichage, sous le verrou du tournoi.
 */
export async function createTeam(tournamentId: string, name: string, memberIds: string[]) {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };
  const userId = session.user.id;

  const tournament = await loadTournamentForRegistration(tournamentId);
  if (!tournament) return { success: false, error: "Tournoi introuvable" };
  if (!tournament.isTeam) return { success: false, error: "Ce tournoi se joue en individuel : il n'accepte pas d'équipe." };
  const refusal = newRegistrationRefusal(tournament);
  if (refusal) return { success: false, error: refusal };

  const teamName = typeof name === "string" ? name.trim() : "";
  const members = cleanTeamMemberIds(userId, memberIds);

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      await lockTournamentRegistrations(tx, tournamentId);
      const error = teamCompositionError({
        isTeamTournament: true,
        coachsPerTeam: tournament.coachsPerTeam,
        name: teamName,
        memberIds: members,
        currentMemberIds: [],
        mercenaryIds: await mercenaryIds(tx, tournamentId),
        captainId: userId,
        otherTeamCoachIds: await teamCoachIds(tx, tournamentId)
      });
      if (error) return { error };
      const sameName = await tx.tournamentTeam.findFirst({ where: { tournamentId, name: teamName }, select: { id: true } });
      if (sameName) return { error: "Une équipe porte déjà ce nom dans ce tournoi." };

      const status = await nextRegistrationStatus(tx, tournamentId);
      await tx.tournamentTeam.create({
        data: {
          name: teamName,
          tournamentId,
          captainId: userId,
          status,
          paymentStatus: "NOT_PAID",
          members: {
            create: members.map(id => ({ userId: id }))
          }
        }
      });

      // Le capitaine et ses coéquipiers ne sont plus mercenaires : ils ont une équipe
      await tx.tournamentMercenary.deleteMany({
        where: { tournamentId, userId: { in: [userId, ...members] } }
      });
      return { status };
    });
    if ("error" in outcome) return { success: false, error: outcome.error };

    refreshTournament({ id: tournamentId, topicId: tournament.topic?.id });
    return { success: true, waitingList: outcome.status === "WAITING_LIST" };
  } catch (e) {
    return { success: false, error: "Erreur lors de la création" };
  }
}

/**
 * Modification d'une équipe par son capitaine, avec les mêmes règles que la création (carte 186) : un membre déjà
 * dans l'équipe peut y rester, un nouveau coéquipier doit être inscrit comme mercenaire. Un membre retiré de l'équipe
 * redevient mercenaire, pour rester visible des autres capitaines. Refusée pour un tournoi annulé, terminé ou passé.
 */
export async function updateTeam(teamId: string, name: string, memberIds: string[]) {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };

  try {
    const team = await prisma.tournamentTeam.findUnique({
      where: { id: teamId },
      select: { id: true, captainId: true, tournamentId: true, members: { select: { userId: true } } }
    });

    if (!team) return { success: false, error: "Équipe introuvable" };
    if (team.captainId !== session.user.id) return { success: false, error: "Action interdite" };

    const tournament = await loadTournamentForRegistration(team.tournamentId);
    if (!tournament) return { success: false, error: "Tournoi introuvable" };
    // Le capitaine peut compléter son équipe quand les inscriptions sont fermées, pas après le tournoi
    const refusal = newRegistrationRefusal({ ...tournament, registrationsLocked: false });
    if (refusal) return { success: false, error: refusal };

    const teamName = typeof name === "string" ? name.trim() : "";
    const members = cleanTeamMemberIds(team.captainId, memberIds);
    const currentMemberIds = team.members.map((member) => member.userId);

    const outcome = await prisma.$transaction(async (tx) => {
      await lockTournamentRegistrations(tx, team.tournamentId);
      const error = teamCompositionError({
        isTeamTournament: tournament.isTeam,
        coachsPerTeam: tournament.coachsPerTeam,
        name: teamName,
        memberIds: members,
        currentMemberIds,
        mercenaryIds: await mercenaryIds(tx, team.tournamentId),
        captainId: team.captainId,
        otherTeamCoachIds: await teamCoachIds(tx, team.tournamentId, teamId)
      });
      if (error) return { error };
      const sameName = await tx.tournamentTeam.findFirst({
        where: { tournamentId: team.tournamentId, name: teamName, id: { not: teamId } },
        select: { id: true }
      });
      if (sameName) return { error: "Une équipe porte déjà ce nom dans ce tournoi." };

      await tx.tournamentTeamMember.deleteMany({ where: { teamId } });
      await tx.tournamentTeam.update({
        where: { id: teamId },
        data: {
          name: teamName,
          members: {
            create: members.map(id => ({ userId: id }))
          }
        }
      });

      // Les nouveaux coéquipiers ne sont plus mercenaires ; les membres retirés le redeviennent
      await tx.tournamentMercenary.deleteMany({
        where: { tournamentId: team.tournamentId, userId: { in: members } }
      });
      const removed = currentMemberIds.filter((id) => !members.includes(id));
      if (removed.length > 0) {
        await tx.tournamentMercenary.createMany({
          data: removed.map((userId) => ({ tournamentId: team.tournamentId, userId })),
          skipDuplicates: true
        });
      }
      return { error: null };
    });
    if (outcome.error) return { success: false, error: outcome.error };

    refreshTournament({ id: tournament.id, topicId: tournament.topic?.id });
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

/**
 * Suppression d'une équipe par son capitaine. La place libérée fait monter la plus ancienne équipe de la liste
 * d'attente, dont les membres sont prévenus (carte 186).
 */
export async function deleteTeam(teamId: string) {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };

  try {
    const team = await prisma.tournamentTeam.findUnique({
      where: { id: teamId },
      select: { id: true, captainId: true, status: true, tournamentId: true, tournament: { select: { topic: { select: { id: true } } } } }
    });

    if (!team) return { success: false, error: "Équipe introuvable" };
    if (team.captainId !== session.user.id) return { success: false, error: "Action interdite" };

    const promoted = await prisma.$transaction(async (tx) => {
      await lockTournamentRegistrations(tx, team.tournamentId);
      await tx.tournamentTeam.delete({ where: { id: teamId } });
      return team.status === "WAITING_LIST" ? [] : promoteFromWaitingList(tx, team.tournamentId);
    });
    await notifyPromotedMembers(promoted, team.tournament.topic?.id);

    refreshTournament({ id: team.tournamentId, topicId: team.tournament.topic?.id });
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

    // Organisateur, commissaire ou modérateur : règle écrite une seule fois (lib/tournamentRights.ts, carte 201)
    const viewer = { id: session.user.id, isModerator: isModerator(session.user.role) };
    if (!canManageTournament(viewer, tournament)) {
      return { success: false, error: "Tu n'as pas l'autorisation de modifier cette inscription." };
    }
    // Le paiement est l'affaire de l'organisateur et des commissaires du tournoi, pas de la modération du site
    // (décision du responsable, carte 177). Un modérateur peut nommer un commissaire si l'organisateur est absent.
    if (params.paymentStatus !== undefined && !canManagePayments(viewer, tournament)) {
      return { success: false, error: "Seuls l'organisateur et les commissaires du tournoi peuvent modifier un paiement." };
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

    // Organisateur, commissaire ou modérateur : règle écrite une seule fois (lib/tournamentRights.ts, carte 201)
    const viewer = { id: session.user.id, isModerator: isModerator(session.user.role) };
    if (!canManageTournament(viewer, tournament)) {
      return { success: false, error: "Action non autorisée" };
    }

    const updated = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { registrationsLocked: !tournament.registrationsLocked }
    });

    refreshTournament({ id: tournamentId, topicId: tournament.topic?.id });

    return { 
      success: true, 
      locked: updated.registrationsLocked 
    };
  } catch (e) {
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}
