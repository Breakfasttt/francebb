"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Calendar } from "lucide-react";

interface LeafletMapProps {
  points: any[];
  viewType: "tournaments" | "ligues";
}

export default function LeafletMapContainer({ points, viewType }: LeafletMapProps) {
  const [icons, setIcons] = useState<any>(null);

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

    // Correction icône par défaut
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    setIcons({ red, gold });
  }, []);

  const center: [number, number] = [46.603354, 1.888334];

  if (!icons) return null;

  return (
    <MapContainer 
      center={center} 
      zoom={6} 
      style={{ height: "100%", width: "100%", borderRadius: "24px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {points.map((p) => (
        <Marker 
          key={`${viewType}-${p.id}`} 
          position={[p.lat, p.lng]} 
          icon={viewType === "tournaments" ? icons.red : icons.gold}
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
                    href={viewType === "tournaments" ? `/tournaments/${p.id}` : `/ligues/${p.id}`} 
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
  );
}

