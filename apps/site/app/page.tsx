/**
 * Accueil du site (refonte, carte 090, ADR 0006).
 * - En-tête : le grand logo, dans le flux de la page (avant la refonte, il était posé en position absolue sous la
 *   barre du haut, et absent sur téléphone), et une phrase de présentation.
 * - Tuiles vers les rubriques : « Jouer à Blood Bowl ! » en premier et en couleur d'accent, puis les autres en
 *   grille (deux colonnes sur téléphone, six sur ordinateur). Les tuiles Ligues et Tournois ont un lien « Créer » ;
 *   pour un visiteur, il mène à la connexion, qui renvoie ensuite vers le formulaire.
 * - Les trois prochains tournois (cartes de la liste `/tournois`) et un article tiré au hasard.
 */
import { getActiveSession } from "@/lib/authGuard";
import SiteLogo from "@/common/components/SiteLogo/SiteLogo";
import { TournamentCard } from "@/app/tournois/component/TournamentListItems";
import { prisma } from "@/lib/prisma";
import { TAKEN_PLACES_COUNT } from "@/lib/tournamentPlaces";
import { Card, EmptyState } from "@bbfrance/ui";
import {
  Award, BookOpen, ChevronRight, Dices, ExternalLink, FileText, HelpCircle, Layout, Map, MessageSquare, Plus, Shield, Trophy,
  type LucideIcon,
} from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";

// Cache pour les tournois (60 s). La clé a changé avec la carte 090 (champs de l'organisateur ajoutés), pour qu'un
// ancien résultat gardé en cache, sans ces champs, ne soit jamais servi après la mise en ligne. L'étiquette
// « home-tournaments » permet de retrouver ce cache (le vider, ou le renouveler par `revalidateTag`) : le test
// tests/e2e/inventaire/accueil.spec.ts s'en sert pour effacer la liste gardée d'un lancement précédent (carte 148).
const getCachedTournaments = unstable_cache(
  async () => {
    return prisma.tournament.findMany({
      where: { date: { gte: new Date() }, isFinished: false, isCancelled: false },
      orderBy: { date: 'asc' },
      take: 3,
      include: { organizer: { select: { name: true } }, topic: { select: { id: true } }, _count: TAKEN_PLACES_COUNT }
    });
  },
  // Clé passée en v3 avec la carte 150 (comptage des inscriptions ajouté pour « x / y places »), pour la même raison
  ["next-tournaments-v3"],
  { revalidate: 60, tags: ["home-tournaments"] }
);

// Cache pour les settings (1h)
const getCachedDiscordInvite = unstable_cache(
  async () => prisma.siteSetting.findUnique({ where: { key: 'discord_invite' } }),
  ["discord-invite-setting"],
  { revalidate: 3600 }
);

/** Contour de focus clavier commun aux tuiles et aux liens « Créer ». */
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus";

/** Une tuile de rubrique : icône dans un pavé coloré, puis le nom. La tuile entière est le lien. */
function Tile({ href, label, icon: Icon, external, children }: {
  href: string;
  label: string;
  icon?: LucideIcon;
  external?: boolean;
  /** Icône personnalisée, à la place d'une icône Lucide (logo Discord) */
  children?: ReactNode;
}) {
  const className = `flex h-full min-h-24 flex-col justify-between gap-3 rounded-bb-lg border border-bb-border bg-bb-surface p-3 text-bb-text no-underline transition-colors hover:border-bb-accent lg:min-h-28 lg:p-4 ${focusRing}`;
  const content = (
    <>
      <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-bb-md bg-bb-accent-soft text-bb-accent-text">
        {Icon ? <Icon size={22} /> : children}
      </span>
      <span className="flex items-center gap-1.5 text-[0.95rem] leading-tight font-bold">
        {label}
        {external && <ExternalLink size={14} aria-hidden="true" className="shrink-0 text-bb-text-muted" />}
        {external && <span className="sr-only">(nouvel onglet)</span>}
      </span>
    </>
  );
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>;
  }
  return <Link href={href} className={className}>{content}</Link>;
}

/** Tuile avec un lien « Créer » posé dans son coin (deux liens côte à côte, jamais l'un dans l'autre). */
function TileWithCreate({ createHref, createLabel, ...tile }: Parameters<typeof Tile>[0] & { createHref: string | null; createLabel: string }) {
  return (
    <div className="relative">
      <Tile {...tile} />
      {createHref && (
        <Link
          href={createHref}
          aria-label={createLabel}
          className={`absolute top-1.5 right-1.5 inline-flex min-h-11 items-center gap-1 rounded-bb-md border border-bb-border bg-bb-surface-2 px-3 text-sm font-bold text-bb-text no-underline transition-colors hover:border-bb-accent ${focusRing}`}
        >
          <Plus size={15} aria-hidden="true" /> Créer
        </Link>
      )}
    </div>
  );
}

/** Logo de Discord (absent de lucide-react). */
function DiscordIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.006 14.006 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
    </svg>
  );
}

/**
 * Tire un article au hasard parmi les `count` articles visibles (non modérés) de la base, aucun s'il n'y en a pas.
 * Le tirage est hors du composant : React demande qu'un composant donne le même résultat à chaque rendu.
 */
