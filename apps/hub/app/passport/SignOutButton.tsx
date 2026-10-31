"use client";

/**
 * Déconnexion du passeport sur cet appareil. Les applications gardent leur propre session.
 */
import { authClient } from "@/lib/authClient";

export default function SignOutButton() {
  const signOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };
  return (
    <button className="hub-button" type="button" onClick={signOut}>Se déconnecter du passeport</button>
  );
}
