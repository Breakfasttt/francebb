"use client";

import React from "react";
import { parseBBCode } from "@/lib/bbcode";
import BBSchemePlayer from "@/app/bbscheme/component/BBSchemePlayer";

interface BBCodeContentProps {
  content: string;
  quoteStatusMap?: Record<string, { isDeleted: boolean, isModerated: boolean }>;
  currentUserId?: string;
  style?: React.CSSProperties;
  className?: string;
}

const BBCodeContent: React.FC<BBCodeContentProps> = ({ 
  content, 
  quoteStatusMap, 
  currentUserId,
  style,
  className
}) => {
  if (!content) return null;

  // On sépare le contenu pour trouver les balises [bbscheme]
  // On utilise une regex qui capture le boardId et le layout
  const schemeRegex = /\[bbscheme(?:=(vertical|horizontal))?\]([\s\S]*?)\[\/bbscheme\]/gi;
  
  const blocks: (string | { type: 'bbscheme', id: string, layout: string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = schemeRegex.exec(content)) !== null) {
    // Ajouter le texte avant le match
    if (match.index > lastIndex) {
      blocks.push(content.substring(lastIndex, match.index));
    }

    const layout = match[1] || 'horizontal';
    const rawId = match[2].trim();
    let boardId = rawId;

    // Extraction de l'ID si c'est une URL
    if (rawId.includes("id=")) {
      boardId = rawId.split("id=")[1].split("&")[0];
    } else if (rawId.includes("/bbscheme?")) {
      const parts = rawId.split("id=");
      if (parts[1]) boardId = parts[1].split("&")[0];
    }

    blocks.push({ type: 'bbscheme', id: boardId, layout });
    lastIndex = schemeRegex.lastIndex;
  }

  // Ajouter le reste du texte
  if (lastIndex < content.length) {
    blocks.push(content.substring(lastIndex));
  }

  return (
    <div className={className} style={{ ...style, maxWidth: "100%", overflow: "hidden" }}>
      {blocks.map((block, index) => {
        if (typeof block === 'string') {
          return (
            <div 
              key={`text-block-${index}`} 
              dangerouslySetInnerHTML={{ 
                __html: parseBBCode(block, quoteStatusMap, currentUserId) 
              }} 
            />
          );
        } else {
          return (
            <BBSchemePlayer 
              key={`scheme-block-${index}`} 
              boardId={block.id} 
              layout={block.layout}
            />
          );
        }
      })}
    </div>
  );
};

export default BBCodeContent;
