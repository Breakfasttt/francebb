"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import "./ClassicSelect.css";

interface ClassicSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: React.ElementType | React.ReactNode;
  containerStyle?: React.CSSProperties;
  size?: "sm" | "md";
}

export default function ClassicSelect({ 
  label, 
  icon, 
  children, 
  className = "", 
  containerStyle,
  size = "md",
  ...props 
}: ClassicSelectProps) {
  const renderIcon = (iconProp: any, iconSize: number) => {
    if (!iconProp) return null;
    if (React.isValidElement(iconProp)) return iconProp;
    const IconComponent = iconProp;
    return <IconComponent size={iconSize} />;
  };

  return (
    <div className={`classic-select-container ${size} ${className}`} style={containerStyle}>
      {label && (
        <label className="classic-select-label">
          {renderIcon(icon, 14)}
          {label}
        </label>
      )}
      <div className={`classic-select-wrapper ${icon ? 'has-icon' : ''}`}>
        {icon && !label && (
          <div className="classic-select-icon-left">
            {renderIcon(icon, size === 'sm' ? 14 : 18)}
          </div>
        )}
        <select {...props} className="classic-select-field">
          {children}
        </select>
        <div className="classic-select-arrow">
          <ChevronDown size={size === 'sm' ? 14 : 18} />
        </div>
      </div>
    </div>
  );
}
