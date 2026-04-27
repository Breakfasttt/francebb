import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ArchiveEditor from "./ArchiveEditor";
import { fetchLegacyRanking } from "../actions";
import "./page.css";
import "./page-mobile.css";


export default async function EditArchivePage({ searchParams }: { searchParams: Promise<{ year?: string, importYear?: string }> }) {
  const { year: yearStr, importYear: importYearStr } = await searchParams;
  const session = await auth();
  
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
    <main className="container ranking-edit-archive">
      <PageHeader 
        title={yearStr ? "Modifier l'archive" : "Nouvelle archive manuelle"}
        subtitle={yearStr ? `Année ${yearStr}` : "Saisie manuelle des résultats CDF"}
        backHref="/classement"
        backTitle="Retour au classement"
      />

      <div style={{ marginTop: '2rem' }}>
        <ArchiveEditor 
          initialData={initialData}
          allUsers={allUsers}
        />
      </div>
    </main>
  );
}
