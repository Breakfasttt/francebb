"use client";

import React from "react";
import Button, { ButtonProps } from "./Button";

/**
 * Bouton d'explication ou d'aide.
 * Utilisé pour les textes cliquables déclenchant des modales d'aide ou des explications.
 * Couleur : Or/Accent (Orange-Yellow)
 */
export default function ExplainButton({ children, ...props }: ButtonProps) {
  return (
    <Button variant="explain" {...props}>
      {children}
    </Button>
  );
}
