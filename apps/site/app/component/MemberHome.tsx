/**
 * Accueil d'un membre connecté (DESIGN.md, type « Tableau de bord ») : pas de mosaïque de blocs, mais un flux.
 * - Colonne principale : le forum (ses derniers non-lus, ou les sujets récents s'il a tout lu), les prochains tournois
 *   (avec ceux où il est inscrit), un article au hasard.
 * - Colonne de contexte (à droite sur ordinateur, dessous sur téléphone) : la tête du classement de l'année, les ligues
 *   de sa région, les dernières ressources, les chaînes vidéo.
 * Les blocs sont dans `HomeSections.tsx` et `HomeBlocks.tsx`, partagés avec l'accueil du visiteur.
 */
import SiteLayout from "@/common/components/SiteLayout/SiteLayout";
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
  media: { twitch: string[]; youtube: string[] };
}) {
  const year = new Date().getFullYear();
  return (
    <SiteLayout
      className="pt-4 lg:pt-6"
      contextFrom="lg"
      contextLabel="Classement, ligues et ressources"
      context={
        <>
          <RankingBlock ranking={ranking} year={year} />
          <LiguesBlock {...ligues} createHref="/ligues/create" />
          <ResourcesBlock resources={resources} createHref="/ressources/submit" />
          <MediaBlock media={media} />
        </>
      }
    >
      <h1 className="sr-only">Accueil</h1>
      <ForumBlock forum={forum} discordHref={discordHref} />
      <NextTournaments tournaments={tournaments} createHref={tournamentCreateHref} createInHeader registeredIds={registeredIds} />
      <ArticlesBlock article={article} createHref="/articles/create" />
    </SiteLayout>
  );
}
