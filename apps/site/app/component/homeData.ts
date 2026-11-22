/**
 * Données de l'accueil (carte 210), lues par le serveur pour les deux versions de la page : visiteur (`VisitorHome`)
 * et membre connecté (`MemberHome`). Ce fichier n'a pas `"use server"` : ses fonctions reçoivent leurs paramètres
 * (rôles, identifiant du membre) du serveur et ne peuvent pas être appelées depuis le navigateur.
 *
 * Les requêtes des tournois, de l'invitation Discord et de l'article au hasard sont reprises telles quelles de
 * l'ancien `app/page.tsx` (cartes 148, 150, 165, 187, 189, 205).
 */
import { YOUTUBE_CHANNELS_KEY, parseYoutubeChannels, type YoutubeChannel } from "@/lib/mediaChannels";
import { getLatestVideos } from "@/lib/youtubeChannels";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TOURNAMENT_TOPIC_NOT_DELETED } from "@/lib/forumDeletion";
import { TAKEN_PLACES_COUNT } from "@/lib/tournamentPlaces";
import { upcomingTournamentWhere } from "@/lib/tournamentDates";
import { getForumAccess, topicAccessWhere } from "@/lib/forumAccess";
import { postExcerpt } from "@/lib/homeLatestPosts";
import { getUnreadState } from "@/app/forum/unreadState";
import { getRanking } from "@/app/classement/actions";

// Cache pour les tournois (60 s). L'étiquette « home-tournaments » permet de retrouver ce cache (le vider, ou le
// renouveler par `revalidateTag`) : le test tests/e2e/inventaire/accueil.spec.ts s'en sert pour effacer la liste
// gardée d'un lancement précédent (carte 148).
export const getCachedTournaments = unstable_cache(
  async () => {
    return prisma.tournament.findMany({
      // Pas de tournoi dont le sujet du forum est supprimé (carte 165). Un tournoi reste affiché jusqu'à la fin de son
      // dernier jour, heure de Paris (carte 187, lib/tournamentDates.ts) : avant, il disparaissait dès son premier jour.
      where: {
        AND: [upcomingTournamentWhere()],
        isFinished: false,
        isCancelled: false,
        ...TOURNAMENT_TOPIC_NOT_DELETED
      },
      orderBy: { date: 'asc' },
      take: 3,
      include: { organizer: { select: { name: true } }, topic: { select: { id: true } }, _count: TAKEN_PLACES_COUNT }
    });
  },
  // Clé passée en v3 avec la carte 150 (comptage des inscriptions ajouté pour « x / y places ») : un ancien résultat
  // gardé en cache, sans ce comptage, n'est jamais servi après la mise en ligne
  ["next-tournaments-v3"],
  { revalidate: 60, tags: ["home-tournaments"] }
);

/** Un des prochains tournois de l'accueil, tel que le renvoie `getCachedTournaments`. */
export type HomeTournament = Awaited<ReturnType<typeof getCachedTournaments>>[number];

// Cache pour les settings (1h)
export const getCachedDiscordInvite = unstable_cache(
  async () => prisma.siteSetting.findUnique({ where: { key: 'discord_invite' } }),
  ["discord-invite-setting"],
  { revalidate: 3600 }
);

/**
 * Tire un article au hasard parmi les `count` articles visibles (non modérés) de la base, aucun s'il n'y en a pas.
 * Le tirage est hors du composant : React demande qu'un composant donne le même résultat à chaque rendu.
 */
export async function pickRandomArticle(count: number) {
  if (count === 0) return null;
  const randomArticles = await prisma.article.findMany({
    // Jamais un article masqué par la modération (carte 139), comme dans le compte de l'appelant
    where: { isModerated: false },
    take: 1,
    skip: Math.floor(Math.random() * count),
    include: { author: true, tags: true }
  });
  return randomArticles[0] ?? null;
}

/** Nombre de sujets du forum montrés sur l'accueil du membre. */
const MEMBER_FORUM_TOPICS_COUNT = 3;

/**
 * Le bloc « Forum » de l'accueil du membre : ses trois sujets non lus les plus récents (carte 210), ou, quand il a tout
 * lu, les trois sujets au dernier message le plus récent (`mode` vaut alors `recent`), pour que le bloc ne soit jamais
 * vide. Les non-lus viennent de `getUnreadState` (`app/forum/unreadState.ts`), la même liste que `/forum/unread` ; les
 * sujets récents passent par `topicAccessWhere`. Dans les deux cas, seuls les forums ouverts au rôle du membre
 * comptent. `total` est le nombre de tous ses sujets non lus.
 */
