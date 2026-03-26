"use client";

import Link from "next/link";
import "./SignInButton.css";

interface SignInButtonProps {
  user?: {
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
}

export function SignInButton({ user }: SignInButtonProps) {

  const handleDisconnect = () => {
    document.cookie = `simulated_user_id=DISCONNECTED; path=/; max-age=31536000`;
    window.location.reload();
  };

  if (!user) {
    return (
      <Link href="/auth/login" className="btn-login" style={{ textDecoration: 'none' }}>
        Connexion
      </Link>
    );
  }

  return (
    <div className="signin-container">
      <Link href="/profile" className="user-capsule">
        {user.image ? (
          <img
            src={user.image}
            alt="Avatar"
            className="user-avatar"
          />
        ) : (
          <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
             {user.name?.[0]?.toUpperCase() || 'J'}
          </div>
        )}
        <span className="user-name">{user.name || "Joueur"}</span>
      </Link>
      <button
        onClick={handleDisconnect}
        className="btn-logout"
      >
        Déconnexion
      </button>
    </div>
  );
}
