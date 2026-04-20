import { prisma } from "@/lib/prisma";
import PageHeader from "@/common/components/PageHeader/PageHeader";
import { Map } from "lucide-react";
import CarteClient from "./component/CarteClient";
import "./page.css";
import "./page-mobile.css";


export const dynamic = "force-dynamic";

export default async function CartePage() {
  const [nextTournaments, ligues] = await Promise.all([
    prisma.tournament.findMany({
      where: { 
        date: { gte: new Date() },
        isFinished: false,
        isCancelled: false
      },
      take: 100, 
      select: { 
        id: true, 
        name: true, 
        location: true, 
        lat: true, 
        lng: true, 
        date: true,
        topic: { select: { id: true } }
      }
    }),
    prisma.ligue.findMany({
      select: { id: true, name: true, ville: true, lat: true, lng: true }
    })
  ]);

  return (
    <div className="carte-page-fixed">
      <PageHeader 
        title={<><Map className="icon-accent" size={24} /> La Carte du Blood Bowl</>}
        subtitle="Localisez les tournois et les ligues à travers la France"
        className="map-page-header"
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
