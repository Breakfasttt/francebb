/*
  Composant générique pour afficher un état vide (pas de résultats, pas de données, etc.)
*/
import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: 'card' | 'ghost'; // 'card' (par défaut) utilise PremiumCard, 'ghost' est transparent
}

import PremiumCard from '../PremiumCard/PremiumCard';

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  action, 
  className = '',
  variant = 'card'
}) => {
  const content = (
    <div className={`empty-state-content ${className}`}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );

  if (variant === 'ghost') {
    return content;
  }

  return (
    <PremiumCard className="empty-state-card">
      {content}
    </PremiumCard>
  );
};

export default EmptyState;
