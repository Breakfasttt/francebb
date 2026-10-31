/**
 * Éditeur d'archives du classement CDF `/classement/edit-archive` (refonte, carte 097, ADR 0006), réservé à la
 * modération : `?year=` ouvre une archive existante, `?importYear=` reprend un import de l'ancien site
 * (teamfrancebb.fr), sans paramètre l'éditeur crée une archive. Écran de saisie plein écran sur téléphone
 * (`ComposeScreen`, sans la barre de navigation du bas : voir `isComposePath`).
 */
import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { redirect } from "next/navigation";
import ComposeScreen from "@/app/forum/component/ComposeScreen";
import ArchiveEditor from "./ArchiveEditor";
import { fetchLegacyRanking } from "../actions";


export default async function EditArchivePage({ searchParams }: { searchParams: Promise<{ year?: string, importYear?: string }> }) {
  const { year: yearStr, importYear: importYearStr } = await searchParams;
  const session = await getActiveSession();
  
  if (!session?.user || !isModerator(session.user.role)) {
    redirect("/classement");
  }

  let initialData = {
    year: yearStr ? parseInt(yearStr) : (importYearStr ? parseInt(importYearStr) : new Date().getFullYear()),
    name: yearStr ? `Championnat de France ${yearStr}` : (importYearStr ? `Championnat de France ${importYearStr}` : `Championnat de France ${new Date().getFullYear()}`),
    rankingData: [] as any[]
  };

  if (yearStr) {
    const archive = await prisma.rankingArchive.findUnique({
      where: { year: parseInt(yearStr) }
    });
    
    if (archive) {
      initialData = {
        year: archive.year,
        name: archive.name,
        rankingData: JSON.parse(archive.data)
      };
    }
  } else if (importYearStr) {
    const res = await fetchLegacyRanking(parseInt(importYearStr));
    if (res.success && res.data) {
      initialData = {
        year: res.data.year,
        name: res.data.name,
        rankingData: res.data.rankingData
      };
    }
  }

  const allUsers = await prisma.user.findMany({
    where: { isBanned: false },
    select: { id: true, name: true, image: true, avatarFrame: true, nafNumber: true },
  });

  return (
    <ComposeScreen
      title={yearStr ? "Modifier l'archive" : "Nouvelle archive"}
      subtitle={yearStr ? `Classement du Championnat de France ${yearStr}` : importYearStr ? `Import de l'année ${importYearStr} depuis l'ancien site` : "Saisie à la main des résultats du Championnat de France"}
      backHref="/classement"
      backTitle="Retour au classement"
    >
      <ArchiveEditor initialData={initialData} allUsers={allUsers} />
    </ComposeScreen>
  );
}
