import React, { ReactNode } from 'react';
import BackButton from '@/common/components/BackButton/BackButton';
import './PageHeader.css';
import './PageHeader-mobile.css';


interface PageHeaderProps {
  /** Le titre principal de la page */
  title: ReactNode;
  /** Un sous-titre optionnel */
  subtitle?: ReactNode;
  /** Le lien de retour. Si défini, affiche le BackButton à gauche. */
  backHref?: string;
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
  return (
    <header className={`page-header-container ${className}`.trim()} style={style}>
      {backHref && (
        <div className="page-header-back-wrapper">
          <BackButton 
            href={backHref} 
            title={backTitle} 
          />
        </div>
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
