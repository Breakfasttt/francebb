"use client";

/**
 * Carte OpenStreetMap de la page `/carte` (bibliothèque Leaflet, par react-leaflet), refaite à la carte 094.
 * Chaque point est un repère ; un appui ouvre une bulle avec le nom, le lieu, la date (tournoi) et le lien « Détails »
 * vers le sujet du tournoi ou la fiche de la ligue. Les boutons de zoom sont en bas à droite, à portée de pouce.
 * Les couleurs de la bulle et des boutons de zoom suivent le thème (classes posées par `CarteClient`).
 */
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Calendar, MapPin } from "lucide-react";

export interface MapPoint {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  /** Tournoi : lieu, date et sujet du forum. */
  location?: string | null;
  date?: Date | string | null;
  topic?: { id: string } | null;
  /** Ligue : ville. */
  ville?: string | null;
}

interface LeafletMapProps {
  points: MapPoint[];
  viewType: "tournaments" | "ligues";
  isFullscreen?: boolean;
}

/** Recalcule la taille de la carte quand la fenêtre ou le plein écran change (sinon, des zones restent grises). */
function MapResizer({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap();

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    // Petit délai pour laisser la nouvelle mise en page s'appliquer
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [isFullscreen, map]);

  return null;
}

/**
 * Repère de couleur (rouge pour un tournoi, doré pour une ligue). Les images sont dessinées pour le site et servies
 * par lui (`public/images/carte/`) : avant la carte 138, elles venaient de deux sites extérieurs, et les repères
 * disparaissaient si l'un d'eux ne répondait plus.
 */
const markerIcon = (color: "red" | "gold") =>
  L.icon({
    iconUrl: `/images/carte/marker-${color}.svg`,
    shadowUrl: "/images/carte/marker-shadow.svg",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

export default function LeafletMapContainer({ points, viewType, isFullscreen = false }: LeafletMapProps) {
  // Ce fichier n'est chargé que dans le navigateur (import dynamique sans rendu serveur) : Leaflet y est disponible
  const icons = useMemo(() => ({ red: markerIcon("red"), gold: markerIcon("gold") }), []);

  return (
    <MapContainer center={[46.2276, 2.2137]} zoom={6} zoomControl={false} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" zoomInTitle="Zoomer" zoomOutTitle="Dézoomer" />

      <MapResizer isFullscreen={isFullscreen} />

      {points.map((p) => (
        <Marker
          key={`${viewType}-${p.id}`}
          position={[p.lat as number, p.lng as number]}
          alt={p.name}
          icon={viewType === "tournaments" ? icons.red : icons.gold}
        >
          {/* Marges du recentrage automatique : la bulle ne passe pas sous les boutons posés sur la carte
              (choix Tournois ou Ligues en haut, zoom en bas à droite) */}
          <Popup autoPanPaddingTopLeft={[12, 80]} autoPanPaddingBottomRight={[64, 56]}>
            <div className="flex min-w-48 flex-col gap-1.5 font-bb-sans text-[0.95rem] text-bb-text">
              <strong className="text-base leading-snug break-words">{p.name}</strong>
              <span className="flex items-center gap-1.5 text-sm text-bb-text-muted">
                <MapPin size={14} aria-hidden="true" className="shrink-0" /> {p.location || p.ville || "Lieu inconnu"}
              </span>
              {p.date && (
                <span className="flex items-center gap-1.5 text-sm text-bb-text-muted">
                  <Calendar size={14} aria-hidden="true" className="shrink-0" /> {new Date(p.date).toLocaleDateString("fr-FR")}
                </span>
              )}
              <a
                href={viewType === "tournaments" ? (p.topic?.id ? `/forum/topic/${p.topic.id}` : "/tournois") : `/ligue/${p.id}`}
                className="mt-1 inline-flex min-h-11 items-center justify-center self-start rounded-bb-md bg-bb-accent px-4 text-sm font-bold text-bb-on-accent! no-underline hover:opacity-90"
              >
                Détails
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
