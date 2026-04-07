const { PrismaClient } = require("./generated-client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");

const config = { url: "file:./dev.db" };
const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function fix() {
  console.log("Starting DB update...");
  const count = await prisma.tournament.updateMany({
    where: { OR: [{ isCDF: false }, { endDate: null }] },
    data: {
      isCDF: true,
      endDate: new Date() // Fallback current date for older ones
    }
  });
  console.log(`Updated ${count.count} tournaments.`);
}

fix().catch(console.error);
