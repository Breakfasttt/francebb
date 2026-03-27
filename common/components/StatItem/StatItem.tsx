/**
 * Composant d'affichage de statistique (Label + Valeur).
 * Utilisé dans les profils, listes de membres, etc.
 */
import React from 'react';
import './StatItem.css';

interface StatItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'vertical' | 'horizontal';
}

const StatItem: React.FC<StatItemProps> = ({ 
  label, 
  value, 
  icon, 
  className = '',
  variant = 'vertical'
}) => {
  return (
    <div className={`stat-item-container ${variant} ${className}`}>
      {icon && <span className="stat-icon">{icon}</span>}
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
};

export default StatItem;
