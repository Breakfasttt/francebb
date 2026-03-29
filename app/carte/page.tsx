import { prisma } from "@/lib/prisma";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { Map } from "lucide-react";
import CarteClient from "./component/CarteClient";
import "./page.css";

export const dynamic = "force-dynamic";

export default async function CartePage() {
  const [nextTournaments, ligues] = await Promise.all([
    prisma.tournament.findMany({
      where: { date: { gte: new Date() } },
      select: { id: true, name: true, location: true, lat: true, lng: true, date: true }
    }),
    prisma.ligue.findMany({
      select: { id: true, name: true, ville: true, lat: true, lng: true }
    })
  ]);

  return (
    <div className="carte-page-fixed">
      <PageHeader 
        title={<><Map className="icon-accent" size={32} /> La Carte du Blood Bowl</>}
        subtitle="Localisez les prochains tournois et les ligues à travers la France"
        backHref="/"
        backTitle="Accueil"
      />

      <div className="carte-content-body">
        <CarteClient 
          initialTournaments={nextTournaments} 
          initialLigues={ligues} 
        />
      </div>
    </div>
  );
}
