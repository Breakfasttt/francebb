"use client";

import { useState, useEffect } from "react";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import { createPost } from "@/app/forum/actions";
import { MessageSquare, Loader2, Send } from "lucide-react";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import { useRouter } from "next/navigation";

export default function ReplyForm({ topicId, quotePostId, quoteAuthor, quoteContent }: { topicId: string; quotePostId?: string; quoteAuthor?: string; quoteContent?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [initialValue, setInitialValue] = useState("");

  useEffect(() => {
    if (quotePostId && quoteAuthor && quoteContent) {
      setInitialValue(`[quote=${quoteAuthor}|${quotePostId}]${quoteContent}[/quote]\n`);
    }
  }, [quotePostId, quoteAuthor, quoteContent]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;

    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createPost(topicId, content);
      router.push(`/forum/topic/${topicId}`);
      router.refresh();
    } catch (error) {
      console.error("Reply error:", error);
      alert("Erreur lors de l'envoi de la réponse.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: 'rgba(26, 26, 32, 0.4)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <BBCodeEditor 
          name="content" 
          defaultValue={initialValue} 
          placeholder="Tapez votre réponse ici..."
          rows={12}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <ClassicButton type="button" onClick={() => router.back()}>
          Annuler
        </ClassicButton>
        <CTAButton 
          type="submit" 
          isLoading={isSubmitting}
          icon={Send}
        >
          Publier ma réponse
        </CTAButton>
      </div>
    </form>
  );
}
