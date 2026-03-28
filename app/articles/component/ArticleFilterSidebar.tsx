"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search, Tag, User, Clock, ArrowDownAz } from "lucide-react";
import "./ArticleFilterSidebar.css";

interface ArticleFilterSidebarProps {
  availableTags: string[];
}

export default function ArticleFilterSidebar({ availableTags }: ArticleFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete("page"); // Reset page on filter change
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    router.push(`?${createQueryString(name, value)}`);
  };

  const sections = [
    {
      title: "Filtrer par Tag",
      icon: <Tag size={18} />,
      name: "tag",
      type: "select",
      options: ["Tous les tags", ...availableTags]
    },
    {
      title: "Auteur",
      icon: <User size={18} />,
      name: "author",
      type: "text",
      placeholder: "Nom de l'auteur..."
    },
    {
      title: "Tri",
      icon: <ArrowDownAz size={18} />,
      name: "sort",
      type: "select",
      options: [
        "date_desc|Plus récents",
        "date_asc|Plus anciens",
        "title_asc|Titre (A-Z)",
        "reactions_desc|Plus populaires"
      ]
    }
  ];

  return (
    <div className="filter-sidebar">
      <button className="reset-btn" onClick={() => router.push("/articles")}>Réinitialiser filtres</button>

      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Rechercher par titre..." 
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
            <div className="filter-item">
              {section.type === "select" ? (
                <select 
                  value={searchParams.get(section.name) || (section.options![0].includes('|') ? section.options![0].split('|')[0] : section.options![0])}
                  onChange={(e) => handleFilterChange(section.name, e.target.value === "Tous les tags" ? "" : e.target.value)}
                >
                  {section.options?.map((opt: string) => {
                    const [val, label] = opt.includes('|') ? opt.split('|') : [opt, opt];
                    return <option key={val} value={val}>{label}</option>;
                  })}
                </select>
              ) : (
                <input 
                  type="text" 
                  placeholder={section.placeholder}
                  value={searchParams.get(section.name) || ""}
                  onChange={(e) => handleFilterChange(section.name, e.target.value)}
                />
              )}
            </div>
          </div>
        </div>
      ))}
      
      <div className="filter-section">
        <div className="section-header">
          <Clock size={18} />
          <span>Vue</span>
        </div>
        <div className="section-content">
          <div className="view-toggle">
            <button 
              className={searchParams.get("view") !== "list" ? "active" : ""} 
              onClick={() => handleFilterChange("view", "grid")}
            >Grille</button>
            <button 
              className={searchParams.get("view") === "list" ? "active" : ""} 
              onClick={() => handleFilterChange("view", "list")}
            >Liste</button>
          </div>
        </div>
      </div>
    </div>
  );
}
