"use client";

import { X } from "lucide-react";
import { Button, Dialog, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from "@bbfrance/ui";

/**
 * Fenêtre générique du site. Coquille Radix Dialog (@bbfrance/ui) : Échap, clic à côté, focus piégé, défilement de la
 * page bloqué et role="dialog". Apparence de la refonte (variables v2, carte 101) : surface du thème, boutons de
 * packages/ui, boutons empilés sur toute la largeur sur téléphone.
 * Pour une simple confirmation, préférer `ConfirmDialog` de @bbfrance/ui.
 */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "admin";
  maxWidth?: string;
  hideFooter?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  children,
  confirmText,
  cancelText,
  variant = "primary",
  maxWidth = "550px",
  hideFooter = false
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[var(--z-index-modal-bottom)] flex items-center justify-center bg-bb-overlay p-4">
          <DialogContent
            aria-describedby={undefined}
            className="relative max-h-[90vh] w-full overflow-y-auto rounded-bb-lg border border-bb-border bg-bb-surface p-5 font-bb-sans text-bb-text shadow-bb lg:p-8"
            style={{ maxWidth }}
          >
            <DialogClose asChild>
              <Button type="button" variant="quiet" size="tap-icon" title="Fermer" aria-label="Fermer" className="absolute top-2 right-2">
                <X size={20} aria-hidden="true" />
              </Button>
            </DialogClose>

            <DialogTitle className="m-0 mb-4 pr-10 text-xl font-extrabold text-bb-text">{title}</DialogTitle>
            {message && <p className="m-0 mb-6 leading-relaxed text-bb-text">{message}</p>}
            {children}

            {!hideFooter && (
              <div className="mt-6 flex flex-col-reverse gap-2 lg:flex-row lg:justify-end">
                <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" onClick={onClose}>
                  {cancelText || "Annuler"}
                </Button>
                {onConfirm && (
                  <Button type="button" variant={variant === "danger" ? "danger" : "primary"} size="tap" className="w-full lg:w-auto" onClick={onConfirm}>
                    {confirmText || "Confirmer"}
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </DialogOverlay>
      </DialogPortal>
    </Dialog>
  );
}
