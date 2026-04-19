"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = string;

interface ThemeContextType {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
  themes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  defaultTheme = 'saison3',
  storageKey = 'theme'
}: { 
  children: React.ReactNode; 
  defaultTheme?: string;
  storageKey?: string;
  attribute?: string; // Gardé pour compatibilité de signature
  enableSystem?: boolean; // Gardé pour compatibilité de signature
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Au montage, lire le localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, [storageKey]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      themes: ['saison3', 'default', 'light', 'blood', 'malpierre', 'naf', 'nehekhara'] 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
