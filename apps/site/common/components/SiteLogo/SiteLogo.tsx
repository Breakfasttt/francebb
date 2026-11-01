/*
  SiteLogo : le logo officiel (images/logo3.png), qui est aussi un lien vers l'accueil.
  La zone cliquable fait au moins 44 pixels de haut (taille d'un pouce), même quand le logo est plus petit, comme dans
  la barre du haut sur téléphone (carte 101).
*/
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    <Link href="/" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-bb-sm transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bb-focus">
      <span className="flex items-center justify-center">
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
          className="drop-shadow-md"
          style={{ width: 'auto', height: `${h}px`, objectFit: 'contain' }}
        />
      </span>
    </Link>
  );
};

export default SiteLogo;
