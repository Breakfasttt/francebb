"use client";

/**
 * Formulaire de la page de modification d'un message (/forum/post/[id]/edit). Refait à la carte 087 : éditeur
 * BBCode plein écran sur téléphone et barre d'envoi collée en bas (ComposeActionBar). L'enregistrement appelle
 * toujours l'action serveur updatePost, puis revient au message (?page=N#post-id).
 * Carte 181 : les modifications en cours sont gardées en brouillon dans le navigateur (crochet useDraft) ; un
 * brouillon identique au message d'origine n'est pas restauré. « Annuler » demande confirmation si le texte a changé.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button, toast } from "@bbfrance/ui";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import DraftBanner from "@/common/components/DraftBanner/DraftBanner";
import { useDraft } from "@/common/hooks/useDraft";
import { updatePost } from "@/app/forum/actions";
import { ComposeActionBar } from "@/app/forum/component/ComposeScreen";
import CancelComposeButton from "@/app/forum/component/CancelComposeButton";

export default function EditPostForm({ postId, initialContent }: { postId: string; initialContent: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const draft = useDraft(`edit:${postId}`, initialContent, { warnBeforeLeave: true });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;

    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await updatePost(postId, content);
      if (result.success && result.topicId) {
        draft.forget();
        // Retour à la page précise du sujet et à l'ancre du message
        router.push(`/forum/topic/${result.topicId}?page=${result.page || 1}#post-${postId}`);
      } else {
        toast.error(result.error || "Erreur lors de la modification du message.");
      }
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Erreur lors de la modification du message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DraftBanner draft={draft} />
      <BBCodeEditor key={draft.editorKey} name="content" defaultValue={draft.value} onChange={draft.onChange} placeholder="Modifiez votre message ici..." rows={12} screen />

      <ComposeActionBar>
        <CancelComposeButton draft={draft} />
        <Button type="submit" variant="primary" size="tap" disabled={isSubmitting} className="leading-tight whitespace-normal max-lg:flex-1">
          {isSubmitting ? <Loader2 size={18} aria-hidden="true" className="animate-spin" /> : <Save size={18} aria-hidden="true" />}
          Enregistrer les modifications
        </Button>
      </ComposeActionBar>
    </form>
  );
}
