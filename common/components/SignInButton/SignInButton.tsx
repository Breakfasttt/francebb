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
    import("next-auth/react").then(({ signOut }) => {
      signOut({ callbackUrl: "/" });
    });
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
