"use client";

/**
 * Carte interactive de `/carte` (refonte, carte 094, ADR 0006).
 * - Sur téléphone, la carte occupe tout l'écran entre la barre du haut et la barre de navigation du bas.
 * - Sur ordinateur, elle remplit la page sous le titre.
 * Par-dessus la carte : en haut à gauche, le choix entre les tournois à venir et les ligues ; en haut à droite, le
 * bouton « Plein écran » ; en bas à gauche, le nombre de points affichés. En plein écran, la carte couvre tout l'écran
 * (attribut `data-fullscreen`, qui retire aussi la barre du bas du téléphone, voir AppShell.css).
 *
 * La bibliothèque Leaflet a sa propre feuille de style (leaflet.css), qui l'emporte sur les classes du site : les
 * réglages de ses éléments (bulle, boutons de zoom, repères) sont donc écrits plus bas avec le suffixe « ! »
 * (priorité forcée).
 */
import { useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Maximize2, Minimize2, Shield, Trophy } from "lucide-react";
import { Button, Skeleton, cn } from "@bbfrance/ui";
import type { MapPoint } from "./LeafletMapContainer";

// Import dynamique : Leaflet a besoin de l'objet `window` du navigateur
const LeafletMap = dynamic(() => import("./LeafletMapContainer"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

interface CarteProps {
  initialTournaments: MapPoint[];
  initialLigues: MapPoint[];
}

/**
 * Habillage des éléments de Leaflet aux couleurs du thème :
 * - la bulle d'un repère et sa pointe ;
 * - les boutons de zoom, et sur téléphone leur taille de 44 pixels ;
 * - la croix de la bulle, à 44 pixels sur téléphone ;
 * - sur téléphone, la zone qui réagit au toucher autour d'un repère : l'image ne mesure que 25 × 41 pixels, une marge
 *   intérieure de 10 pixels l'agrandit et le décalage `translate` remet l'image exactement à sa place.
 */
const leafletTheme = cn(
  "[&_.leaflet-container]:font-bb-sans! [&_.leaflet-container]:bg-bb-surface-2!",
  "[&_.leaflet-popup-content-wrapper]:bg-bb-surface! [&_.leaflet-popup-content-wrapper]:text-bb-text! [&_.leaflet-popup-content-wrapper]:rounded-bb-md! [&_.leaflet-popup-tip]:bg-bb-surface!",
  "[&_.leaflet-bar]:border-bb-border! [&_.leaflet-bar_a]:bg-bb-surface! [&_.leaflet-bar_a]:text-bb-text! [&_.leaflet-bar_a]:border-bb-border!",
  "[&_a.leaflet-popup-close-button]:text-bb-text-muted!",
  "max-lg:[&_.leaflet-bar_a]:size-11! max-lg:[&_.leaflet-bar_a]:text-2xl! max-lg:[&_.leaflet-bar_a]:leading-[44px]!",
  "max-lg:[&_a.leaflet-popup-close-button]:size-11! max-lg:[&_a.leaflet-popup-close-button]:text-2xl! max-lg:[&_a.leaflet-popup-close-button]:leading-[44px]! max-lg:[&_.leaflet-popup-content]:mr-11!",
  "max-lg:[&_img.leaflet-marker-icon]:box-content! max-lg:[&_img.leaflet-marker-icon]:p-2.5! max-lg:[&_img.leaflet-marker-icon]:[translate:-10px_-10px]"
);

export default function CarteClient({ initialTournaments, initialLigues }: CarteProps) {
  const [view, setView] = useState<"tournaments" | "ligues">("tournaments");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tournaments = useMemo(() => initialTournaments.filter((p) => p.lat && p.lng), [initialTournaments]);
  const ligues = useMemo(() => initialLigues.filter((p) => p.lat && p.lng), [initialLigues]);
  const points = view === "tournaments" ? tournaments : ligues;

  const legend = view === "tournaments"
    ? (points.length ? `${points.length} tournoi${points.length > 1 ? "s" : ""} à venir sur la carte` : "Aucun tournoi à venir placé sur la carte")
    : (points.length ? `${points.length} ligue${points.length > 1 ? "s" : ""} sur la carte` : "Aucune ligue placée sur la carte");

  const choice = (value: "tournaments" | "ligues", label: string, count: number, icon: ReactNode) => (
    <Button
      type="button"
      variant="quiet"
      size="tap"
      aria-pressed={view === value}
      onClick={() => setView(value)}
      className={cn("rounded-full px-3 text-sm", view === value ? "bg-bb-accent text-bb-on-accent hover:bg-bb-accent" : "text-bb-text-muted")}
    >
      {icon}
      {label} ({count})
    </Button>
  );

  return (
    <div
      data-fullscreen={isFullscreen ? "" : undefined}
      className={cn(
        // isolate : les calques de Leaflet (jusqu'à 1000) restent sous la barre du haut et les panneaux du site
        "relative isolate overflow-hidden bg-bb-surface-2",
        isFullscreen
          ? "fixed inset-0 z-[6500]"
          : "max-lg:-mx-3 max-lg:h-[calc(100dvh-57px-var(--app-bottom-nav-space))] lg:h-[calc(100dvh-13.5rem)] lg:min-h-[460px] lg:rounded-bb-lg lg:border lg:border-bb-border",
        leafletTheme
      )}
    >
      <LeafletMap points={points} viewType={view} isFullscreen={isFullscreen} />

      {/* pointer-events-none : la bande des boutons ne bloque pas la carte entre eux */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1100] flex items-start justify-between gap-2 p-3">
        <div role="group" aria-label="Points affichés" className="pointer-events-auto flex gap-0.5 rounded-full border border-bb-border bg-bb-surface p-0.5 shadow-bb">
          {choice("tournaments", "Tournois", tournaments.length, <Trophy size={16} aria-hidden="true" />)}
          {choice("ligues", "Ligues", ligues.length, <Shield size={16} aria-hidden="true" />)}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="tap-icon"
          aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="pointer-events-auto shrink-0 rounded-full shadow-bb"
        >
          {isFullscreen ? <Minimize2 size={20} aria-hidden="true" /> : <Maximize2 size={20} aria-hidden="true" />}
        </Button>
      </div>

      <p aria-live="polite" className="pointer-events-none absolute bottom-3 left-3 z-[1100] m-0 max-w-[calc(100%-6rem)] rounded-full border border-bb-border bg-bb-surface px-3 py-1.5 text-sm font-semibold text-bb-text shadow-bb">
        {legend}
      </p>
    </div>
  );
}
