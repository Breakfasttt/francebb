"use client";

import Link from "next/link";
import "./SignInButton.css";
import { LogIn, LogOut } from "lucide-react";
import CTAButton from "@/common/components/Button/CTAButton";
import ClassicButton from "@/common/components/Button/ClassicButton";

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
      <CTAButton href="/auth/login" icon={LogIn} style={{ height: '40px' }}>
        Connexion
      </CTAButton>
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
      <ClassicButton
        onClick={handleDisconnect}
        icon={LogOut}
        style={{ height: '40px' }}
      >
        Déconnexion
      </ClassicButton>
    </div>
  );
}
