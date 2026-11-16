/**
 * Accueil du site (carte 210). Deux accueils :
 * - un visiteur non connecté voit la feuille de match (`VisitorHome`) : « Tu joues déjà » mène au forum,
 *   « Tu découvres » à « Blood Bowl, c'est quoi ? », puis les tournois, les derniers messages, un article et les
 *   rubriques ;
 * - un membre connecté voit son tableau de bord (`MemberHome`), sur une seule colonne : le forum (ses non-lus, ou les
 *   sujets récents), les tournois, le classement, les ligues de sa région, les articles, les ressources et les médias.
 * Cette page ne fait que lire les données (requêtes en parallèle) et choisir l'accueil ; les requêtes sont dans
 * `app/component/homeData.ts`. Le lien « Créer un tournoi » d'un visiteur mène à la connexion, qui renvoie ensuite
 * vers le formulaire. Les liens Discord n'apparaissent que si l'invitation est réglée dans l'administration
 * (carte 189). Les titres des trois blocs de rubriques du visiteur viennent de NAV_GROUPS (navItems.ts), partagés
 * avec le panneau « Plus » (carte 189).
 */
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { NAV_GROUPS, type NavGroupId } from "@/common/components/AppShell/navItems";
import { getForumAccess } from "@/lib/forumAccess";
import { getLatestPosts } from "@/lib/homeLatestPosts";
import VisitorHome from "@/app/component/VisitorHome";
import MemberHome from "@/app/component/MemberHome";
import type { SectionLink } from "@/app/component/HomeBlocks";
import {
  getCachedDiscordInvite,
  getCachedTournaments,
  getHomeActivity,
  getHomeMedia,
  getHomeRanking,
  getHomeResources,
  getMemberForumTopics,
  getMemberLigues,
  getMemberRegisteredTournamentIds,
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

  const ligueCreateHref = userId ? "/ligues/create" : "/auth/login?callbackUrl=/ligues/create";
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

  // Visiteur : derniers messages et activité du jour, limités aux forums ouverts à tous
  const { roles } = await getForumAccess();
  const [latestPosts, activity] = await Promise.all([getLatestPosts(roles), getHomeActivity(roles)]);

  // Les liens de chaque groupe ; le titre et la phrase du groupe viennent de NAV_GROUPS (mêmes que le panneau « Plus »)
  const groupLinks: Record<NavGroupId, SectionLink[]> = {
    debuter: [
      { label: "Jouer à Blood Bowl !", description: "Le guide du débutant", href: "/jouer" },
      { label: "Ressources", description: "Règles, aides de jeu, outils", href: "/ressources" },
    ],
    competition: [
      { label: "Tournois", description: "Calendrier et inscriptions", href: "/tournois", create: { href: tournamentCreateHref, label: "Créer un tournoi" } },
      { label: "Ligues", description: "Toutes les ligues", href: "/ligues", create: { href: ligueCreateHref, label: "Créer une ligue" } },
      { label: "La Carte", description: "Ligues et tournois près de chez vous", href: "/carte" },
      { label: "Championnat de France", description: "Classement de la saison", href: "/classement" },
    ],
    communaute: [
      { label: "Forum", description: "Discussions, annonces, entraide", href: "/forum" },
      { label: "Articles", description: "Écrits par la communauté", href: "/articles" },
      ...(discordHref ? [{ label: "Discord", description: "Discuter en direct", href: discordHref, external: true }] : []),
    ],
  };
  const blocks = NAV_GROUPS.map((group) => ({
    id: `home-${group.id}`,
    title: group.title,
    description: group.description,
    links: groupLinks[group.id],
  }));

  return (
    <VisitorHome
      discordHref={discordHref}
      activity={activity}
      tournaments={nextTournaments}
      tournamentCreateHref={tournamentCreateHref}
      latestPosts={latestPosts}
      article={selectedArticle}
      blocks={blocks}
    />
  );
}
