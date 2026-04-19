"use client";

import { useState, useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

/**
 * Composant de synchronisation manuelle de l'attribut de thème.
 * Cela évite l'injection de scripts inline que React 19 déteste.
 */
function AttributeSync() {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return null;
}

export function ThemeProvider({ children, ...props }: any) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pendant le SSR et le premier rendu, on ne rend que les enfants
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider 
      {...props}
      attribute={undefined} // Désactive l'injection de script automatique
      disableTransitionOnChange
      enableSystem={false}
    >
      <AttributeSync />
      {children}
    </NextThemesProvider>
  );
}
