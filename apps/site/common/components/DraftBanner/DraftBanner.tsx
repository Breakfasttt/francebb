"use client";

/**
 * Bandeau discret « Brouillon restauré · Effacer », posé au-dessus de l'éditeur quand le crochet `useDraft`
 * (`common/hooks/useDraft.ts`) a remis un brouillon dans l'éditeur (carte 181). « Effacer » oublie le brouillon et
 * remet le texte de départ.
 */
import { History } from "lucide-react";
import { Button } from "@bbfrance/ui";
import type { Draft } from "@/common/hooks/useDraft";

export default function DraftBanner({ draft }: { draft: Pick<Draft, "restored" | "discard"> }) {
  if (!draft.restored) return null;
  return (
    <div role="status" className="mb-2 flex items-center gap-2 rounded-bb-md border border-bb-border bg-bb-surface pl-3 text-sm text-bb-text-muted">
      <History size={16} aria-hidden="true" className="shrink-0 text-bb-accent-text" />
      <span className="min-w-0 flex-1">Brouillon restauré</span>
      <Button type="button" variant="quiet" size="tap" aria-label="Effacer le brouillon" onClick={draft.discard} className="shrink-0 px-3 text-sm font-semibold text-bb-accent-text">
        Effacer
      </Button>
    </div>
  );
}
