"use client";

import React, { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { useIsMobile } from "@/common/hooks/useIsMobile";
import Button from "@/common/components/Button/Button";
import "./MobileFilterWrapper.css";

interface MobileFilterWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string; // Appliqué sur le wrapper en Desktop
}

export default function MobileFilterWrapper({ 
  children, 
  title = "Filtres", 
  className = "" 
}: MobileFilterWrapperProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Empêcher le scroll du body quand le bottom-sheet est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Desktop render
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  // Mobile Render (FAB + Bottom Sheet)
  return (
    <>
      {/* FAB: Bouton Flottant ou Fixe (position sticky ou absolute en CSS) */}
      <button 
        className="mobile-filter-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir les filtres"
      >
        <Filter size={24} />
      </button>

      {/* Overlay & Bottom Sheet */}
      <div 
        className={`mobile-filter-overlay ${isOpen ? "open" : ""}`} 
        onClick={() => setIsOpen(false)} 
      />
      
      <div className={`mobile-filter-bottom-sheet ${isOpen ? "open" : ""}`}>
        <div className="bottom-sheet-header">
          <h3>{title}</h3>
          <button className="bottom-sheet-close" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="bottom-sheet-content">
          {children}
        </div>
        <div className="bottom-sheet-footer">
          <Button variant="cta" onClick={() => setIsOpen(false)} style={{ width: "100%" }}>
            Appliquer les filtres
          </Button>
        </div>
      </div>
    </>
  );
}
