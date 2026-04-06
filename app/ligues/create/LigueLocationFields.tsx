"use client";

import { useState, useEffect } from "react";
import { ReferenceData } from "@/prisma/generated-client";
import { DEPARTMENTS_BY_REGION, REGION_BY_DEPARTMENT } from "@/lib/france";

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
  
  // Filtrer les départements en fonction de la région sélectionnée
  const filteredDepartments = selectedRegion 
    ? allDepartments.filter(d => {
        // La clé du département est par exemple "01"
        const regionForDept = REGION_BY_DEPARTMENT[d.key];
        return regionForDept === selectedRegion;
      })
    : allDepartments;

  // Si l'utilisateur sélectionne un département alors que le filtre région est actif,
  // ou l'inverse, on s'assure de la cohérence.
  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDept(val);
    
    // Si on a sélectionné un département et qu'aucune région n'est sélectionnée,
    // on peut tenter de présélectionner la région correspondante.
    if (val && !selectedRegion) {
        // Trouver la clé du département à partir du label (attention: val est le label ici pour l'action)
        // Mais le composant reçoit allDepartments qui sont des ReferenceData
        const deptObj = allDepartments.find(d => d.label === val);
        if (deptObj) {
            const correspondingRegion = REGION_BY_DEPARTMENT[deptObj.key];
            if (correspondingRegion) {
                // On ne force pas forcément le changement de région si déjà filtré, 
                // mais ici c'est utile si l'utilisateur commence par le département.
            }
        }
    }
  };

  return (
    <>
      <div className="form-group">
        <label>Zone Géographique (NAF/Téléphone) *</label>
        <select name="geographicalZone" required className="admin-input">
          <option value="">Sélectionner une zone</option>
          {coachRegions.map((r: any) => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Ville siège</label>
        <input type="text" name="ville" className="admin-input" placeholder="Ex: Lyon" />
      </div>

      {/* Région administrative avant Département comme demandé */}
      <div className="form-group">
        <label>Région administrative</label>
        <select 
            name="region" 
            className="admin-input"
            value={selectedRegion}
            onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedDept(""); // Reset dept selection on region change
            }}
        >
          <option value="">Toutes les régions</option>
          {franceRegions.map((r: any) => (
             <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Département</label>
        <select 
            name="departement" 
            className="admin-input"
            value={selectedDept}
            onChange={handleDeptChange}
        >
          <option value="">Sélectionner</option>
          {filteredDepartments.map((d: any) => (
             <option key={d.key} value={d.label}>{d.label}</option>
          ))}
        </select>
      </div>
    </>
  );
}
