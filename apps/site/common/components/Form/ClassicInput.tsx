"use client";

import React from "react";
import "./ClassicInput.css";

interface ClassicInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, "size"> {
  label?: string;
  icon?: React.ElementType | React.ReactNode;
  containerStyle?: React.CSSProperties;
  multiline?: boolean;
  size?: "sm" | "md";
}

export default function ClassicInput({ 
  label, 
  icon, 
  className = "", 
  containerStyle,
  multiline = false,
  size = "md",
  ...props 
}: ClassicInputProps) {
  const renderIcon = (iconProp: any, iconSize: number) => {
    if (!iconProp) return null;
    if (React.isValidElement(iconProp)) return iconProp;
    const IconComponent = iconProp;
    return <IconComponent size={iconSize} />;
  };

  const Component = multiline ? "textarea" : "input";

  return (
    <div className={`classic-input-container ${size} ${className}`} style={containerStyle}>
      {label && (
        <label className="classic-input-label">
          {renderIcon(icon, 14)}
          {label}
        </label>
      )}
      <div className={`classic-input-wrapper ${icon ? 'has-icon' : ''}`}>
        {icon && !label && (
          <div className="classic-input-icon-left">
            {renderIcon(icon, size === 'sm' ? 14 : 18)}
          </div>
        )}
        <Component 
          {...(props as any)} 
          className={`classic-input-field ${multiline ? 'multiline' : ''}`} 
        />
      </div>
    </div>
  );
}
