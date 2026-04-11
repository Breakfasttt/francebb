"use client";

import React from "react";
import Button, { ButtonProps } from "./Button";

/**
 * Bouton "Administration / Modérateur"
 * Réservé aux actions staff. Distinct visuellement des actions utilisateurs standards.
 */
export default function AdminButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="admin" {...props} />;
}
