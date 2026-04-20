import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tournaments = await prisma.tournament.findMany({
    select: { id: true, name: true, lat: true, lng: true, date: true }
  });
  
  const ligues = await prisma.ligue.findMany({
    select: { id: true, name: true, lat: true, lng: true }
  });

  console.log("=== TOURNOIS ===");
  console.log(`Total: ${tournaments.length}`);
  tournaments.forEach(t => {
    console.log(`- ${t.name}: lat=${t.lat}, lng=${t.lng}, date=${t.date}`);
  });

  console.log("\n=== LIGUES ===");
  console.log(`Total: ${ligues.length}`);
  ligues.forEach(l => {
    console.log(`- ${l.name}: lat=${l.lat}, lng=${l.lng}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
