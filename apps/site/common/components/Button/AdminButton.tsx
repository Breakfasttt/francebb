"use client";

import React from "react";
import Button, { ButtonProps } from "./Button";

/**
 * Bouton "Administration / Modérateur"
 * Réservé aux actions staff. Distinct visuellement des actions utilisateurs standards.
 */
export default function AdminButton(props: ButtonProps) {
  // @ts-ignore
  return <Button {...props} variant="admin" />;
}
