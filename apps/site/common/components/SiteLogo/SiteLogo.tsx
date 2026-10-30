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

// Dimensions réelles du fichier logo3.png, en pixels. Elles servent à calculer la largeur
// affichée à partir de la hauteur voulue, sans déformer le logo.
const LOGO_FILE_WIDTH = 1347;
const LOGO_FILE_HEIGHT = 589;

const SiteLogo: React.FC<SiteLogoProps> = ({ scale = 1 }) => {
  const baseHeight = 70; // Réduit après crop pour un affichage plus élégant
  const h = Math.round(baseHeight * scale);
  const w = Math.round((h * LOGO_FILE_WIDTH) / LOGO_FILE_HEIGHT);

  return (
    <Link href="/" className="site-logo-link">
      <div className="logo-wrapper">
        {/*
          Largeur et hauteur réelles d'affichage : next/image envoie alors une image à la
          taille du logo affiché (et en double pour les écrans haute définition), au lieu
          d'une image de la largeur de l'écran. Le fichier d'origine pèse 1,5 Mo.
        */}
        <Image
          src="/images/logo3.png"
          alt="Blood Bowl France"
          width={w}
          height={h}
          preload
          className="logo-image"
          style={{ width: 'auto', height: `${h}px`, objectFit: 'contain' }}
        />
      </div>
    </Link>
  );
};

export default SiteLogo;
