/**
 * Un chiffre du tableau des statistiques (refonte, carte 090) : icône, nom, valeur en grand et courte explication.
 * Chaque chiffre est une paire nom et valeur d'une liste de définitions (`<dt>` et `<dd>`) : le parent fournit
 * l'élément `<dl>`.
 */
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

export default function StatCard({ label, value, icon, description }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-bb-lg border border-bb-border bg-bb-surface p-3 lg:p-4">
      <dt className="flex items-center gap-2 text-sm font-semibold text-bb-text-muted">
        <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-bb-md bg-bb-accent-soft text-bb-accent-text">
          {icon}
        </span>
        <span className="min-w-0 break-words">{label}</span>
      </dt>
      <dd className="m-0 text-2xl leading-tight font-bold break-words text-bb-text lg:text-3xl">{value}</dd>
      {description && <dd className="m-0 text-sm text-bb-text-muted">{description}</dd>}
    </div>
  );
}
