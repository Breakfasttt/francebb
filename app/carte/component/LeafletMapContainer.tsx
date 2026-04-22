"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Calendar } from "lucide-react";

interface LeafletMapProps {
  points: any[];
  viewType: "tournaments" | "ligues";
  isFullscreen?: boolean;
}

// Composant interne pour corriger le bug des zones grises au resize/fullscreen
function MapResizer({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);
    
    // Petit délai pour laisser le CSS s'appliquer
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

export default function LeafletMapContainer({ points, viewType, isFullscreen = false }: LeafletMapProps) {
  const [icons, setIcons] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Initialisation des icônes uniquement côté client
    const red = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const gold = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    setIcons({ red, gold });
    setMapReady(true);
  }, []);

  if (!mapReady) return null;

  return (
    <div className="leaflet-map-outer-wrapper" style={{ 
      height: "100%", 
      width: "100%", 
      borderRadius: isFullscreen ? "0" : "24px",
      overflow: "hidden",
      position: "relative"
    }}>
      <MapContainer 
        center={[46.2276, 2.2137]} 
        zoom={6} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapResizer isFullscreen={isFullscreen} />
        
        {points.map((p) => (
          <Marker 
            key={`${viewType}-${p.id}`} 
            position={[p.lat, p.lng]} 
            icon={icons ? (viewType === "tournaments" ? icons.red : icons.gold) : undefined}
          >
            <Popup>
              <div className="leaflet-popup-content-inner">
                <h4 style={{ margin: "0 0 0.5rem 0", color: "#333", fontWeight: 800 }}>{p.name}</h4>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#666", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                  <MapPin size={14} /> {p.location || p.ville || "Lieu inconnu"}
                </div>
                {p.date && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#666", fontSize: "0.85rem" }}>
                    <Calendar size={14} /> {new Date(p.date).toLocaleDateString("fr-FR")}
                  </div>
                )}
                <div style={{ marginTop: "0.8rem" }}>
                    <a 
                      href={viewType === "tournaments" 
                        ? (p.topic?.id ? `/forum/topic/${p.topic.id}` : `/tournois/${p.id}`) 
                        : `/ligues/${p.id}`} 
                      style={{ background: "#c21d1d", color: "white", padding: "0.4rem 0.8rem", borderRadius: "8px", textDecoration: "none", fontSize: "0.75rem", fontWeight: 800, display: "inline-block" }}
                    >
                      Détails
                    </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

