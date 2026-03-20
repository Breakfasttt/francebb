"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function SignInButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return <button className="btn-primary" disabled>Chargement...</button>;

  if (session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {session.user?.image && (
            <img 
              src={session.user.image} 
              alt="Avatar" 
              style={{ width: '32px', height: '32px', borderRadius: '50%' }} 
            />
          )}
          <span>{session.user?.name || "Joueur"}</span>
        </a>
        <button onClick={() => alert("Mode Simulation : Déconnexion désactivée")} className="btn-primary" style={{ background: '#333' }}>
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <button className="btn-primary">
      Connecté (Simulé)
    </button>
  );
}
