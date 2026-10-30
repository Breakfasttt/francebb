"use client";

/**
 * Fournit le thème visuel actif (attribut `data-theme` de la balise <html>) et la fonction pour le changer.
 * Qui décide du thème :
 * - un membre connecté : le thème enregistré dans son profil (`defaultTheme`, lu en base par le serveur) gagne
 *   toujours, et il est recopié dans la mémoire du navigateur (localStorage) ;
 * - un visiteur (`preferStoredTheme`) : le dernier thème mémorisé sur cet appareil, s'il y en a un.
 * Un thème choisi à l'instant (`setTheme`) s'affiche tout de suite, en attendant que le serveur renvoie le profil à jour.
 * L'accès au localStorage est protégé : il peut être bloqué (navigation privée, réglages du navigateur).
 */
import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { SITE_THEMES } from '@/lib/themes';

type Theme = string;

interface ThemeContextType {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
  themes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function readStoredTheme(storageKey: string): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function storeTheme(storageKey: string, theme: string) {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Mémoire du navigateur indisponible : le thème reste appliqué pour cette page seulement
  }
}

/** Prévient React quand le thème mémorisé change dans un autre onglet. */
function subscribeToStorage(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

export function ThemeProvider({
  children,
  defaultTheme = 'saison3',
  storageKey = 'theme',
  preferStoredTheme = false
}: {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  /** true pour un visiteur : le thème mémorisé dans le navigateur passe avant `defaultTheme`. */
  preferStoredTheme?: boolean;
  attribute?: string; // Gardé pour compatibilité de signature
  enableSystem?: boolean; // Gardé pour compatibilité de signature
}) {
  // Thème mémorisé sur l'appareil (null pendant le rendu serveur, pour éviter un décalage à l'hydratation)
  const storedTheme = useSyncExternalStore(subscribeToStorage, () => readStoredTheme(storageKey), () => null);

  // Choix fait à l'instant, valable tant que le thème du profil n'a pas changé côté serveur
  const [picked, setPicked] = useState<{ theme: Theme; profileTheme: string } | null>(null);

  const baseTheme = preferStoredTheme ? (storedTheme || defaultTheme) : defaultTheme;
  const theme = picked && picked.profileTheme === defaultTheme ? picked.theme : baseTheme;

  // Synchronise la page (attribut data-theme) et, pour un membre, la mémoire du navigateur
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (!preferStoredTheme) storeTheme(storageKey, theme);
  }, [theme, preferStoredTheme, storageKey]);

  const setTheme = (newTheme: Theme) => {
    setPicked({ theme: newTheme, profileTheme: defaultTheme });
    storeTheme(storageKey, newTheme);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      themes: SITE_THEMES.map((siteTheme) => siteTheme.id)
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
