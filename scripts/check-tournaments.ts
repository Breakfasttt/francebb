import { prisma } from "../lib/prisma";

async function main() {
  const count = await prisma.tournament.count();
  const next = await prisma.tournament.findMany({
    where: {
      date: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: 'asc',
    },
    take: 3,
  });

  console.log("Total tournaments in DB:", count);
  console.log("Next events fetched for home page:", JSON.stringify(next, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
