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
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
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
      />
      
      <div className={`mobile-sidebar-container ${isOpen ? "open" : ""}`}>
        <div className="mobile-sidebar-header">
          <SiteLogo scale={0.6} />
          <button className="mobile-sidebar-close" onClick={onClose} aria-label="Fermer le menu">
            <X size={24} />
          </button>
        </div>

        <div className="mobile-sidebar-body">
          {/* Bloc User / Auth */}
          <div style={{ padding: '0.5rem 1.5rem' }}>
            <SignInButton user={session?.user} />
          </div>

          <div className="mobile-sidebar-divider" />

          {/* Core Navigation */}
          <Link href="/" className="mobile-nav-item">
            <Home size={20} /> Accueil
          </Link>
          <Link href="/forum" className="mobile-nav-item">
            <MessageSquare size={20} /> Forum
          </Link>
          <Link href="/annuaire" className="mobile-nav-item">
            <Map size={20} /> Annuaire
          </Link>
          <Link href="/jouer" className="mobile-nav-item">
            <BookOpen size={20} /> Comment Jouer
          </Link>

          {/* Social / Private */}
          {session?.user && (
            <>
              <div className="mobile-sidebar-divider" />
              <Link href="/profile?tab=pm" className="mobile-nav-item">
                <Mail size={20} /> 
                Messagerie
                {unreadCount > 0 && <span className="mobile-sidebar-badge">{unreadCount}</span>}
              </Link>
            </>
          )}

          {/* Admin / Mod */}
          {(isAdmin || isMod) && (
            <>
              <div className="mobile-sidebar-divider" />
              {isMod && (
                <Link href="/moderation" className="mobile-nav-item danger">
                  <ShieldAlert size={20} /> 
                  Modération
                  {pendingModCount > 0 && <span className="mobile-sidebar-badge danger">{pendingModCount}</span>}
                </Link>
              )}
              {isAdmin && (
                <Link href="/administration" className="mobile-nav-item danger">
                  <Settings size={20} /> Administration
                </Link>
              )}
            </>
          )}

          <div className="mobile-sidebar-divider" />

          {/* Portail dynamique pour les sous-navigations (Sidebars Locales) */}
          <div id="mobile-page-sidebar-slot" className="mobile-sidebar-slot">
            {/* React Portal injectera le contenu de la page courante ici */}
          </div>
        </div>

        {/* Pied de menu : équivalent du footer desktop */}
        <div className="mobile-sidebar-footer">
          <Link href="/mentions-legales">Mentions légales</Link>
          <span>Conçu avec l'aide de l'IA</span>
          <a 
            href="https://github.com/Breakfasttt/francebb" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
          >
            <Github size={14} /> GitHub
          </a>
        </div>
      </div>
    </>
  );
}
