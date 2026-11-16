/**
 * Données de l'accueil (carte 210), lues par le serveur pour les deux versions de la page : visiteur (`VisitorHome`)
 * et membre connecté (`MemberHome`). Ce fichier n'a pas `"use server"` : ses fonctions reçoivent leurs paramètres
 * (rôles, identifiant du membre) du serveur et ne peuvent pas être appelées depuis le navigateur.
 *
 * Les requêtes des tournois, de l'invitation Discord et de l'article au hasard sont reprises telles quelles de
 * l'ancien `app/page.tsx` (cartes 148, 150, 165, 187, 189, 205).
 */
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TOURNAMENT_TOPIC_NOT_DELETED } from "@/lib/forumDeletion";
import { TAKEN_PLACES_COUNT } from "@/lib/tournamentPlaces";
import { parisDayStart, upcomingTournamentWhere } from "@/lib/tournamentDates";
import { topicAccessWhere } from "@/lib/forumAccess";
import { postExcerpt } from "@/lib/homeLatestPosts";
import { getUnreadState } from "@/app/forum/unreadState";

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

/**
 * Activité du jour montrée au visiteur dans le camp « Tu joues déjà » (carte 210) : le nombre de messages publiés
 * depuis minuit (heure de Paris) dans les forums ouverts à ce lecteur, et le nombre de tournois à venir. Les messages
 * supprimés ou masqués par la modération ne comptent pas. Gardé une minute en cache, une entrée par ensemble de rôles.
 */
export const getHomeActivity = unstable_cache(
  async (roles: string[]) => {
    const [postsToday, upcomingTournaments] = await Promise.all([
      prisma.post.count({
        where: { isDeleted: false, isModerated: false, createdAt: { gte: parisDayStart() }, topic: topicAccessWhere(roles) },
      }),
      prisma.tournament.count({
        where: { AND: [upcomingTournamentWhere()], isFinished: false, isCancelled: false, ...TOURNAMENT_TOPIC_NOT_DELETED },
      }),
    ]);
    return { postsToday, upcomingTournaments };
  },
  ["home-activity-v1"],
  { revalidate: 60 }
);

/** Nombre de sujets non lus montrés sur l'accueil du membre. */
const MEMBER_UNREAD_COUNT = 3;

/**
 * Les trois sujets non lus les plus récents du membre (carte 210), avec le début de leur dernier message. La liste
 * vient de `getUnreadState` (`app/forum/unreadState.ts`), la même que la page `/forum/unread` : seuls les forums
 * ouverts au rôle du membre comptent. `total` est le nombre de tous ses sujets non lus.
 */
export async function getMemberUnreadTopics(userId: string) {
  const { topicIds } = await getUnreadState(userId);
  const ids = topicIds.slice(0, MEMBER_UNREAD_COUNT);
  if (ids.length === 0) return { topics: [], total: 0 };

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

  // Même ordre que la liste des non-lus (dernier message le plus récent d'abord)
  const byId = new Map(rows.map((topic) => [topic.id, topic]));
  const topics = ids.flatMap((id) => {
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
  return { topics, total: topicIds.length };
}

/** Un sujet non lu de l'accueil du membre. */
export type MemberUnreadTopic = Awaited<ReturnType<typeof getMemberUnreadTopics>>["topics"][number];

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
