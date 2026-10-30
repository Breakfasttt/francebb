"use client";

import { useTransition, useState } from "react";
import { Save, Shield } from "lucide-react";
import CTAButton from "@/common/components/Button/CTAButton";
import { toast } from "@bbfrance/ui";
import { updateLigue } from "@/app/ligues/actions";

interface LigueEditSubmitProps {
  ligueId: string;
}

export default function LigueEditSubmit({ ligueId }: LigueEditSubmitProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await updateLigue(ligueId, formData);
        if (result.success) {
          toast.success("Ligue mise à jour avec succès !");
        } else {
          toast.error(result.error || "Erreur lors de la mise à jour.");
        }
      } catch {
        toast.error("Une erreur est survenue.");
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

    </>
  );
}
