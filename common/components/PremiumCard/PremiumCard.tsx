import React from 'react';
import './PremiumCard.css';

interface PremiumCardProps<T extends React.ElementType = 'div'> extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  as?: T;
}

export default function PremiumCard<T extends React.ElementType = 'div'>({ 
  children, 
  className = '', 
  hoverEffect = false, 
  as,
  ...props 
}: PremiumCardProps<T> & React.ComponentPropsWithoutRef<T>) {
  const Component = as || 'div';
  const hoverClass = hoverEffect ? 'hover-effect' : '';
  const combinedClassName = `premium-card ${hoverClass} ${className}`.trim();

  return (
    <Component className={combinedClassName} {...props}>
      {children}
    </Component>
  );
}
