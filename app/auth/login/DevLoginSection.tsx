"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { createDevUser } from "./actions";
import { User, Shield, UserPlus, ArrowLeft } from "lucide-react";
import AdminButton from "@/common/components/Button/AdminButton";
import CTAButton from "@/common/components/Button/CTAButton";
import toast from "react-hot-toast";

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
 * Section de connexion pour le développement.
 * Permet de choisir un compte de test ou d'en créer un nouveau.
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
      // @ts-ignore
      setUsers(prev => [result, ...prev]);
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
      <div className="dev-login-teaser" style={{ marginTop: "2rem" }}>
        <AdminButton 
          onClick={() => setShowSelector(true)}
          icon={<Shield size={18} />}
          fullWidth
        >
          🚀 Mode Développement
        </AdminButton>
      </div>
    );
  }

  return (
    <div className="dev-login-container">
      <div className="dev-login-header">
        <button onClick={() => setShowSelector(false)} className="dev-back-button">
          <ArrowLeft size={14} /> Retour
        </button>
        <span className="dev-section-title">Comptes de Test</span>
      </div>

      <div className="dev-users-list">
        {users.length > 0 ? (
          users.map(u => (
            <button
              key={u.id}
              onClick={() => handleSignIn(u.id)}
              className="dev-user-card"
            >
              <div className="dev-user-info">
                <div className="dev-user-avatar">
                  {u.image ? (
                    <img src={u.image} alt="" className="avatar-img" />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className="dev-user-details">
                  <p className="dev-user-name">{u.name}</p>
                  <p className="dev-user-role">{u.role}</p>
                </div>
              </div>
              <span className="dev-user-id">ID: {u.id.slice(0, 8)}...</span>
            </button>
          ))
        ) : (
          <div className="dev-no-users">
            Aucun compte de test disponible.
          </div>
        )}

        <div className="dev-actions">
          <CTAButton 
            onClick={handleCreateUser}
            disabled={isCreating}
            icon={isCreating ? null : <UserPlus size={16} />}
            fullWidth
          >
            {isCreating ? "Création..." : "Créer un nouvel Admin de test"}
          </CTAButton>
        </div>
      </div>
    </div>
  );
}
