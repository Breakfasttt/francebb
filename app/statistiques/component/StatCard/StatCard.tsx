/**
 * Composant de carte de statistique pour le dashboard.
 */
import React from 'react';
import './StatCard.css';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  description?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'admin';
}

export default function StatCard({ 
  label, 
  value, 
  icon, 
  trend, 
  description,
  variant = 'primary'
}: StatCardProps) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon">
          {icon}
        </div>
        {trend && (
          <div className={`stat-card-trend ${trend.isUp ? 'up' : 'down'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>
      
      <div className="stat-card-body">
        <h3 className="stat-card-value">{value}</h3>
        <p className="stat-card-label">{label}</p>
      </div>

      {description && (
        <div className="stat-card-footer">
          <p className="stat-card-desc">{description}</p>
        </div>
      )}
    </div>
  );
}
