"use client";
import React, { useEffect } from "react";
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
  useEffect(() => {
    // Définition de l'élément personnalisé une seule fois
    if (typeof window !== 'undefined' && !customElements.get('bb-scheme')) {
      customElements.define('bb-scheme', class extends HTMLElement {
        private root: any = null;

        connectedCallback() {
          const boardId = this.getAttribute('data-board-id');
          const layout = this.getAttribute('data-layout');
          
          if (!boardId) return;

          // On utilise createRoot pour monter le composant React dans l'élément
          import('react-dom/client').then(({ createRoot }) => {
            if (!this.root) {
              this.root = createRoot(this);
              this.root.render(<BBSchemePlayer boardId={boardId} layout={layout || 'horizontal'} />);
            }
          });
        }

        disconnectedCallback() {
          // Unmount React component when element is removed from DOM
          if (this.root) {
            const r = this.root;
            this.root = null;
            setTimeout(() => r.unmount(), 0);
          }
        }
      });
    }
  }, []);

  if (!content) return null;

  const html = parseBBCode(content, quoteStatusMap, currentUserId);

  return (
    <div 
      className={`bbcode-content-wrapper ${className || ''}`} 
      style={{ ...style, maxWidth: "100%", overflow: "hidden" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default BBCodeContent;
