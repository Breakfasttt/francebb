import React from 'react';
import Link from 'next/link';
import { Button, Card } from '@bbfrance/ui';

/**
 * Page 404 de FranceBB (refonte, carte 090, ADR 0006) : une carte sobre, « Terrain impraticable », une phrase qui dit
 * ce qui se passe et quoi faire, et un bouton vers l'accueil (DESIGN.md : pas d'icône géante, pas de « Oups »).
 * Seulement les variables de couleur v2 : lisible dans tous les thèmes.
 */
export default function NotFound() {
  return (
    <div className="flex justify-center px-3 py-8 font-bb-sans text-base text-bb-text lg:py-16">
      <Card className="flex w-full max-w-lg flex-col items-start gap-3 p-6 lg:p-8">
        <div>
          <p className="m-0 font-bb-heading text-bb-label text-bb-text-muted">Erreur 404</p>
          <h1 className="font-bb-display text-[1.75rem] lg:text-[2.25rem] text-bb-text">Terrain impraticable</h1>
        </div>
        <p className="m-0 text-bb-text-muted">
          Cette page n’existe pas ou a été déplacée. Vérifie l’adresse, ou repars de l’accueil.
        </p>
        <Button asChild variant="primary" size="tap" className="w-full sm:w-auto">
          <Link href="/" className="no-underline">Retour à l’accueil</Link>
        </Button>
      </Card>
    </div>
  );
}
