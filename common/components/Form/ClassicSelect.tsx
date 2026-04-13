"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import "./ClassicSelect.css";

interface ClassicSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: React.ElementType;
  containerStyle?: React.CSSProperties;
}

export default function ClassicSelect({ 
  label, 
  icon: Icon, 
  children, 
  className = "", 
  containerStyle,
  ...props 
}: ClassicSelectProps) {
  return (
    <div className={`classic-select-container ${className}`} style={containerStyle}>
      {label && (
        <label className="classic-select-label">
          {Icon && <Icon size={14} />}
          {label}
        </label>
      )}
      <div className="classic-select-wrapper">
        <select {...props} className="classic-select-field">
          {children}
        </select>
        <div className="classic-select-arrow">
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );
}
