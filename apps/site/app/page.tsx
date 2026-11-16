/**
 * Accueil du site (carte 210). Deux accueils :
 * - un visiteur non connecté voit la feuille de match (`VisitorHome`) : « Nouveau coach ? » mène à « Blood Bowl, c'est
 *   quoi ? », « Tu joues déjà » au forum, puis les mêmes blocs que le membre, sur une seule colonne ;
 * - un membre connecté voit son tableau de bord (`MemberHome`), sur une seule colonne : le forum (ses non-lus, ou les
 *   sujets récents), les tournois, le classement, les ligues de sa région, les articles, les ressources et les médias.
 * Cette page ne fait que lire les données (requêtes en parallèle) et choisir l'accueil ; les requêtes sont dans
 * `app/component/homeData.ts`. Le lien « Créer un tournoi » d'un visiteur mène à la connexion, qui renvoie ensuite
 * vers le formulaire. Les liens Discord n'apparaissent que si l'invitation est réglée dans l'administration
 * (carte 189).
 */
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import VisitorHome from "@/app/component/VisitorHome";
import MemberHome from "@/app/component/MemberHome";
import {
  getCachedDiscordInvite,
  getCachedTournaments,
  getHomeMedia,
  getHomeRanking,
  getHomeResources,
  getMemberForumTopics,
  getMemberLigues,
  getMemberRegisteredTournamentIds,
  getRecentForumTopics,
  pickRandomArticle,
} from "@/app/component/homeData";

export default async function Home() {
  const session = await getActiveSession();
  const userId = session?.user?.id ?? null;

  // Requêtes communes aux deux accueils (certaines sont cachées)
  const [nextTournaments, discordInvite, tournamentForum, articlesCount] = await Promise.all([
    getCachedTournaments(),
    getCachedDiscordInvite(),
    prisma.forum.findFirst({
      where: { isTournamentForum: true },
      select: { id: true }
    }),
    prisma.article.count({ where: { isModerated: false } }),
  ]);
  // Sélection d'un article (on reste dynamique ici pour le hasard)
  const selectedArticle = await pickRandomArticle(articlesCount);

  const tournamentCreateHref = tournamentForum
    ? userId
      ? `/forum/new-tournament?forumId=${tournamentForum.id}`
      : `/auth/login?callbackUrl=${encodeURIComponent(`/forum/new-tournament?forumId=${tournamentForum.id}`)}`
    : null;
  // Invitation Discord réglée dans l'administration ; sans elle, aucun bouton Discord n'est affiché (carte 189)
  const discordHref = discordInvite?.value?.trim() || null;

  if (userId) {
    const member = await prisma.user.findUnique({ where: { id: userId }, select: { region: true } });
    const region = member?.region || null;
    const [forum, ligues, registeredIds, ranking, resources, media] = await Promise.all([
      getMemberForumTopics(userId),
      getMemberLigues(region),
      getMemberRegisteredTournamentIds(userId, nextTournaments.map((tournament) => tournament.id)),
      getHomeRanking(new Date().getFullYear()),
      getHomeResources(),
      getHomeMedia(),
    ]);
    return (
      <MemberHome
        discordHref={discordHref}
        forum={forum}
        tournaments={nextTournaments}
        registeredIds={registeredIds}
        tournamentCreateHref={tournamentCreateHref}
        ligues={{ ...ligues, regionHref: ligues.fromRegion && region ? `/ligues?region=${encodeURIComponent(region)}` : "/ligues" }}
        article={selectedArticle}
        ranking={ranking}
        resources={resources}
        media={media}
      />
    );
  }

  // Visiteur : sujets récents, limités aux forums ouverts à tous ; dernières ligues (pas de région)
  const [forum, ligues, ranking, resources, media] = await Promise.all([
    getRecentForumTopics(),
    getMemberLigues(null),
    getHomeRanking(new Date().getFullYear()),
    getHomeResources(),
    getHomeMedia(),
  ]);

  return (
    <VisitorHome
      discordHref={discordHref}
      forum={forum}
      tournaments={nextTournaments}
      tournamentCreateHref={tournamentCreateHref}
      ligues={{ ...ligues, regionHref: "/ligues" }}
      article={selectedArticle}
      ranking={ranking}
      resources={resources}
      media={media}
    />
  );
}
