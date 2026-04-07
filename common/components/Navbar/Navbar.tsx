"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, ShieldAlert, Mail } from 'lucide-react';
import SiteLogo from '@/common/components/SiteLogo/SiteLogo';
import { SignInButton } from "@/common/components/SignInButton/SignInButton";

interface NavbarProps {
  session: any;
  isAdmin: boolean;
  isMod: boolean;
  unreadCount: number;
  pendingModCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ session, isAdmin, isMod, unreadCount, pendingModCount }) => {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <nav className="nav">
      {/* On masque le logo uniquement sur la page d'accueil */}
      {!isHome ? (
        <SiteLogo scale={0.6} />
      ) : (
        <div style={{ width: '150px' }} /> /* Placeholder pour garder l'alignement si besoin, ou vide */
      )}

      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {isAdmin && (
          <Link
            href="/administration"
            title="Administration"
            className="nav-icon-capsule"
          >
            <Settings size={22} />
          </Link>
        )}
        {isMod && (
          <Link
            href="/moderation"
            title={`${pendingModCount} action(s) de modération en attente`}
            className="nav-icon-capsule"
            style={{ position: 'relative' }}
          >
            <ShieldAlert size={22} />
            {pendingModCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ef4444', // Rouge vif pour la modération
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
              }}>
                {pendingModCount > 9 ? '9+' : pendingModCount}
              </span>
            )}
          </Link>
        )}
        {session?.user && (
          <a
            href="/profile?tab=pm"
            title={`${unreadCount} message(s) non lu(s)`}
            className="nav-icon-capsule"
            style={{ position: 'relative' }}
          >
            <Mail size={22} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--primary)',
                color: 'var(--badge-text)',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </a>
        )}
        <SignInButton user={session?.user} />
      </div>
    </nav>
  );
};

export default Navbar;
