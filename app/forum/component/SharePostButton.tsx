"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface SharePostButtonProps {
  postId: string;
  topicId: string;
  page: number;
}

export default function SharePostButton({ postId, topicId, page }: SharePostButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/forum/topic/${topicId}?page=${page}#post-${postId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        onClick={handleShare}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="share-post-btn"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: copied ? '#22c55e' : '#555',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px 4px',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
        }}
      >
        {copied ? <Check size={13} /> : <Share2 size={13} />}
      </button>

      {showTooltip && !copied && (
        <div style={{
          position: 'absolute',
          bottom: '125%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.85)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          whiteSpace: 'nowrap',
          zIndex: 100,
          pointerEvents: 'none',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'fadeInUp 0.2s ease-out'
        }}>
          Partager ce post
        </div>
      )}

      {copied && (
        <div style={{
          position: 'absolute',
          bottom: '125%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#22c55e',
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
          animation: 'fadeInUp 0.2s ease-out'
        }}>
          Lien copié !
        </div>
      )}

      <style jsx>{`
        .share-post-btn:hover {
          color: ${copied ? '#22c55e' : 'var(--accent)'} !important;
          background: rgba(255,255,255,0.05) !important;
        }
      `}</style>
    </div>
  );
}
