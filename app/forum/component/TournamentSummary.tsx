import React from 'react';
import { Trophy, Calendar, MapPin, Users, Coins, Info, CheckCircle2, XCircle, ExternalLink, Monitor, Shield, Layers } from 'lucide-react';
import './TournamentSummary.css';

interface TournamentSummaryProps {
  tournament: {
    name: string;
    date: Date;
    location: string;
    address: string | null;
    gmapsUrl: string | null;
    ville: string | null;
    departement: string | null;
    region: string | null;
    maxParticipants: number | null;
    currentParticipants: number;
    price: number | null;
    priceMeals: number | null;
    priceLodging: number | null;
    days: string | null;
    structure: string | null;
    ruleset: string | null;
    gameEdition: string | null;
    platform: string | null;
    mealsIncluded: boolean;
    lodgingAtVenue: boolean;
    fridayArrival: boolean;
    isTeam: boolean;
    coachsPerTeam: number | null;
    isNAF: boolean;
    isCDF: boolean;
    isCGO: boolean;
    isTGE: boolean;
    isTSC: boolean;
  };
}

const TournamentSummary: React.FC<TournamentSummaryProps> = ({ tournament }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const championships = [
    { label: 'NAF', active: tournament.isNAF },
    { label: 'CDF', active: tournament.isCDF },
    { label: 'CGO', active: tournament.isCGO },
    { label: 'TGE', active: tournament.isTGE },
    { label: 'TSC', active: tournament.isTSC },
  ].filter(c => c.active);

  // Construction de l'adresse pour Google Maps
  const displayAddress = tournament.address || tournament.location;
  const isActuallySpecified = displayAddress && displayAddress !== "Lieu non précisé";
  const gmapsQuery = encodeURIComponent(`${displayAddress || ''} ${tournament.ville || ''} ${tournament.departement || ''}`.trim());
  const gmapsUrl = tournament.gmapsUrl || `https://www.google.com/maps/search/?api=1&query=${gmapsQuery}`;

  return (
    <div className="tournament-summary-card">
      <div className="summary-header">
        <div className="trophy-icon">
          <Trophy size={24} />
        </div>
        <div className="header-text" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <h2 style={{ margin: 0 }}>Détails du Tournoi</h2>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {tournament.isTeam && (
                    <span className="team-badge" style={{ background: 'var(--accent)', color: '#000', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                        PAR ÉQUIPE DE {tournament.coachsPerTeam}
                    </span>
                )}
                {championships.map(c => (
                    <span key={c.label} style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--accent)', fontSize: '0.7rem', padding: '2px 6px', border: '1px solid var(--accent)', borderRadius: '4px', fontWeight: 700 }}>
                        {c.label}
                    </span>
                ))}
            </div>
          </div>
          <p>{tournament.name}</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-item">
          <Calendar size={18} />
          <div className="item-content">
            <span className="label">Date & Durée</span>
            <span className="value">{formatDate(tournament.date)} ({tournament.days || 1} jour{parseInt(tournament.days || '1') > 1 ? 's' : ''})</span>
          </div>
        </div>

        <div className="summary-item">
          <MapPin size={18} />
          <div className="item-content">
            <span className="label">Localisation</span>
            <div className="value">
              {isActuallySpecified ? (
                <a 
                  href={gmapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="address-link" 
                  style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <strong style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{displayAddress}</strong>
                  <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-muted">{tournament.location}</span>
              )}
              <div style={{ fontSize: '0.9rem', color: '#888' }}>
                {tournament.ville}{tournament.departement && ` (${tournament.departement})`}
              </div>
            </div>
          </div>
        </div>

        <div className="summary-item">
          <Users size={18} />
          <div className="item-content">
            <span className="label">Participants</span>
            <span className="value">
              {tournament.currentParticipants} / {tournament.maxParticipants || '∞'} {tournament.isTeam ? 'équipes' : 'coachs'}
            </span>
          </div>
        </div>

        <div className="summary-item">
          <Coins size={18} />
          <div className="item-content">
            <span className="label">PAF (Inscription)</span>
            <span className="value">
                {tournament.price != null ? `${tournament.price} €` : 'N/A'}
                {(tournament.priceMeals || tournament.priceLodging) && (
                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>
                        {tournament.priceMeals && `Repas: +${tournament.priceMeals}€ `}
                        {tournament.priceLodging && `Dodo: +${tournament.priceLodging}€`}
                    </div>
                )}
            </span>
          </div>
        </div>

        <div className="summary-item">
          <Monitor size={18} />
          <div className="item-content">
            <span className="label">Plateforme</span>
            <span className="value">{tournament.platform || 'Tabletop'}</span>
          </div>
        </div>

        <div className="summary-item">
          <Layers size={18} />
          <div className="item-content">
            <span className="label">Édition</span>
            <span className="value">{tournament.gameEdition || 'BB25'}</span>
          </div>
        </div>

        <div className="summary-item">
          <Shield size={18} />
          <div className="item-content">
            <span className="label">Ruleset</span>
            <span className="value">{tournament.ruleset || 'Libre'}</span>
          </div>
        </div>

        <div className="summary-item">
          <Info size={18} />
          <div className="item-content">
            <span className="label">Type de tournoi</span>
            <span className="value">{tournament.structure || 'Resurrection'}</span>
          </div>
        </div>
      </div>

      <div className="options-row">
        <div className={`option ${tournament.mealsIncluded ? 'available' : 'unavailable'}`}>
          {tournament.mealsIncluded ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span>Repas inclus</span>
        </div>
        <div className={`option ${tournament.lodgingAtVenue ? 'available' : 'unavailable'}`}>
          {tournament.lodgingAtVenue ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span>Dodo sur place</span>
        </div>
        <div className={`option ${tournament.fridayArrival ? 'available' : 'unavailable'}`}>
          {tournament.fridayArrival ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span>Accueil vendredi</span>
        </div>
      </div>
    </div>
  );
};

export default TournamentSummary;
