/**
 * Accueil d'un visiteur non connecté (carte 210) : la feuille de match.
 *
 * - En haut, dans l'en-but, le titre du site.
 * - Deux camps séparés par la ligne de mêlée (« contre ») : « Tu joues déjà » mène au forum (l'action principale, avec
 *   Discord à côté) et montre l'activité du jour ; « Tu découvres » mène à « Blood Bowl, c'est quoi ? » (`/jouer`).
 *   Sur téléphone, les camps sont l'un sous l'autre ; sur ordinateur, côte à côte, la ligne de mêlée devient verticale.
 * - Puis les prochains tournois, les derniers messages du forum (mis à jour en direct, carte 205), l'article au
 *   hasard et les rubriques du site.
 */
import Link from "next/link";
import { Button, cn } from "@bbfrance/ui";
import LatestPosts from "@/app/component/LatestPosts";
import type { LatestPost } from "@/lib/homeLatestPosts";
import { END_ZONE, PitchField, ScrimmageLine } from "./PitchField";
import { ForumDiscordButtons, NextTournaments, RandomArticle, SectionBlock, focusRing, type SectionLink } from "./HomeBlocks";
import type { HomeTournament, pickRandomArticle } from "./homeData";

/** Un camp de la feuille de match : surface pleine. */
const team = "flex flex-col gap-3 rounded-bb-lg border border-bb-border bg-bb-surface px-4 py-4 lg:px-7 lg:py-7";

/** Lien secondaire d'un camp (Tournois, Classement, Ressources…) ; en 14 pixels sur téléphone, pour tenir sur une ligne. */
function TeamLink({ href, children }: { href: string; children: string }) {
  return (
    <Button asChild variant="secondary" size="tap" className="whitespace-normal text-center max-lg:text-sm">
      <Link href={href}>{children}</Link>
    </Button>
  );
}

/** « 1 message », « 14 messages » ; « 1 tournoi à venir », « 3 tournois à venir ». */
function activityText(postsToday: number, upcomingTournaments: number): string {
  const posts = `${postsToday} message${postsToday > 1 ? "s" : ""} aujourd'hui`;
  const tournaments = `${upcomingTournaments} tournoi${upcomingTournaments > 1 ? "s" : ""} à venir`;
  return `${posts} · ${tournaments}`;
}

export default function VisitorHome({
  discordHref,
  activity,
  tournaments,
  tournamentCreateHref,
  latestPosts,
  article,
  blocks,
}: {
  discordHref: string | null;
  activity: { postsToday: number; upcomingTournaments: number };
  tournaments: HomeTournament[];
  tournamentCreateHref: string | null;
  latestPosts: LatestPost[];
  article: Awaited<ReturnType<typeof pickRandomArticle>>;
  blocks: { id: string; title: string; description: string; links: SectionLink[] }[];
}) {
  return (
    <PitchField className="font-bb-sans text-base text-bb-text">
      <section aria-labelledby="home-title" className="relative">

        {/* Sur téléphone, le titre est dans l'en-but du haut ; sur ordinateur, posé sur le terrain */}
        <div className={cn(END_ZONE, "lg:border-b-0 lg:bg-none")}>
          <div className="mx-auto w-full max-w-[1232px] px-4 pt-6 pb-5 lg:px-6 lg:pt-11 lg:pb-10">
            <h1 id="home-title" className="m-0 max-w-[780px] border-0 p-0 text-bb-display font-extrabold tracking-[-0.02em] text-balance text-bb-text normal-case not-italic lg:text-bb-display-lg">
              Tournois, ligues et coachs de Blood Bowl en France
            </h1>
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-[1232px] px-4 pt-4 pb-2 lg:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] lg:px-6 lg:pt-7 lg:pb-12">
          <section aria-labelledby="home-team-players" className={cn(team, "border-t-4 border-t-bb-accent")}>
            <h2 id="home-team-players" className="m-0 border-0 p-0 text-2xl leading-tight font-extrabold text-bb-text normal-case not-italic lg:text-3xl">Tu joues déjà</h2>
            <p className="m-0 text-base text-bb-text-muted lg:text-bb-lead">Le forum, les tournois et le classement de la scène française.</p>
            <ForumDiscordButtons discordHref={discordHref} className="mt-1" />
            {/* Sans message ni tournoi, la ligne est masquée : « 0 message · 0 tournoi » ferait une page morte */}
            {(activity.postsToday > 0 || activity.upcomingTournaments > 0) && (
              <p className="m-0 flex items-center gap-2 text-sm text-bb-text-muted">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-bb-unread" />
                {activityText(activity.postsToday, activity.upcomingTournaments)}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2.5 lg:flex">
              <TeamLink href="/tournois">Tournois</TeamLink>
              <TeamLink href="/classement">Classement</TeamLink>
            </div>
          </section>

          {/* D'un bord à l'autre du terrain sur téléphone (-mx-4) ; sur ordinateur, sur toute la hauteur de la rangée des camps,
              marges comprises (-mt-7, -mb-12) */}
          <ScrimmageLine label="contre" vertical className="-mx-4 my-1 lg:mx-0 lg:-mt-7 lg:-mb-12" />

          <section aria-labelledby="home-team-newcomers" className={team}>
            <h2 id="home-team-newcomers" className="m-0 border-0 p-0 text-2xl leading-tight font-extrabold text-bb-text normal-case not-italic lg:text-3xl">Tu découvres</h2>
            <p className="m-0 text-base text-bb-text-muted lg:text-bb-lead">Un jeu de plateau de football fantastique, entre stratégie et dés.</p>
            <Button asChild variant="secondary" size="tap" className="mt-1 min-h-[52px] border-bb-text text-base font-extrabold lg:self-start lg:px-6">
              <Link href="/jouer">Blood Bowl, c&apos;est quoi ?</Link>
            </Button>
            <div className="grid grid-cols-2 gap-2.5 lg:flex">
              <TeamLink href="/carte?vue=ligues">Trouver une ligue</TeamLink>
              <TeamLink href="/ressources">Ressources</TeamLink>
            </div>
          </section>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-6 px-4 pt-4 pb-10 lg:gap-8 lg:px-6 lg:pt-6">
        {/* Tournois, derniers messages, article : l'un sous l'autre sur téléphone, trois colonnes sur ordinateur */}
        <div className="grid gap-6 lg:grid-cols-3">
          <NextTournaments tournaments={tournaments} createHref={tournamentCreateHref} />
          <div className={cn("flex flex-col", !article && "lg:col-span-2")}>
            <LatestPosts initialPosts={latestPosts} focusRing={focusRing} />
          </div>
          {article && <RandomArticle article={article} />}
        </div>

        {/* Les rubriques en trois blocs, chacun à sa hauteur */}
        <nav aria-label="Rubriques du site" className="grid gap-4 lg:grid-cols-3 lg:items-start lg:gap-5">
          {blocks.map((block) => <SectionBlock key={block.id} {...block} />)}
        </nav>
      </div>
    </PitchField>
  );
}
