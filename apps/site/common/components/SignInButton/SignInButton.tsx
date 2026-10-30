"use client";

import Link from "next/link";
import "./SignInButton.css";
import { LogIn, LogOut } from "lucide-react";
import CTAButton from "@/common/components/Button/CTAButton";
import ClassicButton from "@/common/components/Button/ClassicButton";
import { signOutUser } from "@/common/utils/signOutUser";

interface SignInButtonProps {
  /** Membre connecté via le hub : la déconnexion passe par /auth/logout pour fermer aussi la session hub. */
  hubLogout?: boolean;
  user?: {
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
}

export function SignInButton({ user, hubLogout = false }: SignInButtonProps) {
  const handleDisconnect = () => signOutUser(hubLogout);

  if (!user) {
    return (
      <CTAButton href="/auth/login" icon={LogIn} className="signin-action">
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
        className="signin-action"
      >
        Déconnexion
      </ClassicButton>
    </div>
  );
}
