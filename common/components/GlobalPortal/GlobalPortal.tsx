"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface GlobalPortalProps {
  children: React.ReactNode;
  target?: string;
}

export default function GlobalPortal({ children, target }: GlobalPortalProps) {
  const [targetElement, setTargetElement] = useState<Element | null>(null);

  useEffect(() => {
    const findTarget = () => {
      const el = target ? document.querySelector(target) : document.body;
      if (el) {
        setTargetElement(el);
        return true;
      }
      return false;
    };

    if (findTarget()) return;

    // Si la cible manque (race condition portails), on réessaie toutes les 50ms pendant 2 secondes
    let attempts = 0;
    const intervalId = setInterval(() => {
      attempts++;
      if (findTarget() || attempts > 40) {
        clearInterval(intervalId);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [target]);

  if (!targetElement) return null;

  return createPortal(children, targetElement);
}
