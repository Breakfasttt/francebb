"use client";

/**
 * Formulaire de la page de réponse d'un sujet (/forum/topic/[id]/reply). Refait à la carte 087 : éditeur BBCode
 * plein écran sur téléphone et barre d'envoi collée en bas (ComposeActionBar). L'envoi appelle toujours l'action
 * serveur createPost, puis revient au sujet.
 * Carte 181 : le texte est gardé en brouillon dans le navigateur (crochet useDraft), un par sujet et par citation ;
 * « Annuler » demande confirmation si le texte a changé, et le navigateur aussi avant de quitter la page.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button, toast } from "@bbfrance/ui";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import DraftBanner from "@/common/components/DraftBanner/DraftBanner";
import { useDraft } from "@/common/hooks/useDraft";
import { createPost } from "@/app/forum/actions";
import { ComposeActionBar } from "@/app/forum/component/ComposeScreen";
import CancelComposeButton from "@/app/forum/component/CancelComposeButton";

// quoteAuthor est l'identifiant de l'auteur cité ; quoteAuthorName est son pseudo,
// ajouté en troisième champ de la balise pour que la citation affiche le pseudo.
export default function ReplyForm({ topicId, quotePostId, quoteAuthor, quoteAuthorName, quoteContent }: { topicId: string; quotePostId?: string; quoteAuthor?: string; quoteAuthorName?: string; quoteContent?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  // Texte de départ calculé dès le premier affichage (et non après coup) : le brouillon est comparé à lui
  const initialValue =
    quotePostId && quoteAuthor && quoteContent ? `[quote=${quoteAuthor}|${quotePostId}|${quoteAuthorName ?? ""}]${quoteContent}[/quote]\n` : "";
  const draft = useDraft(`reply:${topicId}${quotePostId ? `:quote-${quotePostId}` : ""}`, initialValue, { warnBeforeLeave: true });

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
      draft.forget();
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
      <DraftBanner draft={draft} />
      <BBCodeEditor key={draft.editorKey} name="content" defaultValue={draft.value} onChange={draft.onChange} placeholder="Tapez votre réponse ici..." rows={12} screen />

      <ComposeActionBar>
        <CancelComposeButton draft={draft} />
        <Button type="submit" variant="primary" size="tap" disabled={isSubmitting} className="max-lg:flex-1">
          {isSubmitting ? <Loader2 size={18} aria-hidden="true" className="animate-spin" /> : <Send size={18} aria-hidden="true" />}
          Publier ma réponse
        </Button>
      </ComposeActionBar>
    </form>
  );
}
