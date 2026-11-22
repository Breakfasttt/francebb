"use client";

/**
 * Bouton « Me déconnecter » des pages sans navigation (carte 221) : la page d'un banni (seule sortie, toute autre
 * rubrique le renvoie ici) et l'inscription d'un nouveau membre. Même déconnexion que le menu du compte
 * (signOutUser, hub compris). `variant` : principal sur /banned, discret sous le formulaire d'inscription.
 */
import { LogOut } from "lucide-react";
import { Button } from "@bbfrance/ui";
import { signOutUser } from "@/common/utils/signOutUser";

export default function LogoutButton({ hubLogout, variant = "primary" }: { hubLogout: boolean; variant?: "primary" | "quiet" }) {
  return (
    <Button type="button" variant={variant} size="tap" className="gap-1.5 max-lg:w-full" onClick={() => signOutUser(hubLogout)}>
      <LogOut size={18} aria-hidden="true" />
      Me déconnecter
    </Button>
  );
}
