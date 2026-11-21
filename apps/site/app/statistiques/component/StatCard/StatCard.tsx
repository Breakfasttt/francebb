/**
 * Un chiffre du tableau des statistiques (refonte, carte 090) : icône, nom, valeur en grand et courte explication.
 * Chaque chiffre est une paire nom et valeur d'une liste de définitions (`<dt>` et `<dd>`) : le parent fournit
 * l'élément `<dl>`.
 */
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  /** Gardée pour compatibilité, plus affichée (DESIGN.md : pas d'icône décorative) */
  icon?: React.ReactNode;
  description?: string;
}

/**
 * Une case du tableau de score (DESIGN.md) : grand chiffre en voix Display, intitulé en voix Heading, précision
 * discrète. Pas d'icône. Les cases sont séparées par les filets de leur grille (page statistiques).
 */
export default function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 bg-bb-surface p-4 lg:p-5">
      <dt className="font-bb-heading text-bb-label text-bb-text-muted">{label}</dt>
      <dd className="font-bb-display text-[2rem] text-bb-text tabular-nums lg:text-[2.75rem]">{value}</dd>
      {description && <dd className="text-sm text-bb-text-muted">{description}</dd>}
    </div>
  );
}
