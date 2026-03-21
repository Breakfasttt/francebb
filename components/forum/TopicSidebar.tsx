"use client";

import Link from "next/link";
import { MessageSquare, ArrowUp, ArrowDown } from "lucide-react";

export default function TopicSidebar({ topicId }: { topicId: string }) {
  return (
    <aside className="forum-sidebar">
      <div className="sidebar-sticky-inner">
        <div className="sidebar-widget-container">
          {/* Topic Actions Widget */}
          <div className="sidebar-widget topic-widget" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MessageSquare size={16} className="text-secondary" />
              Sujet
            </h3>
            
            <button 
              onClick={() => document.getElementById('quick-reply-area')?.scrollIntoView({ behavior: 'smooth' })}
              className="widget-button"
              style={{ background: 'var(--primary)', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <MessageSquare size={18} />
              <span>Répondre</span>
            </button>

            <button 
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="widget-button secondary-btn"
              style={{ textAlign: 'left' }}
            >
              <ArrowDown size={18} />
              <span>Dernier message</span>
            </button>

            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="widget-button secondary-btn"
              style={{ textAlign: 'left' }}
            >
              <ArrowUp size={18} />
              <span>Haut de page</span>
            </button>
          </div>

          {/* Quick navigation to Forum index */}
          <div className="sidebar-widget">
            <Link href="/forum" className="widget-button secondary-btn">
              <MessageSquare size={18} />
              <span>Index du Forum</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
