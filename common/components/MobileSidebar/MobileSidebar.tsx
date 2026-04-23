"use client";

import React, { useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Home, Map, MessageSquare, ShieldAlert, Settings, Mail, Github, BookOpen } from 'lucide-react';
import SiteLogo from '@/common/components/SiteLogo/SiteLogo';
import { SignInButton } from "@/common/components/SignInButton/SignInButton";
import "./MobileSidebar.css";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  isAdmin: boolean;
  isMod: boolean;
  unreadCount: number;
  pendingModCount: number;
}

export default function MobileSidebar({
  isOpen, onClose, session, isAdmin, isMod, unreadCount, pendingModCount
}: MobileSidebarProps) {
  const pathname = usePathname();

  // Bloquer le scroll du body quand on ouvre le menu
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  // Fermer la sidebar au changement de route
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <div 
        className={`mobile-sidebar-overlay ${isOpen ? "open" : ""}`} 
        onClick={onClose} 
        style={{ touchAction: 'none' }}
      />
      
      <div className={`mobile-sidebar-container ${isOpen ? "open" : ""}`}>
        <div className="mobile-sidebar-header">
          <SiteLogo scale={0.6} />
          <button className="mobile-sidebar-close" onClick={onClose} aria-label="Fermer le menu">
            <X size={24} />
          </button>
        </div>

        <div className="mobile-sidebar-body">
          {/* 1. Connexion / Profil / Déconnexion */}
          <div className="mobile-sidebar-user-section">
            <SignInButton user={session?.user} />
          </div>

          {/* 2. Icônes d'action style Desktop (Messagerie / Mod / Admin) */}
          <div className="mobile-utility-icons">
            {session?.user && (
              <Link href="/messagerie" className="nav-icon-capsule" style={{ position: 'relative' }}>
                <Mail size={22} />
                {unreadCount > 0 && <span className="nav-badge primary">{unreadCount}</span>}
              </Link>
            )}
            {isMod && (
              <Link href="/moderation" className="nav-icon-capsule" style={{ position: 'relative' }}>
                <ShieldAlert size={22} />
                {pendingModCount > 0 && <span className="nav-badge danger">{pendingModCount}</span>}
              </Link>
            )}
            {isAdmin && (
              <Link href="/administration" className="nav-icon-capsule">
                <Settings size={22} />
              </Link>
            )}
          </div>

          <div className="mobile-sidebar-divider" />

          {/* 3. Contenu dynamique (Sidebars locales / Tabs) */}
          <div id="mobile-page-sidebar-slot" className="mobile-sidebar-slot">
            {/* Les onglets de la page (Admin, Profil, etc.) apparaissent ici via Portail */}
          </div>
        </div>

        {/* Pied de menu : équivalent du footer desktop */}
        <div className="mobile-sidebar-footer">
          <div className="mobile-footer-links">
            <Link href="/mentions-legales">Mentions légales</Link>
            <a 
              href="https://github.com/Breakfasttt/francebb" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Github size={16} /> GitHub
            </a>
          </div>
          <div className="mobile-footer-credit">
            <span>Conçu avec l'aide de l'IA</span>
          </div>
        </div>
      </div>
    </>
  );
}
