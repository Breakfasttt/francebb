/**
 * Modification d'une ressource `/ressources/edit/[id]` (refonte, carte 096) : le même formulaire que la proposition
 * (`ResourceForm`), prérempli, dans un écran de rédaction plein écran sur téléphone.
 * Droits inchangés depuis avant la refonte : l'auteur et la modération modifient une ressource, qui repasse alors en
 * attente de validation ; un outil officiel (ou bbscheme) n'est modifiable que par un administrateur. Quelqu'un d'autre
 * voit le message « Action non autorisée ». Une ressource introuvable renvoie à la liste.
 * L'action serveur `updateResourceAction` vérifie de nouveau ces droits à l'enregistrement.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button, Card, EmptyState } from "@bbfrance/ui";
import { getActiveSession } from "@/lib/authGuard";
import { isAdmin, isModerator } from "@/lib/roles";
import ComposeScreen from "@/app/forum/component/ComposeScreen";
import ResourceForm from "@/app/ressources/component/ResourceForm";
import { getResource } from "@/app/ressources/actions";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [resource, session] = await Promise.all([getResource(id), getActiveSession()]);
  if (!resource) redirect("/ressources");

  const user = session?.user;
  const isSystem = resource.isSystem || resource.id === "bbscheme";
  const canEdit = isSystem ? isAdmin(user?.role) : isModerator(user?.role) || (!!user?.id && user.id === resource.authorId);

  return (
    <ComposeScreen
      title="Éditer la ressource"
      subtitle={resource.title}
      backHref="/ressources"
      backTitle="Retour aux ressources"
    >
      {canEdit ? (
        <ResourceForm
          initialData={{
            id: resource.id,
            title: resource.title,
            description: resource.description,
            imageUrl: resource.imageUrl,
            link: resource.link,
            tags: resource.tags.map((tag) => tag.name),
            isSystem,
          }}
        />
      ) : (
        <Card>
          <EmptyState
            icon={<AlertTriangle size={40} className="text-bb-danger-text" />}
            title="Action non autorisée"
            action={
              <Button asChild variant="secondary" size="tap">
                <Link href="/ressources">Retour aux ressources</Link>
              </Button>
            }
          >
            Vous n&apos;avez pas les droits nécessaires pour modifier cette ressource.
          </EmptyState>
        </Card>
      )}
    </ComposeScreen>
  );
}
