"use client";

import React, { useState, useTransition, useEffect } from "react";
import { SmilePlus } from "lucide-react";
import { toggleArticleReaction } from "@/app/articles/actions";
import "./ArticleReactions.css";

interface Reaction {
  emoji: string;
  userId: string;
  user?: { name: string | null };
}

interface ArticleReactionsProps {
  articleId: string;
  reactions: Reaction[];
  currentUserId?: string;
}

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😢", "😡", "🔥", "👀", "🎉", "👎", "🍻"];

export default function ArticleReactions({ articleId, reactions, currentUserId }: ArticleReactionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showPicker, setShowPicker] = useState(false);
  
  // Optimistic UI state
  const [optimisticReactions, setOptimisticReactions] = useState(reactions);

  // Sync state if server data changes (e.g. from revalidatePath)
  useEffect(() => {
    setOptimisticReactions(reactions);
  }, [reactions]);

  // Group reactions locally
  const grouped = optimisticReactions.reduce((acc, curr) => {
    if (!acc[curr.emoji]) acc[curr.emoji] = { count: 0, hasReacted: false, users: [] as string[] };
    acc[curr.emoji].count++;
    if (curr.userId === currentUserId) acc[curr.emoji].hasReacted = true;
    if (curr.user?.name) acc[curr.emoji].users.push(curr.user.name);
    return acc;
  }, {} as Record<string, { count: number; hasReacted: boolean; users: string[] }>);

  const handleToggle = (emoji: string) => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour réagir.");
      return;
    }

    // Optimistic internal apply
    setOptimisticReactions(prev => {
      const existingIdx = prev.findIndex(r => r.userId === currentUserId);
      if (existingIdx >= 0) {
        if (prev[existingIdx].emoji === emoji) {
          // Toggle off
          return prev.filter((_, i) => i !== existingIdx);
        } else {
          // Replace with new emoji
          const next = [...prev];
          next[existingIdx] = { ...next[existingIdx], emoji };
          return next;
        }
      } else {
        // Add new
        return [...prev, { emoji, userId: currentUserId }];
      }
    });

    setShowPicker(false);

    startTransition(async () => {
      try {
        const result = await toggleArticleReaction(articleId, emoji);
        if (result.error) throw new Error(result.error);
      } catch (error) {
        console.error("Failed to toggle reaction:", error);
        // Rollback on error
        setOptimisticReactions(reactions);
        alert("Erreur lors de l'ajout de la réaction");
      }
    });
  };

  if (Object.keys(grouped).length === 0 && !currentUserId) {
    return null;
  }

  return (
    <div className="article-reactions-container">
      <div className="reactions-list">
        {Object.entries(grouped).map(([emoji, { count, hasReacted, users }]) => (
          <button
            key={emoji}
            className={`reaction-pill ${hasReacted ? "active" : ""}`}
            title={users.length > 0 ? users.join(", ") : (hasReacted ? "Retirer votre réaction" : "Réagir")}
            onClick={() => handleToggle(emoji)}
            disabled={isPending || !currentUserId}
          >
            <span className="reaction-emoji">{emoji}</span>
            <span className="reaction-count">{count}</span>
          </button>
        ))}
        
        {currentUserId && (
          <div className="add-reaction-wrapper">
            <div className="tooltip-wrapper">
              <button 
                className="add-reaction-btn" 
                onClick={() => setShowPicker(!showPicker)}
                title="Ajouter une réaction"
              >
                <SmilePlus size={18} />
              </button>
              <span className="tooltip-text">Réagir</span>
            </div>
            
            {showPicker && (
              <>
                <div 
                  className="picker-backdrop" 
                  onClick={() => setShowPicker(false)}
                />
                <div className="picker-popover-grid">
                  {COMMON_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleToggle(emoji)}
                      className="picker-emoji-btn"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
