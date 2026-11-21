/**
 * Accueil d'un visiteur non connecté (DESIGN.md, type « Tableau de bord »).
 * - En haut, une bande courte : ce qu'est le site en une phrase, l'action principale (créer son compte, la seule en
 *   rouge), « Découvrir le jeu » pour qui ne connaît pas Blood Bowl, et la carte des ligues. Pas de grand titre
 *   centré ni de scission « nouveau / déjà joueur ».
 * - Puis le même tableau de bord que le membre : forum et tournois au centre, classement, ligues, articles,
 *   ressources et médias à droite (dessous sur téléphone). Les liens « Créer » mènent à la connexion.
 */
import Link from "next/link";
import { Button } from "@bbfrance/ui";
import SiteLayout from "@/common/components/SiteLayout/SiteLayout";
import { NextTournaments } from "./HomeBlocks";
import { ArticlesBlock, ForumBlock, LiguesBlock, MediaBlock, RankingBlock, ResourcesBlock } from "./HomeSections";
import type { HomeRankingEntry, HomeResource, HomeTournament, MemberForumTopics, MemberLigue, pickRandomArticle } from "./homeData";

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
    <SiteLayout
      contextFrom="lg"
      contextLabel="Classement, ligues et ressources"
      header={
        <section aria-labelledby="home-title" className="flex flex-col gap-4 border-b border-bb-border pt-6 pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:pt-10 lg:pb-8">
          <div className="max-w-[60ch]">
            <h1 id="home-title" className="font-bb-display text-[2.25rem] text-bb-text lg:text-[3.25rem]">
              Blood Bowl <span className="text-bb-accent-text">en France</span>
            </h1>
            <p className="mt-2 text-bb-lead text-bb-text-muted">
              Le forum, les tournois et le classement de la scène française. Tout se lit sans compte ; pour écrire ou
              s&apos;inscrire à un tournoi, un compte se crée en un clic avec Discord, Google ou un e-mail.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
            <Button asChild variant="primary" size="tap" className="min-h-12 px-6 text-base">
              <Link href="/auth/login">Créer mon compte</Link>
            </Button>
            <Button asChild variant="secondary" size="tap" className="min-h-12 px-5 text-base">
              <Link href="/jouer">Découvrir le jeu</Link>
            </Button>
            {discordHref && (
              <Button asChild variant="quiet" size="tap" className="min-h-12 px-4 text-base">
                <a href={discordHref} target="_blank" rel="noopener noreferrer">
                  Discord<span className="sr-only"> (nouvel onglet)</span>
                </a>
              </Button>
            )}
          </div>
        </section>
      }
      context={
        <>
          <RankingBlock ranking={ranking} year={year} />
          <LiguesBlock {...ligues} />
          <ResourcesBlock resources={resources} />
          <MediaBlock media={media} />
        </>
      }
    >
      <ForumBlock forum={forum} discordHref={null} visitor />
      {/* Visiteur : « Annoncer un tournoi » seulement quand la liste est vide (il passe par la connexion) */}
      <NextTournaments tournaments={tournaments} createHref={tournamentCreateHref} />
      <ArticlesBlock article={article} />
    </SiteLayout>
  );
}
