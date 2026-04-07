"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ResourceForm from "../component/ResourceForm/ResourceForm";
import { submitResource } from "../actions";
import { toast } from "react-hot-toast";
import { Layout } from "lucide-react";

export default function SubmitResourcePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const res = await submitResource(formData);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Ressource soumise avec succès ! Elle sera visible après validation par l'équipe.");
      router.push("/ressources");
      return { success: true };
    } else {
      toast.error(res.error || "Une erreur est survenue");
      return { error: res.error || "Erreur" };
    }
  };

  return (
    <main className="container submit-resource-page">
      <PageHeader
        title="Soumettre une ressource"
        subtitle="Partagez un outil, un guide ou une aide de jeu avec la communauté"
        backHref="/ressources"
        backTitle="Retour aux ressources"
      />

      <div style={{ marginTop: '2.5rem' }}>
        <ResourceForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="submission-info" style={{ 
        maxWidth: '800px', 
        margin: '2rem auto', 
        padding: '1.5rem', 
        background: 'var(--primary-transparent)', 
        borderRadius: '12px',
        border: '1px solid var(--primary-transparent)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        color: 'var(--primary)'
      }}>
        <Layout size={24} />
        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
          Toutes les ressources soumises sont examinées par l'équipe de modération pour garantir la qualité et la pertinence du contenu partagé.
        </p>
      </div>
    </main>
  );
}
