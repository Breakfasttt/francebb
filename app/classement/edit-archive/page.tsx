import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import ArchiveEditor from "./ArchiveEditor";
import "./page.css";

export default async function EditArchivePage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const { year: yearStr } = await searchParams;
  const session = await auth();
  
  if (!session?.user || !isModerator(session.user.role)) {
    redirect("/classement");
  }

  let initialData = {
    year: yearStr ? parseInt(yearStr) : new Date().getFullYear(),
    name: yearStr ? `Championnat de France ${yearStr}` : `Championnat de France ${new Date().getFullYear()}`,
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
