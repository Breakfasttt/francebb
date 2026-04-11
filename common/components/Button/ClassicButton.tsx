"use client";

import React from "react";
import Button, { ButtonProps } from "./Button";

/**
 * Bouton de style "Classique" (Neutre / Glass)
 * Utilisé pour les actions secondaires, la navigation tertiaire et les éléments discrets.
 */
export default function ClassicButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="classic" {...props} />;
}
