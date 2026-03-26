"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, MapPin, Users, Calendar, Trophy, Euro, Home, Pizza, Clock } from "lucide-react";

const DEPT_NAMES: Record<string, string> = {
  "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence", "05": "Hautes-Alpes", "06": "Alpes-Maritimes", "07": "Ardeche", "08": "Ardennes", "09": "Ariege", "10": "Aube", "11": "Aude", "12": "Aveyron", "13": "Bouches-du-Rhone", "14": "Calvados", "15": "Cantal", "16": "Charente", "17": "Charente-Maritime", "18": "Cher", "19": "Correze", "2A": "Corse-du-Sud", "2B": "Haute-Corse", "21": "Cote-d'Or", "22": "Cotes-d'Armor", "23": "Creuse", "24": "Dordogne", "25": "Doubs", "26": "Drome", "27": "Eure", "28": "Eure-et-Loir", "29": "Finistere", "30": "Gard", "31": "Haute-Garonne", "32": "Gers", "33": "Gironde", "34": "Herault", "35": "Ille-et-Vilaine", "36": "Indre", "37": "Indre-et-Loire", "38": "Isere", "39": "Jura", "40": "Landes", "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique", "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne", "48": "Lozere", "49": "Maine-et-Loire", "50": "Manche", "51": "Marne", "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle", "55": "Meuse", "56": "Morbihan", "57": "Moselle", "58": "Nievre", "59": "Nord", "60": "Oise", "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dome", "64": "Pyrenees-Atlantiques", "65": "Hautes-Pyrenees", "66": "Pyrenees-Orientales", "67": "Bas-Rhin", "68": "Haut-Rhin", "69": "Rhone", "70": "Haute-Saone", "71": "Saone-et-Loire", "72": "Sarthe", "73": "Savoie", "74": "Haute-Savoie", "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines", "79": "Deux-Sevres", "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne", "83": "Var", "84": "Vaucluse", "85": "Vendee", "86": "Vienne", "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne", "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis", "94": "Val-de-Marne", "95": "Val-d'Oise"
};

const REGIONS_DEPTS: Record<string, string[]> = {
  "Auvergne-Rhone-Alpes": ["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"],
  "Bourgogne-Franche-Comte": ["21", "25", "39", "58", "70", "71", "89", "90"],
  "Bretagne": ["22", "29", "35", "56"],
  "Centre-Val de Loire": ["18", "28", "36", "37", "41", "45"],
  "Corse": ["2A", "2B"],
  "Grand Est": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"],
  "Hauts-de-France": ["02", "59", "60", "62", "80"],
  "Ile-de-France": ["75", "77", "78", "91", "92", "93", "94", "95"],
  "Normandie": ["14", "27", "50", "61", "76"],
  "Nouvelle-Aquitaine": ["16", "17", "19", "23", "24", "33", "40", "47", "64", "79", "86", "87"],
  "Occitanie": ["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"],
  "Pays de la Loire": ["44", "49", "53", "72", "85"],
  "Provence-Alpes-Cote d'Azur": ["04", "05", "06", "13", "83", "84"]
};

