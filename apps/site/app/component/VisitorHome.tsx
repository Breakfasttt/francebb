/**
 * Accueil d'un visiteur non connecté (carte 210, revu le 17 novembre 2026 à la demande du responsable du projet).
 *
 * - En haut, dans l'en-but, le nom du site, centré.
 * - Deux camps séparés par la ligne de mêlée : « Nouveau coach ? » (à gauche) mène au guide du débutant (« Découvrir
 *   le jeu », `/jouer`) et à l'inscription, en rouge, puis à la carte des ligues ; « Tu joues déjà » (à droite) mène au forum, avec Discord et
 *   la connexion sur la même ligne. Inscription et connexion passent par la même page, `/auth/login`. Sur téléphone, les camps
 *   sont l'un sous l'autre ; sur ordinateur, côte à côte, la ligne de mêlée devient verticale.
 * - Puis, sur une seule colonne, les mêmes blocs que l'accueil du membre (`HomeSections.tsx`) : forum, tournois,
 *   classement, ligues, articles, ressources, médias, avec les repères à droite sur ordinateur (le premier, « Accueil »,
 *   remonte au haut de la page). Rien n'y répète les
 *   boutons des camps : pas de bouton « Forum » ni de Discord dans le bloc du forum, pas de lien vers la carte dans
 *   celui des ligues.
 */
import Link from "next/link";
import { Button, cn } from "@bbfrance/ui";
import { END_ZONE, PitchField, ScrimmageLine } from "./PitchField";
import { ForumDiscordButtons, NextTournaments } from "./HomeBlocks";
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

/** Repères du visiteur : le haut de la page (titre et camps), puis les blocs. */
const VISITOR_WAYPOINTS = [{ id: "accueil", label: "Accueil" }, ...HOME_WAYPOINTS];

/**
 * Un camp de la feuille de match : surface pleine. Sur ordinateur, ses trois lignes (titre, texte, boutons) suivent
 * celles de la rangée des camps (`grid-rows-subgrid`) : les boutons des deux camps restent alignés, même quand le
 * texte de l'un passe sur deux lignes.
 */
const team =
  "flex flex-col gap-3 rounded-bb-lg border border-bb-border bg-bb-surface px-4 py-4 lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:content-start lg:gap-y-3 lg:px-7 lg:py-7";

/** Titre d'un camp, centré. */
const teamTitle = "m-0 border-0 p-0 text-center text-2xl leading-tight font-extrabold text-bb-text normal-case not-italic lg:text-3xl";

/** Phrase d'un camp, centrée sous le titre. */
const teamText = "m-0 text-center text-base text-bb-text-muted lg:text-bb-lead";

/**
 * Rangée de boutons d'un camp : l'un sous l'autre sur téléphone ; sur ordinateur, centrés et toujours sur une seule
 * ligne (14 pixels et marges réduites jusqu'à 1280 pixels de large, pour tenir dans un camp étroit).
 */
const teamButtons = "mt-1 flex flex-col gap-2.5 lg:mt-0 lg:flex-row lg:flex-nowrap lg:items-start lg:justify-center lg:gap-2 xl:gap-2.5";

