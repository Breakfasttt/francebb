"use client";

import React, { useState } from "react";
import { Smile, Plus } from "lucide-react";
import SmileyPicker from "@/common/components/SmileyPicker/SmileyPicker";
import { toggleArticleReaction } from "@/app/articles/actions";
import "./ArticleReactions.css";

interface ArticleReactionsProps {
  articleId: string;
  reactions: any[];
  currentUserId?: string;
}

export default function ArticleReactions({ articleId, reactions, currentUserId }: ArticleReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc: any, reaction: any) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        hasReacted: false
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user.name);
    if (reaction.userId === currentUserId) {
      acc[reaction.emoji].hasReacted = true;
    }
    return acc;
  }, {});

  const reactionList = Object.values(groupedReactions);

  const handleToggleReaction = async (emoji: string) => {
    if (!currentUserId) return;
    await toggleArticleReaction(articleId, emoji);
  };

  return (
    <div className="article-reactions-container">
      <div className="reactions-list">
        {reactionList.map((reaction: any) => (
          <button
            key={reaction.emoji}
            className={`reaction-pill ${reaction.hasReacted ? "active" : ""}`}
            onClick={() => handleToggleReaction(reaction.emoji)}
            disabled={!currentUserId}
            title={reaction.users.join(", ")}
          >
            <span className="reaction-emoji">{reaction.emoji}</span>
            <span className="reaction-count">{reaction.count}</span>
          </button>
        ))}
        
        {currentUserId && (
          <div className="add-reaction-wrapper">
            <button 
              className="add-reaction-btn" 
              onClick={() => setShowPicker(!showPicker)}
              title="Ajouter une réaction"
            >
              <Smile size={18} />
              <Plus size={10} className="plus-icon" />
            </button>
            
            {showPicker && (
              <div className="picker-popover">
                <SmileyPicker 
                  onSelect={(emoji) => {
                    handleToggleReaction(emoji);
                    setShowPicker(false);
                  }} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
