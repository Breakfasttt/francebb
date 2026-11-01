/**
 * Modification d'une ligue `/ligue/edit/[id]` (refonte, carte 094) : le même formulaire que la création
 * (`LigueForm`), prérempli, dans un écran de rédaction plein écran sur téléphone.
 * Ouvert au chef de ligue, aux commissaires et à la modération ; seuls le chef et la modération peuvent changer la
 * liste des commissaires. Un autre membre est renvoyé vers la fiche de la ligue, un visiteur vers la connexion.
 */
import { notFound, redirect } from "next/navigation";
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import ComposeScreen from "@/app/forum/component/ComposeScreen";
import LigueForm from "@/app/ligues/component/LigueForm";
// Styles des blocs BBCode (spoiler, accordéon, galerie) affichés dans l'aperçu de l'éditeur

export default async function EditLiguePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getActiveSession();
  if (!session) redirect(`/auth/login?callbackUrl=/ligue/edit/${id}`);

  const ligue = await prisma.ligue.findUnique({
    where: { id },
    include: {
      commissaires: { select: { id: true, name: true, image: true } }
    }
  });

  if (!ligue) notFound();

  const isCreator = session.user.id === ligue.creatorId;
  const isCommissaire = ligue.commissaires.some(c => c.id === session.user.id);
  const isMod = isModerator(session.user.role);

  if (!isCreator && !isCommissaire && !isMod) {
    redirect(`/ligue/${id}`);
  }

  const [coachRegions, franceRegions, departments] = await Promise.all([
    prisma.referenceData.findMany({ where: { group: "COACH_REGION", isActive: true }, orderBy: { order: "asc" }, select: { key: true, label: true } }),
    prisma.referenceData.findMany({ where: { group: "REGION_FRANCE", isActive: true }, orderBy: { order: "asc" }, select: { key: true, label: true } }),
    prisma.referenceData.findMany({ where: { group: "DEPARTEMENT_FRANCE", isActive: true }, orderBy: { order: "asc" }, select: { key: true, label: true } }),
  ]);

  return (
    <ComposeScreen
      title={`Modifier ${ligue.acronym}`}
      subtitle={ligue.name}
      backHref={`/ligue/${id}`}
      backTitle="Retour à la ligue"
    >
      <LigueForm
        ligueId={id}
        initialData={{
          name: ligue.name,
          acronym: ligue.acronym,
          geographicalZone: ligue.geographicalZone,
          region: ligue.region,
          departement: ligue.departement,
          ville: ligue.ville,
          address: ligue.address,
          lat: ligue.lat,
          lng: ligue.lng,
          description: ligue.description,
          image: ligue.image,
        }}
        referenceData={{ coachRegions, franceRegions, departments }}
        commissaires={ligue.commissaires}
        canEditCommissaires={isCreator || isMod}
      />
    </ComposeScreen>
  );
}
