"use client";

/**
 * Note chaque page du site visitée dans l'onglet, pour que `BackButton` sache s'il peut revenir en arrière sans
 * quitter le site (carte 196, règles dans `common/utils/inAppHistory.ts`). Monté une fois dans `app/layout.tsx` ;
 * n'affiche rien.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPathname } from "@/common/utils/inAppHistory";

export default function InAppHistoryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordPathname(pathname);
  }, [pathname]);

  return null;
}
