/*
  SiteLogo - Gère l'affichage du logo officiel.
  Désormais utilise la nouvelle image logo3.png fournie.
*/
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './SiteLogo.css';

interface SiteLogoProps {
  scale?: number;
}

const SiteLogo: React.FC<SiteLogoProps> = ({ scale = 1 }) => {
  const baseHeight = 70; // Réduit après crop pour un affichage plus élégant
  const h = Math.round(baseHeight * scale);

  return (
    <Link href="/" className="site-logo-link">
      <div className="logo-wrapper">
        <Image
          src="/images/logo3.png"
          alt="Blood Bowl France"
          width={0}
          height={0}
          sizes="100vw"
          priority
          className="logo-image"
          style={{ width: 'auto', height: `${h}px`, objectFit: 'contain' }}
        />
      </div>
    </Link>
  );
};

export default SiteLogo;
