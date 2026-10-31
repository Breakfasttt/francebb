/**
 * Création d'une ligue `/ligues/create` (refonte, carte 094) : écran de rédaction plein écran sur téléphone
 * (`ComposeScreen`, sans la barre de navigation du bas), avec la barre d'envoi collée en bas de l'écran.
 * Réservé aux membres connectés : un visiteur est envoyé vers la connexion, puis revient ici.
 */
import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import ComposeScreen from "@/app/forum/component/ComposeScreen";
import LigueForm from "@/app/ligues/component/LigueForm";
// Styles des blocs BBCode (spoiler, accordéon, galerie) affichés dans l'aperçu de l'éditeur
import "@/app/forum/page.css";

export default async function CreateLiguePage() {
  const session = await getActiveSession();
  if (!session) redirect("/auth/login?callbackUrl=/ligues/create");

  const [coachRegions, franceRegions, departments] = await Promise.all([
    prisma.referenceData.findMany({ where: { group: "COACH_REGION", isActive: true }, orderBy: { order: "asc" }, select: { key: true, label: true } }),
    prisma.referenceData.findMany({ where: { group: "REGION_FRANCE", isActive: true }, orderBy: { order: "asc" }, select: { key: true, label: true } }),
    prisma.referenceData.findMany({ where: { group: "DEPARTEMENT_FRANCE", isActive: true }, orderBy: { order: "asc" }, select: { key: true, label: true } }),
  ]);

  return (
    <ComposeScreen
      title="Créer une ligue"
      subtitle="Regroupez votre communauté Blood Bowl locale"
      backHref="/ligues"
      backTitle="Retour aux ligues"
    >
      <LigueForm referenceData={{ coachRegions, franceRegions, departments }} canEditCommissaires />
    </ComposeScreen>
  );
}