export async function getMemberForumTopics(userId: string) {
  const { topicIds } = await getUnreadState(userId);
  if (topicIds.length > 0) {
    return { mode: "unread" as const, topics: await loadForumTopicRows(topicIds.slice(0, MEMBER_FORUM_TOPICS_COUNT)), total: topicIds.length };
  }
  return getRecentForumTopics();
}

/**
 * Les trois sujets au dernier message le plus récent, parmi les forums ouverts au lecteur (membre ou visiteur) : bloc
 * « Forum » de l'accueil du visiteur, et de celui du membre qui a tout lu.
 */
export async function getRecentForumTopics() {
  const { roles } = await getForumAccess();
  const recent = await prisma.topic.findMany({
    where: topicAccessWhere(roles),
    orderBy: { lastPostAt: "desc" },
    take: MEMBER_FORUM_TOPICS_COUNT,
    select: { id: true },
  });
  return { mode: "recent" as const, topics: await loadForumTopicRows(recent.map((topic) => topic.id)), total: 0 };
}

/** Lignes du bloc « Forum », dans l'ordre de `ids`, avec le début de leur dernier message. */
async function loadForumTopicRows(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await prisma.topic.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      lastPostAt: true,
      lastPostId: true,
      forum: { select: { name: true } },
      lastPostAuthor: { select: { name: true, image: true } },
    },
  });
  // Début du dernier message de chaque sujet, s'il est visible (ni supprimé ni masqué par la modération)
  const lastPostIds = rows.flatMap((topic) => (topic.lastPostId ? [topic.lastPostId] : []));
  const lastPosts = lastPostIds.length === 0
    ? []
    : await prisma.post.findMany({
        where: { id: { in: lastPostIds }, isDeleted: false, isModerated: false },
        select: { id: true, content: true },
      });
  const excerpts = new Map(lastPosts.map((post) => [post.id, postExcerpt(post.content)]));

  // Même ordre que la liste reçue (dernier message le plus récent d'abord)
  const byId = new Map(rows.map((topic) => [topic.id, topic]));
  return ids.flatMap((id) => {
    const topic = byId.get(id);
    if (!topic) return [];
    return [{
      id: topic.id,
      title: topic.title,
      forumName: topic.forum.name,
      lastPostAt: topic.lastPostAt,
      lastPostAuthorName: topic.lastPostAuthor?.name ?? "Anonyme",
      lastPostAuthorImage: topic.lastPostAuthor?.image ?? null,
      excerpt: (topic.lastPostId && excerpts.get(topic.lastPostId)) || "",
    }];
  });
}

/** Le bloc « Forum » de l'accueil du membre. */
export type MemberForumTopics = Awaited<ReturnType<typeof getMemberForumTopics>>;

/** Un sujet du bloc « Forum » de l'accueil du membre. */
export type MemberForumTopic = MemberForumTopics["topics"][number];

/** Nombre de ligues montrées sur l'accueil du membre. */
const MEMBER_LIGUES_COUNT = 3;

/**
 * Les ligues de la région du membre (carte 210) : celles dont la zone (`Ligue.geographicalZone`) est la région de son
 * profil (`User.region`), les deux venant de la même liste de référence (`COACH_REGION`). Les plus fournies en
 * membres d'abord. Sans région au profil, ou sans ligue dans sa région, les dernières ligues créées (`fromRegion`
 * vaut alors faux, pour que le titre du bloc le dise). Les coordonnées servent à la petite carte de l'ordinateur.
 */
export async function getMemberLigues(region: string | null) {
  const select = {
    id: true,
    name: true,
    acronym: true,
    image: true,
    ville: true,
    lat: true,
    lng: true,
    _count: { select: { members: true } },
  } as const;
  if (region) {
    const ligues = await prisma.ligue.findMany({
      where: { geographicalZone: region },
      orderBy: { members: { _count: "desc" } },
      take: MEMBER_LIGUES_COUNT,
      select,
    });
    if (ligues.length > 0) return { ligues, fromRegion: true };
  }
  const ligues = await prisma.ligue.findMany({ orderBy: { createdAt: "desc" }, take: MEMBER_LIGUES_COUNT, select });
  return { ligues, fromRegion: false };
}

