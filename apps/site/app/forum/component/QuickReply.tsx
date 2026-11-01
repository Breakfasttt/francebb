"use client";

/**
 * Réponse rapide en bas d'un sujet (ancre id="quick-reply-area", visée par « Citer » et « Répondre »).
 * Carte de la refonte (carte 086) autour de l'éditeur BBCode (refait à la carte 087).
 * Après l'envoi, l'éditeur est vidé, la page est rafraîchie, puis elle défile jusqu'au nouveau message, mis en valeur
 * par une animation (classe new-post-fade-in de app/globals.css). Un refus du serveur garde le texte en place.
 */
import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Card, toast } from "@bbfrance/ui";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import { createPost } from "@/app/forum/actions";

export default function QuickReply({ topicId }: { topicId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const router = useRouter();

  const handleSubmit = () => {
    // L'éditeur garde son texte dans une zone de saisie nommée « content »
    const editorTextarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement | null;
    if (!editorTextarea || !editorTextarea.value.trim()) return;
    setIsSubmitting(true);
    createPost(topicId, editorTextarea.value)
      .then((res) => {
        setIsSubmitting(false);
        // Refus du serveur (sujet verrouillé, session expirée…) : le texte reste dans l'éditeur
        if (!res.success) {
          toast.error(res.error || "Erreur lors de l'envoi de la réponse.");
          return;
        }
        setResetKey((prev) => prev + 1);
        router.refresh();

        // Le nouveau message apparaît après le rafraîchissement : on le cherche pendant 5 secondes au plus
        let attempts = 0;
        const intervalId = setInterval(() => {
          attempts++;
          const postEl = document.getElementById(`post-${res.postId}`);
          if (postEl) {
            clearInterval(intervalId);
            postEl.scrollIntoView({ behavior: "smooth", block: "center" });
            postEl.classList.add("new-post-fade-in");
          } else if (attempts > 50) {
            clearInterval(intervalId);
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          }
        }, 100);
      })
      .catch(() => {
        setIsSubmitting(false);
        toast.error("Erreur lors de l'envoi de la réponse.");
      });
  };

  return (
    <Card id="quick-reply-area" className="scroll-mt-20 p-3 lg:p-5">
      <h2 className="m-0 mb-3 flex items-center gap-2 border-0 p-0 text-lg font-bold text-bb-text normal-case not-italic">
        <MessageSquare size={20} aria-hidden="true" className="text-bb-accent-text" />
        Votre réponse
      </h2>

      <BBCodeEditor key={resetKey} name="content" defaultValue="" placeholder="Écrivez votre réponse ici..." rows={6} />

      <Button type="button" variant="primary" size="tap" className="mt-4 w-full" onClick={handleSubmit} disabled={isSubmitting}>
        <Send size={18} aria-hidden="true" /> {isSubmitting ? "Envoi en cours…" : "Envoyer ma réponse"}
      </Button>
    </Card>
  );
}
