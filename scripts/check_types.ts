import { PrismaClient } from '../prisma/generated-client';

const prisma = new PrismaClient();

async function main() {
  const tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
      typeCDF: true,
      isFinished: true,
      isCDF: true
    }
  });

  console.log('--- Tournaments ---');
  tournaments.forEach(t => {
    console.log(`[${t.id}] ${t.name}: isCDF=${t.isCDF}, isFinished=${t.isFinished}, typeCDF="${t.typeCDF}"`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
