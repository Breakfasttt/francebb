import React from 'react';
import PremiumCard from '@/common/components/PremiumCard/PremiumCard';

export default function ForumLoading() {
  return (
    <div className="forum-page container" style={{ opacity: 0.7 }}>
      <div className="forum-layout" style={{ marginTop: '2rem' }}>
        <div className="forum-main-content">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-category" style={{ marginBottom: '2rem' }}>
              <div className="skeleton-title" style={{ 
                height: '30px', 
                width: '200px', 
                background: 'var(--glass-bg)', 
                marginBottom: '1rem',
                borderRadius: '8px'
              }}></div>
              {[1, 2].map((j) => (
                <PremiumCard key={j} className="skeleton-forum-card" style={{ height: '80px', marginBottom: '0.5rem' }}>
                  <div className="animate-pulse" style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)' }}></div>
                </PremiumCard>
              ))}
            </div>
          ))}
        </div>
        <div className="forum-sidebar desktop-only">
          <div className="skeleton-sidebar-box" style={{ height: '400px', width: '300px', background: 'var(--card-bg)', borderRadius: '12px' }}></div>
        </div>
      </div>
    </div>
  );
}
