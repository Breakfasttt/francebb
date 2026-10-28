"use client";

import { useTransition, useState } from "react";
import { Save, Shield } from "lucide-react";
import CTAButton from "@/common/components/Button/CTAButton";
import Toast from "@/common/components/Toast/Toast";
import { updateLigue } from "@/app/ligues/actions";

interface LigueEditSubmitProps {
  ligueId: string;
}

export default function LigueEditSubmit({ ligueId }: LigueEditSubmitProps) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await updateLigue(ligueId, formData);
        if (result.success) {
          setToast({ message: "Ligue mise à jour avec succès !", type: "success" });
        } else {
          setToast({ message: "Erreur lors de la mise à jour.", type: "error" });
        }
      } catch (error) {
        setToast({ message: "Une erreur est survenue.", type: "error" });
      }
    });
  };

  return (
    <>
      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
        <CTAButton 
          type="submit" 
          fullWidth 
          isLoading={isPending}
          formAction={handleSubmit}
          icon={<Save size={18} />}
          size="lg"
        >
          Enregistrer
        </CTAButton>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}
