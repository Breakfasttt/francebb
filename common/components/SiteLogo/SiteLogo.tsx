"use client";

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
        <div className="text-row bb" style={{ fontSize: `${fontSizeBB}rem` }}>BLOOD BOWL</div>
      </div>

    </Link>
  );
};

export default SiteLogo;
