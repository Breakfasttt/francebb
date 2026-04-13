"use client";

import { useState } from "react";
import { ReferenceData } from "@/prisma/generated-client";
import { DEPARTMENTS_BY_REGION, REGION_BY_DEPARTMENT } from "@/lib/france";
import { Map, Save, Globe, Check } from "lucide-react";
import dynamic from "next/dynamic";
import Modal from "@/common/components/Modal/Modal";
import ClassicSelect from "@/common/components/Form/ClassicSelect";

const MapPicker = dynamic(() => import("../../forum/component/MapPicker"), { 
  ssr: false,
  loading: () => <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}>Chargement de la carte...</div>
});

interface LigueLocationFieldsProps {
  coachRegions: any[];
  franceRegions: any[];
  allDepartments: any[];
}

export default function LigueLocationFields({ 
  coachRegions, 
  franceRegions, 
  allDepartments 
}: LigueLocationFieldsProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Filtrer les départements en fonction de la région sélectionnée
  const filteredDepartments = selectedRegion 
    ? allDepartments.filter(d => {
        const regionForDept = REGION_BY_DEPARTMENT[d.key];
        return regionForDept === selectedRegion;
      })
    : allDepartments;

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDept(val);
  };

  return (
    <>
      <input type="hidden" name="lat" value={lat ?? ""} />
      <input type="hidden" name="lng" value={lng ?? ""} />

      <ClassicSelect 
        label="Zone Géographique (NAF/Téléphone) *" 
        name="geographicalZone" 
        required
      >
        <option value="">Sélectionner une zone</option>
        {coachRegions.map((r: any) => (
          <option key={r.key} value={r.key}>{r.label}</option>
        ))}
      </ClassicSelect>

      <div className="form-group">
        <label>Ville siège</label>
        <input type="text" name="ville" className="admin-input" placeholder="Ex: Lyon" />
      </div>

      <ClassicSelect 
        label="Région administrative" 
        name="region"
        value={selectedRegion}
        onChange={(e) => {
            setSelectedRegion(e.target.value);
            setSelectedDept("");
        }}
      >
        <option value="">Toutes les régions</option>
        {franceRegions.map((r: any) => (
           <option key={r.key} value={r.key}>{r.label}</option>
        ))}
      </ClassicSelect>

      <ClassicSelect 
        label="Département" 
        name="departement"
        value={selectedDept}
        onChange={handleDeptChange}
      >
        <option value="">Sélectionner</option>
        {filteredDepartments.map((d: any) => (
           <option key={d.key} value={d.label}>{d.label}</option>
        ))}
      </ClassicSelect>

      <div className="form-group" style={{ gridColumn: 'span 2' }}>
        <label>Lieu habituel / Adresse exacte</label>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input 
              type="text" 
              name="address" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: 5 rue de la Paix, Paris" 
              className="admin-input" 
              style={{ paddingLeft: '2.8rem' }} 
            />
            <Map size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
          </div>
          <button 
            type="button" 
            onClick={() => setIsMapModalOpen(true)}
            className="map-open-btn"
            title="Choisir sur la carte"
          >
            <Globe size={20} />
            <span>Choisir sur la carte</span>
          </button>
        </div>
        {(lat && lng) && (
          <p style={{ fontSize: '0.75rem', color: 'var(--success, #22c55e)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Check size={14} /> Localisation précise définie ({lat.toFixed(5)}, {lng.toFixed(5)})
          </p>
        )}
      </div>


      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title="Localisation de la ligue"
        hideFooter={true}
        maxWidth="800px"
      >
        <MapPicker 
          initialCenter={lat && lng ? [lat, lng] : undefined}
          initialSearch={address}
          onSelect={(newLat, newLng, newAddress) => {
            setLat(newLat);
            setLng(newLng);
            if (newAddress) {
              const parts = newAddress.split(',');
              const shortAddress = parts.slice(0, 3).join(',').trim();
              setAddress(shortAddress);
            }
            setIsMapModalOpen(false);
          }}
          onCancel={() => setIsMapModalOpen(false)}
        />
      </Modal>

      <style jsx>{`
        .admin-input {
          width: 100%;
          padding: 0.9rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          color: var(--foreground);
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }

        .admin-input:focus { border-color: var(--primary); background: var(--background); }
        
        .map-open-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--foreground);
          padding: 0 1.2rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .map-open-btn:hover {
          background: var(--primary-transparent);
          border-color: var(--primary);
          color: var(--primary);
        }

        @media (max-width: 600px) {
          .map-open-btn span { display: none; }
          .map-open-btn { padding: 0 1rem; }
        }
      `}</style>
    </>
  );
}
