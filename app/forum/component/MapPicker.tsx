"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Check, X, Loader2 } from "lucide-react";
import CTAButton from "@/common/components/Button/CTAButton";
import ClassicButton from "@/common/components/Button/ClassicButton";

/**
 * Composant interne pour gérer les clics sur la carte
 */
function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Composant interne pour recadrer la carte
 */
function MapRecenter({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 16);
    }
  }, [coords, map]);
  return null;
}

interface MapPickerProps {
  initialCenter?: [number, number];
  initialSearch?: string;
  onSelect: (lat: number, lng: number, address?: string) => void;
  onCancel: () => void;
}

export default function MapPicker({ initialCenter, initialSearch, onSelect, onCancel }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(initialCenter || null);
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [isSearching, setIsSearching] = useState(false);
  const [address, setAddress] = useState("");

  const center: [number, number] = useMemo(() => initialCenter || [46.603354, 1.888334], [initialCenter]);

  // Si on n'a pas de position initiale mais qu'on a une recherche, on lance la recherche au montage
  useEffect(() => {
    if (!initialCenter && initialSearch) {
      handleSearchInternal(initialSearch);
    }
  }, [initialCenter, initialSearch]);

  // Correction icône par défaut
  useEffect(() => {
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    
    // Reverse geocoding
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { "User-Agent": "BBFrance-App" }
      });
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (e) {
      console.error("Reverse geocoding error:", e);
    }
  }, []);

  const handleSearchInternal = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
        headers: { "User-Agent": "BBFrance-App" }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCoords: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setPosition(newCoords);
        setAddress(display_name);
      }
    } catch (e) {
      console.error("Search geocoding error:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchInternal(searchQuery);
  };

  return (
    <div className="map-picker-container">
      <form className="map-search-bar" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Rechercher une adresse..." 
            className="search-input"
          />
        </div>
        <CTAButton type="submit" isLoading={isSearching} style={{ height: 'auto', minWidth: '120px' }}>
          Rechercher
        </CTAButton>
      </form>

      <div className="map-wrapper">
        <MapContainer 
          center={center} 
          zoom={initialCenter ? 16 : 6} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onClick={handleMapClick} />
          {position && <Marker position={position} draggable={true} eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const pos = marker.getLatLng();
              handleMapClick(pos.lat, pos.lng);
            }
          }} />}
          {position && <MapRecenter coords={position} />}
        </MapContainer>
      </div>

      <div className="map-picker-footer">
        <div className="selected-address">
          <MapPin size={16} />
          <span className="address-text">{address || (position ? `${position[0].toFixed(5)}, ${position[1].toFixed(5)}` : "Cliquez sur la carte pour choisir un lieu")}</span>
        </div>
        <div className="picker-actions">
          <ClassicButton onClick={onCancel} icon={X}>
            Annuler
          </ClassicButton>
          <CTAButton 
            onClick={() => position && onSelect(position[0], position[1], address)} 
            disabled={!position}
            icon={Check}
          >
            Valider ce lieu
          </CTAButton>
        </div>
      </div>

      <style jsx>{`
        .map-picker-container {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          height: 550px;
          width: 100%;
          min-width: 600px;
        }

        .map-search-bar {
          display: flex;
          gap: 0.8rem;
          align-items: stretch;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          z-index: 2;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.8rem;
          background: var(--input-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          color: var(--foreground);
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }
        
        .search-input:focus {
          border-color: var(--primary);
          background: var(--background);
          box-shadow: 0 0 0 3px var(--primary-transparent);
        }

        .map-wrapper {
          flex: 1;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--glass-border);
          position: relative;
          z-index: 1;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
        }

        .map-picker-footer {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--glass-border);
        }

        .selected-address {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          background: var(--glass-bg);
          padding: 0.8rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
        }

        .address-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
        }

        .picker-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .map-picker-container {
             min-width: 100%;
             height: 600px;
          }
          .picker-actions {
            flex-direction: column-reverse;
          }
          .picker-actions :global(button) {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
