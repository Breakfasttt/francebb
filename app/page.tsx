import { auth } from "@/auth";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import SiteLogo from "@/common/components/SiteLogo/SiteLogo";
import { prisma } from "@/lib/prisma";
import { Award, BookOpen, Calendar, FileText, HelpCircle, Info, Layout, Map, MapPin, MessageSquare, Shield, Trophy } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import "./page-mobile.css";
import "./page.css";

// Cache pour les tournois (60s)
const getCachedTournaments = unstable_cache(
  async () => {
    return prisma.tournament.findMany({
      where: { date: { gte: new Date() }, isFinished: false, isCancelled: false },
      orderBy: { date: 'asc' },
      take: 3,
      include: { topic: true }
    });
  },
  ["next-tournaments"],
  { revalidate: 60 }
);

// Cache pour les settings (1h)
const getCachedDiscordInvite = unstable_cache(
  async () => prisma.siteSetting.findUnique({ where: { key: 'discord_invite' } }),
  ["discord-invite-setting"],
  { revalidate: 3600 }
);

export default async function Home() {
  const session = await auth();
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
    prisma.article.count()
  ]);

  // 2. Sélection d'un article (on reste dynamique ici pour le hasard)
  let selectedArticle = null;
  if (articlesCount > 0) {
    const randomArticles = await prisma.article.findMany({
      take: 1,
      skip: Math.floor(Math.random() * articlesCount),
      include: { author: true, tags: true }
    });
    selectedArticle = randomArticles[0];
  }

  return (
    <>
      <div className="logo-overlay-container desktop-only">
        <SiteLogo scale={1.8} />
      </div>

      <div className="home-page-fixed">
        <section className="hero">
          {/* LIGNE 1 */}
          <div className="action-grid-row top-row">
            <Link href="/jouer" style={{ display: 'contents' }}>
              <PremiumCard hoverEffect className="action-card primary-action">
                <Info size={28} className="icon-accent" />
                <div className="card-text large">Jouer à<br />Blood Bowl !</div>
              </PremiumCard>
            </Link>

            <Link href="/forum" style={{ display: 'contents' }}>
              <PremiumCard hoverEffect className="action-card">
                <MessageSquare size={24} className="icon-accent" />
                <div className="card-text">Forum</div>
              </PremiumCard>
            </Link>

            <div className="card-stack">
              <Link href="/ligues" style={{ display: 'contents' }}>
                <PremiumCard hoverEffect className="action-card flex-1">
                  <Shield size={24} className="icon-accent" />
                  <div className="card-text">Ligues</div>
                </PremiumCard>
              </Link>
              <Link href={isAuth ? "/ligues/create" : "/auth/login?callback=/ligues/create"} style={{ display: 'contents' }}>
                <PremiumCard hoverEffect className="action-card-mini">
                  + Créer
                </PremiumCard>
              </Link>
            </div>

            <div className="card-stack">
              <Link href="/tournois" style={{ display: 'contents' }}>
                <PremiumCard hoverEffect className="action-card flex-1">
                  <Trophy size={24} className="icon-accent" />
                  <div className="card-text">Tournois</div>
                </PremiumCard>
              </Link>
              {tournamentForum && (
                <Link href={isAuth ? `/forum/new-tournament?forumId=${tournamentForum.id}` : `/auth/login?callback=/forum/new-tournament?forumId=${tournamentForum.id}`} style={{ display: 'contents' }}>
                  <PremiumCard hoverEffect className="action-card-mini">
                    + Créer
                  </PremiumCard>
                </Link>
              )}
            </div>


            <Link href="/carte" style={{ display: 'contents' }}>
              <PremiumCard hoverEffect className="action-card">
                <Map size={24} className="icon-accent" />
                <div className="card-text">La Carte</div>
              </PremiumCard>
            </Link>
          </div>

          {/* LIGNE 2 */}
          <div className="action-grid-row bottom-row">
            <Link href="/classement" style={{ display: 'contents' }}>
              <PremiumCard hoverEffect className="action-card">
                <Award size={24} className="icon-accent" />
                <div className="card-text">Championnat de France</div>
              </PremiumCard>
            </Link>

            <Link href="/articles" style={{ display: 'contents' }}>
              <PremiumCard hoverEffect className="action-card">
                <FileText size={24} className="icon-accent" />
                <div className="card-text">Articles</div>
              </PremiumCard>
            </Link>

            <Link href="/ressources" style={{ display: 'contents' }}>
              <PremiumCard hoverEffect className="action-card">
                <BookOpen size={24} className="icon-accent" />
                <div className="card-text">Ressources</div>
              </PremiumCard>
            </Link>

            <div className="card-stack">
              <Link href="/bbscheme" style={{ display: 'contents' }}>
                <PremiumCard hoverEffect className="action-card flex-1">
                  <Layout size={24} className="icon-accent" />
                  <div className="card-text">BBScheme</div>
                </PremiumCard>
              </Link>
              <Link href="/bbquizz" style={{ display: 'contents' }}>
                <PremiumCard hoverEffect className="action-card flex-1">
                  <HelpCircle size={24} className="icon-accent" />
                  <div className="card-text">Quizz</div>
                </PremiumCard>
              </Link>
            </div>

            <a
              href={discordInvite?.value || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="discord-link-wrapper"
              style={{ display: 'contents' }}
            >
              <PremiumCard className="action-card discord-cta" hoverEffect>
                <div className="discord-glow" />
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="icon-white">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.006 14.006 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
                </svg>
                <div className="discord-text">Communauté<br />Discord</div>
              </PremiumCard>
            </a>
          </div>
        </section>



        <section className="home-content-split">
          <div className="column events-column">
            <h2 className="section-title">Prochains Tournois</h2>
            <div className="events-grid">
              {nextTournaments.length > 0 ? (
                nextTournaments.map((t: any) => (
                  <PremiumCard
                    key={t.id}
                    as={t.topic ? Link : 'div'}
                    href={t.topic ? `/forum/topic/${t.topic.id}` : undefined}
                    hoverEffect
                    className="tournament-home-card"
                  >
                    <h3 className="tourney-title">{t.topic?.title || t.name || "Tournoi sans titre"}</h3>
                    <div className="tourney-meta">
                      <MapPin size={12} /> <span>{t.location || "Lieu à définir"}</span>
                    </div>
                    <div className="tourney-meta">
                      <Calendar size={12} /> {new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                  </PremiumCard>
                ))
              ) : (
                <p className="empty-msg">Aucun tournoi prévu.</p>
              )}
            </div>
          </div>

          <div className="column article-column">
            <h2 className="section-title">Article Aléatoire</h2>
            {selectedArticle ? (
              <>
                <div className="random-article-wrapper">
                  <Link href={`/articles/${selectedArticle.id}`} className="home-article-link">
                    <div className="home-article-content">
                      <BookOpen size={16} className="icon-accent" style={{ marginBottom: '0.4rem' }} />
                      <h3 className="home-article-title">{selectedArticle.title}</h3>
                      <div className="home-article-meta">
                        par <span className="author-name">{selectedArticle.author?.name || "Anonyme"}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </>
            ) : (
              <div className="empty-article-box">
                <FileText size={40} opacity={0.3} />
                <p>Aucun article publié.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
