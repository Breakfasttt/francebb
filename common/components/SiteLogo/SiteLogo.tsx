"use client";

import React from 'react';
import Link from 'next/link';
import './SiteLogo.css';

interface SiteLogoProps {
  scale?: number; // pour l'adapter si besoin mais par défaut 1
}

/**
 * SiteLogo - Composant de marque officiel "Blood Bowl France"
 * Version: Fédération Moderne (Capsule Unifiée)
 */
const SiteLogo = ({ scale = 1 }: SiteLogoProps) => {
  const logoSize = 100 * scale;
  const capsuleHeight = 80 * scale;
  const capsuleWidth = 220 * scale;
  const fontSizeFrance = 2.8 * scale;
  const fontSizeBB = 1.1 * scale;
  const borderRadius = 16 * scale;
  const borderWidth = 1.8 * scale;
  const capsuleMargin = -20 * scale;

  return (
    <Link href="/" className="badge-structure" style={{ margin: `0 ${10 * scale}px 0 0` }}>

      {/* 1. Le Blason (Logo Image) */}
      <div
        className="logo-box"
        style={{
          width: logoSize,
          height: logoSize,
          borderRadius: `${borderRadius}px`,
          borderWidth: `${borderWidth}px`
        }}
      >
        <img
          src="/images/lofo_fbb.jpg"
          alt="BB France Logo"
          onError={(e) => {
            const tgt = e.currentTarget;
            tgt.style.display = 'none';
            if (tgt.parentElement) tgt.parentElement.innerHTML = 'FBB';
          }}
        />
      </div>

      {/* 2. La Capsule de Texte */}
      <div
        className="capsule-text"
        style={{
          height: capsuleHeight,
          width: capsuleWidth,
          padding: `0 ${15 * scale}px ${2 * scale}px ${30 * scale}px`,
          marginLeft: `${capsuleMargin}px`,
          borderRadius: `0 ${borderRadius}px ${borderRadius}px 0`,
          borderWidth: `${borderWidth}px`
        }}
      >
        <div className="text-row france" style={{ fontSize: `${fontSizeFrance}rem` }}>FRANCE</div>
        <div className="text-row bb" style={{ fontSize: `${fontSizeBB}rem`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>BLOOD</span>
          <svg width={20 * scale} height={14 * scale} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: `0 ${2 * scale}px`, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}>
            <ellipse cx="12" cy="8" rx="10" ry="6" fill="url(#ballGradient)" />
            <path d="M7 8H17M10 6V10M12 6V10M14 6V10" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <path d="M4 4L2 2M20 4L22 2M4 12L2 14M20 12L22 14" stroke="#8b1111" strokeWidth="1.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="ballGradient" x1="0" y1="0" x2="24" y2="16" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a71d1d" />
                <stop offset="1" stopColor="#ED2939" />
              </linearGradient>
            </defs>
          </svg>
          <span>BOWL</span>
        </div>
      </div>

    </Link>
  );
};

export default SiteLogo;
