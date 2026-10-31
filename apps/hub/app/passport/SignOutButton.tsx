"use client";

/**
 * Déconnexion du passeport sur cet appareil. Les applications gardent leur propre session.
 */
import { authClient } from "@/lib/authClient";
import { Button } from "@bbfrance/ui";

export default function SignOutButton() {
  const signOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };
  return (
    <Button variant="secondary" size="tap" type="button" onClick={signOut}>Se déconnecter du passeport</Button>
  );
}
