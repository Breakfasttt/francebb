"use client";

import React from "react";
import Button, { ButtonProps } from "./Button";

/**
 * Bouton "Danger / Critique"
 * Utilisé pour les actions irréversibles ou potentiellement dangereuses (Supprimer, Ban, etc.).
 */
export default function DangerButton(props: ButtonProps) {
  // @ts-ignore
  return <Button {...props} variant="danger" />;
}
