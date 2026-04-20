"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useIsMobile } from "@/common/hooks/useIsMobile";

interface MobilePortalProps {
  children: React.ReactNode;
  targetId?: string;
}

export default function MobilePortal({ children, targetId = "mobile-page-sidebar-slot" }: MobilePortalProps) {
  const isMobile = useIsMobile();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isMobile) {
      // Find the target element in the DOM
      const el = document.getElementById(targetId);
      if (el) {
        setTargetElement(el);
      } else {
        // If not found yet, we can set up an observer or just retry once
        requestAnimationFrame(() => {
          const delayedEl = document.getElementById(targetId);
          if (delayedEl) setTargetElement(delayedEl);
        });
      }
    } else {
      setTargetElement(null);
    }
  }, [isMobile, targetId]);

  if (isMobile) {
    // Si on est sur mobile, on téléporte si le slot existe, sinon on le garde masqué en attendant
    if (targetElement) {
      return createPortal(children, targetElement);
    }
    return null; // Masque l'élément au lieu de le rendre à un endroit non désiré
  }

  // Sur desktop, rendu normal à l'endroit d'origine
  return <>{children}</>;
}
