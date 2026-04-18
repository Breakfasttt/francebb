"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import Tooltip from "@/common/components/Tooltip/Tooltip";

interface SharePostButtonProps {
  postId: string;
  topicId: string;
  page: number;
}

export default function SharePostButton({ postId, topicId, page }: SharePostButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/forum/topic/${topicId}?page=${page}#post-${postId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <>
      <Tooltip text={copied ? "Lien copié !" : "Partager ce post"}>
        <button
          onClick={handleShare}
          className="share-post-btn"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: copied ? 'var(--success)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px 4px',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
        >
          {copied ? <Check size={13} /> : <Share2 size={13} />}
        </button>
      </Tooltip>

      <style jsx>{`
        .share-post-btn:hover {
          color: ${copied ? 'var(--success)' : 'var(--accent)'} !important;
          background: var(--glass-bg) !important;
        }
      `}</style>
    </>
  );
}
