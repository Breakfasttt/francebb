"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ResourceForm from "@/app/ressources/component/ResourceForm/ResourceForm";
import { getResource, updateResourceAction } from "@/app/ressources/actions";
import { Loader2, AlertTriangle } from "lucide-react";
import PremiumCard from "@/common/components/PremiumCard/PremiumCard";
import { useSession } from "next-auth/react";
import { isModerator, isAdmin } from "@/lib/roles";
import { toast } from "react-hot-toast";
import ClassicButton from "@/common/components/Button/ClassicButton";
import CTAButton from "@/common/components/Button/CTAButton";

interface EditResourcePageProps {
  params: Promise<{ id: string }>;
}

export default function EditResourcePage({ params }: EditResourcePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadResource() {
      const data = await getResource(id);
      if (!data) {
        toast.error("Ressource introuvable");
        router.push("/ressources");
        return;
      }
      setResource(data);
      setLoading(false);
    }
    loadResource();
  }, [id, router]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const res = await updateResourceAction(id, formData);
    setIsSubmitting(false);
    
    if (res.success) {
      toast.success(resource.isSystem ? "Outil système mis à jour" : "Ressource mise à jour (repasse en modération)");
      router.push("/ressources");
      return { success: true };
    } else {
      toast.error(res.error || "Erreur lors de la mise à jour");
      return { error: res.error || "Erreur" };
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Chargement de la ressource...</p>
      </div>
    );
  }

  // Vérification des permissions
  const user = session?.user as any;
  const isAuthor = user?.id === resource.authorId;
  const isMod = isModerator(user?.role);
  const isSys = resource.isSystem || resource.id === 'bbpusher';

  const canEdit = isSys ? isAdmin(user?.role) : (isMod || isAuthor);

  if (!canEdit) {
    return (
      <div className="container" style={{ padding: '5rem 2rem' }}>
        <PremiumCard style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertTriangle size={48} color="var(--danger)" style={{ margin: '0 auto 1.5rem' }} />
          <h3>Action non autorisée</h3>
          <p>Vous n'avez pas les permissions nécessaires pour modifier cette ressource.</p>
          <ClassicButton onClick={() => router.push("/ressources")} style={{ marginTop: '1.5rem' }}>
            Retour aux ressources
          </ClassicButton>
        </PremiumCard>
      </div>
    );
  }

  return (
    <main className="container">
      <PageHeader 
        title="Éditer la ressource"
        subtitle={`Modification de "${resource.title}"`}
        backHref="/ressources"
        backTitle="Retour aux ressources"
      />

      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '5rem' }}>
        <ResourceForm 
          initialData={{
            title: resource.title,
            description: resource.description,
            imageUrl: resource.imageUrl,
            link: resource.link,
            tags: resource.tags.map((t: any) => t.name)
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Mettre à jour"
          onCancel={() => router.back()}
          isSystem={isSys}
        />
      </div>
    </main>
  );
}
