"use client";

import React from 'react';
import { MonitorOff } from 'lucide-react';
import CTAButton from '@/common/components/Button/CTAButton';
import Link from 'next/link';
import "./DesktopOnlyFallback.css";

interface DesktopOnlyFallbackProps {
  title?: string;
  message?: string;
}

export default function DesktopOnlyFallback({ 
  title = "Optimisé pour PC", 
  message = "Cet outil interactif nécessite un grand écran et une souris pour fonctionner correctement. Il n'est pas encore adapté aux écrans tactiles mobiles." 
}: DesktopOnlyFallbackProps) {
  return (
    <div className="desktop-fallback-container">
      <div className="desktop-fallback-card">
        <div className="fallback-icon-wrapper">
          <MonitorOff size={64} />
        </div>
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="fallback-actions">
          <Link href="/">
            <CTAButton label="Retour à l'accueil" />
          </Link>
        </div>
      </div>
    </div>
  );
}
