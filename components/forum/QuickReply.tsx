"use client";

import { useState } from "react";
import BBCodeEditor from "./BBCodeEditor";
import { createPost } from "@/app/forum/actions";
import { MessageSquare, Loader2 } from "lucide-react";

export default function QuickReply({ topicId, onReplySuccess }: { topicId: string; onReplySuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      await createPost(topicId, content);
      setContent("");
      if (onReplySuccess) onReplySuccess();
      window.location.reload(); // Revalidation handled by server action, but reload to scroll to bottom/see post
    } catch (error) {
      console.error("Quick reply error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="quick-reply-area" className="quick-reply" style={{ marginTop: '3rem' }}>
      <div className="premium-card" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <MessageSquare size={20} className="text-secondary" />
          Réponse
        </h3>
        
        <BBCodeEditor 
          name="content" 
          defaultValue={content} 
          placeholder="Écrivez votre réponse ici..."
          rows={6}
        />
        
        {/* We need a way to get the content from the editor. 
            Actually, BBCodeEditor should probably expose its state or use a hidden input 
            if we want to use it in a traditional form, OR we can make it more modular.
            Since BBCodeEditor is a client component with its own 'content' state, 
            I should probably add a callback or use a ref. 
        */}
        
        <div style={{ marginTop: '1.5rem' }}>
          <button 
            onClick={() => {
              // Find the textarea inside the editor and get its value
              const editorTextarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
              if (editorTextarea) {
                createPost(topicId, editorTextarea.value).then(() => window.location.reload());
              }
            }}
            disabled={isSubmitting}
            className="widget-button" 
            style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
            Envoyer ma réponse
          </button>
        </div>
      </div>
    </div>
  );
}
