"use client";

/**
 * Assistant de mise en forme par IA de l'éditeur BBCode. Il ne contacte aucune IA lui-même : il prépare un texte de
 * consigne (un « prompt ») qui contient les règles du BBCode du forum et le message du membre, le copie dans le
 * presse-papier, et peut ouvrir Gemini, Claude ou ChatGPT dans un nouvel onglet. Le membre colle la consigne dans
 * l'IA, puis recopie le résultat dans l'éditeur.
 * Fenêtre centrée sur ordinateur, panneau qui monte du bas sur téléphone (carte 087).
 */
import { Bot, Copy, ExternalLink, Sparkles } from "lucide-react";
import { Button, Sheet, SheetContent, toast, useMediaQuery, DESKTOP_QUERY } from "@bbfrance/ui";

const AI_SITES = [
  { name: "Gemini", url: "https://gemini.google.com/app", icon: Sparkles },
  { name: "Claude", url: "https://claude.ai/new", icon: Bot },
  { name: "Ouvrir ChatGPT", url: "https://chatgpt.com", icon: ExternalLink },
];

export default function AIAssistantSheet({ open, onOpenChange, prompt }: { open: boolean; onOpenChange: (open: boolean) => void; prompt: string }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copié ! Prêt à être collé dans une I.A.", { duration: 7000 });
  };

  const openAI = (url: string) => {
    copyPrompt();
    window.open(url, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title="Assistant de mise en forme par IA"
        description="Une consigne contenant les règles du forum et votre message est prête : copiez-la, puis collez-la dans l'IA de votre choix."
        side={isDesktop ? "center" : "bottom"}
      >
        <div className="flex flex-col gap-3 pb-2">
          <pre className="m-0 max-h-40 overflow-y-auto rounded-bb-md border border-bb-border bg-bb-surface-2 p-3 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-bb-text-muted">
            {prompt}
          </pre>
          <Button type="button" variant="primary" size="tap" className="w-full" onClick={copyPrompt}>
            <Copy size={18} aria-hidden="true" /> Copier le prompt
          </Button>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {AI_SITES.map((site) => (
              <Button key={site.name} type="button" variant="secondary" size="tap" onClick={() => openAI(site.url)}>
                <site.icon size={18} aria-hidden="true" /> {site.name}
              </Button>
            ))}
          </div>
          <p className="m-0 text-center text-sm text-bb-text-muted">La consigne est aussi copiée automatiquement quand vous ouvrez une IA.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
