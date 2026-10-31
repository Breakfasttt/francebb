import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button, Card } from '@bbfrance/ui';

/**
 * Page 404 de BBFrance (refonte, carte 090, ADR 0006) : une carte centrée, « Terrain impraticable ! », et un bouton
 * vers l'accueil. Seulement les variables de couleur v2 : lisible dans tous les thèmes.
 */
export default function NotFound() {
  return (
    <div className="flex justify-center px-3 py-8 font-bb-sans text-base text-bb-text lg:py-16">
      <Card className="flex w-full max-w-lg flex-col items-center gap-4 p-6 text-center lg:p-8">
        <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-bb-accent-soft text-bb-accent-text">
          <ShieldAlert size={36} strokeWidth={1.5} />
        </span>
        <div>
          <p className="m-0 text-sm font-bold tracking-wide text-bb-accent-text">Erreur 404</p>
          <h1 className="m-0 border-0 p-0 text-2xl leading-tight font-bold text-bb-text normal-case not-italic">Terrain impraticable !</h1>
        </div>
        <p className="m-0 text-bb-text-muted">
          Oups ! Il semblerait que le ballon soit sorti des limites du terrain.
          Cette page n’existe pas ou a été déplacée par un Gobelin farceur.
        </p>
        <Button asChild variant="primary" size="tap" className="w-full sm:w-auto">
          <Link href="/" className="no-underline">Retourner au vestiaire (accueil)</Link>
        </Button>
      </Card>
    </div>
  );
}
