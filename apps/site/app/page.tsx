/**
 * Accueil du site (carte 155, d'après la maquette « D » choisie par le responsable ; ADR 0006). Pas de logo : le
 * titre de la page est un texte.
 * - En haut, un bandeau de présentation avec trois boutons : « Aller au forum » (le plus visible, en couleur
 *   d'accent), « Jouer à Blood Bowl ! » et « Rejoindre le Discord ». À côté (en dessous sur téléphone), les trois
 *   prochains tournois ; s'il n'y en a aucun, un message et le lien « Créer un tournoi ».
 * - Puis toutes les rubriques, rangées en trois blocs : « Débuter », « Jouer en compétition » (Tournois et Ligues y
 *   ont leur lien « Créer » ; pour un visiteur, il mène à la connexion, qui renvoie ensuite vers le formulaire) et
 *   « La communauté ».
 * - Enfin, un article tiré au hasard. S'il n'y a aucun article, ce bloc n'est pas affiché.
 */
import { getActiveSession } from "@/lib/authGuard";
import { DateBlock, placeText, topicHref } from "@/app/tournois/component/TournamentListItems";
import { prisma } from "@/lib/prisma";
import { TOURNAMENT_TOPIC_NOT_DELETED } from "@/lib/forumDeletion";
import { TAKEN_PLACES_COUNT, takenPlaces } from "@/lib/tournamentPlaces";
import { Button, cn } from "@bbfrance/ui";
import { ChevronRight, ExternalLink, MessageSquare, Plus } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";

// Cache pour les tournois (60 s). L'étiquette « home-tournaments » permet de retrouver ce cache (le vider, ou le
// renouveler par `revalidateTag`) : le test tests/e2e/inventaire/accueil.spec.ts s'en sert pour effacer la liste
// gardée d'un lancement précédent (carte 148).
const getCachedTournaments = unstable_cache(
  async () => {
    return prisma.tournament.findMany({
      // Pas de tournoi dont le sujet du forum est supprimé (carte 165)
      where: { date: { gte: new Date() }, isFinished: false, isCancelled: false, ...TOURNAMENT_TOPIC_NOT_DELETED },
      orderBy: { date: 'asc' },
      take: 3,
      include: { organizer: { select: { name: true } }, topic: { select: { id: true } }, _count: TAKEN_PLACES_COUNT }
    });
  },
  // Clé passée en v3 avec la carte 150 (comptage des inscriptions ajouté pour « x / y places ») : un ancien résultat
  // gardé en cache, sans ce comptage, n'est jamais servi après la mise en ligne
  ["next-tournaments-v3"],
  { revalidate: 60, tags: ["home-tournaments"] }
);

// Cache pour les settings (1h)
const getCachedDiscordInvite = unstable_cache(
  async () => prisma.siteSetting.findUnique({ where: { key: 'discord_invite' } }),
  ["discord-invite-setting"],
  { revalidate: 3600 }
);

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

/** Contour de focus clavier commun aux liens de l'accueil. */
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus";

/** Titre d'un bloc (sans les majuscules ni l'italique de l'ancien CSS des titres). */
const blockTitle = "m-0 border-0 p-0 text-xl leading-tight font-extrabold text-bb-text normal-case not-italic";

/** Petit titre en capitales, en couleur d'accent, au-dessus d'un contenu (« La communauté française »…). */
const eyebrow = "text-xs font-bold tracking-[0.08em] text-bb-accent-text uppercase lg:text-[0.8rem]";

/** Un lien d'un bloc de rubriques : le nom, une courte description, et éventuellement un lien « Créer » à droite. */
interface SectionLink {
  label: string;
  description: string;
  href: string;
  /** Lien externe, ouvert dans un nouvel onglet (Discord) */
  external?: boolean;
  /** Adresse du formulaire de création ; null quand la création n'est pas possible (aucun forum de tournois) */
  create?: { href: string | null; label: string };
}

