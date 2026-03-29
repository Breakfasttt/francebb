import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🏙️ Peuplement des coordonnées fictives pour test...");

  // Coordonnées de test : Paris, Lyon, Marseille, Bordeaux
  const locations = [
    { name: "Paris", lat: 48.8566, lng: 2.3522 },
    { name: "Lyon", lat: 45.7640, lng: 4.8357 },
    { name: "Marseille", lat: 43.2965, lng: 5.3698 },
    { name: "Bordeaux", lat: 44.8378, lng: -0.5792 },
    { name: "Lille", lat: 50.6292, lng: 3.0573 },
  ];

  // On récupère quelques tournois non terminés
  const tournaments = await prisma.tournament.findMany({
    where: { isFinished: false },
    take: locations.length
  });

  for (let i = 0; i < tournaments.length; i++) {
    const loc = locations[i];
    await prisma.tournament.update({
      where: { id: tournaments[i].id },
      data: { lat: loc.lat, lng: loc.lng }
    });
    console.log(`✅ Tournoi "${tournaments[i].name}" déplacé à ${loc.name}`);
  }

  // On récupère quelques ligues
  const ligues = await prisma.ligue.findMany({
    take: locations.length
  });

  for (let i = 0; i < ligues.length; i++) {
    const loc = locations[Math.min(i + 1, locations.length - 1)]; // Un peu décalé
    await prisma.ligue.update({
      where: { id: ligues[i].id },
      data: { lat: loc.lat, lng: loc.lng }
    });
    console.log(`✅ Ligue "${ligues[i].name}" déplacée à ${loc.name}`);
  }

  console.log("✨ Terminé ! Relancez la page Carte.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
