import { MessageSquarePlus, Pin, Lock } from "lucide-react";
import Link from "next/link";
import { isModerator } from "@/lib/roles";
import "./CreateTopicSidebar.css";

interface CreateTopicSidebarProps {
  forumId: string;
  userRole?: string;
  submitLabel: string;
  icon?: any;
  isTournament?: boolean;
}

export default function CreateTopicSidebar({ forumId, userRole = "COACH", submitLabel, icon, isTournament = false }: CreateTopicSidebarProps) {
  const userCanStick = isModerator(userRole);

  return (
    <aside className="forum-sidebar">
      <div className="sidebar-sticky-inner">
        <div className="sidebar-widget" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <h3 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            borderBottom: '1px solid var(--glass-border)', 
            paddingBottom: '0.8rem', 
            margin: 0,
            color: 'var(--accent)',
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {icon || <MessageSquarePlus size={18} />} 
            <span>Publication</span>
          </h3>

          {userCanStick && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>
              <label className="forum-sidebar-label">
                <input type="checkbox" name="isSticky" value="on" className="forum-sidebar-checkbox" />
                <Pin size={14} style={{ opacity: 0.6 }} />
                <span>Épingler (Post-it)</span>
              </label>
              
              <label className="forum-sidebar-label">
                <input type="checkbox" name="isLocked" value="on" className="forum-sidebar-checkbox" />
                <Lock size={14} style={{ opacity: 0.6 }} />
                <span>Verrouiller le sujet</span>
              </label>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
            <button type="submit" className="widget-button" style={{ 
              width: '100%', 
              background: isTournament ? 'var(--accent)' : 'var(--primary)', 
              color: 'var(--header-foreground)',
              padding: '1rem', 
              fontSize: '1.1rem', 
              justifyContent: 'center',
              fontWeight: 800,
              boxShadow: isTournament ? '0 4px 15px rgba(255, 215, 0, 0.2)' : '0 4px 15px rgba(194, 29, 29, 0.3)'
            }}>
              {submitLabel.toUpperCase()}
            </button>
            <Link href={`/forum/${forumId}`} className="widget-button secondary-btn" style={{ width: '100%', justifyContent: 'center' }}>
              Annuler
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
