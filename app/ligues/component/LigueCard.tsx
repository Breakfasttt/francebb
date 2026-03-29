"use client";

import Link from "next/link";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { Shield, MapPin, Users, Trophy, ExternalLink } from "lucide-react";
import "./LigueCard.css";

interface LigueCardProps {
  ligue: {
    id: string;
    name: string;
    acronym: string;
    geographicalZone: string | null;
    region: string | null;
    ville: string | null;
    description: string | null;
    _count?: {
      tournaments: number;
      members: number;
    };
  };
  view?: "grid" | "list";
}

export default function LigueCard({ ligue, view = "grid" }: LigueCardProps) {
  if (view === "list") {
    return (
      <div className="ligue-list-item">
        <div className="ligue-list-icon">
          <Shield size={24} />
        </div>
        <div className="ligue-list-info">
          <Link href={`/ligue/${ligue.id}`} className="ligue-list-title">
            {ligue.name} <span className="ligue-list-acronym">({ligue.acronym})</span>
          </Link>
          <div className="ligue-list-meta">
            <span className="meta-item"><MapPin size={12} /> {ligue.geographicalZone} - {ligue.ville || ligue.region}</span>
          </div>
        </div>
        <div className="ligue-list-stats">
          <div className="stat-pill"><Users size={14} /> {ligue._count?.members || 0}</div>
          <div className="stat-pill"><Trophy size={14} /> {ligue._count?.tournaments || 0}</div>
        </div>
        <div className="ligue-list-action">
          <Link href={`/ligue/${ligue.id}`} className="btn-detail-small">Détails</Link>
        </div>
      </div>
    );
  }

  return (
    <PremiumCard 
      as={Link} 
      href={`/ligue/${ligue.id}`} 
      className="ligue-card clickable" 
      hoverEffect={true}
    >
      <div className="ligue-card-header">
        <div className="ligue-badge">{ligue.acronym}</div>
        <Shield size={32} className="ligue-shield-icon" />
      </div>

      <div className="ligue-card-body">
        <h3 className="ligue-card-name">{ligue.name}</h3>
        <div className="ligue-card-location">
          <MapPin size={16} />
          <span>{ligue.geographicalZone} - {ligue.ville || ligue.region || "France"}</span>
        </div>
        
        {ligue.description && (
          <p className="ligue-card-desc">
            {ligue.description.replace(/\[\/?\w+.*?\]/g, '').substring(0, 100)}...
          </p>
        )}
      </div>

      <div className="ligue-card-footer">
        <div className="ligue-card-stats">
          <div className="ligue-stat" title="Membres">
            <Users size={18} />
            <span>{ligue._count?.members || 0}</span>
          </div>
          <div className="ligue-stat" title="Tournois">
            <Trophy size={18} />
            <span>{ligue._count?.tournaments || 0}</span>
          </div>
        </div>
        <div className="ligue-card-action">
          <ExternalLink size={18} />
        </div>
      </div>
    </PremiumCard>
  );
}
