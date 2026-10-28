"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, ShieldAlert, Mail, Menu, X as CloseIcon } from 'lucide-react';
import SiteLogo from '@/common/components/SiteLogo/SiteLogo';
import { SignInButton } from "@/common/components/SignInButton/SignInButton";
import MobileSidebar from '@/common/components/MobileSidebar/MobileSidebar';
import GlobalPortal from '@/common/components/GlobalPortal/GlobalPortal';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="nav">
      {/* Hamburger Menu on Mobile - Positioned LEFT */}
      <div 
        role="button"
        tabIndex={0}
        className="nav-icon-capsule mobile-only" 
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsMobileMenuOpen(!isMobileMenuOpen);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }
        }}
        aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        style={{ marginRight: 'auto' }}
      >
        {isMobileMenuOpen ? <CloseIcon size={22} /> : <Menu size={22} />}
      </div>

      {/* Site Logo - Desktop Only */}
      <div className="desktop-only" style={{ display: 'flex', alignItems: 'center' }}>
        {!isHome ? (
          <SiteLogo scale={0.6} />
        ) : (
          <div style={{ width: '150px' }} />
        )}
      </div>

      {/* Normal links, hidden on Mobile */}
      <div className="nav-links desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
              <span className="nav-badge danger">
                {pendingModCount > 9 ? '9+' : pendingModCount}
              </span>
            )}
          </Link>
        )}
        {session?.user && (
          <Link
            href="/messagerie"
            title={`${unreadCount} message(s) non lu(s)`}
            className="nav-icon-capsule"
            style={{ position: 'relative' }}
          >
            <Mail size={22} />
            {unreadCount > 0 && (
              <span className="nav-badge primary">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        )}
        <div className="desktop-only" style={{ marginLeft: '1rem' }}>
          <SignInButton user={session?.user} />
        </div>
      </div>

      {/* Slot pour le bouton retour mobile (PageHeader) - EXTÉRIEUR au bloc desktop */}
      <div id="mobile-back-button-slot" className="mobile-only" style={{ marginLeft: 'auto' }}>
        {/* Injecté dynamiquement par PageHeader via Portail */}
      </div>

      <GlobalPortal>
        <MobileSidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
          session={session}
          isAdmin={isAdmin}
          isMod={isMod}
          unreadCount={unreadCount}
          pendingModCount={pendingModCount}
        />
      </GlobalPortal>
    </nav>
  );
};

export default Navbar;
