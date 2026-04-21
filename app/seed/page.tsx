"use client";

import { useEffect, useState } from "react";

/**
 * Page de Seed (Debug uniquement)
 * Permet de déclencher des initialisations depuis l'interface si besoin.
 */
export default function SeedPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Page de Seed</h1>
      <p>Cette page est utilisée pour l'initialisation des données.</p>
      <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '12px' }}>
        <p>Utilisez plutôt les commandes CLI pour le seed initial :</p>
        <code>npx prisma db seed</code>
      </div>
    </div>
  );
}
