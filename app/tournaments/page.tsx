import "./page.css";
import "./page-mobile.css";

import PageHeader from "@/common/components/PageHeader/PageHeader";
import { prisma } from "@/lib/prisma";
import TournamentFilterSidebar from "@/app/tournaments/component/TournamentFilterSidebar";
import Link from "next/link";
import ActiveFilters from "@/app/tournaments/component/ActiveFilters";
import EmptyState from "@/common/components/EmptyState/EmptyState";
import { Search, MapPin, Calendar, Users, Trophy, Sparkles, GitBranch, Clock } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import Pagination from "@/common/components/Pagination/Pagination";
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
  const view = (params.view as string) || "grid";
  const showHistory = params.history === "true";
  
  const page = parseInt(params.page as string) || 1;
  const limit = view === "grid" ? 10 : 20;
  const skip = (page - 1) * limit;
  
  // Build where clause
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const where: any = {};

  if (!showHistory) {
    where.isFinished = false;
    where.isCancelled = false;
    where.date = { gte: todayStart };
  }

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

  const total = await prisma.tournament.count({ where });
  const totalPages = Math.ceil(total / limit);

  const tournaments = await prisma.tournament.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    include: { 
      organizer: true,
      topic: { select: { id: true } }
    }
  });

  return (
    <main className="container tournaments-container">
      <PageHeader 
        title="Tous les Tournois" 
        backHref="/" 
      />

      <div className="search-layout">
        <aside className="sidebar-wrapper">
          <TournamentFilterSidebar />
        </aside>

        <section className="results-wrapper">
          <div className="active-filters-wrapper">
            <ActiveFilters currentSort={sort} />
          </div>
          
          {tournaments.length > 0 ? (
            <>
              {view === "grid" ? (
                <div className="tournaments-grid">
                  {tournaments.map((t: any) => (
                    <PremiumCard 
                      key={t.id} 
                      as={Link}
                      href={t.topic?.id ? `/forum/topic/${t.topic.id}` : `/tournaments/${t.id}`}
                      className={`tournament-card clickable ${t.isCancelled ? 'cancelled' : t.isFinished ? 'finished' : ''}`} 
                      hoverEffect={true}
                    >
                      {/* Status Badges */}
                      <div className="t-status-row">
                        {t.isCancelled ? (
                          <span className="status-badge cancelled">ANNULÉ</span>
                        ) : t.isFinished ? (
                          <span className="status-badge finished">TERMINÉ</span>
                        ) : new Date(t.date) < todayStart ? (
                          <span className="status-badge past">PASSÉ</span>
                        ) : null}
                      </div>

                      <div>
                        <div className="t-header">
                          <div className="t-badge-main">{t.gameEdition || "BB20"}</div>
                          <div className="t-badge-outline"><Sparkles size={12} /> {t.ruleset || "NAF"}</div>
                          {t.structure && <div className="t-badge-outline"><GitBranch size={12} /> {t.structure}</div>}
                        </div>

                        <div className="t-title-area">
                          <div className="t-title-header">
                            <h3>{t.name}</h3>
                            <div className="t-logistic-badges">
                              {t.mealsIncluded && <span className="log-badge meals">Repas Inclus</span>}
                              {t.lodgingAtVenue && <span className="log-badge lodging">Dodo sur place</span>}
                              {t.fridayArrival && <span className="log-badge friday">Vendredi</span>}
                            </div>
                          </div>
                        </div>

                        <div className="t-info">
                          <div className="t-info-item">
                            <MapPin size={16} /> 
                            <span>{t.ville || t.location}, {t.region} ({t.departement})</span>
                          </div>
                          <div className="t-info-item">
                            <Calendar size={16} /> 
                            <span>{new Date(t.date).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                          <div className="t-info-item">
                            <Clock size={16} />
                            <span>Durée : {t.days} jour(s)</span>
                          </div>
                          {t.ruleset && (
                            <div className="t-info-item">
                              <Trophy size={16} />
                              <span>Règles : {t.ruleset}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="t-footer">
                        <div className="t-stats-box">
                          <div className="t-participants" title="Inscriptions">
                            <Users size={18} />
                            <span>{t.currentParticipants} / {t.maxParticipants || "∞"}</span>
                          </div>
                          <div className="t-price">
                            {t.price === 0 ? "GRATUIT" : `${t.price}€`}
                          </div>
                        </div>
                        
                        <div className="t-action-btn-fake">
                          Détails
                        </div>
                      </div>
                    </PremiumCard>
                  ))}
                </div>
              ) : (
                <div className="tournaments-list-view">
                  <div className="list-header-row">
                    <span>Date</span>
                    <span>Tournoi</span>
                    <span>Lieu</span>
                    <span>Format</span>
                    <span>Statut</span>
                    <span>Prix</span>
                    <span></span>
                  </div>
                  {tournaments.map((t: any) => {
                    const isPast = new Date(t.date) < todayStart;
                    return (
                      <div key={t.id} className={`tournament-list-item ${t.isCancelled ? 'cancelled' : t.isFinished ? 'finished' : ''} ${isPast ? 'past' : ''}`}>
                        <div className="list-col-date">
                          <div className="date-day">{new Date(t.date).getDate()}</div>
                          <div className="date-month">{new Date(t.date).toLocaleDateString("fr-FR", { month: 'short' })}</div>
                        </div>
                        
                        <div className="list-col-name">
                          <Link href={t.topic?.id ? `/forum/topic/${t.topic.id}` : `/tournaments/${t.id}`} className="tournament-link">
                            {t.name}
                          </Link>
                          <div className="organizer-small">Par {t.organizer.name}</div>
                        </div>

                        <div className="list-col-location">
                          <div className="location-main">{t.ville || t.location}</div>
                          <div className="location-dept">{t.region} ({t.departement})</div>
                        </div>

                        <div className="list-col-format">
                          <div className="format-badges">
                            <span className="f-badge">{t.gameEdition || "BB20"}</span>
                            <span className="f-badge outline">{t.ruleset || "NAF"}</span>
                          </div>
                        </div>

                        <div className="list-col-status">
                          <div className="status-pill-box">
                            {t.isCancelled ? (
                              <span className="status-pill cancelled">Annulé</span>
                            ) : t.isFinished ? (
                              <span className="status-pill finished">Terminé</span>
                            ) : isPast ? (
                              <span className="status-pill past">Passé</span>
                            ) : (
                              <div className="participants-pill">
                                <Users size={12} />
                                <span>{t.currentParticipants}/{t.maxParticipants || "∞"}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="list-col-price">
                          <span className="price-val">{t.price === 0 ? "OFFERT" : `${t.price}€`}</span>
                        </div>

                        <div className="list-col-action">
                          <Link 
                            href={t.topic?.id ? `/forum/topic/${t.topic.id}` : `/tournaments/${t.id}`} 
                            className="list-btn"
                          >
                            Voir
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pagination-wrapper" style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                <Pagination 
                  currentPage={page} 
                  totalPages={totalPages} 
                  queryParam="page"
                  baseUrl="/tournaments"
                />
              </div>
            </>
          ) : (
            <EmptyState 
              icon={<Search size={48} />}
              title="Aucun tournoi trouvé"
              description="Essayez de modifier vos filtres ou de réinitialiser la recherche."
            />
          )}
        </section>
      </div>
    </main>
  );
}
