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
}

const Navbar: React.FC<NavbarProps> = ({ session, isAdmin, isMod, unreadCount }) => {
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
            title="Modération"
            className="nav-icon-capsule"
          >
            <ShieldAlert size={22} />
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
