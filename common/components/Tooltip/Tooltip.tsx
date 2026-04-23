"use client";

import React, { useState } from 'react';
import './Tooltip.css';

interface TooltipProps {
  content?: React.ReactNode;
  text?: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export default function Tooltip({ content, text, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const displayContent = content || text;

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && displayContent && (
        <div className={`tooltip-bubble tooltip-${position}`}>
          {displayContent}
        </div>
      )}
    </div>
  );
}
