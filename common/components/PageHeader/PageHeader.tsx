"use client";

import React, { ReactNode, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import BackButton from '@/common/components/BackButton/BackButton';
import './PageHeader.css';
import './PageHeader-mobile.css';


interface PageHeaderProps {
  /** Le titre principal de la page */
  title: ReactNode;
  /** Un sous-titre optionnel */
  subtitle?: ReactNode;
  /** Le lien de retour. Si omis, utilisera router.back(). Si défini sur null, n'affiche pas de bouton. */
  backHref?: string | null;
  /** Titre au survol du BackButton */
  backTitle?: string;
  /** Style inline pour le header */
  style?: React.CSSProperties;
  /** Classes CSS supplémentaires */
  className?: string;
  /** Contenu optionnel à afficher à droite, ou en dessous (boutons d'action, filtres) */
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backTitle = "Retour",
  style,
  className = '',
  children
}: PageHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [targetSlot, setTargetSlot] = useState<Element | null>(null);

  useEffect(() => {
    setMounted(true);
    const slot = document.getElementById('mobile-back-button-slot');
    setTargetSlot(slot);
  }, []);

  const backButtonContent = backHref !== null ? (
    <div className="page-header-back-wrapper">
      <BackButton 
        href={backHref} 
        title={backTitle} 
      />
    </div>
  ) : null;

  return (
    <header className={`page-header-container ${className}`.trim()} style={style}>
      {backButtonContent && (
        <>
          {mounted && targetSlot && window.innerWidth <= 1024 ? (
            createPortal(backButtonContent, targetSlot)
          ) : (
            backButtonContent
          )}
        </>
      )}
      
      <div className="page-header-content">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      
      {children && (
        <div className="page-header-actions">
          {children}
        </div>
      )}
    </header>
  );
}
