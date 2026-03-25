import React from 'react';
import { Trophy, Calendar, MapPin, Users, Coins, Info, CheckCircle2, XCircle } from 'lucide-react';
import './TournamentSummary.css';

interface TournamentSummaryProps {
  tournament: {
    name: string;
    date: Date;
    location: string;
    ville: string | null;
    departement: string | null;
    region: string | null;
    maxParticipants: number | null;
    currentParticipants: number;
    price: number | null;
    days: string | null;
    structure: string | null;
    ruleset: string | null;
    gameEdition: string | null;
    mealsIncluded: boolean;
    lodgingAtVenue: boolean;
    fridayArrival: boolean;
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

  return (
    <div className="tournament-summary-card">
      <div className="summary-header">
        <div className="trophy-icon">
          <Trophy size={24} />
        </div>
        <div className="header-text">
          <h2>Détails du Tournoi</h2>
          <p>{tournament.name}</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-item">
          <Calendar size={18} />
          <div className="item-content">
            <span className="label">Date</span>
            <span className="value">{formatDate(tournament.date)} ({tournament.days || 1} jour{parseInt(tournament.days || '1') > 1 ? 's' : ''})</span>
          </div>
        </div>

        <div className="summary-item">
          <MapPin size={18} />
          <div className="item-content">
            <span className="label">Localisation</span>
            <span className="value">
              {tournament.location}
              {tournament.ville && `, ${tournament.ville}`}
              {tournament.departement && ` (${tournament.departement})`}
            </span>
          </div>
        </div>

        <div className="summary-item">
          <Users size={18} />
          <div className="item-content">
            <span className="label">Participants</span>
            <span className="value">
              {tournament.currentParticipants} / {tournament.maxParticipants || '∞'} inscrits
            </span>
          </div>
        </div>

        <div className="summary-item">
          <Coins size={18} />
          <div className="item-content">
            <span className="label">Prix</span>
            <span className="value">{tournament.price != null ? `${tournament.price} €` : 'N/A'}</span>
          </div>
        </div>

        <div className="summary-item">
          <Info size={18} />
          <div className="item-content">
            <span className="label">Format & Édition</span>
            <span className="value">{tournament.gameEdition || 'BB20'} - {tournament.ruleset || 'NAF'}</span>
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
