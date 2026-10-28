"use client";

import React from "react";
import Button, { ButtonProps } from "./Button";

/**
 * Bouton "Appel au clic" (CTA)
 * Style brillant (shiny) et accrocheur, utilisé pour les actions principales (Nouveau sujet, Valider, etc.).
 */
export default function CTAButton(props: ButtonProps) {
  return <Button {...props} variant="cta" />;
}