async function pickRandomArticle(count: number) {
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

/** Titre d'un bloc de l'accueil (sans les majuscules ni l'italique de l'ancien CSS des titres). */
const sectionTitle = "m-0 border-0 p-0 text-lg leading-tight font-bold text-bb-text normal-case not-italic";

export default async function Home() {
  const session = await getActiveSession();
  const isAuth = !!session?.user;

  // 1. Requêtes parallélisées (certaines sont cachées)
  const [
    nextTournaments,
    discordInvite,
    tournamentForum,
    articlesCount
  ] = await Promise.all([
    getCachedTournaments(),
    getCachedDiscordInvite(),
    prisma.forum.findFirst({
      where: { isTournamentForum: true },
      select: { id: true }
    }),
    prisma.article.count({ where: { isModerated: false } })
  ]);

  // 2. Sélection d'un article (on reste dynamique ici pour le hasard)
  const selectedArticle = await pickRandomArticle(articlesCount);

  const ligueCreateHref = isAuth ? "/ligues/create" : "/auth/login?callbackUrl=/ligues/create";
  const tournamentCreateHref = tournamentForum
    ? isAuth
      ? `/forum/new-tournament?forumId=${tournamentForum.id}`
      : `/auth/login?callbackUrl=${encodeURIComponent(`/forum/new-tournament?forumId=${tournamentForum.id}`)}`
    : null;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return (
    <div className="mx-auto w-full max-w-[1232px] px-3 pb-10 font-bb-sans text-base text-bb-text lg:px-6">
      {/* En-tête de l'accueil : le logo sert de titre de la page. Sa hauteur est imposée ici (80 pixels sur
          téléphone, 126 sur ordinateur) ; SiteLogo reçoit la plus grande, pour charger une image assez nette. */}
      <header className="flex flex-col items-center gap-2 pt-4 pb-6 text-center lg:pt-8 lg:pb-8">
        <h1 className="m-0 border-0 p-0 [&_img]:h-20! lg:[&_img]:h-[126px]!">
          <SiteLogo scale={1.8} />
        </h1>
        <p className="m-0 text-[0.95rem] text-bb-text-muted">Tournois, ligues et communauté du Blood Bowl en France</p>
      </header>

      <nav aria-label="Rubriques du site" className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Link
          href="/jouer"
          className={`col-span-2 flex min-h-24 items-center gap-4 rounded-bb-lg bg-bb-accent p-4 text-bb-on-accent no-underline transition-colors hover:bg-bb-accent-hover lg:min-h-28 ${focusRing}`}
        >
          <Dices size={34} aria-hidden="true" className="shrink-0" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-lg leading-tight font-bold">Jouer à Blood Bowl !</span>
            <span className="text-sm opacity-90">Le guide pour débuter</span>
          </span>
          <ChevronRight size={22} aria-hidden="true" className="shrink-0" />
        </Link>
        <Tile href="/forum" label="Forum" icon={MessageSquare} />
        <TileWithCreate href="/ligues" label="Ligues" icon={Shield} createHref={ligueCreateHref} createLabel="Créer une ligue" />
        <TileWithCreate href="/tournois" label="Tournois" icon={Trophy} createHref={tournamentCreateHref} createLabel="Créer un tournoi" />
        <Tile href="/carte" label="La Carte" icon={Map} />
        <Tile href="/classement" label="Championnat de France" icon={Award} />
        <Tile href="/articles" label="Articles" icon={FileText} />
        <Tile href="/ressources" label="Ressources" icon={BookOpen} />
        <Tile href="/bbscheme" label="BBScheme" icon={Layout} />
        <Tile href="/bbquizz" label="Quizz" icon={HelpCircle} />
        <Tile href={discordInvite?.value || "#"} label="Discord" external>
          <DiscordIcon />
        </Tile>
      </nav>

      <div className="mt-8 flex flex-col gap-8 lg:mt-10">
        <section aria-labelledby="home-next-tournaments" className="flex flex-col gap-3">
          <h2 id="home-next-tournaments" className={sectionTitle}>Prochains tournois</h2>
          {nextTournaments.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-3">
              {nextTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} todayStart={todayStart} />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState icon={<Trophy size={36} />} title="Aucun tournoi prévu." />
            </Card>
          )}
        </section>

        <section aria-labelledby="home-random-article" className="flex flex-col gap-3">
          <h2 id="home-random-article" className={sectionTitle}>Article aléatoire</h2>
          {selectedArticle ? (
            <Link
              href={`/articles/${selectedArticle.id}`}
              className={`group block rounded-bb-lg text-inherit no-underline ${focusRing}`}
            >
              <Card className="flex items-start gap-3 p-4 transition-colors group-hover:border-bb-text-muted">
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-bb-md bg-bb-accent-soft text-bb-accent-text">
                  <BookOpen size={20} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="line-clamp-2 text-base leading-snug font-bold break-words text-bb-text">{selectedArticle.title}</span>
                  <span className="text-sm text-bb-text-muted">
                    par <span className="font-semibold text-bb-accent-text">{selectedArticle.author?.name || "Anonyme"}</span>
                  </span>
                </span>
                <ChevronRight size={20} aria-hidden="true" className="mt-2.5 shrink-0 text-bb-text-muted" />
              </Card>
            </Link>
          ) : (
            <Card>
              <EmptyState icon={<FileText size={36} />} title="Aucun article publié." />
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
