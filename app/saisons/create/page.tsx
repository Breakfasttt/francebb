import { auth } from "@/auth";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { Plus } from "lucide-react";
import SeasonBuilder from "./component/SeasonBuilder";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CreateSeasonPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "COMMISSAIRE") {
    redirect("/saisons");
  }

  // On récupère les ligues existantes
  const ligues = await prisma.ligue.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <>
      <PageHeader 
        title="Créer une Saison" 
        subtitle="Outil réservé aux commissaires de Ligue" 
        icon={<Plus size={24} />} 
        backLink="/saisons" 
      />
      <div className="page-content">
        <SeasonBuilder ligues={ligues} />
      </div>
    </>
  );
}
