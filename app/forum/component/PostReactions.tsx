"use client";

import { useState, useTransition, useEffect } from "react";
import { SmilePlus } from "lucide-react";
import { togglePostReaction } from "@/app/forum/actions";

interface Reaction {
  emoji: string;
  userId: string;
}

interface PostReactionsProps {
  postId: string;
  initialReactions: Reaction[];
  currentUserId?: string;
}

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😢", "😡", "🔥", "👀", "🎉", "👎", "🍻"];

export default function PostReactions({ postId, initialReactions, currentUserId }: PostReactionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showPicker, setShowPicker] = useState(false);
  
  // Optimistic UI state
  const [optimisticReactions, setOptimisticReactions] = useState(initialReactions);

  // Sync state if server data changes (e.g. from revalidatePath)
  useEffect(() => {
    setOptimisticReactions(initialReactions);
  }, [initialReactions]);

  // Group reactions locally
  const grouped = optimisticReactions.reduce((acc, curr) => {
    if (!acc[curr.emoji]) acc[curr.emoji] = { count: 0, hasReacted: false };
    acc[curr.emoji].count++;
    if (curr.userId === currentUserId) acc[curr.emoji].hasReacted = true;
    return acc;
  }, {} as Record<string, { count: number; hasReacted: boolean }>);

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
        await togglePostReaction(postId, emoji);
      } catch (error) {
        console.error("Failed to toggle reaction:", error);
        // Rollback on error
        setOptimisticReactions(initialReactions);
        alert("Erreur lors de l'ajout de la réaction");
      }
    });
  };

  if (Object.keys(grouped).length === 0 && !currentUserId) {
    return null; // Don't show anything for guests if there are no reactions
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
      {Object.entries(grouped).map(([emoji, { count, hasReacted }]) => (
        <button
          key={emoji}
          title={hasReacted ? "Retirer votre réaction" : "Réagir"}
          onClick={() => handleToggle(emoji)}
          disabled={isPending || !currentUserId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.3rem 0.6rem",
            borderRadius: "20px",
            border: hasReacted ? "1px solid var(--primary)" : "1px solid rgba(255,255,255,0.1)",
            background: hasReacted ? "rgba(var(--primary-rgb, 8, 145, 178), 0.15)" : "rgba(255,255,255,0.03)",
            color: hasReacted ? "var(--primary)" : "#aaa",
            cursor: currentUserId ? (isPending ? "wait" : "pointer") : "default",
            fontSize: "0.85rem",
            transition: "all 0.2s"
          }}
          className={currentUserId ? "hover-brightness" : ""}
        >
          <span>{emoji}</span>
          <span style={{ fontWeight: 600, color: "white" }}>{count}</span>
        </button>
      ))}

      {currentUserId && (
        <div style={{ position: "relative" }}>
          <button
            title="Ajouter une réaction"
            onClick={() => setShowPicker(!showPicker)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "1px dashed rgba(255,255,255,0.2)",
              background: "transparent",
              color: "#888",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            className="hover-border-white hover-text-white"
          >
            <SmilePlus size={14} />
          </button>

          {showPicker && (
            <>
              {/* Backdrop invisble pour fermer */}
              <div 
                style={{ position: "fixed", inset: 0, zIndex: 9 }} 
                onClick={() => setShowPicker(false)}
              />
              <div style={{
                position: "absolute",
                bottom: "calc(100% + 5px)",
                left: "0",
                background: "#1e1e24",
                border: "1px solid var(--glass-border)",
                borderRadius: "12px",
                padding: "0.5rem",
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "0.2rem",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                zIndex: 10
              }}>
                {COMMON_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleToggle(emoji)}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      padding: "0.4rem",
                      borderRadius: "8px",
                      transition: "background 0.2s"
                    }}
                    className="hover-bg-white-10"
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
  );
}
