"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";

export default function ProfileForm({ user }: { user: any }) {
  const [name, setName] = useState(user.name || "");
  const [image, setImage] = useState(user.image || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        body: JSON.stringify({ name, image }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setToast({ message: "Profil mis à jour avec succès !", type: "success" });
        setTimeout(() => window.location.reload(), 1500); // Give time for toast
      } else {
        setToast({ message: "Erreur lors de la mise à jour.", type: "error" });
      }
    } catch (error) {
      setToast({ message: "Une erreur est survenue.", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsModalOpen(false);
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "POST" });
      if (res.ok) {
        setToast({ message: "Compte supprimé avec succès.", type: "success" });
        setTimeout(() => signOut({ callbackUrl: "/" }), 1500);
      } else {
        setToast({ message: "Erreur lors de la suppression.", type: "error" });
        setIsDeleting(false);
      }
    } catch (error) {
      setToast({ message: "Une erreur est survenue.", type: "error" });
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="name" style={{ fontWeight: '600', color: '#ccc' }}>Pseudo</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: '0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="image" style={{ fontWeight: '600', color: '#ccc' }}>URL de l'avatar</label>
          <input
            id="image"
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
            style={{
              padding: '0.8rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white'
            }}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isUpdating}>
          {isUpdating ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>

      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
        <h3 style={{ color: '#ff4444', marginBottom: '1rem' }}>Zone de danger</h3>
        <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1rem' }}>
          La suppression de votre compte effacera toutes vos données et vos préférences de manière permanente.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
          style={{ background: '#440000', color: '#ff4444', border: '1px solid #ff4444' }}
          disabled={isDeleting}
        >
          {isDeleting ? "Suppression..." : "Supprimer mon compte"}
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le compte"
        message="Êtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données seront effacées de manière permanente."
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
