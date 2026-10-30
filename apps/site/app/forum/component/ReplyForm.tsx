"use client";

/**
 * Formulaire de la page de réponse d'un sujet (/forum/topic/[id]/reply). Refait à la carte 087 : éditeur BBCode
 * plein écran sur téléphone et barre d'envoi collée en bas (ComposeActionBar). L'envoi appelle toujours l'action
 * serveur createPost, puis revient au sujet.
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button, toast } from "@bbfrance/ui";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import { createPost } from "@/app/forum/actions";
import { ComposeActionBar } from "@/app/forum/component/ComposeScreen";

// quoteAuthor est l'identifiant de l'auteur cité ; quoteAuthorName est son pseudo,
// ajouté en troisième champ de la balise pour que la citation affiche le pseudo.
export default function ReplyForm({ topicId, quotePostId, quoteAuthor, quoteAuthorName, quoteContent }: { topicId: string; quotePostId?: string; quoteAuthor?: string; quoteAuthorName?: string; quoteContent?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [initialValue, setInitialValue] = useState("");

  useEffect(() => {
    if (quotePostId && quoteAuthor && quoteContent) {
      setInitialValue(`[quote=${quoteAuthor}|${quotePostId}|${quoteAuthorName ?? ""}]${quoteContent}[/quote]\n`);
    }
  }, [quotePostId, quoteAuthor, quoteAuthorName, quoteContent]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;

    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createPost(topicId, content);
      if (!res.success) {
        toast.error(res.error || "Erreur lors de l'envoi de la réponse.");
        return;
      }
      router.push(`/forum/topic/${topicId}`);
      router.refresh();
    } catch (error) {
      console.error("Reply error:", error);
      toast.error("Erreur lors de l'envoi de la réponse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <BBCodeEditor name="content" defaultValue={initialValue} placeholder="Tapez votre réponse ici..." rows={12} screen />

      <ComposeActionBar>
        <Button type="button" variant="secondary" size="tap" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" size="tap" disabled={isSubmitting} className="max-lg:flex-1">
          {isSubmitting ? <Loader2 size={18} aria-hidden="true" className="animate-spin" /> : <Send size={18} aria-hidden="true" />}
          Publier ma réponse
        </Button>
      </ComposeActionBar>
    </form>
  );
}
