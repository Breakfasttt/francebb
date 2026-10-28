/**
 * Composant de badge de statut thémable.
 * Utilisé pour afficher les rôles, les états ou des alertes/succès.
 */
import React from 'react';
import './StatusBadge.css';

export type BadgeVariant = 'admin' | 'moderator' | 'coach' | 'banned' | 'success' | 'warning' | 'info' | 'primary' | 'secondary' | 'accent' | 'default';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '',
  icon 
}) => {
  return (
    <span className={`status-badge ${variant} ${className}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      <span className="badge-text">{children}</span>
    </span>
  );
};

export default StatusBadge;
