"use client";

/**
 * Système d'onglets flexible.
 * Supporte les modes vertical (sidebar), horizontal, et "docked" (profil).
 */
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import './TabSystem.css';
import './TabSystem-mobile.css';
import Tooltip from '@/common/components/Tooltip/Tooltip';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: number;
  danger?: boolean;
}

interface TabSystemProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  variant?: 'standard' | 'sidebar' | 'docked-sidebar' | 'docked-sidebar-left';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  showLabels?: boolean;
  noPortal?: boolean;
}

const TabSystem: React.FC<TabSystemProps> = ({
  items,
  activeTab,
  onTabChange,
  variant = 'standard',
  orientation = 'horizontal',
  className = '',
  showLabels = true,
  noPortal = false
}) => {
  const [mounted, setMounted] = useState(false);
  const [targetSlot, setTargetSlot] = useState<Element | null>(null);

  useEffect(() => {
    setMounted(true);
    const slot = document.getElementById('mobile-page-sidebar-slot');
    setTargetSlot(slot);
  }, []);

  const content = (
    <div className={`tab-system ${variant} ${orientation} ${className}`}>
      {items.map((item) => {
        const button = (
          <button
            key={item.id}
            className={`tab-item ${activeTab === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''} ${item.danger ? 'danger' : ''}`}
            onClick={() => !item.disabled && onTabChange(item.id)}
            disabled={item.disabled}
          >
            {item.icon && <span className="tab-icon">{item.icon}</span>}
            {showLabels && <span className="tab-label">{item.label}</span>}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="tab-badge">{item.badge}</span>
            )}
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

  // Auto-téléportation vers le menu mobile global si c'est une sidebar locale sur mobile
  const isSidebar = variant.includes('sidebar');
  if (mounted && targetSlot && isSidebar && window.innerWidth <= 1024 && !noPortal) {
    return createPortal(content, targetSlot);
  }

  return content;
};

export default TabSystem;
