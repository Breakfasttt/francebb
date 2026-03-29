"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Trophy, Shield, Info, Loader2 } from "lucide-react";

// Import dynamique pour éviter les erreurs SSR de Leaflet (nécessite 'window' objet)
const LeafletMap = dynamic(
  () => import("./LeafletMapContainer"),
  { 
    ssr: false,
    loading: () => (
      <div className="map-loading">
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        <p>Chargement de la carte...</p>
      </div>
    )
  }
);

interface CarteProps {
  initialTournaments: any[];
  initialLigues: any[];
}

export default function CarteClient({ initialTournaments, initialLigues }: CarteProps) {
  const [view, setView] = useState<"tournaments" | "ligues">("tournaments");

  const points = useMemo(() => {
    const list = view === "tournaments" ? initialTournaments : initialLigues;
    return list.filter(p => p.lat && p.lng);
  }, [view, initialTournaments, initialLigues]);

  return (
    <div className="carte-client-wrapper">
      <div className="map-view-leaflet">
          {/* Sélecteur Coulissant en Overlay */}
          <div className="map-overlay-controls">
            <div className="sliding-toggle">
              <div className={`sliding-bg ${view}`} />
              <button 
                className={`toggle-option ${view === "tournaments" ? "active" : ""}`}
                onClick={() => setView("tournaments")}
              >
                <Trophy size={16} />
                <span>Tournois</span>
              </button>
              <button 
                className={`toggle-option ${view === "ligues" ? "active" : ""}`}
                onClick={() => setView("ligues")}
              >
                <Shield size={16} />
                <span>Ligues</span>
              </button>
            </div>
          </div>

          <LeafletMap points={points} viewType={view} />
      </div>

      {points.length === 0 && (
        <div className="map-legend">
          <p className="no-points-msg">
            Aucun point trouvé pour cette vue.
          </p>
        </div>
      )}

      <style jsx>{`
        .carte-client-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          position: relative;
        }
        
        .map-view-leaflet {
          flex: 1;
          width: 100%;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          overflow: hidden;
          background: var(--card-bg);
          position: relative; /* Pour l'overlay */
          border: 1px solid var(--glass-border);
        }

        .map-overlay-controls {
          position: absolute;
          top: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          pointer-events: none;
        }

        .sliding-toggle {
          display: flex;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(12px);
          padding: 4px;
          border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          pointer-events: auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        }

        .sliding-bg {
          position: absolute;
          top: 4px;
          left: 4px;
          width: calc(50% - 4px);
          height: calc(100% - 8px);
          background: var(--primary);
          border-radius: 50px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 10px rgba(194, 29, 29, 0.4);
        }

        .sliding-bg.ligues {
          transform: translateX(100%);
        }

        .toggle-option {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 1.5rem;
          border: none;
          background: none;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          transition: color 0.3s;
          white-space: nowrap;
        }

        .toggle-option.active {
          color: white;
        }

        .map-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 1.5rem;
          color: var(--text-muted);
        }
        .no-points-msg {
           text-align: center;
           color: var(--text-muted);
           font-style: italic;
           font-size: 0.9rem;
           margin-top: 0.5rem;
        }
        .map-legend {
          flex-shrink: 0;
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background: rgba(0, 0, 0, 0.7);
          padding: 0.5rem 1.2rem;
          border-radius: 50px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}