/** Bouton d'un camp : rouge (`primary`) pour l'action principale, sinon secondaire. */
function TeamButton({ href, children, primary = false }: { href: string; children: string; primary?: boolean }) {
  return (
    <Button asChild variant={primary ? "primary" : "secondary"} size="tap" className={cn("min-h-[52px] text-base whitespace-nowrap lg:px-3 lg:text-sm xl:px-5 xl:text-base", primary && "font-extrabold")}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}

/** Adresse de connexion qui renvoie ensuite vers `target` (formulaires de création, réservés aux membres). */
function loginThen(target: string): string {
  return `/auth/login?callbackUrl=${encodeURIComponent(target)}`;
}

export default function VisitorHome({
  discordHref,
  forum,
  tournaments,
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
  tournamentCreateHref: string | null;
  ligues: { ligues: MemberLigue[]; fromRegion: boolean; regionHref: string };
  article: Awaited<ReturnType<typeof pickRandomArticle>>;
  ranking: HomeRankingEntry[];
  resources: HomeResource[];
  media: { twitch: string[]; youtube: string[] };
}) {
  const year = new Date().getFullYear();
  return (
    <PitchField className="font-bb-sans text-base text-bb-text">
      <section id="accueil" aria-labelledby="home-title" className="relative scroll-mt-24">

        {/* Sur téléphone, le nom du site est dans l'en-but du haut ; sur ordinateur, posé sur le terrain. Centré, au-dessus
            de la ligne de mêlée qui sépare les deux camps */}
        <div className={cn(END_ZONE, "lg:border-b-0 lg:bg-none")}>
          <div className="mx-auto w-full max-w-[1232px] px-4 pt-7 pb-6 lg:px-6 lg:pt-12 lg:pb-10">
            <h1 id="home-title" className="m-0 border-0 p-0 text-center text-bb-display font-extrabold tracking-[-0.02em] text-bb-text normal-case not-italic lg:text-bb-display-lg">
              France Blood Bowl
            </h1>
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-[1232px] px-4 pt-4 pb-2 lg:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] lg:px-6 lg:pt-7 lg:pb-6">
          <section aria-labelledby="home-team-newcomers" className={team}>
            <h2 id="home-team-newcomers" className={teamTitle}>Nouveau coach ?</h2>
            <p className={teamText}>Un jeu de plateau de football fantastique, entre stratégie et dés.</p>
            <div className={teamButtons}>
              <TeamButton href="/jouer" primary>Découvrir le jeu</TeamButton>
              <TeamButton href="/auth/login" primary>S&apos;inscrire</TeamButton>
              <TeamButton href="/carte?vue=ligues">Trouver une ligue</TeamButton>
            </div>
          </section>

          {/* D'un bord à l'autre du terrain sur téléphone (-mx-4) ; sur ordinateur, de la hauteur des camps */}
          <ScrimmageLine vertical className="-mx-4 my-1 lg:row-span-3 lg:m-0" />

          <section aria-labelledby="home-team-players" className={team}>
            <h2 id="home-team-players" className={teamTitle}>Tu joues déjà</h2>
            <p className={teamText}>Le forum, les tournois et le classement de la scène française.</p>
            {/* Forum, Discord et connexion : sur une ligne sur ordinateur */}
            <div className={teamButtons}>
              <ForumDiscordButtons discordHref={discordHref} className="contents" />
              <TeamButton href="/auth/login">Se connecter</TeamButton>
            </div>
          </section>
        </div>
      </section>

      {/* Même écart entre les camps et le premier bloc qu'entre deux blocs (16 pixels sur téléphone, 24 sur ordinateur) */}
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 px-4 pt-2 pb-10 lg:gap-6 lg:px-6 lg:pt-0 lg:pb-16">
        <Anchor id="forum"><ForumBlock forum={forum} discordHref={null} visitor /></Anchor>
        <Anchor id="tournois">
          <NextTournaments tournaments={tournaments} createHref={tournamentCreateHref} createInHeader />
        </Anchor>
        <Anchor id="classement"><RankingBlock ranking={ranking} year={year} /></Anchor>
        <Anchor id="ligues"><LiguesBlock {...ligues} createHref={loginThen("/ligues/create")} mapLink={false} /></Anchor>
        <Anchor id="articles"><ArticlesBlock article={article} createHref={loginThen("/articles/create")} /></Anchor>
        <Anchor id="ressources"><ResourcesBlock resources={resources} createHref={loginThen("/ressources/submit")} /></Anchor>
        <Anchor id="medias"><MediaBlock media={media} /></Anchor>
      </div>
      <HomeWaypoints items={VISITOR_WAYPOINTS} />
    </PitchField>
  );
}