/** Une ligue de l'accueil du membre. */
export type MemberLigue = Awaited<ReturnType<typeof getMemberLigues>>["ligues"][number];

/** Identifiants des tournois, parmi `tournamentIds`, où le membre est inscrit (pour le signaler dans la liste). */
export async function getMemberRegisteredTournamentIds(userId: string, tournamentIds: string[]) {
  if (tournamentIds.length === 0) return new Set<string>();
  const registrations = await prisma.tournamentRegistration.findMany({
    where: { userId, tournamentId: { in: tournamentIds } },
    select: { tournamentId: true },
  });
  return new Set(registrations.map((registration) => registration.tournamentId));
}

/** Nombre de coachs montrés dans le bloc « Classement » de l'accueil du membre. */
const HOME_RANKING_COUNT = 5;

/**
 * Tête du classement du Championnat de France de l'année en cours, pour l'accueil du membre. Le calcul est celui de
 * la page `/classement` (`getRanking`, ou l'archive de l'année si elle existe), gardé dix minutes en cache : les
 * résultats ne changent qu'à la validation d'un tournoi.
 */
export const getHomeRanking = unstable_cache(
  async (year: number) => {
    const ranking: { name?: string; userId?: string | null; totalPoints?: number }[] = await getRanking(`CDF_${year}`);
    return ranking.slice(0, HOME_RANKING_COUNT).map((entry) => ({
      name: entry.name || "Coach anonyme",
      userId: entry.userId ?? null,
      totalPoints: entry.totalPoints ?? 0,
    }));
  },
  ["home-ranking-v1"],
  { revalidate: 600 }
);

/** Une ligne du bloc « Classement » de l'accueil du membre. */
export type HomeRankingEntry = Awaited<ReturnType<typeof getHomeRanking>>[number];

/** Nombre de ressources montrées sur l'accueil du membre. */
const HOME_RESOURCES_COUNT = 3;

/** Les dernières ressources validées par la modération (mêmes ressources que la page `/ressources`). */
export const getHomeResources = unstable_cache(
  async () =>
    prisma.resource.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: HOME_RESOURCES_COUNT,
      select: { id: true, title: true, description: true, link: true },
    }),
  ["home-resources-v1"],
  { revalidate: 300 }
);

/** Une ressource de l'accueil du membre. */
export type HomeResource = Awaited<ReturnType<typeof getHomeResources>>[number];

/**
 * Chaînes Twitch et YouTube réglées dans l'administration (réglages `twitch_channels` et `youtube_channels`, format
 * dans lib/mediaChannels.ts), lues comme la page `/media`. L'accueil n'affiche que leurs noms : les lecteurs restent sur `/media`.
 */
export const getHomeMedia = unstable_cache(
  async (): Promise<YoutubeChannel[]> => {
    const setting = await prisma.siteSetting.findUnique({ where: { key: YOUTUBE_CHANNELS_KEY }, select: { value: true } });
    return parseYoutubeChannels(setting?.value);
  },
  ["home-media-v3"],
  { revalidate: 300, tags: ["home-media"] }
);

/** Une vidéo du bloc Médias de l'accueil : la dernière vidéo d'une chaîne YouTube référencée. */
export interface HomeVideo {
  videoId: string;
  title: string;
  channelName: string;
}

/**
 * Dernières vidéos de `count` chaînes YouTube tirées au hasard parmi celles dont le flux répond. Les dernières vidéos
 * de toutes les chaînes viennent du même cache d'une heure que la page Médias (`getLatestVideos`, mêmes arguments) :
 * le tirage change à chaque visite sans redemander quoi que ce soit à YouTube. Hors composant : React demande qu'un
 * composant donne le même résultat à chaque rendu.
 */
export async function pickHomeVideos(channels: YoutubeChannel[], count = 3): Promise<HomeVideo[]> {
  if (channels.length === 0) return [];
  const latest = await getLatestVideos(channels.map((channel) => channel.id));
  const videos = channels.flatMap((channel) => {
    const video = latest[channel.id];
    return video ? [{ videoId: video.videoId, title: video.title, channelName: channel.name }] : [];
  });
  for (let i = videos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [videos[i], videos[j]] = [videos[j], videos[i]];
  }
  return videos.slice(0, count);
}
