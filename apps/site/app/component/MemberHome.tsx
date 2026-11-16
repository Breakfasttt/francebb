/**
 * Accueil d'un membre connecté (carte 210, revu le 16 novembre 2026 à la demande du responsable du projet) : une seule
 * colonne qui défile, sans bandeau d'accueil, dans cet ordre :
 * 1. le forum : ses trois derniers sujets non lus, ou, s'il a tout lu, les trois sujets les plus récents ; le bouton
 *    « Forum » est dans l'en-tête du bloc ;
 * 2. les prochains tournois avec « Créer » ;
 * 3. la tête du classement du Championnat de France de l'année ;
 * 4. les ligues de sa région avec « Créer » et la carte ;
 * 5. les articles avec « Écrire » ;
 * 6. les dernières ressources avec « Proposer » ;
 * 7. les chaînes vidéo (médias).
 * Statistiques reste au pied de page, Membres dans le panneau « Plus » et sur le forum, Jouer dans le panneau « Plus ».
 * Sur ordinateur, des repères à droite de l'écran (`HomeWaypoints`) mènent d'un bloc à l'autre. Les blocs sont dans
 * `HomeSections.tsx`, partagés avec l'accueil du visiteur.
 */
import { NextTournaments } from "./HomeBlocks";
import HomeWaypoints from "./HomeWaypoints";
import {
  Anchor,
  ArticlesBlock,
  ForumBlock,
  HOME_WAYPOINTS,
  LiguesBlock,
  MediaBlock,
  RankingBlock,
  ResourcesBlock,
} from "./HomeSections";
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
    <div className="font-bb-sans text-base text-bb-text">
      <h1 className="sr-only">Accueil</h1>
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 px-4 pt-4 pb-10 lg:gap-6 lg:px-6 lg:pt-8 lg:pb-16">
        <Anchor id="forum"><ForumBlock forum={forum} discordHref={discordHref} /></Anchor>
        <Anchor id="tournois">
          <NextTournaments tournaments={tournaments} createHref={tournamentCreateHref} createInHeader registeredIds={registeredIds} />
        </Anchor>
        <Anchor id="classement"><RankingBlock ranking={ranking} year={year} /></Anchor>
        <Anchor id="ligues"><LiguesBlock {...ligues} createHref="/ligues/create" /></Anchor>
        <Anchor id="articles"><ArticlesBlock article={article} createHref="/articles/create" /></Anchor>
        <Anchor id="ressources"><ResourcesBlock resources={resources} createHref="/ressources/submit" /></Anchor>
        <Anchor id="medias"><MediaBlock media={media} /></Anchor>
      </div>
      <HomeWaypoints items={HOME_WAYPOINTS} />
    </div>
  );
}
