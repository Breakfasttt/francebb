import React from 'react';
import { cn } from '@bbfrance/ui';

/**
 * Carte de contenu (variables v2 depuis la carte 101) : surface du thème, bordure fine, coins arrondis et marge
 * intérieure. Le verre dépoli n'est actif que si le thème le permet (variable --bb-glass-blur).
 * Utilisée par la page des mentions légales ; pour un nouvel écran, préférer `Card` de @bbfrance/ui.
 */
interface PremiumCardProps<T extends React.ElementType = 'div'> extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Légère élévation au survol (ordinateur seulement). */
  hoverEffect?: boolean;
  /** Laisse dépasser le contenu (bulle d'aide, menu) au lieu de le couper. */
  noOverflow?: boolean;
  as?: T;
}

export default function PremiumCard<T extends React.ElementType = 'div'>({
  children,
  className = '',
  hoverEffect = false,
  noOverflow = false,
  as,
  ...props
}: PremiumCardProps<T> & React.ComponentPropsWithoutRef<T>) {
  const Component = as || 'div';
  return (
    <Component
      className={cn(
        "rounded-bb-lg border border-bb-border bg-bb-surface p-4 text-bb-text backdrop-blur-[var(--bb-glass-blur)] lg:p-6",
        noOverflow ? "overflow-visible" : "overflow-hidden",
        hoverEffect && "transition-shadow lg:hover:shadow-bb",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
