import { MessageSquarePlus, Pin, Lock } from "lucide-react";
import Link from "next/link";
import { isModerator } from "@/lib/roles";
import CTAButton from "@/common/components/Button/CTAButton";
import ClassicButton from "@/common/components/Button/ClassicButton";
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
            <CTAButton 
              type="submit" 
              style={{ width: '100%', whiteSpace: 'normal', lineHeight: '1.2', padding: '0.8rem 1rem' }}
              className={isTournament ? 'accent-btn' : ''}
            >
              {submitLabel}
            </CTAButton>
            <ClassicButton 
              href={`/forum/${forumId}`} 
              style={{ width: '100%' }}
            >
              Annuler
            </ClassicButton>
          </div>
        </div>
      </div>
    </aside>
  );
}
