"use client";
import Link from "next/link";

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

  const handleConnect = () => {
    document.cookie = `simulated_user_id=; path=/; max-age=0`;
    window.location.reload();
  };

  if (!user) {
    return (
      <Link href="/auth/login" className="btn-primary" style={{ textDecoration: 'none' }}>
        Se connecter
      </Link>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <a href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
        {user.image && (
          <img
            src={user.image}
            alt="Avatar"
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
        )}
        <span>{user.name || "Joueur"}</span>
      </a>
      <button
        onClick={handleDisconnect}
        className="btn-primary"
        style={{ background: '#333' }}
      >
        Déconnexion
      </button>
    </div>
  );
}
