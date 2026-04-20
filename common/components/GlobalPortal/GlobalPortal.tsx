"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface GlobalPortalProps {
  children: React.ReactNode;
}

export default function GlobalPortal({ children }: GlobalPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // On attend que le client soit monté
  if (!mounted) return null;

  // On injecte directement à la fin du document body
  return createPortal(children, document.body);
}