/** Un bloc de rubriques : un titre, une phrase, puis une liste de liens séparés par un filet. */
function SectionBlock({ id, title, description, links }: { id: string; title: string; description: string; links: SectionLink[] }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 rounded-bb-lg border border-bb-border bg-bb-surface px-4 pt-[18px] pb-1.5 lg:px-6 lg:pt-[22px] lg:pb-2">
      <div className="flex flex-col gap-1">
        <h2 id={id} className={blockTitle}>{title}</h2>
        <p className="m-0 text-sm text-bb-text-muted">{description}</p>
      </div>
      <ul className="m-0 flex list-none flex-col p-0">
        {links.map((link) => {
          const content = (
            <>
              <span className="flex items-center gap-1.5 text-base font-bold text-bb-text lg:text-[0.95rem]">
                {link.label}
                {link.external && <ExternalLink size={14} aria-hidden="true" className="shrink-0 text-bb-text-muted" />}
                {link.external && <span className="sr-only">(nouvel onglet)</span>}
              </span>
              <span className="text-[0.8rem] text-bb-text-muted">{link.description}</span>
            </>
          );
          const linkClass = `flex min-h-14 flex-1 flex-col justify-center gap-0.5 rounded-bb-md py-1.5 no-underline ${focusRing}`;
          return (
            <li key={link.label} className="flex min-h-14 items-center gap-2.5 border-t border-bb-border">
              {link.external ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>{content}</a>
              ) : (
                <Link href={link.href} className={linkClass}>{content}</Link>
              )}
              {link.create?.href && (
                <Link
                  href={link.create.href}
                  aria-label={link.create.label}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-1 rounded-bb-md bg-bb-accent-soft px-3 text-sm font-bold text-bb-accent-text no-underline transition-colors hover:bg-bb-surface-2 ${focusRing}`}
                >
                  <Plus size={15} aria-hidden="true" /> Créer
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

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
  const discordHref = discordInvite?.value || "#";

  const blocks: { id: string; title: string; description: string; links: SectionLink[] }[] = [
    {
      id: "home-debuter",
      title: "Débuter",
      description: "Apprendre les règles et se lancer.",
      links: [
        { label: "Jouer à Blood Bowl !", description: "Le guide du débutant", href: "/jouer" },
        { label: "Ressources", description: "Règles, aides de jeu, outils", href: "/ressources" },
        { label: "Quizz", description: "Testez vos connaissances", href: "/bbquizz" },
        { label: "BBScheme", description: "Tableau tactique", href: "/bbscheme" },
      ],
    },
    {
      id: "home-competition",
      title: "Jouer en compétition",
      description: "Tournois, ligues et classement national.",
      links: [
        { label: "Tournois", description: "Calendrier et inscriptions", href: "/tournois", create: { href: tournamentCreateHref, label: "Créer un tournoi" } },
        { label: "Ligues", description: "Toutes les ligues", href: "/ligues", create: { href: ligueCreateHref, label: "Créer une ligue" } },
        { label: "La Carte", description: "Ligues et tournois près de chez vous", href: "/carte" },
        { label: "Championnat de France", description: "Classement de la saison", href: "/classement" },
      ],
    },
    {
      id: "home-communaute",
      title: "La communauté",
      description: "Discuter, lire, partager.",
      links: [
        { label: "Forum", description: "Discussions, annonces, entraide", href: "/forum" },
        { label: "Articles", description: "Écrits par la communauté", href: "/articles" },
        { label: "Discord", description: "Discuter en direct", href: discordHref, external: true },
      ],
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-7 px-4 pt-5 pb-10 font-bb-sans text-base text-bb-text lg:gap-8 lg:px-6 lg:pt-10">
      {/* Bandeau de présentation et prochains tournois : côte à côte sur ordinateur, l'un sous l'autre sur téléphone */}
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-6">
        <section aria-labelledby="home-title" className="flex flex-col justify-center gap-4 rounded-bb-lg border border-bb-border bg-bb-surface px-5 py-6 lg:gap-6 lg:px-10 lg:py-9">
          <div className="flex flex-col gap-3">
            <span className={eyebrow}>La communauté française</span>
            <h1 id="home-title" className="m-0 border-0 p-0 text-[1.625rem] leading-[1.15] font-extrabold tracking-[-0.02em] text-bb-text normal-case not-italic lg:text-[2.5rem] lg:leading-[1.08]">
              Tournois, ligues et coachs de Blood Bowl en France
            </h1>
            <p className="m-0 hidden max-w-[600px] text-[1.05rem] leading-relaxed text-bb-text-muted lg:block">
              Échangez sur le forum, trouvez un tournoi près de chez vous, rejoignez une ligue.
            </p>
          </div>
          {/* Sur téléphone, « Aller au forum » occupe toute la largeur, les deux autres boutons se partagent la
              ligne suivante. Sur ordinateur, les trois sont alignés : Jouer, Forum, Discord. */}
          <div className="grid grid-cols-2 gap-2.5 lg:flex lg:flex-wrap lg:items-center lg:gap-3">
            <Button asChild variant="secondary" size="tap" className="order-2 min-h-12 whitespace-normal text-center lg:order-none">
              <Link href="/jouer">Jouer à Blood Bowl !</Link>
            </Button>
            <Button asChild variant="primary" size="tap" className="order-1 col-span-2 min-h-[52px] px-6 text-base font-extrabold shadow-[0_6px_18px_var(--bb-accent-soft)] lg:order-none">
              <Link href="/forum">
                <MessageSquare size={20} aria-hidden="true" /> Aller au forum
              </Link>
            </Button>
            <Button asChild variant="secondary" size="tap" className="order-3 min-h-12 lg:order-none">
              <a href={discordHref} target="_blank" rel="noopener noreferrer">
                <span className="lg:hidden">Discord</span>
                <span className="hidden lg:inline">Rejoindre le Discord</span>
                <span className="sr-only">(nouvel onglet)</span>
              </a>
            </Button>
          </div>
        </section>

        <section aria-labelledby="home-next-tournaments" className="flex flex-col overflow-hidden rounded-bb-lg border border-bb-border bg-bb-surface">
          <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2 lg:px-[22px] lg:pt-4">
            <h2 id="home-next-tournaments" className={blockTitle}>Prochains tournois</h2>
            <Link href="/tournois" className={`inline-flex min-h-11 items-center text-sm font-semibold text-bb-accent-text no-underline ${focusRing}`}>
              Tous les tournois
            </Link>
          </div>
          {nextTournaments.length > 0 ? (
            <ul className="m-0 list-none p-0">
              {nextTournaments.map((tournament) => (
                <li key={tournament.id} className="border-t border-bb-border">
                  <Link
                    href={topicHref(tournament)}
                    className="flex items-center gap-3.5 px-4 py-3.5 text-inherit no-underline transition-colors hover:bg-bb-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-bb-focus lg:px-[22px]"
                  >
                    <DateBlock date={tournament.date} className="size-[52px] border-0 bg-bb-accent-soft" />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-base leading-snug font-bold break-words text-bb-text">{tournament.name}</span>
                      <span className="text-sm text-bb-text-muted">
                        {placeText(tournament)} · {takenPlaces(tournament)} / {tournament.maxParticipants || "∞"} places
                      </span>
                    </span>
                    <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-bb-text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 border-t border-bb-border px-4 py-6 text-center lg:py-7">
              <p className="m-0 text-base font-bold text-bb-text">Aucun tournoi prévu pour l&apos;instant</p>
              <p className="m-0 max-w-[300px] text-sm leading-normal text-bb-text-muted">Vous organisez un tournoi ? Annoncez-le à la communauté.</p>
              {tournamentCreateHref && (
                <Link
                  href={tournamentCreateHref}
                  className={`inline-flex min-h-11 items-center gap-1 rounded-bb-md bg-bb-accent-soft px-4 text-sm font-bold text-bb-accent-text no-underline ${focusRing}`}
                >
                  <Plus size={15} aria-hidden="true" /> Créer un tournoi
                </Link>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Les rubriques en trois blocs : trois colonnes sur ordinateur, l'un sous l'autre sur téléphone */}
      <nav aria-label="Rubriques du site" className="grid gap-5 lg:grid-cols-3">
        {blocks.map((block) => <SectionBlock key={block.id} {...block} />)}
      </nav>

      {/* Article tiré au hasard : rien n'est affiché s'il n'y a aucun article */}
      {selectedArticle && (
        <section aria-labelledby="home-random-article">
          <Link
            href={`/articles/${selectedArticle.id}`}
            className={cn("flex flex-col gap-1.5 rounded-bb-lg bg-bb-surface-2 p-[18px] text-inherit no-underline lg:flex-row lg:items-center lg:gap-6 lg:px-7 lg:py-[22px]", focusRing)}
          >
            <h2 id="home-random-article" className={cn(eyebrow, "m-0 shrink-0 border-0 p-0 not-italic")}>Article au hasard</h2>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="line-clamp-2 text-lg leading-snug font-bold break-words text-bb-text lg:text-[1.2rem]">{selectedArticle.title}</span>
              <span className="text-sm text-bb-text-muted">par {selectedArticle.author?.name || "Anonyme"}</span>
            </span>
            <span aria-hidden="true" className="hidden shrink-0 text-sm font-semibold text-bb-accent-text lg:inline">Lire l&apos;article →</span>
          </Link>
        </section>
      )}
    </div>
  );
}
