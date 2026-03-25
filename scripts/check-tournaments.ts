import { prisma } from "../lib/prisma";

async function main() {
  const tournaments = await prisma.tournament.findMany({
    include: { topic: true }
  });
  console.log("Tournaments found:", tournaments.map(t => ({ id: t.id, name: t.name, topicId: t.topic?.id })));
}

main();
