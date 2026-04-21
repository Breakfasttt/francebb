"use client";

import React from "react";
import Button, { ButtonProps } from "./Button";

/**
 * Bouton classique
 * Utilisé pour les actions secondaires ou standard.
 */
export default function ClassicButton(props: ButtonProps) {
  // @ts-ignore
  return <Button {...props} variant="classic" />;
}
