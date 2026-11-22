/**
 * Accueil d'un visiteur non connecté (DESIGN.md, type « Tableau de bord »).
 * - En haut, une bande courte : ce qu'est le site en une phrase, l'action principale (créer son compte, la seule en
 *   rouge), « Découvrir le jeu » pour qui ne connaît pas Blood Bowl, et la carte des ligues. Pas de grand titre
 *   centré ni de scission « nouveau / déjà joueur ».
 * - Puis le même tableau de bord que le membre : colonne de gauche avec les tournois, les ligues, les ressources et le
 *   classement ; à droite, le forum, les articles et les médias (sur téléphone, le contenu puis la colonne de gauche).
 *   Les liens « Créer » mènent à la connexion.
 */
import Link from "next/link";
import { Button } from "@bbfrance/ui";
import { DiscordIcon } from "@/common/components/Icons/SocialIcons";
import SiteLayout from "@/common/components/SiteLayout/SiteLayout";
import type { YoutubeChannel } from "@/lib/mediaChannels";
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
  media: YoutubeChannel[];
}) {
  const year = new Date().getFullYear();
  return (
    <SiteLayout
      contextFrom="lg"
      contextLabel="Tournois, ligues, ressources et classement"
      header={
        <section aria-labelledby="home-title" className="flex flex-col gap-4 pt-6 pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:pt-10 lg:pb-8">
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
              <Button asChild variant="quiet" size="tap" className="min-h-12 bg-bb-discord px-5 text-base text-white hover:bg-bb-discord-hover hover:text-white">
                <a href={discordHref} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <DiscordIcon size={20} className="text-white" />
                  Discord<span className="sr-only"> (nouvel onglet)</span>
                </a>
              </Button>
            )}
          </div>
        </section>
      }
      contextSide="left"
      context={
        <>
          {/* Visiteur : « Annoncer un tournoi » seulement quand la liste est vide (il passe par la connexion) */}
          <NextTournaments tournaments={tournaments} createHref={tournamentCreateHref} />
          <LiguesBlock {...ligues} />
          <ResourcesBlock resources={resources} />
          <RankingBlock ranking={ranking} year={year} />
        </>
      }
    >
      <ForumBlock forum={forum} discordHref={null} visitor />
      <ArticlesBlock article={article} />
      <MediaBlock channels={media} />
    </SiteLayout>
  );
}
