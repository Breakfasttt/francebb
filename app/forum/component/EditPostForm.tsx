"use client";

import { useState } from "react";
import BBCodeEditor from "@/common/components/BBCodeEditor/BBCodeEditor";
import { updatePost } from "@/app/forum/actions";
import { Pencil, Loader2, Save } from "lucide-react";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";
import { useRouter } from "next/navigation";

export default function EditPostForm({ postId, initialContent }: { postId: string; initialContent: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;

    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const result = await updatePost(postId, content);
      if (result?.topicId) {
        router.push(`/forum/topic/${result.topicId}`);
      }
    } catch (error) {
      console.error("Edit error:", error);
      alert("Erreur lors de la modification du message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: 'var(--card-bg)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <BBCodeEditor 
          name="content" 
          defaultValue={initialContent} 
          placeholder="Modifiez votre message ici..."
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
          icon={Save}
        >
          Enregistrer les modifications
        </CTAButton>
      </div>
    </form>
  );
}
