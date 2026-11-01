"use client";

import { AlertTriangle } from "lucide-react";
import { Button, Dialog, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, cn } from "@bbfrance/ui";

/**
 * Fenêtre de confirmation. Coquille Radix Dialog (@bbfrance/ui) : Échap, focus piégé, role="dialog" ;
 * un clic à côté ne ferme pas (choix explicite « Annuler » ou confirmer). Apparence de la refonte (variables v2,
 * carte 101). Pour un nouvel écran, préférer `ConfirmDialog` de @bbfrance/ui.
 */

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  isDanger?: boolean;
  children?: React.ReactNode;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirmer", isDanger = false, children }: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[var(--z-index-modal-bottom)] flex items-center justify-center bg-bb-overlay p-4">
          <DialogContent
            onInteractOutside={(event) => event.preventDefault()}
            className="flex w-full max-w-[400px] flex-col items-center rounded-bb-lg border border-bb-border bg-bb-surface p-6 text-center font-bb-sans text-bb-text shadow-bb lg:p-8"
          >
            <div
              className={cn(
                "mb-5 flex size-[60px] items-center justify-center rounded-full",
                isDanger ? "bg-bb-danger/10 text-bb-danger-text" : "bg-bb-accent-soft text-bb-accent-text"
              )}
              aria-hidden="true"
            >
              <AlertTriangle size={30} />
            </div>

            <DialogTitle className="m-0 mb-3 text-xl font-bold text-bb-text">{title}</DialogTitle>
            <DialogDescription className="m-0 mb-6 text-[0.95rem] leading-normal text-bb-text-muted">{message}</DialogDescription>

            {children && <div className="mb-6 w-full text-left">{children}</div>}

            <div className="flex w-full flex-col-reverse gap-2 lg:flex-row lg:justify-center">
              <Button type="button" variant="secondary" size="tap" className="w-full lg:w-auto" onClick={onClose}>
                Annuler
              </Button>
              <Button type="button" variant={isDanger ? "danger" : "primary"} size="tap" className="w-full lg:w-auto" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          </DialogContent>
        </DialogOverlay>
      </DialogPortal>
    </Dialog>
  );
}
