/**
 * Système d'onglets flexible.
 * Supporte les modes vertical (sidebar), horizontal, et "docked" (profil).
 */
import React from 'react';
import './TabSystem.css';
import Tooltip from '@/common/components/Tooltip/Tooltip';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabSystemProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  variant?: 'standard' | 'sidebar' | 'docked-sidebar' | 'docked-sidebar-left';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  showLabels?: boolean; // Utile pour le mode docked-sidebar qui ne montre que les icônes
}

const TabSystem: React.FC<TabSystemProps> = ({
  items,
  activeTab,
  onTabChange,
  variant = 'standard',
  orientation = 'horizontal',
  className = '',
  showLabels = true
}) => {
  return (
    <div className={`tab-system ${variant} ${orientation} ${className}`}>
      {items.map((item) => {
        const button = (
          <button
            key={item.id}
            className={`tab-item ${activeTab === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
            onClick={() => !item.disabled && onTabChange(item.id)}
            disabled={item.disabled}
          >
            {item.icon && <span className="tab-icon">{item.icon}</span>}
            {showLabels && <span className="tab-label">{item.label}</span>}
          </button>
        );

        if (!showLabels) {
          const tooltipPosition = variant === 'docked-sidebar-left' ? 'left' : 'right';
          return (
            <Tooltip key={item.id} text={item.label} position={tooltipPosition}>
              {button}
            </Tooltip>
          );
        }

        return <React.Fragment key={item.id}>{button}</React.Fragment>;
      })}
    </div>
  );
};

export default TabSystem;
