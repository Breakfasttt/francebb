"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { createDevUser } from "./actions";
import { Shield, UserPlus, ArrowLeft } from "lucide-react";
import { Avatar, Button, toast } from "@bbfrance/ui";

interface DevUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  image: string | null;
}

interface DevLoginSectionProps {
  initialUsers: DevUser[];
  callbackUrl: string;
}

/**
 * Section de connexion pour le développement (n'existe qu'avec NODE_ENV=development).
 * Permet de choisir un compte de test ou d'en créer un nouveau. Refonte (carte 091) : boutons et couleurs de
 * packages/ui, une ligne par compte, assez haute pour le pouce ; la connexion elle-même n'a pas changé.
 */
export default function DevLoginSection({ initialUsers, callbackUrl }: DevLoginSectionProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [users, setUsers] = useState(initialUsers);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateUser = async () => {
    setIsCreating(true);
    const result = await createDevUser();
    setIsCreating(false);

    if (result) {
      // Le client Prisma du site ne renvoie pas l'email : seuls les champs affichés sont gardés
      setUsers(prev => [{ id: result.id, name: result.name, email: null, role: result.role, image: result.image }, ...prev]);
      toast.success("Compte de test créé !");
    } else {
      toast.error("Échec de la création.");
    }
  };

  const handleSignIn = async (userId: string) => {
    await signIn("dev-login", { userId, redirectTo: callbackUrl });
  };

  if (!showSelector) {
    return (
      <div className="border-t border-dashed border-bb-border pt-4">
        <Button type="button" variant="quiet" size="tap" className="w-full" onClick={() => setShowSelector(true)}>
          <Shield size={18} aria-hidden="true" />
          🚀 Mode Développement
        </Button>
      </div>
    );
  }

  return (
    <section aria-labelledby="dev-login-title" className="flex flex-col gap-3 border-t border-dashed border-bb-border pt-4">
      <div className="flex items-center gap-2">
        <Button type="button" variant="quiet" size="tap" className="px-2" onClick={() => setShowSelector(false)}>
          <ArrowLeft size={16} aria-hidden="true" /> Retour
        </Button>
        <h2 id="dev-login-title" className="m-0 flex-1 border-0 p-0 text-right text-sm font-bold text-bb-text-muted normal-case not-italic">
          Comptes de test
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        {users.length > 0 ? (
          users.map(u => (
            <Button
              key={u.id}
              type="button"
              variant="secondary"
              size="tap"
              onClick={() => handleSignIn(u.id)}
              className="w-full justify-start gap-3 py-2 text-left font-normal whitespace-normal"
            >
              <Avatar src={u.image} name={u.name ?? "?"} size={32} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-bold">{u.name}</span>
                <span className="text-sm text-bb-text-muted">{u.role}</span>
              </span>
              <span className="shrink-0 text-xs text-bb-text-muted">ID: {u.id.slice(0, 8)}...</span>
            </Button>
          ))
        ) : (
          <p className="m-0 text-center text-sm text-bb-text-muted">
            Aucun compte de test disponible.
          </p>
        )}

        <Button type="button" variant="primary" size="tap" className="w-full" onClick={handleCreateUser} disabled={isCreating}>
          {!isCreating && <UserPlus size={16} aria-hidden="true" />}
          {isCreating ? "Création..." : "Créer un nouvel Admin de test"}
        </Button>
      </div>
    </section>
  );
}
