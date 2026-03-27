import "./page.css";
import BackButton from "@/common/components/BackButton/BackButton";
import { prisma } from "@/lib/prisma";
import TournamentFilterSidebar from "@/app/tournaments/component/TournamentFilterSidebar";
import { MapPin, Calendar, Users, Trophy, ChevronDown, Bed, Pizza, Sparkles, GitBranch } from "lucide-react";
import Link from "next/link";
import ActiveFilters from "@/app/tournaments/component/ActiveFilters";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session) redirect("/auth/login?callback=/tournaments");

  const params = await searchParams;

  const query = params.query as string | undefined;
  const region = params.region as string | undefined;
  const dept = params.dept as string | undefined;
  const edition = params.edition as string | undefined;
  const ruleset = params.ruleset as string | undefined;
  const days = params.days as string | undefined;
  const minPlaces = params.minPlaces ? parseInt(params.minPlaces as string) : undefined;
  
  const lodging = params.lodging === "true";
  const meals = params.meals === "true";
  const friday = params.friday === "true";
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice as string) : undefined;
  const structure = params.structure as string | undefined;
  const sort = (params.sort as string) || "date_asc";

  // Build where clause
  const where: any = {
    date: { gte: new Date() },
  };

  if (query) where.name = { contains: query };
  if (region) where.region = region;
  if (dept) where.departement = dept;
  if (edition) where.gameEdition = edition;
  if (ruleset) where.ruleset = ruleset;
  if (days) where.days = days;
  if (structure) where.structure = structure;
  if (minPlaces) where.maxParticipants = { gte: minPlaces };
  if (lodging) where.lodgingAtVenue = true;
  if (meals) where.mealsIncluded = true;
  if (friday) where.fridayArrival = true;
  if (maxPrice !== undefined) where.price = { lte: maxPrice };

  // Handle Sort
  let orderBy: any = {};
  if (sort === "date_asc") orderBy = { date: "asc" };
  else if (sort === "date_desc") orderBy = { date: "desc" };
  else if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };
  else if (sort === "participants_asc") orderBy = { maxParticipants: "asc" };
  else if (sort === "participants_desc") orderBy = { maxParticipants: "desc" };

  const tournaments = await prisma.tournament.findMany({
    where,
    orderBy,
    include: { 
      organizer: true,
      topic: { select: { id: true } }
    }
  });

  return (
    <main className="container tournaments-container">
      <header className="page-header" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem' }}>
        <BackButton href="/" style={{ position: 'absolute', left: 0 }} />
        <h1 style={{ margin: 0 }}>Tous les Tournois</h1>
      </header>

      <div className="search-layout">
        <aside className="sidebar-wrapper">
          <TournamentFilterSidebar />
        </aside>

        <section className="results-wrapper">
          <ActiveFilters currentSort={sort} />
          
          {tournaments.length > 0 ? (
            <div className="results-grid">
              {tournaments.map((t: any) => (
                <div key={t.id} className="tournament-row hover-effect">
                  <div className="t-main-info">
                    <div className="t-game-badges">
                      <div className="t-badge">{t.gameEdition || "BB20"}</div>
                      <div className="t-format-badge"><Sparkles size={12} /> {t.ruleset || "NAF"}</div>
                      {t.structure && <div className="t-format-badge"><GitBranch size={12} /> {t.structure}</div>}
                    </div>
                    <div className="t-details">
                      <div className="t-title-row">
                        <h3>{t.name}</h3>
                        <div className="t-icons">
                          {t.mealsIncluded && <span title="Repas compris"><Pizza size={18} className="icon-highlight" /></span>}
                          {t.lodgingAtVenue && <span title="Dodo sur place"><Bed size={18} className="icon-highlight" /></span>}
                        </div>
                      </div>
                      <div className="t-meta">
                        <span className="t-meta-item"><MapPin size={14} /> {t.ville}, {t.region} ({t.departement})</span>
                        <span className="t-meta-item"><Calendar size={14} /> {new Date(t.date).toLocaleDateString("fr-FR")} ({t.days}j)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="t-stats">
                    <div className="stat-item" title="Participants">
                      <Users size={16} />
                      <span>{t.currentParticipants}/{t.maxParticipants || "?"}</span>
                    </div>
                    <div className="stat-price">
                       {t.price ? `${t.price}€` : "Gratuit"}
                    </div>
                    <Link href={t.topic?.id ? `/forum/topic/${t.topic.id}` : `/tournaments/${t.id}`} className="view-btn">Détails</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results premium-card">
              <h3>Aucun résultat trouvé</h3>
              <p>Essayez de modifier vos filtres pour trouver ce que vous cherchez.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
