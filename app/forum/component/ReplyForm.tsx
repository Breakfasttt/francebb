"use client";

import { useState, useEffect } from "react";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import { createPost } from "@/app/forum/actions";
import { MessageSquare, Loader2, Send } from "lucide-react";
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
        <button 
          type="button" 
          onClick={() => router.back()}
          className="widget-button secondary-btn"
          style={{ width: 'auto', padding: '0.8rem 2rem' }}
        >
          Annuler
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="widget-button" 
          style={{ width: 'auto', padding: '0.8rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          Publier ma réponse
        </button>
      </div>
    </form>
  );
}
