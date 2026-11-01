"use client";

/**
 * Fenêtre de l'export en GIF de BBScheme (carte 100) : barre de progression pendant la capture des images puis la
 * fabrication du GIF, ensuite l'aperçu, « Télécharger » et « Fermer ». Elle ne se ferme pas tant que l'export n'est
 * pas terminé (la capture a besoin du terrain affiché). Le calcul de l'export reste dans page.tsx.
 */
import { Download, Loader2 } from "lucide-react";
import { Button, Sheet, SheetContent, useMediaQuery, DESKTOP_QUERY } from "@bbfrance/ui";

interface GifExportSheetProps {
  open: boolean;
  /** Avancement de 0 à 100. */
  progress: number;
  /** Le GIF fabriqué (adresse `data:`), une fois l'export terminé. */
  gif: string | null;
  onClose: () => void;
}

export default function GifExportSheet({ open, progress, gif, onClose }: GifExportSheetProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const done = progress >= 100;

  const download = () => {
    if (!gif) return;
    const link = document.createElement("a");
    link.href = gif;
    link.download = `bbscheme-${Date.now()}.gif`;
    link.click();
  };

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next && done) onClose(); }}>
      <SheetContent
        side={isDesktop ? "center" : "bottom"}
        title="Export en GIF"
        onInteractOutside={(event) => { if (!done) event.preventDefault(); }}
      >
        {!done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Loader2 size={40} className="animate-spin text-bb-accent-text" aria-hidden="true" />
            <p className="m-0 font-semibold">Fabrication de votre animation…</p>
            <div
              role="progressbar"
              aria-label="Avancement de l'export"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="h-2 w-full overflow-hidden rounded-full bg-bb-surface-2"
            >
              <div className="h-full rounded-full bg-bb-accent transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="m-0 text-sm text-bb-text-muted">{progress < 50 ? "Capture des images…" : "Assemblage du GIF…"}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            <div className="overflow-hidden rounded-bb-md border border-bb-border bg-bb-bg">
              {/* Image fabriquée dans le navigateur (adresse data:) : next/image ne sait pas l'optimiser */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {gif && <img src={gif} alt="Aperçu de l'animation exportée" className="block h-auto max-w-full" />}
            </div>
            <div className="flex flex-col gap-2 pb-2 lg:flex-row-reverse">
              <Button type="button" variant="primary" size="tap" onClick={download} disabled={!gif}>
                <Download size={18} aria-hidden="true" /> Télécharger
              </Button>
              <Button type="button" variant="secondary" size="tap" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
