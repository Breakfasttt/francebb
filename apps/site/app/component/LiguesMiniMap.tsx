"use client";

/**
 * Petite carte de l'accueil : celle des ligues (bloc « Ligues de ta région », carte 210) ou celle des prochains tournois
 * (`viewType="tournaments"`, bloc « Prochains tournois »).
 *
 * Elle n'existe que sur ordinateur : sur téléphone, le bloc garde seulement le lien « Voir les ligues sur la carte ».
 * La bibliothèque de carte (Leaflet) est lourde : elle n'est chargée que lorsque le bloc arrive à l'écran
 * (`IntersectionObserver`), jamais au chargement de l'accueil. La carte reprend `LeafletMapContainer` de `/carte`, en
 * version `compact` (cadrée sur les ligues, sans zoom à la molette). Sans ligue localisée, rien n'est affiché.
 * Les couleurs des bulles et des boutons de zoom suivent le thème, comme sur `/carte` (`leafletTheme`).
 */
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { DESKTOP_QUERY, Skeleton, cn, useMediaQuery } from "@bbfrance/ui";
import type { MapPoint } from "@/app/carte/component/LeafletMapContainer";
import { leafletTheme } from "@/app/carte/component/leafletTheme";

const LeafletMap = dynamic(() => import("@/app/carte/component/LeafletMapContainer"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

export default function LiguesMiniMap({
  points,
  viewType = "ligues",
  className,
}: {
  points: MapPoint[];
  viewType?: "tournaments" | "ligues";
  className?: string;
}) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const frameRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const located = points.filter((point) => point.lat !== null && point.lng !== null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!isDesktop || !frame || visible) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px" });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [isDesktop, visible]);

  if (!isDesktop || located.length === 0) return null;
  return (
    <div ref={frameRef} className={cn("relative isolate min-h-[200px] overflow-hidden bg-bb-surface-2", leafletTheme, className)}>
      {visible && <LeafletMap points={located} viewType={viewType} compact />}
    </div>
  );
}