export default function TournamentFilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to update search params
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    router.push(`?${createQueryString(name, value)}`);
  };

  const selectedRegion = searchParams.get("region") || "";
  
  // Get departments based on selected region
  const deptsList = selectedRegion && REGIONS_DEPTS[selectedRegion] 
    ? REGIONS_DEPTS[selectedRegion]
    : Object.values(REGIONS_DEPTS).flat().sort();

  const availableDepts = [
    "Toutes", 
    ...deptsList.map(d => `${d}|${d} - ${DEPT_NAMES[d] || ""}`)
  ];

  const sections = [
    {
      title: "Localisation",
      icon: <MapPin size={18} />,
      filters: [
        { 
          name: "region", 
          label: "Région", 
          type: "select", 
          options: ["Toutes", ...Object.keys(REGIONS_DEPTS).sort()] 
        },
        { 
          name: "dept", 
          label: "Département", 
          type: "select", 
          options: availableDepts 
        },
      ]
    },
    {
      title: "Format & Jeu",
      icon: <Trophy size={18} />,
      filters: [
        { 
          name: "edition", 
          label: "Version du jeu", 
          type: "select", 
          options: ["Toutes", "BB20", "BB25", "Fumbll", "BB2", "BB3/WBB", "BB7", "DB", "Autre"] 
        },
        { 
          name: "ruleset", 
          label: "Règles", 
          type: "select", 
          options: ["Toutes", "Eurobowl", "NAF", "Custom", "DB"] 
        },
        { 
          name: "structure", 
          label: "Structure", 
          type: "select", 
          options: ["Toutes", "Resurrection", "Evolutif"] 
        },
        { 
          name: "days", 
          label: "Durée", 
          type: "select", 
          options: ["Toutes", "1|1j", "2|2j", "3j+|3j+", "Saison Rythme|Saison Rythmée"] 
        },
      ]
    },
    {
      title: "Participants",
      icon: <Users size={18} />,
      filters: [
        { name: "minPlaces", label: "Places min.", type: "number" },
      ]
    },
    {
      title: "Logistique",
      icon: <Home size={18} />,
      filters: [
        { name: "lodging", label: "Logement sur place", type: "checkbox" },
        { name: "meals", label: "Repas compris", type: "checkbox" },
        { name: "friday", label: "Arrivée vendredi", type: "checkbox" },
      ]
    },
    {
      title: "Budget",
      icon: <Euro size={18} />,
      filters: [
        { name: "maxPrice", label: "Prix max (€)", type: "number" },
      ]
    }
  ];

  return (
    <div className="filter-sidebar">
      <button className="reset-btn" onClick={() => router.push("/tournaments")}>Réinitialiser tous les filtres</button>

      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Rechercher par nom..." 
          defaultValue={searchParams.get("query") || ""}
          onChange={(e) => handleFilterChange("query", e.target.value)}
        />
      </div>

      {sections.map((section, i) => (
        <div key={i} className="filter-section">
          <div className="section-header">
            {section.icon}
            <span>{section.title}</span>
          </div>
          <div className="section-content">
            {section.filters.map((filter, j) => (
               <div key={j} className="filter-item">
                 {filter.type === "select" ? (
                   <>
                     <label>{filter.label}</label>
                     <select 
                       value={searchParams.get(filter.name) || "Toutes"}
                       onChange={(e) => handleFilterChange(filter.name, e.target.value === "Toutes" ? "" : e.target.value)}
                     >
                       {(filter as any).options?.map((opt: string) => {
                         const [val, label] = opt.includes('|') ? opt.split('|') : [opt, opt];
                         return <option key={val} value={val}>{label}</option>;
                       })}
                     </select>
                   </>
                 ) : filter.type === "checkbox" ? (
                   <label className="checkbox-label">
                     <input 
                       type="checkbox" 
                       checked={searchParams.get(filter.name) === "true"}
                       onChange={(e) => handleFilterChange(filter.name, e.target.checked ? "true" : "")}
                     />
                     <span>{filter.label}</span>
                   </label>
                 ) : (
                   <>
                     <label>{filter.label}</label>
                     <input 
                       type="number" 
                       placeholder="illimité"
                       value={searchParams.get(filter.name) || ""}
                       onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                     />
                   </>
                 )}
               </div>
            ))}
          </div>
        </div>
      ))}

      {/* Reset button removed from here */}

      <style jsx>{`
        .filter-sidebar {
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: fit-content;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
        }

        .search-box input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.8rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: var(--foreground);
          outline: none;
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          color: var(--accent);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 1px;
        }

        .section-content {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .filter-item label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .filter-item select, .filter-item input[type="number"] {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 6px;
          padding: 0.5rem;
          color: var(--foreground);
          outline: none;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          cursor: pointer;
          color: var(--foreground);
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
        }

        .reset-btn {
          margin-bottom: 0.5rem;
          padding: 0.8rem;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .reset-btn:hover {
          background: rgba(255,50,50,0.1);
          border-color: rgba(255,50,50,0.2);
          color: #ff5555;
        }

        .filter-item input[type="number"]:focus {
          border-color: var(--primary);
          background: var(--glass-bg);
          filter: brightness(1.2);
        }
      `}</style>
    </div>
  );
}
