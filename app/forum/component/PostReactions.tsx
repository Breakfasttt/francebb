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
            border: hasReacted ? "1px solid var(--primary)" : "1px solid var(--glass-border)",
            background: hasReacted ? "var(--primary-transparent)" : "var(--glass-bg)",
            color: hasReacted ? "var(--primary)" : "var(--text-muted)",
            cursor: currentUserId ? (isPending ? "wait" : "pointer") : "default",
            fontSize: "0.85rem",
            transition: "all 0.2s"
          }}
          className={currentUserId ? "hover-brightness" : ""}
        >
          <span>{emoji}</span>
          <span style={{ fontWeight: 700, color: hasReacted ? "var(--primary)" : "var(--foreground)" }}>{count}</span>
        </button>
      ))}

      {currentUserId && (
        <div style={{ position: "relative" }}>
          <div className="tooltip-wrapper">
            <button
              onClick={() => setShowPicker(!showPicker)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "1px dashed var(--glass-border)",
                background: "transparent",
                color: "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              className="hover-border-accent hover-text-accent"
            >
              <SmilePlus size={14} />
            </button>
            <span className="tooltip-text">Réagir</span>
          </div>

          {showPicker && (
            <>
              {/* Backdrop invisble pour fermer */}
              <div 
                style={{ position: "fixed", inset: 0, zIndex: 9 }} 
                onClick={() => setShowPicker(false)}
              />
              <div style={{
                position: "absolute",
                bottom: "calc(100% + 10px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--footer-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: "12px",
                padding: "0.5rem",
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "0.2rem",
                boxShadow: "var(--glass-shadow)",
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

      <style jsx>{`
        .tooltip-wrapper {
          position: relative;
          display: inline-flex;
        }
        .tooltip-text {
          visibility: hidden;
          background-color: var(--footer-bg);
          color: var(--header-foreground);
          text-align: center;
          padding: 4px 10px;
          border-radius: 6px;
          position: absolute;
          z-index: 100;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 0.7rem;
          white-space: nowrap;
          box-shadow: var(--glass-shadow);
          border: 1px solid var(--glass-border);
          pointer-events: none;
        }
        .tooltip-wrapper:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }
        .hover-border-accent:hover {
          border-color: var(--accent) !important;
          border-style: solid !important;
        }
        .hover-text-accent:hover {
          color: var(--accent) !important;
        }
        .hover-bg-theme:hover {
          background: var(--primary-transparent) !important;
        }
      `}</style>
    </div>
  );
}
