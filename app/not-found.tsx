import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import PremiumCard from '@/common/components/PremiumCard/PremiumCard';
import ClassicButton from '@/common/components/Button/ClassicButton';
import "./not-found.css";

/**
 * Page 404 personnalisée pour BBFrance.
 * Design premium, respectueux des thèmes et en français.
 */
export default function NotFound() {
  return (
    <div className="not-found-wrapper">
      <PremiumCard className="not-found-card">
        <div className="not-found-icon">
          <ShieldAlert size={50} strokeWidth={1.5} />
        </div>
        
        <header>
          <h1>404</h1>
          <h2>Terrain impraticable !</h2>
        </header>

        <p>
          Oups ! Il semblerait que le ballon soit sorti des limites du terrain. 
          Cette page n'existe pas ou a été déplacée par un Gobelin farceur.
        </p>

        <div className="not-found-actions">
          <ClassicButton href="/" fullWidth>
            Retourner au vestiaire (Accueil)
          </ClassicButton>
        </div>
      </PremiumCard>
    </div>
  );
}
