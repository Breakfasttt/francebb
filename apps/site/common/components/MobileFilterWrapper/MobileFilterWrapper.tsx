"use client";

/**
 * Bouton flottant de filtres (téléphone).
 * Sur téléphone : un bouton rond (entonnoir) ouvre un panneau par le bas qui contient les filtres.
 * Sur ordinateur : les filtres s'affichent normalement, dans une simple <div className={className}>,
 * ou ne s'affichent pas du tout avec `mobileOnly` (quand la page a déjà sa colonne de filtres sur ordinateur).
 */

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Filter, X } from "lucide-react";
import { MOBILE_BREAKPOINT, useIsMobile } from "@/common/hooks/useIsMobile";
import Button from "@/common/components/Button/Button";
import "./MobileFilterWrapper.css";

interface MobileFilterWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string; // Appliqué sur le wrapper en Desktop
  /** N'affiche rien sur ordinateur (la page affiche déjà ses filtres ailleurs). */
  mobileOnly?: boolean;
  /** Largeur d'écran (en pixels) jusqu'à laquelle on passe au bouton flottant : le seuil commun (1024) par défaut. */
  breakpoint?: number;
}

export default function MobileFilterWrapper({
  children,
  title = "Filtres",
  className = "",
  mobileOnly = false,
  breakpoint = MOBILE_BREAKPOINT
}: MobileFilterWrapperProps) {
  const isMobile = useIsMobile(breakpoint);
  const [isOpenState, setIsOpen] = useState(false);
  // Le panneau n'est jamais ouvert en affichage ordinateur (écran agrandi, rotation de tablette…)
  const isOpen = isOpenState && isMobile;

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
    if (mobileOnly) return null;
    return <div className={className}>{children}</div>;
  }

  // Mobile Render (FAB + Bottom Sheet)
  // Rendu dans <body> : un parent masqué sur téléphone ou en verre dépoli (backdrop-filter)
  // empêcherait sinon le bouton et le panneau de rester fixés à l'écran.
  return createPortal(
    <>
      {/* FAB: Bouton Flottant ou Fixe (position sticky ou absolute en CSS) */}
      <button
        type="button"
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

      <div
        className={`mobile-filter-bottom-sheet ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-label={title}
        aria-hidden={!isOpen}
      >
        <div className="bottom-sheet-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="bottom-sheet-close"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer les filtres"
          >
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
    </>,
    document.body
  );
}
