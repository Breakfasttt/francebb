const { PrismaClient } = require("./prisma/generated-client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

const config = { url: "file:./prisma/dev.db" };
const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function check() {
  const tournamentId = "cmnoc565200011gpe8fxqbl2f";
  const t = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { organizerId: true }
  });
  console.log("Tournament Organizer ID:", t?.organizerId);

  const users = await prisma.user.findMany({
    select: { id: true, name: true, role: true }
  });
  console.log("Users in DB:", users);
}

check();
