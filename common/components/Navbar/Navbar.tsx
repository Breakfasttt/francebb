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
            style={{ color: 'var(--header-foreground)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            <Settings size={22} />
          </Link>
        )}
        {isMod && (
          <Link
            href="/moderation"
            title="Modération"
            style={{ color: 'var(--header-foreground)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            <ShieldAlert size={22} />
          </Link>
        )}
        {session?.user && (
          <a
            href="/profile?tab=pm"
            title={`${unreadCount} message(s) non lu(s)`}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--header-foreground)',
              textDecoration: 'none'
            }}
          >
            <Mail size={22} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                background: 'var(--primary)',
                color: 'white',
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
