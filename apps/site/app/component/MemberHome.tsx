/**
 * Accueil d'un membre connecté (DESIGN.md, type « Tableau de bord ») : pas de mosaïque de blocs, mais un flux.
 * - Colonne principale : le forum (ses derniers non-lus, ou les sujets récents s'il a tout lu), un article au hasard,
 *   les chaînes vidéo.
 * - Colonne de gauche (dessous sur téléphone) : les prochains tournois (avec ceux où il est inscrit), les ligues de sa
 *   région, les dernières ressources, la tête du classement de l'année.
 * Les blocs sont dans `HomeSections.tsx` et `HomeBlocks.tsx`, partagés avec l'accueil du visiteur.
 */
import SiteLayout from "@/common/components/SiteLayout/SiteLayout";
import type { YoutubeChannel } from "@/lib/mediaChannels";
import { NextTournaments } from "./HomeBlocks";
import { ArticlesBlock, ForumBlock, LiguesBlock, MediaBlock, RankingBlock, ResourcesBlock } from "./HomeSections";
import type { HomeRankingEntry, HomeResource, HomeTournament, MemberForumTopics, MemberLigue, pickRandomArticle } from "./homeData";

export default function MemberHome({
  discordHref,
  forum,
  tournaments,
  registeredIds,
  tournamentCreateHref,
  ligues,
  article,
  ranking,
  resources,
  media,
}: {
  discordHref: string | null;
  forum: MemberForumTopics;
  tournaments: HomeTournament[];
  registeredIds: Set<string>;
  tournamentCreateHref: string | null;
  ligues: { ligues: MemberLigue[]; fromRegion: boolean; regionHref: string };
  article: Awaited<ReturnType<typeof pickRandomArticle>>;
  ranking: HomeRankingEntry[];
  resources: HomeResource[];
  media: YoutubeChannel[];
}) {
  const year = new Date().getFullYear();
  return (
    <SiteLayout
      className="pt-4 lg:pt-6"
      contextFrom="lg"
      contextSide="left"
      contextLabel="Tournois, ligues, ressources et classement"
      context={
        <>
          <NextTournaments tournaments={tournaments} createHref={tournamentCreateHref} createInHeader registeredIds={registeredIds} />
          <LiguesBlock {...ligues} createHref="/ligues/create" />
          <ResourcesBlock resources={resources} createHref="/ressources/submit" />
          <RankingBlock ranking={ranking} year={year} />
        </>
      }
    >
      <h1 className="sr-only">Accueil</h1>
      <ForumBlock forum={forum} discordHref={discordHref} />
      <ArticlesBlock article={article} createHref="/articles/create" />
      <MediaBlock channels={media} />
    </SiteLayout>
  );
}
