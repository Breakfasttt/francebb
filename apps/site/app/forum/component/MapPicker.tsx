"use client";

/**
 * Choix du lieu d'un tournoi sur une carte (refonte, carte 089) : recherche d'une adresse (géocodage, c'est-à-dire
 * transformation d'une adresse en coordonnées, par une action serveur), appui sur la carte ou déplacement du repère
 * pour corriger, puis « Valider ce lieu ». Affiché dans le panneau « Localisation du tournoi » du formulaire de
 * tournoi : la carte prend la moitié de la hauteur de l'écran sur téléphone. Carte OpenStreetMap (Leaflet).
 */
import { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Check, Loader2 } from "lucide-react";
import { Button, Input } from "@bbfrance/ui";
import { reverseGeocodeAction, searchAddressAction } from "@/app/ligues/actions";

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
      map.setView(coords, map.getZoom());
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

    // Adresse du point choisi, demandée par une action serveur (le navigateur ne peut pas interroger directement le
    // service de géocodage)
    try {
      const displayName = await reverseGeocodeAction(lat, lng);
      if (displayName) {
        setAddress(displayName);
      }
    } catch (e) {
      console.error("Reverse geocoding error:", e);
    }
  }, []);

  const handleSearchInternal = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    // Coordonnées de l'adresse, demandées par une action serveur
    try {
      const data = await searchAddressAction(query);
      if (data) {
        const { lat, lng, display_name } = data;
        const newCoords: [number, number] = [lat, lng];
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
    // Le formulaire de recherche est affiché dans un panneau, hors du formulaire du tournoi dans la page, mais React
    // remonterait l'envoi jusqu'à lui : on l'arrête ici
    e.stopPropagation();
    handleSearchInternal(searchQuery);
  };

  return (
    <div className="flex w-full flex-col gap-3 pt-1 pb-2">
      <form role="search" aria-label="Rechercher une adresse" className="flex items-stretch gap-2" onSubmit={handleSearch}>
        <div className="relative min-w-0 flex-1">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-bb-text-muted" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une adresse..."
            aria-label="Rechercher une adresse"
            enterKeyHint="search"
            className="pl-10"
          />
        </div>
        {/* Sur téléphone, seule la loupe est affichée ; le nom du bouton reste lu par les lecteurs d'écran */}
        <Button type="submit" variant="primary" size="tap" disabled={isSearching} className="shrink-0 max-lg:w-11 max-lg:px-0">
          {isSearching ? <Loader2 size={18} aria-hidden="true" className="animate-spin" /> : <Search size={18} aria-hidden="true" />}
          <span className="max-lg:sr-only">Rechercher</span>
        </Button>
      </form>

      {/* isolate : les calques de Leaflet (z-index jusqu'à 1000) restent sous le reste du panneau */}
      <div role="group" aria-label="Carte du lieu" className="relative isolate h-[45dvh] min-h-60 overflow-hidden rounded-bb-md border border-bb-border lg:h-[420px]">
        {isMounted && (
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
        )}
      </div>

      <p className="m-0 flex items-start gap-2 rounded-bb-md bg-bb-surface-2 px-3 py-2 text-sm text-bb-text-muted">
        <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
        <span className="min-w-0 break-words">
          {address || (position ? `${position[0].toFixed(5)}, ${position[1].toFixed(5)}` : "Touchez la carte pour choisir un lieu")}
        </span>
      </p>

      <div className="flex flex-col gap-2 lg:flex-row-reverse">
        <Button
          type="button"
          variant="primary"
          size="tap"
          className="w-full lg:w-auto"
          onClick={() => position && onSelect(position[0], position[1], address)}
          disabled={!position}
        >
          <Check size={18} aria-hidden="true" /> Valider ce lieu
        </Button>
        <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
