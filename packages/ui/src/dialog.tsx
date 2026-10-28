"use client";

/**
 * Primitives Dialog (Radix) sans style : comportement accessible (focus piégé, Échap, clic extérieur, scroll bloqué,
 * role="dialog"). Le composant appelant fournit son propre CSS via `asChild` ou `className`, pour garder les 7 thèmes.
 */
import { Dialog as DialogPrimitive } from "radix-ui";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogOverlay = DialogPrimitive.Overlay;
export const DialogContent = DialogPrimitive.Content;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;
