"use client";

import React from "react";
import type { NavCounts } from "./navCounts";

/**
 * Attend les compteurs sans bloquer l'affichage : la barre est rendue tout de suite sans pastille,
 * puis les pastilles apparaissent quand la promesse est résolue.
 * Partagé par l'ancienne barre (Navbar) et la nouvelle coquille (AppShell, carte 081).
 */
export function useNavCounts(counts?: Promise<NavCounts>): NavCounts {
  const [resolved, setResolved] = React.useState<{ source: Promise<NavCounts>; value: NavCounts } | null>(null);
  React.useEffect(() => {
    if (!counts) return;
    let active = true;
    counts.then((value) => {
      if (active) setResolved({ source: counts, value });
    });
    return () => {
      active = false;
    };
  }, [counts]);
  return resolved && resolved.source === counts ? resolved.value : { unreadCount: 0, notificationCount: 0, pendingModCount: 0 };
}
