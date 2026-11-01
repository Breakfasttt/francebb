"use client";

/**
 * Fournit le thème visuel actif (attribut `data-theme` de la balise <html>) et la fonction pour le changer.
 * Qui décide du thème :
 * - un membre connecté : le thème enregistré dans son profil (`defaultTheme`, lu en base par le serveur) gagne
 *   toujours, et il est recopié dans la mémoire du navigateur (localStorage) ;
 * - un visiteur (`preferStoredTheme`) : le dernier thème mémorisé sur cet appareil, s'il y en a un.
 * Un thème choisi à l'instant (`setTheme`) s'affiche tout de suite, en attendant que le serveur renvoie le profil à jour.
 * L'accès au localStorage est protégé : il peut être bloqué (navigation privée, réglages du navigateur).
 *
 * Le thème affiché est aussi recopié dans le cookie `bbfrance_theme` (carte 147). Pour un visiteur, la mise en page
 * générale (`app/layout.tsx`) lit ce cookie et le passe en `defaultTheme` : la page arrive du serveur déjà dans le bon
 * thème, sans passer un instant par le thème par défaut (ADR 0005).
 */
import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import { DEFAULT_SITE_THEME, SITE_THEMES, THEME_COOKIE } from '@/lib/themes';

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

/**
 * Écrit le thème dans un cookie gardé un an, envoyé au serveur avec chaque page de ce site (`path=/`). Ce n'est
 * qu'une préférence d'affichage : aucune donnée personnelle, aucun suivi.
 */
function storeThemeCookie(theme: string) {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${THEME_COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=31536000; SameSite=Lax${secure}`;
  } catch {
    // Cookies refusés : le thème sera de nouveau posé après le chargement, comme avant la carte 147
  }
}

/** Prévient React quand le thème mémorisé change dans un autre onglet. */
function subscribeToStorage(onChange: () => void) {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_SITE_THEME,
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

  // Synchronise la page (attribut data-theme), le cookie lu par le serveur et, pour un membre, la mémoire du navigateur
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storeThemeCookie(theme);
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
