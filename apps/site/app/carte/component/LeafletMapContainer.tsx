"use client";

/**
 * Carte OpenStreetMap de la page `/carte` (bibliothèque Leaflet, par react-leaflet), refaite à la carte 094.
 * Chaque point est un repère ; un appui ouvre une bulle avec le nom, le lieu, la date (tournoi) et le lien « Détails »
 * vers le sujet du tournoi ou la fiche de la ligue. Plusieurs points au même endroit partagent un repère, dont la bulle
 * les liste tous. Les boutons de zoom sont en bas à droite, à portée de pouce.
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
  /**
   * Petite carte posée dans une page (accueil du membre, carte 210) : cadrée sur ses points, sans zoom à la molette
   * (la molette doit faire défiler la page, pas la carte). Désactivé par défaut : la page `/carte` ne change pas.
   */
  compact?: boolean;
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

/** Cadre la carte sur ses points (petite carte `compact`) ; un seul point garde un zoom de ville. */
function FitToPoints({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    const located = points.filter((p) => p.lat !== null && p.lng !== null);
    if (located.length === 0) return;
    const bounds = L.latLngBounds(located.map((p) => [p.lat as number, p.lng as number] as [number, number]));
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 10 });
  }, [map, points]);
  return null;
}

const placeOf = (p: MapPoint) => p.location || p.ville || "Lieu inconnu";
const hrefOf = (p: MapPoint, viewType: LeafletMapProps["viewType"]) =>
  viewType === "tournaments" ? (p.topic?.id ? `/forum/topic/${p.topic.id}` : "/tournois") : `/ligue/${p.id}`;

/**
 * Regroupe les points posés au même endroit (mêmes coordonnées, à environ un mètre près) : sinon, les repères se
 * superposent et un seul reste cliquable. L'ordre d'arrivée (par date pour les tournois) est gardé.
 */
function groupByPlace(points: MapPoint[]): MapPoint[][] {
  const groups = new Map<string, MapPoint[]>();
  for (const p of points) {
    if (p.lat === null || p.lng === null) continue;
    const key = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
    const group = groups.get(key);
    if (group) group.push(p);
    else groups.set(key, [p]);
  }
  return [...groups.values()];
}

export default function LeafletMapContainer({ points, viewType, isFullscreen = false, compact = false }: LeafletMapProps) {
  // Ce fichier n'est chargé que dans le navigateur (import dynamique sans rendu serveur) : Leaflet y est disponible
  const icons = useMemo(() => ({ red: markerIcon("red"), gold: markerIcon("gold") }), []);

  return (
    <MapContainer center={[46.2276, 2.2137]} zoom={6} zoomControl={false} scrollWheelZoom={!compact} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" zoomInTitle="Zoomer" zoomOutTitle="Dézoomer" />

      <MapResizer isFullscreen={isFullscreen} />
      {compact && <FitToPoints points={points} />}

      {groupByPlace(points).map((group) => {
        const first = group[0];
        const several = group.length > 1;
        return (
          <Marker
            key={`${viewType}-${first.id}`}
            position={[first.lat as number, first.lng as number]}
            alt={several ? `${group.length} ${viewType === "tournaments" ? "tournois" : "ligues"} à ${placeOf(first)}` : first.name}
            icon={viewType === "tournaments" ? icons.red : icons.gold}
          >
            {/* Marges du recentrage automatique : la bulle ne passe pas sous les boutons posés sur la carte
                (choix Tournois ou Ligues en haut, zoom en bas à droite) */}
            <Popup autoPanPaddingTopLeft={[12, 80]} autoPanPaddingBottomRight={[64, 56]}>
              {several ? (
                // Plusieurs tournois (ou ligues) au même endroit : la bulle les liste tous (revue 221)
                <div className="flex max-h-72 min-w-56 flex-col overflow-y-auto font-bb-sans text-[0.95rem] text-bb-text">
                  <p className="m-0! pb-1 text-sm text-bb-text-muted">
                    {group.length} {viewType === "tournaments" ? "tournois" : "ligues"} à {placeOf(first)}
                  </p>
                  <ul className="m-0 list-none p-0">
                    {group.map((p) => (
                      <li key={p.id} className="border-t border-bb-border">
                        <a href={hrefOf(p, viewType)} className="flex min-h-11 flex-col justify-center py-1.5 text-bb-text! no-underline hover:underline">
                          <span className="leading-snug font-semibold break-words">{p.name}</span>
                          {p.date && <span className="text-sm text-bb-text-muted">{new Date(p.date).toLocaleDateString("fr-FR")}</span>}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex min-w-48 flex-col gap-1.5 font-bb-sans text-[0.95rem] text-bb-text">
                  <strong className="text-base leading-snug break-words">{first.name}</strong>
                  <span className="flex items-center gap-1.5 text-sm text-bb-text-muted">
                    <MapPin size={14} aria-hidden="true" className="shrink-0" /> {placeOf(first)}
                  </span>
                  {first.date && (
                    <span className="flex items-center gap-1.5 text-sm text-bb-text-muted">
                      <Calendar size={14} aria-hidden="true" className="shrink-0" /> {new Date(first.date).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                  <a
                    href={hrefOf(first, viewType)}
                    className="mt-1 inline-flex min-h-11 items-center justify-center self-start rounded-bb-md bg-bb-accent px-4 text-sm font-bold text-bb-on-accent! no-underline hover:opacity-90"
                  >
                    Détails
                  </a>
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
